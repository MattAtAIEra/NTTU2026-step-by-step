// 用 Gemini TTS 預先產生「念給我聽」的朗讀音檔，跟網站一起部署。
//
//   GEMINI_API_KEY=你的金鑰 node tools/audio/build-audio.mjs
//
// 可選參數：
//   --force          全部重新產生（預設只產生文字有變動或還沒有音檔的段落）
//   --voice 名稱     更換聲音（預設 Sulafat）
//   --only 關鍵字    只處理標籤含有關鍵字的段落，例如 --only 成語故事
//
// 流程：讀取 site/js/content.js → 呼叫 TTS 模型產生語音 → ffmpeg 去頭尾靜音、統一音量、轉 MP3
// → 再把音檔交給 Gemini 聽寫，核對內容是否和原文一致、破音字讀音是否正確，不通過就重新產生。
// 金鑰只在這支程式裡使用，不會寫進網站。
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import vm from 'node:vm';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const SITE = join(ROOT, 'site');
const AUDIO_DIR = join(SITE, 'audio');
const MANIFEST = join(SITE, 'js', 'audio-manifest.js');
const LOCK = join(ROOT, 'tools', 'audio', 'audio-lock.json');

const args = process.argv.slice(2);
const arg = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const FORCE = args.includes('--force');
const ONLY = arg('--only');
const VOICE = arg('--voice') || process.env.TTS_VOICE || 'Sulafat';
const TTS_MODEL = process.env.TTS_MODEL || 'gemini-3.8-flash-tts';
const CHECK_MODEL = process.env.CHECK_MODEL || 'gemini-3.8-flash';
// 這個 TTS 模型會把一般文字指示照念出來，只有方括號標籤會被當成語氣指示
const STYLE_TAG = '[warm, gentle, slightly slow storytelling voice for young children, Taiwanese Mandarin accent]';
const MAX_TRIES = 3;

// 送進 TTS 時改用同音字的地方（畫面上的文字不變）。
// 「繇」有 ㄧㄠˊ、ㄧㄡˊ、ㄓㄡˋ 等讀音，TTS 會念成 ㄧㄡˊ；人名「張僧繇」應念 ㄧㄠˊ，所以改送同音的「搖」。
const SAY_AS = { 張僧繇: '張僧搖' };

// 破音字與容易念錯的字：音檔裡出現這些詞時，指定字必須念成這個注音
const PRONUNCIATION = [
  { word: '寶藏', char: '藏', zhuyin: 'ㄗㄤˋ' },
  { word: '藏在', char: '藏', zhuyin: 'ㄘㄤˊ' },
  { word: '躲藏', char: '藏', zhuyin: 'ㄘㄤˊ' },
  { word: '捉迷藏', char: '藏', zhuyin: 'ㄘㄤˊ' },
  { word: '張僧繇', char: '繇', zhuyin: 'ㄧㄠˊ' },
  { word: '金陵', char: '陵', zhuyin: 'ㄌㄧㄥˊ' },
];

const KEY = process.env.GEMINI_API_KEY;
if (!KEY) {
  console.error('找不到 GEMINI_API_KEY 環境變數，無法產生音檔。');
  process.exit(1);
}

// ---------- 讀取教材，列出要朗讀的文字（必須和網頁按鈕送出的文字完全相同） ----------
const sandbox = { window: {} };
vm.runInNewContext(readFileSync(join(SITE, 'js', 'content.js'), 'utf8'), sandbox);
const C = sandbox.window.COURSE;
const plain = (t) => t.replace(/\{([^|{}]+)\|[^{}]*\}/g, '$1').replace(/\[([^|[\]]+)\|[^[\]]*\]/g, '$1');

const items = [];
items.push({ slug: 'l1-story', label: '第一課短文', text: plain(C.lesson1.story.text) });
C.lesson1.chars.forEach((c, i) => {
  items.push({ slug: `l1-char${i + 1}-say`, label: `生字讀音：${c.char}`, text: c.say });
  items.push({ slug: `l1-char${i + 1}-sentence`, label: `生字例句：${c.char}`, text: c.sentence });
});
C.lesson2.idioms.forEach((it, k) => {
  items.push({ slug: `l2-idiom${k + 1}-name`, label: `成語：${it.answer}`, text: it.answer });
  items.push({ slug: `l2-idiom${k + 1}-story`, label: `成語故事：${it.answer}`, text: plain(it.story.text) });
  it.examples.forEach((e, i) => items.push({ slug: `l2-idiom${k + 1}-example${i + 1}`, label: `成語例句：${it.answer}（${i + 1}）`, text: e }));
});

