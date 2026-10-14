/*
 * 寒假國語特攻隊：互動程式
 * ------------------------------------------------------------
 * 純原生 JavaScript，不需要任何套件或建置步驟。
 * 頁面以網址 # 後面的路徑切換：
 *   #/            闖關地圖（首頁）
 *   #/lesson1/2   第一課第 3 步
 *   #/lesson2/0   第二課第 1 步
 *   #/finish      通關證書
 *   #/teacher     教師版（完整教材＋答案）
 */
(function () {
  'use strict';

  var COURSE = window.COURSE;
  var L1 = COURSE.lesson1;
  var L2 = COURSE.lesson2;
  var app = document.getElementById('app');
  var LETTERS = ['A', 'B', 'C', 'D'];

  // ---------------------------------------------------------------
  // 小工具
  // ---------------------------------------------------------------
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // {字|注音}：目標生字（可點開生字卡）；[字|注音]：一般注音
  function rubyHTML(text, clickable) {
    return esc(text)
      .replace(/\{([^|{}]+)\|([^{}]*)\}/g, function (_, c, z) {
        return clickable === false
          ? '<ruby class="tc">' + c + '<rt>' + z + '</rt></ruby>'
          : '<button type="button" class="tchar" data-act="char-pop" data-char="' + c + '" aria-label="生字「' + c + '」，念' + z + '，點一下看生字卡"><ruby>' + c + '<rt>' + z + '</rt></ruby></button>';
      })
      .replace(/\[([^|[\]]+)\|([^[\]]*)\]/g, function (_, c, z) {
        return '<ruby>' + c + '<rt>' + z + '</rt></ruby>';
      });
  }

  function plain(text) {
    return text.replace(/\{([^|{}]+)\|[^{}]*\}/g, '$1').replace(/\[([^|[\]]+)\|[^[\]]*\]/g, '$1');
  }

  function reduceMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function toast(msg) {
    var box = document.getElementById('toast');
    box.innerHTML = '<div class="t">' + esc(msg) + '</div>';
    clearTimeout(toast.timer);
    toast.timer = setTimeout(function () {
      box.innerHTML = '';
    }, 2300);
  }

  // ---------------------------------------------------------------
  // 闖關進度（存在瀏覽器裡；無法儲存時就只記在這次開啟的頁面）
  // ---------------------------------------------------------------
  var STORE_KEY = 'cn-squad-progress-v1';

  function blankState() {
    return { tried: {}, solved: {}, stars: {}, found: [], seenChars: [], clues: {}, hints: {}, visited: {}, name: '', sound: true, zhuyin: true };
  }

  function loadState() {
    try {
      var raw = window.localStorage.getItem(STORE_KEY);
      if (raw) {
        var saved = JSON.parse(raw);
        var s = blankState();
        Object.keys(s).forEach(function (k) {
          if (saved[k] !== undefined) s[k] = saved[k];
        });
        return s;
      }
    } catch (e) {
      /* 無痕模式或封鎖儲存空間 */
    }
    return blankState();
  }

  function saveState() {
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify(state));
    } catch (e) {
      /* 無法儲存時忽略 */
    }
  }

  var state = loadState();

  var STAR_IDS = ['l1-find']
    .concat(
      L1.quiz.map(function (q) {
        return q.id;
      })
    )
    .concat(
      L2.idioms.reduce(function (acc, it) {
        return acc.concat(
          [it.id + '-riddle'],
          it.quiz.map(function (q) {
            return q.id;
          })
        );
      }, [])
    );

  function starCount() {
    return STAR_IDS.filter(function (id) {
      return state.stars[id];
    }).length;
  }

  function lessonStars(lessonId) {
    return STAR_IDS.filter(function (id) {
      var inL1 = id === 'l1-find' || id.indexOf('l1q') === 0;
      return (lessonId === 'lesson1') === inL1;
    });
  }

  function lesson1Done() {
    return L1.quiz.every(function (q) {
      return state.solved[q.id];
    });
  }

  function idiomSolved(i) {
    return !!state.solved[L2.idioms[i].id + '-riddle'];
  }

  function lesson2Done() {
    return L2.idioms.every(function (it, i) {
      return (
        idiomSolved(i) &&
        it.quiz.every(function (q) {
          return state.solved[q.id];
        })
      );
    });
  }

  function allQuestions() {
    var list = L1.quiz.slice();
    L2.idioms.forEach(function (it) {
      list = list.concat(it.quiz);
    });
    return list;
  }

  function findQuestion(id) {
    return allQuestions().filter(function (q) {
      return q.id === id;
    })[0];
  }

  // ---------------------------------------------------------------
  // 音效（用 Web Audio 即時合成，不需要音檔）
  // ---------------------------------------------------------------
  var Sound = {
    ctx: null,
    get: function () {
      if (!this.ctx) {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        this.ctx = new AC();
      }
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return this.ctx;
    },
    tone: function (freq, start, dur, type, vol) {
      if (!state.sound) return;
      var ctx = this.get();
      if (!ctx) return;
      var t = ctx.currentTime + start;
      var o = ctx.createOscillator();
      var g = ctx.createGain();
      o.type = type || 'sine';
      o.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol || 0.1, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g);
      g.connect(ctx.destination);
      o.start(t);
      o.stop(t + dur + 0.05);
    },
    click: function () {
      this.tone(660, 0, 0.08, 'sine', 0.05);
    },
    found: function () {
      this.tone(880, 0, 0.12, 'triangle', 0.1);
      this.tone(1320, 0.08, 0.16, 'triangle', 0.08);
    },
    correct: function () {
      var self = this;
      [523.25, 659.25, 783.99, 1046.5].forEach(function (f, i) {
        self.tone(f, i * 0.09, 0.22, 'triangle', 0.12);
      });
    },
    wrong: function () {
      this.tone(262, 0, 0.16, 'square', 0.04);
      this.tone(196, 0.14, 0.26, 'square', 0.04);
    },
    fanfare: function () {
      var self = this;
      [
        [523.25, 0],
        [659.25, 0.12],
        [783.99, 0.24],
        [1046.5, 0.36],
        [783.99, 0.54],
        [1046.5, 0.66],
      ].forEach(function (n) {
        self.tone(n[0], n[1], 0.3, 'triangle', 0.12);
      });
    },
  };

  // ---------------------------------------------------------------
  // 念給我聽：優先播放 Gemini TTS 預先產生的音檔（js/audio-manifest.js），
  // 找不到對應音檔時（例如文字改過、還沒重新產生），改用瀏覽器內建語音
  // ---------------------------------------------------------------
  var CLIPS = window.AUDIO_CLIPS || {};
  var TTS = {
    synth: 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window,
    voice: null,
    current: null,
    audio: null,
    can: function (text) {
      return !!CLIPS[text] || this.synth;
    },
    pick: function () {
      try {
        var vs = window.speechSynthesis.getVoices();
        this.voice =
          vs.filter(function (v) {
            return /zh[-_](TW|Hant)/i.test(v.lang);
          })[0] ||
          vs.filter(function (v) {
            return /^zh/i.test(v.lang);
          })[0] ||
          null;
      } catch (e) {
        this.voice = null;
      }
    },
    stop: function () {
      if (this.audio) {
        this.audio.pause();
        this.audio = null;
      }
      if (this.synth) window.speechSynthesis.cancel();
      if (this.current) this.current.classList.remove('speaking');
      this.current = null;
    },
    speak: function (text, btn) {
      var again = btn && this.current === btn;
      this.stop();
      if (again) return;
      var self = this;
      var done = function () {
        if (btn) btn.classList.remove('speaking');
        if (self.current === btn) self.current = null;
      };
      if (btn) btn.classList.add('speaking');
      this.current = btn || null;
      if (!CLIPS[text]) {
        this.synthSpeak(text, done);
        return;
      }
      var a = new Audio(CLIPS[text]);
      var fellBack = false;
      var fallback = function () {
        if (fellBack || self.audio !== a) return;
        fellBack = true;
        self.audio = null;
        self.synthSpeak(text, done);
      };
      this.audio = a;
      a.onended = done;
      a.onerror = fallback;
      var p = a.play();
      if (p && p.catch) {
        p.catch(function (err) {
          if (err && err.name === 'AbortError') return;
          if (err && err.name === 'NotAllowedError') done();
          else fallback();
        });
      }
    },
    synthSpeak: function (text, done) {
      if (!this.synth) {
        done();
        return;
      }
      var u = new SpeechSynthesisUtterance(text);
      u.lang = 'zh-TW';
      if (this.voice) u.voice = this.voice;
      u.rate = 0.85;
      u.onend = u.onerror = done;
      window.speechSynthesis.speak(u);
    },
  };
  if (TTS.synth) {
    TTS.pick();
    if (window.speechSynthesis.addEventListener) window.speechSynthesis.addEventListener('voiceschanged', TTS.pick.bind(TTS));
  }

  function speakBtn(text, label) {
    if (!TTS.can(text)) return '';
    return '<button type="button" class="speak-btn" data-act="speak" data-text="' + esc(text) + '" aria-label="' + esc(label || '念給我聽') + '" title="念給我聽">🔊</button>';
  }

  // ---------------------------------------------------------------
  // 彩帶與星星動畫
  // ---------------------------------------------------------------
  var Confetti = {
    parts: [],
    raf: 0,
    burst: function (n) {
      if (reduceMotion()) return;
      var cv = document.getElementById('confetti');
      var ctx = cv.getContext('2d');
      var dpr = window.devicePixelRatio || 1;
      cv.width = window.innerWidth * dpr;
      cv.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var colors = ['#FFD447', '#F2708E', '#3E7BE6', '#4CB66A', '#FF9F43', '#B38CF5'];
      for (var i = 0; i < (n || 120); i++) {
        this.parts.push({
          x: window.innerWidth / 2 + (Math.random() - 0.5) * 120,
          y: window.innerHeight * 0.35,
          vx: (Math.random() - 0.5) * 16,
          vy: -Math.random() * 14 - 4,
          s: 6 + Math.random() * 8,
          r: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 0.4,
          c: colors[i % colors.length],
          life: 0,
        });
      }
      var self = this;
      if (!this.raf) {
        var tick = function () {
          ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
          self.parts = self.parts.filter(function (p) {
            p.life++;
            p.vy += 0.35;
            p.vx *= 0.99;
            p.x += p.vx;
            p.y += p.vy;
            p.r += p.vr;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.r);
            ctx.fillStyle = p.c;
            ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
            ctx.restore();
            return p.y < window.innerHeight + 40 && p.life < 240;
          });
          if (self.parts.length) {
            self.raf = requestAnimationFrame(tick);
          } else {
            self.raf = 0;
            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
          }
        };
        this.raf = requestAnimationFrame(tick);
      }
    },
  };

  function bumpStars() {
    var pill = document.getElementById('star-pill');
    document.getElementById('star-count').textContent = starCount();
    pill.classList.remove('bump');
    void pill.offsetWidth;
    pill.classList.add('bump');
  }

  function flyStar(fromEl) {
    var pill = document.getElementById('star-pill');
    if (!fromEl || reduceMotion()) {
      bumpStars();
      return;
    }
    var a = fromEl.getBoundingClientRect();
    var b = pill.getBoundingClientRect();
    var s = document.createElement('span');
    s.className = 'fly-star';
    s.textContent = '⭐';
    s.style.left = a.left + a.width / 2 - 17 + 'px';
    s.style.top = a.top + a.height / 2 - 20 + 'px';
    document.body.appendChild(s);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        s.style.transform = 'translate(' + (b.left + 14 - a.left - a.width / 2) + 'px,' + (b.top + 4 - a.top - a.height / 2) + 'px) scale(.5) rotate(360deg)';
        s.style.opacity = '0.6';
      });
    });
    setTimeout(function () {
      s.remove();
      bumpStars();
    }, 950);
  }

  // ---------------------------------------------------------------
  // 課程步驟
  // ---------------------------------------------------------------
  var STEPS = {
    lesson1: [
      { key: 'mission', tag: 'A', label: '闖關任務' },
      { key: 'scene', tag: 'B', label: '情境圖' },
      { key: 'story', tag: 'C', label: '趣味短文' },
      { key: 'chars', tag: 'D', label: '生字解說' },
      { key: 'quiz', tag: 'E', label: '守門關卡' },
      { key: 'review', tag: 'F', label: '答案解析' },
    ],
    lesson2: [{ key: 'mission', tag: 'A', label: '闖關任務' }]
      .concat(
        [0, 1].reduce(function (acc, i) {
          var n = i === 0 ? '①' : '②';
          return acc.concat([
            { key: 'riddle', idiom: i, tag: 'B', label: '看圖猜成語' + n },
            { key: 'idiomStory', idiom: i, tag: 'C', label: '成語故事' + n },
            { key: 'idiomMeaning', idiom: i, tag: 'D', label: '成語解釋' + n },
            { key: 'quiz', idiom: i, tag: 'E', label: '守門關卡' + n },
          ]);
        }, [])
      )
      .concat([{ key: 'review', tag: 'F', label: '答案解析' }]),
  };

  function isLocked(lessonId, step) {
    if (lessonId === 'lesson2' && step.idiom !== undefined && step.key !== 'riddle') return !idiomSolved(step.idiom);
    if (step.key === 'review') return lessonId === 'lesson1' ? !lesson1Done() : !lesson2Done();
    return false;
  }

  function lessonData(id) {
    return id === 'lesson1' ? L1 : L2;
  }

  var current = null; // { id, idx }
  var selectedChar = 0;
  var quizPos = {};

  // ---------------------------------------------------------------
  // 路由與畫面更新
  // ---------------------------------------------------------------
  function parseHash() {
    var h = window.location.hash.replace(/^#\/?/, '');
    var parts = h.split('/');
    return { page: parts[0] || 'home', sub: parts[1] === undefined || parts[1] === '' ? 0 : parseInt(parts[1], 10) || 0 };
  }

  function render(opts) {
    opts = opts || {};
    var y = window.scrollY;
    if (!opts.keepScroll) TTS.stop();
    var r = parseHash();
    var html;
    var title = COURSE.title;
    current = null;
    if (r.page === 'lesson1' || r.page === 'lesson2') {
      html = renderLesson(r.page, r.sub, opts);
      title = lessonData(r.page).no + ' ' + lessonData(r.page).title + '｜寒假國語特攻隊';
    } else if (r.page === 'finish') {
      html = renderFinish();
      title = '通關證書｜寒假國語特攻隊';
    } else if (r.page === 'teacher') {
      html = renderTeacher();
      title = '教師版教材｜寒假國語特攻隊';
    } else {
      html = renderHome();
    }
    app.innerHTML = html;
    document.title = title;
    updateTopbar(r.page);
    if (opts.keepScroll) {
      window.scrollTo(0, y);
      if (opts.focus) {
        var f = document.querySelector(opts.focus);
        if (f) f.focus({ preventScroll: true });
      }
    } else {
      window.scrollTo(0, 0);
      app.focus({ preventScroll: true });
      afterEnter(r.page);
    }
  }

  function refresh(opts) {
    opts = opts || {};
    opts.keepScroll = true;
    opts.again = true;
    render(opts);
  }

  function updateTopbar(page) {
    document.getElementById('star-count').textContent = starCount();
    document.getElementById('star-total').textContent = STAR_IDS.length;
    document.getElementById('star-pill').setAttribute('aria-label', '已獲得 ' + starCount() + ' 顆星星，共 ' + STAR_IDS.length + ' 顆，點一下查看通關證書');
    var nav = document.querySelectorAll('[data-nav]');
    for (var i = 0; i < nav.length; i++) {
      if (nav[i].getAttribute('data-nav') === page) nav[i].setAttribute('aria-current', 'page');
      else nav[i].removeAttribute('aria-current');
    }
    var sb = document.getElementById('sound-btn');
    sb.textContent = state.sound ? '🔊' : '🔇';
    sb.setAttribute('aria-pressed', String(state.sound));
    sb.setAttribute('aria-label', state.sound ? '音效：開啟（點一下關閉）' : '音效：關閉（點一下開啟）');
    document.getElementById('snow').style.display = page === 'home' || page === 'finish' ? '' : 'none';
  }

  function afterEnter(page) {
    if (!current) {
      if (page === 'finish' && lesson1Done() && lesson2Done()) {
        Confetti.burst(160);
        Sound.fanfare();
      }
      return;
    }
    var step = STEPS[current.id][current.idx];
    state.visited[current.id + '/' + current.idx] = true;
    saveState();
    if (step.key === 'review' && !isLocked(current.id, step)) {
      Confetti.burst(160);
      Sound.fanfare();
    }
  }

  // ---------------------------------------------------------------
  // 首頁
  // ---------------------------------------------------------------
  function levelCard(L, idx) {
    var ids = lessonStars(L.id);
    var got = ids.filter(function (id) {
      return state.stars[id];
    }).length;
    var done = L.id === 'lesson1' ? lesson1Done() : lesson2Done();
    var started = Object.keys(state.visited).some(function (k) {
      return k.indexOf(L.id + '/') === 0;
    });
    var status = done ? '<span class="chip green">✓ 已通關</span>' : started ? '<span class="chip blue">闖關中</span>' : '<span class="chip">尚未開始</span>';
    var thumb =
      idx === 1
        ? '<div class="thumb"><img src="images/lesson1-scene.svg" alt="" loading="lazy" width="1200" height="800"></div>'
        : '<div class="thumb mystery"><img src="images/idiom2-riddle.svg" alt="" loading="lazy" width="1200" height="800"><span class="qmark" aria-hidden="true">？</span></div>';
    return (
      '<a class="card level l' + idx + '" href="#/' + L.id + '/0">' +
      thumb +
      '<span class="no">' + L.no + '</span>' +
      '<h3>' + esc(L.title) + '：' + esc(L.theme) + '</h3>' +
      '<p>' + esc(L.mission.title.replace(/^任務[一二]：/, '')) + '</p>' +
      '<div class="status">' + status + '<span>⭐ ' + got + '／' + ids.length + '</span><span class="btn small ' + (idx === 1 ? 'primary' : 'pink') + '">' + (done ? '再玩一次' : started ? '繼續闖關' : '開始') + ' →</span></div>' +
      '</a>'
    );
  }

  function renderHome() {
    var colors = ['#3E7BE6', '#F2708E', '#F4A04A'];
    var bothDone = lesson1Done() && lesson2Done();
    return (
      '<section class="wrap">' +
      '<div class="hero"><div class="hero-poster"><picture><source srcset="images/poster.webp" type="image/webp">' +
      '<img src="images/poster.jpg" width="1600" height="900" alt="「小朋友的寒假國語特攻隊」海報：男孩拿著放大鏡研究國字，女孩拿著鉛筆思考成語謎題，中間是綁紅色頭巾的三花貓，左邊寫著第一課說文解字，右邊寫著第二課成語猜謎。"></picture></div></div>' +
      '<div class="hero-text"><h1>小朋友的<em>寒假國語</em>特攻隊</h1>' +
      '<p>國小三年級．冒險闖關國語課<br>第一課「說文解字」＋第二課「成語猜謎」，答對拿星星，集滿就能領通關證書！</p>' +
      '<div class="hero-actions"><a class="btn pink" href="#/lesson1/0">🚀 開始闖關</a><a class="btn" href="#/teacher">📘 教師版教材</a></div></div>' +
      '<h2 class="section-title">闖關地圖</h2>' +
      '<div class="map">' + levelCard(L1, 1) + levelCard(L2, 2) + '</div>' +
      (bothDone
        ? '<div class="card" style="margin-top:24px;text-align:center"><p style="font-size:22px;margin:0 0 12px">🎉 兩課都通關了！快去領取你的通關證書吧！</p><a class="btn yellow" href="#/finish">🏅 領取通關證書</a></div>'
        : '') +
      '<h2 class="section-title">認識特攻隊</h2>' +
      '<div class="card team"><img src="images/team.svg" width="600" height="370" alt="特攻隊成員：穿藍色連帽外套的男孩小宇、綁紅色頭巾的三花貓墨墨、穿粉紅色連帽外套的女孩小晴，一起開心揮手。">' +
      '<div class="team-members">' +
      COURSE.team
        .map(function (m, i) {
          return '<div class="member"><span class="dot" style="background:' + colors[i] + '"></span><div><b>' + esc(m.name) + '</b>　<span class="chip">' + esc(m.role) + '</span><p>' + esc(m.look) + '</p></div></div>';
        })
        .join('') +
      '</div></div>' +
      '</section>'
    );
  }

  // ---------------------------------------------------------------
  // 課程頁
  // ---------------------------------------------------------------
  function renderLesson(id, idx, opts) {
    var steps = STEPS[id];
    idx = Math.max(0, Math.min(steps.length - 1, idx));
    current = { id: id, idx: idx };
    var L = lessonData(id);
    var step = steps[idx];
    var body = isLocked(id, step) ? lockedStep(id, step) : stepBody(id, step, opts);
    return (
      '<section class="wrap lesson ' + id + '">' +
      '<div class="lesson-head"><a class="btn small" href="#/">🗺️ 回地圖</a>' +
      '<div><span class="lesson-no">' + L.no + '</span> <h1>' + esc(L.title) + '</h1><p class="theme">' + esc(L.theme) + '</p></div></div>' +
      '<nav class="stepper" aria-label="闖關步驟"><ol>' +
      steps
        .map(function (s, i) {
          var inner = '<span class="tag">' + s.tag + '</span>' + esc(s.label);
          if (isLocked(id, s) && i !== idx) return '<li><span class="locked" title="完成前面的關卡才能打開">' + inner + ' 🔒</span></li>';
          var cls = state.visited[id + '/' + i] && i !== idx ? ' class="done"' : '';
          return '<li><a href="#/' + id + '/' + i + '"' + cls + (i === idx ? ' aria-current="step"' : '') + '>' + inner + '</a></li>';
        })
        .join('') +
      '</ol></nav>' +
      '<div id="step-body">' + body + '</div>' +
      stepNav(id, idx) +
      '</section>'
    );
  }

  function stepNav(id, idx) {
    var steps = STEPS[id];
    var prev = idx > 0 ? '<a class="btn" href="#/' + id + '/' + (idx - 1) + '">← 上一步</a>' : '<span class="spacer"></span>';
    var next;
    if (idx < steps.length - 1) {
      next = isLocked(id, steps[idx + 1])
        ? '<span class="btn is-disabled" aria-disabled="true">🔒 完成這一關才能前進</span>'
        : '<a class="btn primary" href="#/' + id + '/' + (idx + 1) + '">下一步：' + esc(steps[idx + 1].label) + ' →</a>';
    } else if (id === 'lesson1') {
      next = '<a class="btn pink" href="#/lesson2/0">前往第二課：成語猜謎 →</a>';
    } else {
      next = '<a class="btn yellow" href="#/finish">🏅 領取通關證書</a>';
    }
    return '<div class="step-nav no-print">' + prev + next + '</div>';
  }

  function stepBody(id, step, opts) {
    var L = lessonData(id);
    switch (step.key) {
      case 'mission':
        return missionStep(L, opts);
      case 'scene':
        return sceneStep(opts);
      case 'story':
        return storyStep(opts);
      case 'chars':
        return charsStep(opts);
      case 'quiz':
        return quizStep(id, step, opts);
      case 'riddle':
        return riddleStep(step.idiom, opts);
      case 'idiomStory':
        return idiomStoryStep(step.idiom, opts);
      case 'idiomMeaning':
        return idiomMeaningStep(step.idiom, opts);
      case 'review':
        return reviewStep(id, opts);
      default:
        return '';
    }
  }

  function cardOpen(opts, extra) {
    return '<article class="card' + (opts && opts.again ? '' : ' step') + (extra ? ' ' + extra : '') + '">';
  }

  function talk(img, html) {
    return '<div class="talk"><img src="images/' + img + '" alt="墨墨" width="96" height="102"><div class="bubble">' + html + '</div></div>';
  }

  function lockedStep(id, step) {
    var steps = STEPS[id];
    var back = 0;
    var msg;
    if (step.key === 'review') {
      msg = '先通過這一課所有的守門關卡，才能打開答案解析喔！';
      for (var i = 0; i < steps.length; i++) {
        if (steps[i].key === 'quiz' || steps[i].key === 'riddle') {
          back = i;
          break;
        }
      }
    } else {
      msg = '先猜出這一關的成語，才能看成語故事喔！';
      for (var j = 0; j < steps.length; j++) {
        if (steps[j].key === 'riddle' && steps[j].idiom === step.idiom) back = j;
      }
    }
    return '<article class="card step">' + talk('momo-think.svg', '🔒 ' + msg) + '<a class="btn primary" href="#/' + id + '/' + back + '">回到關卡 →</a></article>';
  }

  // A：闖關任務
  function missionStep(L, opts) {
    var m = L.mission;
    return (
      cardOpen(opts) +
      '<h2 class="step-title"><span class="tag">A</span>' + esc(m.title) + '</h2>' +
      talk('momo.svg', esc(m.intro)) +
      '<h3>🎯 闖關目標</h3>' +
      '<ol class="mission-goals">' +
      m.goals
        .map(function (g, i) {
          return '<li><span class="n">' + (i + 1) + '</span><span>' + esc(g) + '</span></li>';
        })
        .join('') +
      '</ol>' +
      '<div class="quiz-actions"><a class="btn pink" href="#/' + L.id + '/1">接受任務，出發！🚀</a></div>' +
      '</article>'
    );
  }

  function promptDetails(obj, idp) {
    return (
      '<details class="teacher"><summary>🎨 情境圖生成描述（老師／AI 繪圖用）</summary>' +
      '<h4>中文描述</h4><div class="prompt-box" id="' + idp + '-zh">' + esc(obj.promptZh) + '</div>' +
      '<p><button type="button" class="btn small" data-act="copy" data-target="' + idp + '-zh">📋 複製中文描述</button></p>' +
      '<h4>English prompt（給 AI 繪圖工具）</h4><div class="prompt-box en" id="' + idp + '-en">' + esc(obj.promptEn) + '</div>' +
      '<p><button type="button" class="btn small" data-act="copy" data-target="' + idp + '-en">📋 Copy prompt</button></p>' +
      '</details>'
    );
  }

  // B：情境圖＋找生字
  function sceneStep(opts) {
    var s = L1.scene;
    var found = state.found;
    var all = found.length === s.hotspots.length;
    return (
      cardOpen(opts) +
      '<h2 class="step-title"><span class="tag">B</span>情境圖：' + esc(L1.theme) + '</h2>' +
      talk(all ? 'momo-happy.svg' : 'momo.svg', all ? '太厲害了！五個生字都找到了！接下來去讀一讀短文吧！' : esc(s.findTask)) +
      '<figure style="margin:0"><div class="scene pan"><div class="pan-inner">' +
      '<img src="' + s.img + '" width="1200" height="800" alt="' + esc(s.alt) + '">' +
      s.hotspots
        .map(function (h, i) {
          var f = found.indexOf(h.char) >= 0;
          return '<button type="button" class="hotspot' + (f ? ' found' : '') + '" style="left:' + h.x + '%;top:' + h.y + '%" data-act="find" data-char="' + h.char + '" aria-label="' + (f ? '已找到「' + h.char + '」' : '發光的字，第 ' + (i + 1) + ' 個') + '"></button>';
        })
        .join('') +
      '</div></div><p class="pan-hint">👆 圖片可以左右滑動，發光的字在右邊的大樹上</p><figcaption class="scene-caption">' + esc(s.caption) + '</figcaption></figure>' +
      '<div class="find-bar"><span>找到的生字：</span><div class="find-slots">' +
      s.hotspots
        .map(function (h) {
          var f = found.indexOf(h.char) >= 0;
          return '<span class="find-slot' + (f ? ' filled' : '') + '">' + (f ? h.char : '') + '</span>';
        })
        .join('') +
      '</div><b>' + found.length + '／' + s.hotspots.length + '</b></div>' +
      '<p class="find-pop" id="find-pop" aria-live="polite">' + (opts && opts.foundMsg ? opts.foundMsg : '') + '</p>' +
      promptDetails(s, 'p-l1') +
      '</article>'
    );
  }

  function toolsBar(text) {
    return (
      '<div class="tools">' +
      (TTS.can(text) ? '<button type="button" class="btn small yellow" data-act="speak" data-text="' + esc(text) + '">🔊 念給我聽</button>' : '') +
      '<button type="button" class="btn small" data-act="zhuyin" aria-pressed="' + !state.zhuyin + '">' + (state.zhuyin ? '🙈 隱藏注音挑戰' : '👀 顯示注音') + '</button>' +
      '</div>'
    );
  }

  // C：趣味短文
  function storyStep(opts) {
    return (
      cardOpen(opts) +
      '<h2 class="step-title"><span class="tag">C</span>趣味短文：' + esc(L1.story.title) + '</h2>' +
      toolsBar(plain(L1.story.text)) +
      '<p class="story' + (state.zhuyin ? '' : ' hide-zhuyin') + '">' + rubyHTML(L1.story.text) + '</p>' +
      '<p class="note">💡 畫上黃色底線的是今天的生字，點一下就能打開生字卡。' + esc(L1.story.note) + '</p>' +
      '</article>'
    );
  }

  // D：生字解說
  function charInfo(c, compact) {
    var meaning = c.polyphone
      ? '<div class="info-block mean"><h4>🔀 破音字：一個字，兩種念法</h4><div class="poly">' +
        c.polyphone
          .map(function (p) {
            return '<div><b>' + p.zhuyin + '</b>　' + esc(p.meaning) + '<div class="word-chips" style="margin-top:6px">' + p.words.map(function (w) {
              return '<span class="chip">' + w + '</span>';
            }).join('') + '</div></div>';
          })
          .join('') +
        '</div></div>'
      : '<div class="info-block mean"><h4>💡 字義</h4><ul>' + c.meanings.map(function (m) {
          return '<li>' + esc(m) + '</li>';
        }).join('') + '</ul></div>';
    return (
      '<div class="info-block origin"><h4>📜 說文解字小故事</h4><p>' + esc(c.origin) + '</p></div>' +
      meaning +
      (compact
        ? ''
        : '<div class="info-block words"><h4>🧩 常用詞語</h4><div class="word-chips">' + c.words.map(function (w) {
            return '<span class="chip">' + w + '</span>';
          }).join('') + '</div></div>') +
      '<div class="info-block sent"><h4>✏️ 例句</h4><div class="example" style="background:none;border:0;padding:0;margin:0"><p>' + esc(c.sentence) + '</p>' + speakBtn(c.sentence, '念例句') + '</div></div>'
    );
  }

  function charBig(c) {
    return (
      '<div class="char-big">' +
      '<div class="grid" aria-hidden="true">' + c.char + '</div>' +
      '<div class="zy">' + c.zhuyin + (c.zhuyin2 ? '／' + c.zhuyin2 : '') + ' ' + speakBtn(c.say, '念「' + c.char + '」的讀音') + '</div>' +
      '<div class="char-facts"><span class="chip blue">部首：' + c.radical + '</span><span class="chip pink">總筆畫：' + c.strokes + ' 畫</span></div>' +
      '<p class="note">' + esc(c.parts) + '</p>' +
      '</div>'
    );
  }

  function charsStep(opts) {
    var c = L1.chars[selectedChar];
    var seenAll = L1.chars.every(function (x) {
      return state.seenChars.indexOf(x.char) >= 0;
    });
    return (
      cardOpen(opts) +
      '<h2 class="step-title"><span class="tag">D</span>生字解說：說文解字</h2>' +
      talk(seenAll ? 'momo-happy.svg' : 'momo.svg', seenAll ? '五個生字都看完了！準備好就去挑戰<b>守門關卡</b>吧！' : '點一點下面的字，看看每個字是<b>怎麼組成的</b>。部首常常藏著字的意思喔！') +
      '<div class="char-picker" role="group" aria-label="選擇生字">' +
      L1.chars
        .map(function (x, i) {
          var seen = state.seenChars.indexOf(x.char) >= 0;
          return '<button type="button" class="char-tile' + (seen ? ' seen' : '') + '" data-act="pick-char" data-i="' + i + '" aria-pressed="' + (i === selectedChar) + '" aria-label="生字「' + x.char + '」' + (seen ? '（看過了）' : '') + '">' + x.char + '</button>';
        })
        .join('') +
      '</div>' +
      '<div class="char-detail" id="char-detail">' + charBig(c) + '<div>' + charInfo(c) + '</div></div>' +
      '</article>'
    );
  }

  // E：選擇題（第一課與第二課共用）
  function quizStep(id, step, opts) {
    var qs = step.idiom === undefined ? L1.quiz : L2.idioms[step.idiom].quiz;
    var key = id + (step.idiom === undefined ? '' : step.idiom);
    if (quizPos[key] === undefined) {
      var first = 0;
      for (var i = 0; i < qs.length; i++) {
        if (!state.solved[qs[i].id]) {
          first = i;
          break;
        }
        first = qs.length - 1;
      }
      quizPos[key] = first;
    }
    var qi = quizPos[key];
    var q = qs[qi];
    var solved = state.solved[q.id];
    var last = qi === qs.length - 1;
    var steps = STEPS[id];
    var nextIdx = current.idx + 1;
    var nextBtn = '';
    if (solved) {
      if (!last) nextBtn = '<button type="button" class="btn primary" data-act="next-q" data-key="' + key + '">下一題 →</button>';
      else if (nextIdx < steps.length) nextBtn = '<a class="btn primary" href="#/' + id + '/' + nextIdx + '">過關！前往「' + esc(steps[nextIdx].label) + '」→</a>';
    }
    return (
      cardOpen(opts) +
      '<div class="quiz-head"><h2 class="step-title" style="margin:0"><span class="tag">E</span>守門關卡 ' + (qi + 1) + '／' + qs.length + '</h2>' +
      '<div class="dots" aria-label="作答進度">' +
      qs
        .map(function (x, i) {
          return '<i class="' + (state.solved[x.id] ? 'ok' : '') + (i === qi ? ' on' : '') + '" title="第 ' + (i + 1) + ' 題"></i>';
        })
        .join('') +
      '</div></div>' +
      '<span class="chip pink">' + esc(q.kind) + '</span>' +
      questionHTML(q, opts) +
      '<div class="quiz-actions">' +
      (!solved ? '<button type="button" class="btn small yellow" data-act="hint" data-q="' + q.id + '">💡 墨墨提示</button>' : '') +
      (qi > 0 ? '<button type="button" class="btn small" data-act="prev-q" data-key="' + key + '">← 上一題</button>' : '') +
      nextBtn +
      '</div>' +
      '</article>'
    );
  }

  function questionHTML(q, opts) {
    var tried = state.tried[q.id] || [];
    var solved = state.solved[q.id];
    var flash = opts && opts.flash && opts.flash.id === q.id ? opts.flash.i : -1;
    var long = q.options.some(function (o) {
      return o.length > 12;
    });
    var single = q.options.every(function (o) {
      return o.length <= 2;
    });
    return (
      '<div class="question">' + (q.bigChar ? '<span class="big" aria-hidden="true">' + q.bigChar + '</span>' : '') + '<p style="margin:0">' + esc(q.question) + '</p></div>' +
      '<div class="choices' + (long ? ' long' : '') + '">' +
      q.options
        .map(function (o, i) {
          var wrong = tried.indexOf(i) >= 0 && i !== q.answer;
          var right = solved && i === q.answer;
          var cls = 'choice' + (single ? ' kai-text' : '') + (wrong ? ' wrong' : '') + (right ? ' correct' : '') + (i === flash ? (wrong ? ' just-wrong' : ' just-right') : '');
          return (
            '<button type="button" class="' + cls + '" data-act="answer" data-q="' + q.id + '" data-i="' + i + '"' + (solved || wrong ? ' disabled' : '') + '>' +
            '<span class="letter" aria-hidden="true">' + (wrong ? '✗' : right ? '✓' : LETTERS[i]) + '</span>' +
            '<span class="txt">' + esc(o) + '</span>' +
            '<span class="visually-hidden">' + (wrong ? '（答錯了）' : right ? '（正確答案）' : '') + '</span>' +
            '</button>'
          );
        })
        .join('') +
      '</div>' +
      '<div class="feedback" id="fb-' + q.id + '" tabindex="-1" aria-live="polite">' + feedbackHTML(q) + '</div>'
    );
  }

  function feedbackHTML(q) {
    var tried = state.tried[q.id] || [];
    if (state.solved[q.id]) {
      var star = state.stars[q.id];
      return (
        '<div class="fb ok"><img src="images/momo-happy.svg" alt="" width="70" height="74"><div>' +
        '<h4>答對了！正確答案是 ' + LETTERS[q.answer] + (star ? '　⭐ 第一次就答對，獲得一顆星星！' : '　（再接再厲，下一題拿星星！）') + '</h4>' +
        '<p><b>解析：</b>' + esc(q.explain) + '</p></div></div>'
      );
    }
    var last = tried[tried.length - 1];
    if (last !== undefined && last !== q.answer) {
      return '<div class="fb no"><img src="images/momo-think.svg" alt="" width="70" height="74"><div><h4>差一點點！再想一想～</h4><p>' + esc(q.hint) + '</p></div></div>';
    }
    if (state.hints[q.id]) {
      return '<div class="fb hint"><img src="images/momo.svg" alt="" width="70" height="74"><div><h4>墨墨提示</h4><p>' + esc(q.hint) + '</p></div></div>';
    }
    return '';
  }

  // 第二課 B：看圖猜成語
  function idiomSpeak(it) {
    var b = speakBtn(it.answer, '念「' + it.answer + '」');
    return b ? '<p style="text-align:center;margin:0 0 6px">' + b + '</p>' : '';
  }

  function revealTiles(it, withZy) {
    return (
      '<div class="reveal' + (withZy === false ? '' : ' with-zy') + '" aria-label="' + it.answer + '">' +
      it.answer
        .split('')
        .map(function (ch, i) {
          return '<span class="tile" style="animation-delay:' + i * 0.15 + 's" aria-hidden="true">' + (withZy === false ? '' : '<small>' + it.zhuyin[i] + '</small>') + ch + '</span>';
        })
        .join('') +
      '</div>'
    );
  }

  function riddleStep(i, opts) {
    var it = L2.idioms[i];
    var r = it.riddle;
    var rid = it.id + '-riddle';
    var solved = state.solved[rid];
    var tried = state.tried[rid] || [];
    var shown = state.clues[rid] || 0;
    var flash = opts && opts.flash && opts.flash.id === rid ? opts.flash.i : -1;
    var nextIdx = current.idx + 1;
    var lastWrong = tried.length && tried[tried.length - 1] !== r.answerIndex ? r.choices[tried[tried.length - 1]] : null;
    var fb = '';
    if (solved) {
      fb =
        '<div class="fb ok"><img src="images/momo-happy.svg" alt="" width="70" height="74"><div>' +
        '<h4>答對了！就是「' + it.answer + '」' + (state.stars[rid] ? '　⭐ 一次就猜中，獲得一顆星星！' : '') + '</h4>' +
        '<p>' + esc(it.meaning) + '</p></div></div>' +
        revealTiles(it) +
        idiomSpeak(it) +
        '<div class="quiz-actions" style="justify-content:center"><a class="btn primary" href="#/lesson2/' + nextIdx + '">📖 看「' + it.answer + '」的故事 →</a></div>';
    } else if (lastWrong) {
      fb = '<div class="fb no"><img src="images/momo-think.svg" alt="" width="70" height="74"><div><h4>不是「' + esc(lastWrong) + '」喔！</h4><p>' + esc(r.wrongFeedback[lastWrong] || '') + '</p><p>' + esc(r.hint) + '</p></div></div>';
    }
    var clueList = solved ? r.clues : r.clues.slice(0, shown);
    return (
      cardOpen(opts) +
      '<h2 class="step-title"><span class="tag">B</span>看圖猜成語 ' + (i === 0 ? '①' : '②') + '</h2>' +
      talk('momo-think.svg', '時光機帶我們回到古代了！仔細看看圖裡的<b>人物、動物和東西</b>，猜猜是哪一個成語。') +
      '<div class="scene pan"><div class="pan-inner"><img src="' + r.img + '" width="1200" height="800" alt="' + esc(r.alt) + '"></div></div><p class="pan-hint">👆 圖片可以左右滑動，看清楚每一個角落的線索</p>' +
      (!solved && shown < r.clues.length
        ? '<div class="quiz-actions"><button type="button" class="btn small yellow" data-act="clue" data-r="' + rid + '">🔎 看不出來？給我一條線索（' + shown + '／' + r.clues.length + '）</button></div>'
        : '') +
      (clueList.length
        ? '<ul class="clues">' + clueList.map(function (c) {
            return '<li>' + esc(c) + '</li>';
          }).join('') + '</ul>'
        : '') +
      '<p class="riddle-ask">❓ 猜一猜：這張圖說的是哪一個成語？</p>' +
      '<div class="choices">' +
      r.choices
        .map(function (c, k) {
          var wrong = tried.indexOf(k) >= 0 && k !== r.answerIndex;
          var right = solved && k === r.answerIndex;
          var cls = 'choice kai-text' + (wrong ? ' wrong' : '') + (right ? ' correct' : '') + (k === flash ? (wrong ? ' just-wrong' : ' just-right') : '');
          return (
            '<button type="button" class="' + cls + '" data-act="riddle" data-r="' + rid + '" data-idiom="' + i + '" data-i="' + k + '"' + (solved || wrong ? ' disabled' : '') + '>' +
            '<span class="letter" aria-hidden="true">' + (wrong ? '✗' : right ? '✓' : LETTERS[k]) + '</span><span class="txt">' + c + '</span>' +
            '<span class="visually-hidden">' + (wrong ? '（答錯了）' : right ? '（正確答案）' : '') + '</span></button>'
          );
        })
        .join('') +
      '</div>' +
      '<div class="feedback" id="fb-' + rid + '" tabindex="-1" aria-live="polite">' + fb + '</div>' +
      (solved ? promptDetails(r, 'p-' + it.id) : '') +
      '</article>'
    );
  }

  // 第二課 C：成語故事
  function idiomStoryStep(i, opts) {
    var it = L2.idioms[i];
    var s = it.story;
    return (
      cardOpen(opts) +
      '<h2 class="step-title"><span class="tag">C</span>' + esc(s.title) + '</h2>' +
      revealTiles(it) +
      idiomSpeak(it) +
      toolsBar(plain(s.text)) +
      '<p class="story' + (state.zhuyin ? '' : ' hide-zhuyin') + '">' + rubyHTML(s.text) + '</p>' +
      '<p class="source">📚 故事出處：' + rubyHTML(s.source) + '</p>' +
      '<details class="teacher"><summary>📜 看看古書原文</summary>' +
      '<p class="orig">' + esc(s.original) + '</p>' +
      '<dl class="gloss">' + s.glossary.map(function (g) {
        return '<dt>' + esc(g[0]) + '</dt><dd>' + esc(g[1]) + '</dd>';
      }).join('') + '</dl></details>' +
      '</article>'
    );
  }

  // 第二課 D：成語解釋
  function idiomMeaningStep(i, opts) {
    var it = L2.idioms[i];
    return (
      cardOpen(opts) +
      '<h2 class="step-title"><span class="tag">D</span>成語解釋：' + it.answer + '</h2>' +
      revealTiles(it) +
      idiomSpeak(it) +
      '<h3>🔍 一個字一個字看</h3>' +
      '<div class="literal">' + it.literal.map(function (l) {
        return '<div><b>' + l[0] + '</b><span>' + esc(l[1]) + '</span></div>';
      }).join('') + '</div>' +
      '<p>' + esc(it.literalSentence) + '</p>' +
      '<h3>💡 比喻的意思</h3><div class="meaning-box">' + esc(it.meaning) + '</div>' +
      '<h3>🗣️ 生活例句</h3>' +
      it.examples.map(function (e) {
        return '<div class="example"><p>' + esc(e) + '</p>' + speakBtn(e, '念例句') + '</div>';
      }).join('') +
      '<div class="word-chips" style="margin-top:12px">' +
      (it.similar.length ? '<span class="chip green">近義成語：' + it.similar.join('、') + '</span>' : '') +
      (it.opposite.length ? '<span class="chip pink">反義成語：' + it.opposite.join('、') + '</span>' : '') +
      '</div>' +
      '</article>'
    );
  }

  // F：答案解析與徽章
  function reviewItem(title, answer, explain) {
    return '<div class="review-item"><h4>' + title + '</h4><span class="ans">正確答案：' + answer + '</span><p>' + explain + '</p></div>';
  }

  function quizReview(q, n) {
    return reviewItem(n + '　' + esc(q.question), LETTERS[q.answer] + '．' + esc(q.options[q.answer]) + (state.stars[q.id] ? '　⭐' : ''), esc(q.explain));
  }

  function reviewStep(id, opts) {
    var L = lessonData(id);
    var ids = lessonStars(id);
    var got = ids.filter(function (x) {
      return state.stars[x];
    }).length;
    var items = '';
    if (id === 'lesson1') {
      items = L1.quiz
        .map(function (q, i) {
          return quizReview(q, '第 ' + (i + 1) + ' 題（' + q.kind + '）');
        })
        .join('');
    } else {
      L2.idioms.forEach(function (it, k) {
        var n = k === 0 ? '①' : '②';
        items += '<h3>成語' + n + '：' + it.answer + '</h3>';
        items += reviewItem('看圖猜成語' + n, it.answer + (state.stars[it.id + '-riddle'] ? '　⭐' : ''), '圖中的線索：' + esc(it.riddle.clues.join('')) + '所以答案是「' + it.answer + '」，意思是：' + esc(it.meaning));
        items += it.quiz
          .map(function (q, i) {
            return quizReview(q, '守門關卡' + n + '－第 ' + (i + 1) + ' 題（' + q.kind + '）');
          })
          .join('');
      });
    }
    var next = id === 'lesson1' ? '<a class="btn pink" href="#/lesson2/0">前往第二課：成語猜謎 →</a>' : '<a class="btn yellow" href="#/finish">🏅 領取通關證書</a>';
    return (
      cardOpen(opts) +
      '<h2 class="step-title"><span class="tag">F</span>正確答案與簡短解析</h2>' +
      '<div class="badge-award"><div class="medal" aria-hidden="true">' + L.badge.icon + '</div>' +
      '<h3>恭喜獲得「' + L.badge.name + '」徽章！</h3><p>這一課拿到 ⭐ ' + got + '／' + ids.length + ' 顆星星</p></div>' +
      items +
      '<div class="quiz-actions" style="justify-content:center">' + next + '<button type="button" class="btn small" data-act="retry" data-lesson="' + id + '">🔄 這一課重玩一次</button></div>' +
      '</article>'
    );
  }

  // ---------------------------------------------------------------
  // 通關證書
  // ---------------------------------------------------------------
  function renderFinish() {
    var d1 = lesson1Done();
    var d2 = lesson2Done();
    if (!d1 || !d2) {
      return (
        '<section class="wrap"><div class="card step" style="margin-top:28px">' +
        talk('momo-think.svg', '還差一點點就能領取通關證書了！把下面的關卡都完成吧！') +
        '<ul class="mission-goals" style="margin-top:12px">' +
        '<li><span class="n">' + (d1 ? '✓' : '1') + '</span><span>第一課：說文解字 ' + (d1 ? '（已通關）' : '— <a href="#/lesson1/0">前往闖關</a>') + '</span></li>' +
        '<li><span class="n">' + (d2 ? '✓' : '2') + '</span><span>第二課：成語猜謎 ' + (d2 ? '（已通關）' : '— <a href="#/lesson2/0">前往闖關</a>') + '</span></li>' +
        '</ul><p>目前星星：⭐ ' + starCount() + '／' + STAR_IDS.length + '</p></div></section>'
      );
    }
    var n = starCount();
    var today = new Date();
    var date = today.getFullYear() + ' 年 ' + (today.getMonth() + 1) + ' 月 ' + today.getDate() + ' 日';
    return (
      '<section class="wrap" style="margin-top:28px">' +
      '<div class="cert">' +
      '<p style="margin:0;color:var(--muted)">小朋友的寒假國語特攻隊</p>' +
      '<h1>通關證書</h1>' +
      '<div class="name">' + esc(state.name || '特攻隊員') + '</div>' +
      '<p style="font-size:20px">完成了「第一課 說文解字」和「第二課 成語猜謎」所有關卡，<br>表現非常出色，特頒此證，以資鼓勵！</p>' +
      '<div class="stars" aria-label="獲得 ' + n + ' 顆星星">' + Array(n + 1).join('⭐') + '<span style="opacity:.25">' + Array(STAR_IDS.length - n + 1).join('⭐') + '</span></div>' +
      '<div class="badges"><span class="chip" style="font-size:20px">' + L1.badge.icon + ' ' + L1.badge.name + '</span><span class="chip pink" style="font-size:20px">' + L2.badge.icon + ' ' + L2.badge.name + '</span></div>' +
      '<img class="team-img" src="images/team.svg" alt="特攻隊成員小宇、墨墨和小晴一起揮手慶祝" width="600" height="370">' +
      '<p style="color:var(--muted);margin:6px 0 0">頒發日期：' + date + '</p>' +
      '</div>' +
      '<form class="name-form no-print" data-act-form="name"><label class="visually-hidden" for="kid-name">你的名字</label>' +
      '<input id="kid-name" name="kid" maxlength="12" placeholder="寫上你的名字" value="' + esc(state.name) + '" autocomplete="off">' +
      '<button class="btn primary" type="submit">✏️ 寫上名字</button>' +
      '<button class="btn yellow" type="button" data-act="print">🖨️ 列印證書</button>' +
      '<button class="btn" type="button" data-act="reset">🔄 全部重玩</button></form>' +
      '</section>'
    );
  }

  // ---------------------------------------------------------------
  // 教師版：依 A～F 順序列出完整教材與答案
  // ---------------------------------------------------------------
  function optList(options, answer) {
    return (
      '<ol class="opts" type="A">' +
      options
        .map(function (o, i) {
          return '<li' + (i === answer ? ' class="right"' : '') + '>' + esc(o) + (i === answer ? '　✔' : '') + '</li>';
        })
        .join('') +
      '</ol>'
    );
  }

  function promptBlock(obj, idp) {
    return (
      '<h4>中文生成描述</h4><div class="prompt-box" id="' + idp + '-zh">' + esc(obj.promptZh) + '</div>' +
      '<p class="no-print"><button type="button" class="btn small" data-act="copy" data-target="' + idp + '-zh">📋 複製中文描述</button></p>' +
      '<h4>English prompt</h4><div class="prompt-box en" id="' + idp + '-en">' + esc(obj.promptEn) + '</div>' +
      '<p class="no-print"><button type="button" class="btn small" data-act="copy" data-target="' + idp + '-en">📋 Copy prompt</button></p>'
    );
  }

  function renderTeacher() {
    var h = '';
    h += '<section class="wrap teacher-page">';
    h += '<div class="lesson-head"><a class="btn small no-print" href="#/">🗺️ 回地圖</a><div><span class="lesson-no">教師版</span> <h1>完整教材與答案</h1><p class="theme">每一課依「A 課程標題與闖關任務 → B 情境圖生成描述 → C 短文或成語故事 → D 生字詞語或成語解釋 → E 互動選擇題 → F 正確答案與簡短解析」的順序整理，可直接列印。</p></div></div>';
    h += '<div class="teacher-toolbar"><button type="button" class="btn yellow small" data-act="print">🖨️ 列印教材</button><button type="button" class="btn small" data-act="reset">🔄 清除學生闖關紀錄</button></div>';

    h += '<h2>課程參數</h2><div class="card"><div class="table-scroll"><table class="param-table"><tbody>';
    h += '<tr><th>教學年級</th><td>' + COURSE.grade + '</td></tr>';
    h += '<tr><th>人物角色</th><td>小學生（小宇、小晴）＋可愛動物夥伴（三花貓墨墨）</td></tr>';
    h += '<tr><th>背景畫風</th><td>日系 Q 版卡通，色彩鮮明、活潑可愛</td></tr>';
    h += '<tr><th>學習情境</th><td>冒險闖關：第一課森林尋寶、第二課搭時光機回到成語故事裡</td></tr>';
    h += '<tr><th>教材難度</th><td>適中，循序漸進：先看圖、再讀文、後解字，最後作答</td></tr>';
    h += '<tr><th>題型</th><td>看圖猜謎＋四選一選擇題。答錯可以再試，會出現提示；第一次就答對可得一顆星星，全課共 ' + STAR_IDS.length + ' 顆。</td></tr>';
    var ai = window.AUDIO_INFO;
    h += '<tr><th>朗讀語音</th><td>' + (ai ? '以 Gemini TTS（' + esc(ai.model) + '，聲音 ' + esc(ai.voice) + '）預先產生，共 ' + Object.keys(CLIPS).length + ' 段，並以 Gemini 聽寫自動核對內容與破音字讀音。' : '使用瀏覽器內建語音。') + '</td></tr>';
    h += '</tbody></table></div></div>';

    h += '<h2>角色設定與畫風</h2><div class="card"><div class="team"><img src="images/team.svg" alt="特攻隊成員：小宇、墨墨、小晴" width="600" height="370"><div class="team-members">';
    h += COURSE.team
      .map(function (m) {
        return '<div class="member"><div><b>' + esc(m.name) + '</b>　<span class="chip">' + esc(m.role) + '</span><p>' + esc(m.look) + '</p></div></div>';
      })
      .join('');
    h += '</div></div><h4>畫風說明（每張情境圖共用）</h4><p>' + esc(COURSE.styleGuide) + '</p></div>';

    // ---- 第一課 ----
    h += '<h2>第一課：說文解字</h2>';
    h += '<h3><span class="tag">A</span>課程標題與闖關任務</h3><div class="card"><p><b>課程標題：</b>' + L1.no + '　' + L1.title + '——' + L1.theme + '</p><p><b>' + esc(L1.mission.title) + '</b></p><p>' + esc(L1.mission.intro) + '</p><ol>' + L1.mission.goals.map(function (g) {
      return '<li>' + esc(g) + '</li>';
    }).join('') + '</ol></div>';
    h += '<h3><span class="tag">B</span>情境圖生成描述</h3><div class="card"><div class="scene"><img src="' + L1.scene.img + '" alt="' + esc(L1.scene.alt) + '" width="1200" height="800" loading="lazy"></div>' + promptBlock(L1.scene, 't-l1') + '</div>';
    h += '<h3><span class="tag">C</span>趣味短文</h3><div class="card"><p class="story">' + rubyHTML(L1.story.text, false) + '</p><p class="note">' + esc(L1.story.note) + '目標生字：' + L1.chars.map(function (c) {
      return c.char;
    }).join('、') + '。</p></div>';
    h += '<h3><span class="tag">D</span>生字詞語解釋</h3><div class="card"><div class="table-scroll"><table class="char-table"><thead><tr><th>生字</th><th>注音</th><th>部首／筆畫</th><th>字形結構與說文解字</th><th>字義</th><th>常用詞語</th><th>例句</th></tr></thead><tbody>';
    h += L1.chars
      .map(function (c) {
        return (
          '<tr><td class="c">' + c.char + '</td><td>' + c.zhuyin + (c.zhuyin2 ? '<br>' + c.zhuyin2 : '') + '</td><td>' + c.radical + '<br>' + c.strokes + ' 畫</td><td>' + esc(c.parts) + '<br>' + esc(c.origin) + '</td><td>' + c.meanings.map(esc).join('<br>') + '</td><td>' + c.words.join('、') + '</td><td>' + esc(c.sentence) + '</td></tr>'
        );
      })
      .join('');
    h += '</tbody></table></div></div>';
    h += '<h3><span class="tag">E</span>互動選擇題</h3><div class="card">';
    h += '<p><b>暖身活動（看圖找字）：</b>' + esc(L1.scene.findTask) + '（找齊五個字可得一顆星星）</p>';
    h += L1.quiz
      .map(function (q, i) {
        return '<h4>第 ' + (i + 1) + ' 題（' + esc(q.kind) + '）</h4><p>' + esc(q.question) + '</p>' + optList(q.options, -1);
      })
      .join('');
    h += '</div>';
    h += '<h3><span class="tag">F</span>正確答案與簡短解析</h3><div class="card">';
    h += L1.quiz
      .map(function (q, i) {
        return '<div class="answer-key"><b>第 ' + (i + 1) + ' 題：' + LETTERS[q.answer] + '．' + esc(q.options[q.answer]) + '</b><br>' + esc(q.explain) + '</div>';
      })
      .join('');
    h += '</div>';

    // ---- 第二課 ----
    h += '<h2>第二課：成語猜謎</h2>';
    h += '<h3><span class="tag">A</span>課程標題與闖關任務</h3><div class="card"><p><b>課程標題：</b>' + L2.no + '　' + L2.title + '——' + L2.theme + '</p><p><b>' + esc(L2.mission.title) + '</b></p><p>' + esc(L2.mission.intro) + '</p><ol>' + L2.mission.goals.map(function (g) {
      return '<li>' + esc(g) + '</li>';
    }).join('') + '</ol><p><b>本課成語：</b>' + L2.idioms.map(function (it) {
      return it.answer;
    }).join('、') + '（圖片中不出現答案文字，學生先看圖猜，再揭曉）</p></div>';
    h += '<h3><span class="tag">B</span>情境圖生成描述（看圖猜成語）</h3>';
    L2.idioms.forEach(function (it, k) {
      h += '<div class="card"><h4>成語' + (k === 0 ? '①' : '②') + '：' + it.answer + '</h4><div class="scene"><img src="' + it.riddle.img + '" alt="' + esc(it.riddle.alt) + '" width="1200" height="800" loading="lazy"></div>';
      h += '<h4>圖中的視覺線索</h4><ul>' + it.riddle.clues.map(function (c) {
        return '<li>' + esc(c) + '</li>';
      }).join('') + '</ul>';
      h += promptBlock(it.riddle, 't-' + it.id) + '</div>';
    });
    h += '<h3><span class="tag">C</span>成語故事</h3>';
    L2.idioms.forEach(function (it) {
      h += '<div class="card"><h4>' + esc(it.story.title) + '</h4><p class="story" style="font-size:20px">' + rubyHTML(it.story.text, false) + '</p><p><b>出處：</b>' + esc(it.story.sourcePlain) + '</p><p><b>原文：</b></p><p class="orig">' + esc(it.story.original) + '</p><dl class="gloss">' + it.story.glossary.map(function (g) {
        return '<dt>' + esc(g[0]) + '</dt><dd>' + esc(g[1]) + '</dd>';
      }).join('') + '</dl></div>';
    });
    h += '<h3><span class="tag">D</span>成語解釋</h3>';
    L2.idioms.forEach(function (it) {
      h += '<div class="card"><h4>' + it.answer + '（' + it.zhuyin.join(' ') + '）</h4>';
      h += '<p><b>字面意思：</b>' + it.literal.map(function (l) {
        return l[0] + '＝' + l[1];
      }).join('；') + '。' + esc(it.literalSentence.replace(/^字面意思：/, '')) + '</p>';
      h += '<p><b>比喻意思：</b>' + esc(it.meaning) + '</p>';
      h += '<p><b>生活例句：</b></p><ol>' + it.examples.map(function (e) {
        return '<li>' + esc(e) + '</li>';
      }).join('') + '</ol>';
      h += '<p>' + (it.similar.length ? '<b>近義成語：</b>' + it.similar.join('、') + '　' : '') + (it.opposite.length ? '<b>反義成語：</b>' + it.opposite.join('、') : '') + '</p></div>';
    });
    h += '<h3><span class="tag">E</span>互動選擇題</h3><div class="card">';
    L2.idioms.forEach(function (it, k) {
      var n = k === 0 ? '①' : '②';
      h += '<h4>看圖猜成語' + n + '</h4><p>看情境圖，猜猜是哪一個成語？</p>' + optList(it.riddle.choices, -1);
      it.quiz.forEach(function (q, i) {
        h += '<h4>守門關卡' + n + '－第 ' + (i + 1) + ' 題（' + esc(q.kind) + '）</h4><p>' + esc(q.question) + '</p>' + optList(q.options, -1);
      });
    });
    h += '</div>';
    h += '<h3><span class="tag">F</span>正確答案與簡短解析</h3><div class="card">';
    L2.idioms.forEach(function (it, k) {
      var n = k === 0 ? '①' : '②';
      h += '<div class="answer-key"><b>看圖猜成語' + n + '：' + LETTERS[it.riddle.answerIndex] + '．' + it.answer + '</b><br>' + esc(it.riddle.clues.join('')) + '</div>';
      it.quiz.forEach(function (q, i) {
        h += '<div class="answer-key"><b>守門關卡' + n + '－第 ' + (i + 1) + ' 題：' + LETTERS[q.answer] + '．' + esc(q.options[q.answer]) + '</b><br>' + esc(q.explain) + '</div>';
      });
    });
    h += '</div>';

    h += '<h2>參考資源</h2><div class="card"><ul>' + COURSE.references.map(function (r) {
      return '<li><a href="' + r.url + '" target="_blank" rel="noopener">' + esc(r.name) + '</a></li>';
    }).join('') + '</ul><p class="note">本示範教材的生字依國小三年級常見程度挑選；正式上課前，建議老師對照班級使用的課本版本與教育部字詞彙表，替換成當學期的生字。成語典故依古籍原文改寫成白話，原文附在「C 成語故事」中。</p></div>';
    h += '</section>';
    return h;
  }

  // ---------------------------------------------------------------
  // 彈出視窗（短文裡點生字）
  // ---------------------------------------------------------------
  var lastFocus = null;
  function openModal(html, label) {
    closeModal();
    lastFocus = document.activeElement;
    var m = document.createElement('div');
    m.className = 'modal';
    m.id = 'modal';
    m.setAttribute('role', 'dialog');
    m.setAttribute('aria-modal', 'true');
    m.setAttribute('aria-label', label || '說明');
    m.innerHTML = '<div class="card"><button type="button" class="icon-btn close" data-act="close-modal" aria-label="關閉">✕</button>' + html + '</div>';
    document.body.appendChild(m);
    m.querySelector('.close').focus();
  }

  function closeModal() {
    var m = document.getElementById('modal');
    if (m) {
      m.remove();
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    }
  }

  // ---------------------------------------------------------------
  // 互動事件
  // ---------------------------------------------------------------
  function handleFind(btn) {
    var ch = btn.getAttribute('data-char');
    var c = L1.chars.filter(function (x) {
      return x.char === ch;
    })[0];
    var msg = '找到「' + ch + '」（' + c.zhuyin + (c.zhuyin2 ? '／' + c.zhuyin2 : '') + '），常用詞語：' + c.words.join('、');
    if (state.found.indexOf(ch) < 0) {
      state.found.push(ch);
      Sound.found();
      if (state.found.length === L1.scene.hotspots.length) {
        msg = '🎉 五個生字全部找到了！獲得一顆星星！';
        state.stars['l1-find'] = true;
        Sound.correct();
        Confetti.burst(100);
        flyStar(btn);
      }
      saveState();
    }
    refresh({ foundMsg: esc(msg) });
  }

  function handleAnswer(btn) {
    var qid = btn.getAttribute('data-q');
    var i = parseInt(btn.getAttribute('data-i'), 10);
    var q = findQuestion(qid);
    if (!q || state.solved[qid]) return;
    var tried = state.tried[qid] || (state.tried[qid] = []);
    if (tried.indexOf(i) >= 0) return;
    tried.push(i);
    if (i === q.answer) {
      state.solved[qid] = true;
      if (tried.length === 1) {
        state.stars[qid] = true;
        flyStar(btn);
      }
      Sound.correct();
      Confetti.burst(90);
    } else {
      Sound.wrong();
    }
    saveState();
    refresh({ flash: { id: qid, i: i }, focus: '#fb-' + qid });
  }

  function handleRiddle(btn) {
    var rid = btn.getAttribute('data-r');
    var k = parseInt(btn.getAttribute('data-i'), 10);
    var it = L2.idioms[parseInt(btn.getAttribute('data-idiom'), 10)];
    if (state.solved[rid]) return;
    var tried = state.tried[rid] || (state.tried[rid] = []);
    if (tried.indexOf(k) >= 0) return;
    tried.push(k);
    if (k === it.riddle.answerIndex) {
      state.solved[rid] = true;
      if (tried.length === 1) {
        state.stars[rid] = true;
        flyStar(btn);
      }
      Sound.fanfare();
      Confetti.burst(150);
    } else {
      Sound.wrong();
    }
    saveState();
    refresh({ flash: { id: rid, i: k }, focus: '#fb-' + rid });
  }

  function copyText(text) {
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        toast('已複製到剪貼簿！');
      } catch (e) {
        toast('無法自動複製，請手動選取文字複製。');
      }
      ta.remove();
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () {
        toast('已複製到剪貼簿！');
      }, fallback);
    } else {
      fallback();
    }
  }

  function resetLesson(lessonId) {
    var keep = blankState();
    var ids = lessonStars(lessonId).concat(lessonId === 'lesson2' ? L2.idioms.map(function (it) {
      return it.id + '-riddle';
    }) : []);
    var qids = (lessonId === 'lesson1' ? L1.quiz : L2.idioms.reduce(function (a, it) {
      return a.concat(it.quiz);
    }, [])).map(function (q) {
      return q.id;
    });
    ids.concat(qids).forEach(function (id) {
      delete state.tried[id];
      delete state.solved[id];
      delete state.stars[id];
      delete state.hints[id];
      delete state.clues[id];
    });
    if (lessonId === 'lesson1') {
      state.found = keep.found;
      state.seenChars = keep.seenChars;
    }
    Object.keys(quizPos).forEach(function (k) {
      if (k.indexOf(lessonId) === 0) delete quizPos[k];
    });
    saveState();
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-act]');
    if (!t) {
      if (e.target.classList && e.target.classList.contains('modal')) closeModal();
      return;
    }
    var act = t.getAttribute('data-act');
    switch (act) {
      case 'find':
        handleFind(t);
        break;
      case 'answer':
        handleAnswer(t);
        break;
      case 'riddle':
        handleRiddle(t);
        break;
      case 'hint':
        state.hints[t.getAttribute('data-q')] = true;
        Sound.click();
        saveState();
        refresh({ focus: '#fb-' + t.getAttribute('data-q') });
        break;
      case 'clue': {
        var rid = t.getAttribute('data-r');
        state.clues[rid] = (state.clues[rid] || 0) + 1;
        Sound.click();
        saveState();
        refresh();
        break;
      }
      case 'next-q':
      case 'prev-q': {
        var key = t.getAttribute('data-key');
        quizPos[key] += act === 'next-q' ? 1 : -1;
        Sound.click();
        refresh({ focus: '.quiz-head' });
        var head = document.querySelector('.quiz-head');
        if (head) head.scrollIntoView({ block: 'start', behavior: reduceMotion() ? 'auto' : 'smooth' });
        break;
      }
      case 'pick-char': {
        selectedChar = parseInt(t.getAttribute('data-i'), 10);
        var ch = L1.chars[selectedChar].char;
        if (state.seenChars.indexOf(ch) < 0) state.seenChars.push(ch);
        Sound.click();
        saveState();
        refresh({ focus: '.char-tile[aria-pressed="true"]' });
        break;
      }
      case 'char-pop': {
        var c = L1.chars.filter(function (x) {
          return x.char === t.getAttribute('data-char');
        })[0];
        if (!c) break;
        if (state.seenChars.indexOf(c.char) < 0) {
          state.seenChars.push(c.char);
          saveState();
        }
        Sound.click();
        openModal(charBig(c) + charInfo(c, true) + '<p style="text-align:center;margin:12px 0 0"><a class="btn small primary" href="#/lesson1/3" data-act="goto-char" data-i="' + L1.chars.indexOf(c) + '">看完整生字卡 →</a></p>', '生字卡：' + c.char);
        break;
      }
      case 'goto-char':
        selectedChar = parseInt(t.getAttribute('data-i'), 10);
        closeModal();
        break;
      case 'close-modal':
        closeModal();
        break;
      case 'speak':
        TTS.speak(t.getAttribute('data-text'), t);
        break;
      case 'zhuyin':
        state.zhuyin = !state.zhuyin;
        saveState();
        refresh();
        break;
      case 'copy': {
        var el = document.getElementById(t.getAttribute('data-target'));
        if (el) copyText(el.textContent);
        break;
      }
      case 'print':
        window.print();
        break;
      case 'retry': {
        var lid = t.getAttribute('data-lesson');
        resetLesson(lid);
        window.location.hash = '#/' + lid + '/0';
        toast('已清除這一課的作答紀錄，再挑戰一次吧！');
        break;
      }
      case 'reset':
        if (window.confirm('確定要清除所有闖關紀錄和星星嗎？')) {
          var snd = state.sound;
          state = blankState();
          state.sound = snd;
          quizPos = {};
          saveState();
          toast('闖關紀錄已清除！');
          if (window.location.hash === '#/' || window.location.hash === '') render();
          else window.location.hash = '#/';
        }
        break;
      default:
        break;
    }
  });

  document.addEventListener('submit', function (e) {
    var f = e.target;
    if (f.getAttribute('data-act-form') === 'name') {
      e.preventDefault();
      state.name = (f.kid.value || '').trim().slice(0, 12);
      saveState();
      render();
      toast('名字寫好了！可以列印證書囉！');
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });

  document.getElementById('sound-btn').addEventListener('click', function () {
    state.sound = !state.sound;
    saveState();
    updateTopbar(parseHash().page);
    if (state.sound) Sound.click();
  });

  // 頁尾參考資源
  document.getElementById('ref-list').innerHTML = COURSE.references
    .map(function (r) {
      return '<li><a href="' + r.url + '" target="_blank" rel="noopener">' + esc(r.name) + '</a></li>';
    })
    .join('');

  // 飄雪
  (function makeSnow() {
    var box = document.getElementById('snow');
    var html = '';
    for (var i = 0; i < 14; i++) {
      var size = 10 + Math.random() * 14;
      html += '<i style="left:' + (Math.random() * 100).toFixed(1) + '%;font-size:' + size.toFixed(0) + 'px;animation-duration:' + (9 + Math.random() * 10).toFixed(1) + 's;animation-delay:-' + (Math.random() * 18).toFixed(1) + 's">❄</i>';
    }
    box.innerHTML = html;
  })();

  window.addEventListener('hashchange', function () {
    closeModal();
    render();
  });
  render();
})();
