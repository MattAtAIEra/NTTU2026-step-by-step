// SVG 繪圖基礎工具：元素產生器、漸層、貝茲曲線取樣。
// 所有插圖共用同一組外框色與線寬，讓人物造型與畫風保持一致。

export const OUT = '#4B3426';

export const r2 = (n) => Math.round(n * 100) / 100;

function attrs(o = {}) {
  return Object.entries(o)
    .filter(([, v]) => v !== undefined && v !== null && v !== false && v !== '')
    .map(([k, v]) => ` ${k}="${typeof v === 'number' ? r2(v) : v}"`)
    .join('');
}

export function el(tag, a = {}, ...kids) {
  const inner = kids.flat(Infinity).filter((k) => k !== undefined && k !== null && k !== false && k !== '').join('');
  return inner ? `<${tag}${attrs(a)}>${inner}</${tag}>` : `<${tag}${attrs(a)}/>`;
}

export const g = (a, ...kids) => el('g', a, ...kids);
export const path = (d, a = {}) => el('path', { d, ...a });
export const circle = (cx, cy, r, a = {}) => el('circle', { cx, cy, r, ...a });
export const ellipse = (cx, cy, rx, ry, a = {}) => el('ellipse', { cx, cy, rx, ry, ...a });
export const rect = (x, y, width, height, a = {}) => el('rect', { x, y, width, height, ...a });
export const poly = (pts, a = {}) => el('polygon', { points: pts.map((p) => p.map(r2).join(',')).join(' '), ...a });
export const text = (x, y, str, a = {}) => el('text', { x, y, ...a }, str);