// ---------- 工具 ----------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const selectedOnly = (it) => Boolean(ONLY && it.label.includes(ONLY));

async function gemini(model, body) {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': KEY },
      body: JSON.stringify(body),
    });
    if (res.ok) return res.json();
    const msg = await res.text();
    if ((res.status === 429 || res.status >= 500) && attempt < 5) {
      const wait = 2000 * 2 ** (attempt - 1);
      console.log(`   API 回應 ${res.status}，${wait / 1000} 秒後重試……`);
      await sleep(wait);
      continue;
    }
    throw new Error(`${model} 回應 ${res.status}：${msg.slice(0, 300)}`);
  }
}

function ttsInput(text) {
  let t = text;
  for (const [from, to] of Object.entries(SAY_AS)) t = t.split(from).join(to);
  return `${STYLE_TAG} ${t}`;
}

const norm = (s) => s.replace(/[^\p{Script=Han}\p{L}\p{N}]/gu, '').replace(/裏/g, '裡').replace(/着/g, '著');

function similarity(a, b) {
  a = norm(a);
  b = norm(b);
  if (!a.length && !b.length) return 1;
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return 1 - dp[a.length][b.length] / Math.max(a.length, b.length);
}

function seconds(file) {
  return parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).toString());
}

// 產生語音 → 去頭尾靜音、統一音量 → MP3
async function synthesize(text, outFile) {
  const d = await gemini(TTS_MODEL, {
    contents: [{ parts: [{ text: ttsInput(text) }] }],
    generationConfig: { responseModalities: ['AUDIO'], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } } } },
  });
  const part = d.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
  if (!part) throw new Error('TTS 沒有回傳音訊');
  const raw = Buffer.from(part.inlineData.data, 'base64');
  const stamp = `${process.pid}-${Date.now()}`;
  const tmp = join(tmpdir(), `tts-${stamp}.wav`);
  const trimmed = join(tmpdir(), `tts-${stamp}-trim.wav`);
  const isWav = raw.subarray(0, 4).toString() === 'RIFF';
  writeFileSync(tmp, raw);
  const input = isWav ? ['-i', tmp] : ['-f', 's16le', '-ar', '24000', '-ac', '1', '-i', tmp];
  try {
    // 去頭尾靜音與統一音量分成兩次處理：同一條濾鏡串在部分音檔上會卡住
    const trim = 'silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.15,areverse,silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.3,areverse';
    ffmpeg([...input, '-af', trim, trimmed]);
    ffmpeg(['-i', trimmed, '-af', 'loudnorm=I=-18:TP=-1.5:LRA=11', '-ar', '24000', '-ac', '1', '-c:a', 'libmp3lame', '-b:a', '64k', outFile]);
  } finally {
    rmSync(tmp, { force: true });
    rmSync(trimmed, { force: true });
  }
}

function ffmpeg(params) {
  execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-nostdin', '-y', ...params], { stdio: ['ignore', 'ignore', 'inherit'], timeout: 120000 });
}

// 聽寫音檔，核對內容與讀音
async function verify(file, text) {
  const checks = PRONUNCIATION.filter((p) => text.includes(p.word));
  const ask =
    '你是國小國語老師，正在檢查朗讀音檔。請只根據你在音檔中實際聽到的聲音回答，輸出 JSON：\n' +
    '{"transcript": "逐字聽寫音檔裡念出來的所有內容（台灣繁體中文；若有英文或其他語言也照實寫出）", "readings": {' +
    checks.map((p) => `"${p.word}": "音檔中「${p.word}」的「${p.char}」實際念成的注音（例如 ㄘㄤˊ）"`).join(', ') +
    '}}';
  const d = await gemini(CHECK_MODEL, {
    contents: [{ parts: [{ inlineData: { mimeType: 'audio/mpeg', data: readFileSync(file).toString('base64') } }, { text: ask }] }],
    generationConfig: { responseMimeType: 'application/json' },
  });
  const out = JSON.parse(d.candidates[0].content.parts.map((p) => p.text || '').join(''));
  const sim = similarity(out.transcript || '', text);
  const latin = /[A-Za-z]{3,}/.test(out.transcript || '');
  const sec = seconds(file);
  const rate = norm(text).length / sec;
  const problems = [];
  if (sim < 0.9) problems.push(`聽寫結果和原文相似度只有 ${(sim * 100).toFixed(0)}%`);
  if (latin) problems.push('音檔裡出現英文（可能把語氣標籤念出來了）');
  if (rate < 1.5 || rate > 7.5) problems.push(`語速異常（每秒 ${rate.toFixed(1)} 字）`);
  const readings = {};
  for (const p of checks) {
    const heard = String((out.readings || {})[p.word] || '').replace(/\s/g, '');
    readings[p.word] = heard;
    if (!heard.includes(p.zhuyin)) problems.push(`「${p.word}」的「${p.char}」聽起來是 ${heard || '（無法判斷）'}，應該念 ${p.zhuyin}`);
  }
  return { ok: problems.length === 0, problems, similarity: Number(sim.toFixed(3)), seconds: Number(sec.toFixed(2)), readings, transcript: out.transcript };
}