// 粗線條肢體：先畫外框色粗線，再畫內色細線，做出有描邊的圓頭線條。
export function limb(d, color, w, ow = 3) {
  const base = { fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
  return g(
    {},
    path(d, { ...base, stroke: OUT, 'stroke-width': w + ow * 2 }),
    path(d, { ...base, stroke: color, 'stroke-width': w })
  );
}

// 以「腳底中心點」把元件放進整張圖裡。元件盒子寬 w、高 h，腳底在 (w/2, h)。
export function place(content, { x, y, s = 1, flip = false, w = 200, h = 280, cls }) {
  const sx = flip ? -s : s;
  return g({ transform: `translate(${r2(x)} ${r2(y)}) scale(${r2(sx)} ${r2(s)}) translate(${-w / 2} ${-h})`, class: cls }, content);
}

export function linGrad(id, stops, { x1 = 0, y1 = 0, x2 = 0, y2 = 1 } = {}) {
  return el(
    'linearGradient',
    { id, x1, y1, x2, y2 },
    stops.map(([o, c, op]) => el('stop', { offset: o, 'stop-color': c, 'stop-opacity': op }))
  );
}

export function radGrad(id, stops, { cx = 0.5, cy = 0.5, r = 0.5 } = {}) {
  return el(
    'radialGradient',
    { id, cx, cy, r },
    stops.map(([o, c, op]) => el('stop', { offset: o, 'stop-color': c, 'stop-opacity': op }))
  );
}

// 星形（閃光、星星）
export function star(cx, cy, R, r = R * 0.45, n = 5, a = {}) {
  const pts = [];
  for (let i = 0; i < n * 2; i++) {
    const rad = i % 2 === 0 ? R : r;
    const ang = -Math.PI / 2 + (i * Math.PI) / n;
    pts.push([cx + rad * Math.cos(ang), cy + rad * Math.sin(ang)]);
  }
  return poly(pts, a);
}

// 四角閃光
export function sparkle(cx, cy, R, a = {}) {
  const r = R * 0.22;
  return path(
    `M ${cx} ${cy - R} Q ${cx + r} ${cy - r} ${cx + R} ${cy} Q ${cx + r} ${cy + r} ${cx} ${cy + R} Q ${cx - r} ${cy + r} ${cx - R} ${cy} Q ${cx - r} ${cy - r} ${cx} ${cy - R} Z`,
    a
  );
}

// 雲朵：多個圓先畫外框，再蓋一層無框的圓，形成連成一片的輪廓。
export function puff(circles, fill = '#fff', { stroke = OUT, sw = 3, cls } = {}) {
  return g(
    { class: cls },
    circles.map(([x, y, r]) => circle(x, y, r, { fill, stroke, 'stroke-width': sw })),
    circles.map(([x, y, r]) => circle(x, y, r, { fill }))
  );
}

// ---- 貝茲曲線取樣（畫龍身用） ----
function bez(p0, p1, p2, p3, t) {
  const u = 1 - t;
  return [
    u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
    u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
  ];
}
function bezD(p0, p1, p2, p3, t) {
  const u = 1 - t;
  return [
    3 * u * u * (p1[0] - p0[0]) + 6 * u * t * (p2[0] - p1[0]) + 3 * t * t * (p3[0] - p2[0]),
    3 * u * u * (p1[1] - p0[1]) + 6 * u * t * (p2[1] - p1[1]) + 3 * t * t * (p3[1] - p2[1]),
  ];
}

// points: [P0, C1, C2, P1, C3, C4, P2, ...]，回傳等距取樣的點、單位切線與 0~1 的位置
export function sampleChain(points, n) {
  const segs = [];
  for (let i = 0; i + 3 < points.length; i += 3) segs.push(points.slice(i, i + 4));
  const dense = [];
  segs.forEach((sg, si) => {
    for (let k = 0; k <= 60; k++) {
      if (si > 0 && k === 0) continue;
      const t = k / 60;
      dense.push({ p: bez(...sg, t), d: bezD(...sg, t) });
    }
  });
  let L = 0;
  dense[0].l = 0;
  for (let i = 1; i < dense.length; i++) {
    L += Math.hypot(dense[i].p[0] - dense[i - 1].p[0], dense[i].p[1] - dense[i - 1].p[1]);
    dense[i].l = L;
  }
  const out = [];
  let j = 0;
  for (let i = 0; i < n; i++) {
    const target = (L * i) / (n - 1);
    while (j < dense.length - 2 && dense[j + 1].l < target) j++;
    const a = dense[j];
    const b = dense[j + 1];
    const f = Math.min(1, Math.max(0, (target - a.l) / (b.l - a.l || 1)));
    const p = [a.p[0] + (b.p[0] - a.p[0]) * f, a.p[1] + (b.p[1] - a.p[1]) * f];
    let d = [a.d[0] + (b.d[0] - a.d[0]) * f, a.d[1] + (b.d[1] - a.d[1]) * f];
    const m = Math.hypot(d[0], d[1]) || 1;
    d = [d[0] / m, d[1] / m];
    out.push({ p, t: d, s: i / (n - 1) });
  }
  return { pts: out, L };
}

// 共用動畫樣式。放進每一張 SVG 裡，以 <img> 載入時也能播放。
export const STYLE = `
.o{stroke:${OUT};stroke-width:3;stroke-linejoin:round;stroke-linecap:round}
.o2{stroke:${OUT};stroke-width:2;stroke-linejoin:round;stroke-linecap:round}
.o4{stroke:${OUT};stroke-width:4;stroke-linejoin:round;stroke-linecap:round}
.zi{font-family:'LXGW WenKai TC','BiauKai','DFKai-SB','TW-Kai','Kaiti TC','STKaiti','KaiTi','Noto Serif TC','Noto Sans TC','PingFang TC','Microsoft JhengHei',serif;font-weight:700;text-anchor:middle;dominant-baseline:central}
.blink{animation:blink 5s infinite;transform-box:fill-box;transform-origin:center}
@keyframes blink{0%,93%,100%{transform:scaleY(1)}95%{transform:scaleY(.08)}97%{transform:scaleY(1)}}
.drift{animation:drift 26s ease-in-out infinite alternate}
@keyframes drift{from{transform:translateX(-40px)}to{transform:translateX(40px)}}
.bob{animation:bob 2.6s ease-in-out infinite alternate}
@keyframes bob{from{transform:translateY(4px)}to{transform:translateY(-8px)}}
.pulse{animation:pulse 2.4s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
@keyframes pulse{0%,100%{opacity:.7;transform:scale(.96)}50%{opacity:1;transform:scale(1.06)}}
.twinkle{animation:twinkle 1.8s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
@keyframes twinkle{0%,100%{opacity:.15;transform:scale(.5)}50%{opacity:1;transform:scale(1)}}
.flow{stroke-dasharray:16 26;animation:flow 1.6s linear infinite}
@keyframes flow{to{stroke-dashoffset:-42}}
.sway{animation:sway 2.8s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:50% 100%}
@keyframes sway{from{transform:rotate(-4deg)}to{transform:rotate(4deg)}}
.wobble{animation:wobble 1.6s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:50% 100%}
@keyframes wobble{from{transform:rotate(-3.5deg)}to{transform:rotate(3.5deg)}}
.wag{animation:wag 1s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:0% 100%}
@keyframes wag{from{transform:rotate(-8deg)}to{transform:rotate(10deg)}}
.spin{animation:spin 5s linear infinite;transform-box:fill-box;transform-origin:center}
@keyframes spin{to{transform:rotate(360deg)}}
.rays{animation:spin 40s linear infinite;transform-box:fill-box;transform-origin:center}
.flash{animation:flash 3.2s steps(1) infinite}
@keyframes flash{0%,100%{opacity:0}8%{opacity:1}12%{opacity:0}16%{opacity:1}24%{opacity:0}}
.hop{animation:hop 1.4s ease-in-out infinite}
@keyframes hop{0%,100%{transform:translate(0,0)}25%{transform:translate(-14px,-22px)}50%{transform:translate(-28px,0)}75%{transform:translate(-14px,-22px)}}
.bonk{animation:bonk 2.6s ease-in infinite}
@keyframes bonk{0%{transform:translateX(-70px);opacity:0}10%{opacity:1}45%{transform:translateX(0)}100%{transform:translateX(0)}}
.boom{animation:boom 2.6s ease-out infinite;transform-box:fill-box;transform-origin:center}
@keyframes boom{0%,44%{opacity:0;transform:scale(.2)}50%{opacity:1;transform:scale(1.15)}70%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(1)}}
.dangle{animation:dangle 2.2s ease-in-out infinite alternate}
@keyframes dangle{from{transform:translateY(0)}to{transform:translateY(12px)}}
.fly{animation:fly 3.4s ease-in-out infinite alternate}
@keyframes fly{from{transform:translate(0,6px)}to{transform:translate(6px,-12px)}}
.shake{animation:shake .5s ease-in-out infinite alternate}
@keyframes shake{from{transform:translate(-2px,1px)}to{transform:translate(2px,-1px)}}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
`;

export function svgDoc({ w, h, title, desc, defs = [], body, style = '' }) {
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-labelledby="t d">` +
    `<title id="t">${title}</title><desc id="d">${desc}</desc>` +
    `<style>${STYLE}${style}</style>` +
    `<defs>${defs.join('')}</defs>` +
    body +
    `</svg>\n`
  );
}