// ---------- 主程式 ----------
mkdirSync(AUDIO_DIR, { recursive: true });
const lock = existsSync(LOCK) ? JSON.parse(readFileSync(LOCK, 'utf8')) : { clips: {} };
const next = { model: TTS_MODEL, checkModel: CHECK_MODEL, voice: VOICE, styleTag: STYLE_TAG, clips: {} };
const review = [];

console.log(`TTS 模型：${TTS_MODEL}　聲音：${VOICE}　驗證模型：${CHECK_MODEL}`);
for (const it of items) {
  const hash = createHash('sha1').update([TTS_MODEL, VOICE, ttsInput(it.text)].join('\n')).digest('hex').slice(0, 10);
  const file = `audio/${it.slug}-${hash}.mp3`;
  const prev = lock.clips[it.text];
  const selected = !ONLY || it.label.includes(ONLY);
  const fresh = prev && prev.file === file && existsSync(join(SITE, file));
  const reuse = ONLY ? !selected && prev && existsSync(join(SITE, prev.file)) : !FORCE && fresh;
  if (reuse) {
    next.clips[it.text] = prev;
    console.log(`✓ ${it.label}（沿用）`);
    continue;
  }
  // 上次中斷前已經產生、但還沒寫進紀錄的音檔：先驗證，通過就直接使用
  const existing = !FORCE && !selectedOnly(it) && existsSync(join(SITE, file)) && statSync(join(SITE, file)).size > 0;
  let result;
  for (let t = 1; t <= MAX_TRIES; t++) {
    if (t === 1 && existing) {
      console.log(`… ${it.label}：找到現有音檔，重新驗證`);
    } else {
      console.log(`… ${it.label}：產生中（第 ${t} 次）`);
      await synthesize(it.text, join(SITE, file));
    }
    result = await verify(join(SITE, file), it.text);
    console.log(`${result.ok ? '✓' : '✗'} ${it.label}：${result.seconds} 秒，相似度 ${(result.similarity * 100).toFixed(0)}%${result.ok ? '' : '｜' + result.problems.join('；')}`);
    if (result.ok) break;
  }
  if (!result.ok) review.push({ label: it.label, file, problems: result.problems });
  next.clips[it.text] = { label: it.label, file, seconds: result.seconds, verified: result.ok, similarity: result.similarity, readings: result.readings, problems: result.problems };
  writeFileSync(LOCK, JSON.stringify({ ...lock, ...next, clips: { ...lock.clips, ...next.clips } }, null, 2) + '\n');
}

// 清掉沒有用到的舊音檔
const used = new Set(Object.values(next.clips).map((c) => c.file.replace(/^audio\//, '')));
for (const f of readdirSync(AUDIO_DIR)) if (f.endsWith('.mp3') && !used.has(f)) rmSync(join(AUDIO_DIR, f));

writeFileSync(LOCK, JSON.stringify(next, null, 2) + '\n');
const map = Object.fromEntries(Object.entries(next.clips).map(([text, c]) => [text, c.file]));
writeFileSync(
  MANIFEST,
  '/* 自動產生，請勿手動修改。重新產生：node tools/audio/build-audio.mjs */\n' +
    `window.AUDIO_INFO = ${JSON.stringify({ model: TTS_MODEL, voice: VOICE })};\n` +
    `window.AUDIO_CLIPS = ${JSON.stringify(map, null, 2)};\n`
);

const total = Object.values(next.clips).reduce((s, c) => s + (c.seconds || 0), 0);
console.log(`\n完成：${items.length} 段音檔，共 ${total.toFixed(0)} 秒。`);
if (review.length) {
  console.log(`\n⚠️ 有 ${review.length} 段在 ${MAX_TRIES} 次內沒有通過自動檢查，請人工試聽：`);
  for (const r of review) console.log(`  - ${r.label}（${r.file}）：${r.problems.join('；')}`);
}
