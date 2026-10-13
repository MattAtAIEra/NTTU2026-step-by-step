// 畫面元件：樹、草、雲、溪流、樹樁、寶箱……以及四張情境圖的構圖。
import { OUT, g, path, circle, ellipse, rect, text, place, puff, star, sparkle, linGrad, radGrad, poly } from './lib.mjs';
import { boy, girl, cat, rabbit, farmer, painter, monk, villager, dragon, dragonEyePos, characterDefs, PAINTER_HAND } from './characters.mjs';

// ---------- 小元件 ----------
export function roundTree(x, y, s = 1, { leaf = '#6CC27A', leafDk = '#4FA463', trunk = '#9A6A3F' } = {}) {
  return g(
    { transform: `translate(${x} ${y}) scale(${s})` },
    rect(-9, -40, 18, 42, { rx: 6, fill: trunk, class: 'o' }),
    puff([[-28, -62, 26], [0, -86, 32], [28, -62, 26], [0, -54, 26]], leaf),
    path('M -30 -70 Q -20 -86 -4 -88', { fill: 'none', stroke: '#9BE0A0', 'stroke-width': 5, 'stroke-linecap': 'round' }),
    circle(16, -60, 10, { fill: leafDk, opacity: 0.5 })
  );
}

export function pineTree(x, y, s = 1, { leaf = '#3E9B6A', leafHi = '#5DBB84', trunk = '#8A5A35' } = {}) {
  return g(
    { transform: `translate(${x} ${y}) scale(${s})` },
    rect(-7, -24, 14, 26, { rx: 4, fill: trunk, class: 'o' }),
    path('M -46 -20 L 0 -76 L 46 -20 Q 0 -8 -46 -20 Z', { fill: leaf, class: 'o' }),
    path('M -38 -56 L 0 -110 L 38 -56 Q 0 -44 -38 -56 Z', { fill: leaf, class: 'o' }),
    path('M -28 -90 L 0 -138 L 28 -90 Q 0 -80 -28 -90 Z', { fill: leaf, class: 'o' }),
    path('M -6 -128 L -18 -96 M -10 -96 L -26 -62 M -14 -62 L -34 -28', { stroke: leafHi, 'stroke-width': 5, 'stroke-linecap': 'round' })
  );
}

export function bush(x, y, s = 1, color = '#5DB86A', hi = '#86D58F') {
  return g(
    { transform: `translate(${x} ${y}) scale(${s})` },
    puff([[-40, -18, 26], [-10, -34, 32], [24, -26, 28], [48, -12, 22], [0, -8, 30]], color),
    path('M -30 -30 Q -18 -50 0 -54', { fill: 'none', stroke: hi, 'stroke-width': 5, 'stroke-linecap': 'round' })
  );
}

export function flower(x, y, color = '#FF7A9A', s = 1) {
  return g(
    { transform: `translate(${x} ${y}) scale(${s})` },
    path('M 0 0 L 0 18', { stroke: '#4FA463', 'stroke-width': 3 }),
    [0, 72, 144, 216, 288].map((a) => {
      const r = (a * Math.PI) / 180;
      return circle(Math.cos(r) * 7, Math.sin(r) * 7, 6, { fill: color, class: 'o2' });
    }),
    circle(0, 0, 5, { fill: '#FFD447', class: 'o2' })
  );
}

export function mushroom(x, y, s = 1) {
  return g(
    { transform: `translate(${x} ${y}) scale(${s})` },
    rect(-7, -16, 14, 18, { rx: 5, fill: '#FFF4E0', class: 'o2' }),
    path('M -22 -14 Q -20 -38 0 -38 Q 20 -38 22 -14 Z', { fill: '#E5484D', class: 'o2' }),
    circle(-9, -26, 4, { fill: '#fff' }),
    circle(7, -30, 3, { fill: '#fff' }),
    circle(11, -20, 3, { fill: '#fff' })
  );
}

export function cloud(x, y, s = 1, cls = 'drift', delay = 0) {
  return g(
    { transform: `translate(${x} ${y}) scale(${s})` },
    g(
      { class: cls, style: delay ? `animation-delay:${delay}s` : undefined },
      puff([[-40, 0, 24], [-10, -16, 32], [26, -6, 26], [50, 6, 18], [0, 8, 24]], '#fff', { stroke: '#BFD9EA', sw: 3 })
    )
  );
}

export function grassClump(x, y, h = 40, color = '#4FA463', delay = 0) {
  return g(
    { transform: `translate(${x} ${y})` },
    g(
      { class: 'sway', style: `animation-delay:${delay}s` },
      path(`M -12 0 Q -16 ${-h * 0.6} -22 ${-h} Q -8 ${-h * 0.5} -4 0 Z`, { fill: color, class: 'o2' }),
      path(`M -4 0 Q -2 ${-h * 0.8} 2 ${-h * 1.25} Q 8 ${-h * 0.6} 6 0 Z`, { fill: color, class: 'o2' }),
      path(`M 4 0 Q 14 ${-h * 0.5} 22 ${-h * 0.9} Q 12 ${-h * 0.3} 14 0 Z`, { fill: color, class: 'o2' })
    )
  );
}

function sun(x, y, r = 46) {
  const rays = [];
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6;
    rays.push(
      path(`M ${x + Math.cos(a) * (r + 12)} ${y + Math.sin(a) * (r + 12)} L ${x + Math.cos(a) * (r + 30)} ${y + Math.sin(a) * (r + 30)}`, {
        stroke: '#FFC93C',
        'stroke-width': 7,
        'stroke-linecap': 'round',
      })
    );
  }
  return g(
    {},
    circle(x, y, r * 2.4, { fill: 'url(#glowY)', opacity: 0.6 }),
    g({ class: 'rays' }, rays),
    circle(x, y, r, { fill: '#FFD447', class: 'o' }),
    path(`M ${x - 18} ${y - 6} Q ${x - 12} ${y - 14} ${x - 6} ${y - 6}`, { fill: 'none', class: 'o' }),
    path(`M ${x + 6} ${y - 6} Q ${x + 12} ${y - 14} ${x + 18} ${y - 6}`, { fill: 'none', class: 'o' }),
    path(`M ${x - 10} ${y + 10} Q ${x} ${y + 20} ${x + 10} ${y + 10}`, { fill: 'none', class: 'o' }),
    ellipse(x - 24, y + 8, 7, 4, { fill: '#FF9F80', opacity: 0.7 }),
    ellipse(x + 24, y + 8, 7, 4, { fill: '#FF9F80', opacity: 0.7 })
  );
}

function treasureChest(x, y, s = 1) {
  return g(
    { transform: `translate(${x} ${y}) scale(${s})` },
    path('M -46 -36 L -38 -88 Q 0 -102 38 -88 L 46 -36 Z', { fill: '#7A3F17', class: 'o' }),
    path('M -38 -88 Q 0 -102 38 -88', { fill: 'none', stroke: '#F2C94C', 'stroke-width': 6, 'stroke-linecap': 'round' }),
    path('M -8 -36 L -6 -97 L 6 -97 L 8 -36 Z', { fill: '#F2C94C', class: 'o2' }),
    ellipse(0, -38, 44, 12, { fill: '#FFF2A8' }),
    circle(-18, -42, 7, { fill: '#FFD447', class: 'o2' }),
    circle(-4, -46, 7, { fill: '#FFD447', class: 'o2' }),
    circle(14, -42, 7, { fill: '#FFD447', class: 'o2' }),
    rect(-46, -36, 92, 50, { rx: 6, fill: '#C9772F', class: 'o' }),
    rect(-46, -36, 92, 10, { fill: '#F2C94C', class: 'o2' }),
    rect(-10, -36, 20, 50, { fill: '#F2C94C', class: 'o2' }),
    rect(-7, -16, 14, 14, { rx: 3, fill: '#8E5726', class: 'o2' }),
    circle(-30, -6, 3, { fill: '#8E5726' }),
    circle(30, -6, 3, { fill: '#8E5726' })
  );
}

// 發光的生字泡泡
function glowChar(x, y, ch, delay = 0) {
  return g(
    { transform: `translate(${x} ${y})` },
    g(
      { class: 'bob', style: `animation-delay:${delay}s` },
      circle(0, 0, 44, { fill: 'url(#glowY)' }),
      circle(0, 0, 27, { fill: '#FFF8D6', stroke: '#F2B705', 'stroke-width': 3.5 }),
      text(0, 1, ch, { class: 'zi', 'font-size': 34, fill: '#7A3E00' })
    )
  );
}

function stump(x, y, s = 1) {
  return g(
    { transform: `translate(${x} ${y}) scale(${s})` },
    path('M -88 30 Q -60 18 -58 -2 L -58 -60 L 58 -60 L 58 -2 Q 62 18 92 30 Q 50 34 30 22 Q 0 34 -24 22 Q -50 34 -88 30 Z', { fill: '#9A6A3F', class: 'o' }),
    path('M -40 -50 L -36 10 M -6 -50 L -4 16 M 28 -50 L 30 12', { stroke: '#7A5030', 'stroke-width': 3, 'stroke-linecap': 'round' }),
    ellipse(0, -60, 58, 18, { fill: '#E8C48F', class: 'o' }),
    ellipse(0, -60, 40, 12, { fill: 'none', stroke: '#C69A62', 'stroke-width': 2.5 }),
    ellipse(0, -60, 22, 6.5, { fill: 'none', stroke: '#C69A62', 'stroke-width': 2.5 }),
    ellipse(0, -60, 6, 2, { fill: '#C69A62' }),
    path('M 54 -30 Q 74 -46 70 -60 Q 60 -48 54 -40', { fill: '#7CC37A', class: 'o2' })
  );
}

function hoe(x, y, s = 1) {
  return g(
    { transform: `translate(${x} ${y}) scale(${s}) rotate(-8)` },
    path('M -110 0 L 90 -6', { stroke: OUT, 'stroke-width': 14, 'stroke-linecap': 'round' }),
    path('M -110 0 L 90 -6', { stroke: '#C9A15A', 'stroke-width': 8, 'stroke-linecap': 'round' }),
    path('M 84 -14 L 120 -10 L 126 24 Q 108 30 94 24 Z', { fill: '#8C9AA6', class: 'o' }),
    path('M 100 -4 L 112 18', { stroke: '#C5D0D8', 'stroke-width': 3, 'stroke-linecap': 'round' })
  );
}

function snail(x, y, s = 1) {
  return g(
    { transform: `translate(${x} ${y}) scale(${s})` },
    path('M -18 0 Q -20 -6 -10 -6 L 18 -6 Q 26 -6 26 0 Z', { fill: '#E8D3B0', class: 'o2' }),
    path('M 20 -6 L 24 -16 M 24 -6 L 30 -14', { stroke: OUT, 'stroke-width': 2, 'stroke-linecap': 'round' }),
    circle(0, -14, 12, { fill: '#E9A157', class: 'o2' }),
    path('M 0 -14 m -3 0 a 3 3 0 1 1 3 3 a 6 6 0 1 1 -6 -6', { fill: 'none', stroke: OUT, 'stroke-width': 1.8 })
  );
}

function lightning(points, cls = 'flash', delay = 0) {
  return g(
    { class: cls, style: delay ? `animation-delay:${delay}s` : undefined },
    poly(points, { fill: '#FFE14D', stroke: '#F2A900', 'stroke-width': 3, 'stroke-linejoin': 'round' })
  );
}

// =====================================================================
// 第一課：文字寶藏大探險（森林、獨木橋、樹洞寶箱）
// =====================================================================
export function sceneLesson1() {
  const defs = [
    ...characterDefs(),
    linGrad('sky1', [[0, '#8FD1FF'], [1, '#E3F5FF']]),
    linGrad('ground1', [[0, '#A6DC84'], [1, '#6DBE5C']]),
    linGrad('water1', [[0, '#9EE0FA'], [1, '#43A9E2']]),
    radGrad('hollow', [[0, '#2B1A10'], [1, '#5A3A22']]),
  ];
  const body = [
    rect(0, 0, 1200, 800, { fill: 'url(#sky1)' }),
    sun(130, 110, 44),
    cloud(420, 110, 1.1, 'drift'),
    cloud(760, 70, 0.8, 'drift', -9),
    cloud(1080, 140, 0.7, 'drift', -4),
    path('M 0 430 L 120 300 L 230 380 L 360 250 L 520 400 L 650 280 L 800 410 L 930 300 L 1080 380 L 1200 290 L 1200 460 L 0 460 Z', { fill: '#B8DCCF' }),
    path('M 0 450 L 160 360 L 300 430 L 470 350 L 620 440 L 760 360 L 920 440 L 1060 370 L 1200 430 L 1200 480 L 0 480 Z', { fill: '#94C9B5' }),
    // 遠方的樹
    [60, 150, 240, 330, 420, 700, 790, 880].map((x, i) => roundTree(x, 470 - (i % 2) * 6, 0.62, { leaf: i % 2 ? '#7CC88A' : '#68BB7C' })),
    path('M 0 460 Q 300 430 600 450 Q 900 470 1200 440 L 1200 800 L 0 800 Z', { fill: 'url(#ground1)' }),
    // 溪流
    path('M 560 452 C 540 530, 470 610, 380 800 L 850 800 C 770 620, 680 530, 650 452 Z', { fill: 'url(#water1)', class: 'o' }),
    path('M 590 500 Q 600 494 612 500 M 560 560 Q 580 552 600 560 M 630 610 Q 650 602 670 610 M 520 680 Q 545 670 570 680 M 660 730 Q 690 720 720 730 M 600 470 Q 608 466 616 470', {
      fill: 'none',
      stroke: '#fff',
      'stroke-width': 4,
      'stroke-linecap': 'round',
      class: 'flow',
    }),
    // 左側樹林
    pineTree(60, 560, 1.15),
    roundTree(190, 520, 1.1),
    pineTree(300, 540, 0.9, { leaf: '#47A673' }),
    // 迷路的路標
    g(
      { transform: 'translate(170 690)' },
      rect(-8, -130, 16, 132, { rx: 4, fill: '#9A6A3F', class: 'o' }),
      g({ class: 'wobble' }, path('M -10 -122 L -78 -122 L -92 -106 L -78 -90 L -10 -90 Z', { fill: '#E2B07A', class: 'o' }), text(-48, -105, '?', { 'font-size': 28, 'font-weight': 900, 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: OUT, 'font-family': 'Arial, sans-serif' })),
      path('M 10 -84 L 78 -84 L 92 -68 L 78 -52 L 10 -52 Z', { fill: '#E2B07A', class: 'o' }),
      text(48, -67, '?', { 'font-size': 28, 'font-weight': 900, 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: OUT, 'font-family': 'Arial, sans-serif' }),
      path('M -10 -46 L -66 -46 L -78 -32 L -66 -18 L -10 -18 Z', { fill: '#D99B60', class: 'o' }),
      text(-42, -31, '?', { 'font-size': 24, 'font-weight': 900, 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: OUT, 'font-family': 'Arial, sans-serif' })
    ),
    // 大樹與樹洞寶箱
    g(
      {},
      path('M 900 730 Q 930 720 944 690 C 958 610, 962 500, 948 380 L 1118 380 C 1104 500, 1108 610, 1124 690 Q 1140 720 1180 730 Z', { fill: '#9A6A3F', class: 'o' }),
      path('M 972 420 Q 980 520 968 640 M 1092 430 Q 1086 540 1100 660', { fill: 'none', stroke: '#7A5030', 'stroke-width': 4, 'stroke-linecap': 'round' }),
      puff([[880, 300, 70], [960, 220, 90], [1080, 210, 90], [1170, 290, 72], [1030, 330, 80], [920, 360, 56], [1150, 370, 56]], '#5DB86A'),
      path('M 900 250 Q 930 190 990 170', { fill: 'none', stroke: '#8AD893', 'stroke-width': 8, 'stroke-linecap': 'round' }),
      ellipse(1033, 580, 62, 80, { fill: 'url(#hollow)', class: 'o4' }),
      ellipse(1033, 580, 92, 100, { fill: 'url(#glowY)', class: 'pulse' }),
      treasureChest(1033, 640, 0.95)
    ),
    glowChar(946, 470, '探', 0),
    glowChar(980, 380, '險', -0.5),
    glowChar(1040, 340, '迷', -1),
    glowChar(1100, 380, '寶', -1.5),
    glowChar(1130, 470, '藏', -2),
    [[905, 520, 14], [1170, 540, 12], [1010, 300, 10], [1150, 320, 12], [930, 330, 9]].map(([x, y, r], i) =>
      g({ class: 'twinkle', style: `animation-delay:${-i * 0.4}s` }, sparkle(x, y, r, { fill: '#FFF6B0' }))
    ),
    // 獨木橋
    g(
      {},
      rect(320, 596, 530, 30, { rx: 15, fill: '#B07A45', class: 'o' }),
      path('M 360 606 L 480 606 M 520 614 L 640 614 M 680 606 L 800 606', { stroke: '#8A5A35', 'stroke-width': 3, 'stroke-linecap': 'round' }),
      ellipse(838, 611, 12, 15, { fill: '#E8C48F', class: 'o' }),
      ellipse(838, 611, 6, 8, { fill: 'none', stroke: '#C69A62', 'stroke-width': 2 })
    ),
    // 主角們
    place(boy({ holdMap: true, look: [2, -1], mouthType: 'open' }), { x: 430, y: 606, s: 0.92 }),
    g({ class: 'wobble', style: 'transform-origin:590px 606px;transform-box:view-box' }, place(girl({ armL: 82, armR: 82, mouthType: 'o', look: [-2, 2] }), { x: 590, y: 606, s: 0.88 })),
    place(cat({ eyes: 'happy', paws: 'up' }), { x: 738, y: 606, s: 0.9, w: 140, h: 150 }),
    path('M 790 470 Q 800 460 796 448 M 804 480 Q 816 470 812 456', { fill: 'none', stroke: '#5A8FB8', 'stroke-width': 3.5, 'stroke-linecap': 'round', class: 'twinkle' }),
    // 前景
    bush(70, 800, 1.3),
    bush(1150, 810, 1.1, '#4FA463'),
    flower(230, 760, '#FF7A9A'),
    flower(270, 780, '#FFB347', 0.8),
    flower(890, 770, '#B38CF5', 0.9),
    mushroom(320, 770, 0.9),
    mushroom(960, 790, 0.7),
    grassClump(250, 720, 34),
    grassClump(880, 730, 30, '#58A86A', -1),
    grassClump(1000, 760, 36, '#4FA463', -2),
  ];
  return {
    w: 1200,
    h: 800,
    title: '文字寶藏大探險',
    desc: '小宇拿著藏寶圖、小晴張開雙手保持平衡、三花貓墨墨帶路，三人正走過溪上的獨木橋；右邊的大樹洞裡有發光的寶箱，飛出探、險、迷、寶、藏五個字。',
    defs,
    body: body.join(''),
  };
}

// =====================================================================
// 第二課 成語一：看圖猜成語（守株待兔）
// =====================================================================
export function sceneIdiom1() {
  const defs = [
    ...characterDefs(),
    linGrad('sky2', [[0, '#9ED3FF'], [0.7, '#FFE4BA'], [1, '#FFD39A']]),
    linGrad('field2', [[0, '#B9D77C'], [1, '#8DBF5A']]),
  ];
  const weeds = [
    [80, 620, 46], [140, 600, 40], [330, 610, 52], [420, 640, 44], [610, 640, 40], [880, 610, 48], [960, 640, 56],
    [60, 760, 60], [400, 790, 58], [520, 770, 62], [640, 790, 54], [880, 790, 66], [300, 700, 50], [1110, 600, 46],
  ];
  const body = [
    rect(0, 0, 1200, 800, { fill: 'url(#sky2)' }),
    sun(1080, 120, 42),
    cloud(240, 90, 0.9, 'drift'),
    cloud(520, 60, 0.6, 'drift', -7),
    path('M 0 400 Q 150 300 320 360 Q 480 410 640 340 Q 820 280 980 350 Q 1100 400 1200 360 L 1200 460 L 0 460 Z', { fill: '#A7CDA0' }),
    // 遠方的茅草屋
    g(
      { transform: 'translate(150 410)' },
      rect(-46, -40, 92, 46, { fill: '#E9D4A8', class: 'o' }),
      path('M -62 -36 L 0 -86 L 62 -36 Z', { fill: '#C9A15A', class: 'o' }),
      rect(-12, -24, 24, 30, { fill: '#7A5030', class: 'o2' })
    ),
    // 遠方山坡上跳走的兔子（兔子不會再來）
    g({ transform: 'translate(460 372) scale(0.42)' }, g({ class: 'hop' }, place(rabbit({}), { x: 0, y: 0, w: 120, h: 80, flip: true }))),
    path('M 0 440 Q 300 420 600 436 Q 900 452 1200 430 L 1200 800 L 0 800 Z', { fill: 'url(#field2)' }),
    // 荒廢的田壟
    path('M 40 500 Q 300 480 560 500 M 20 540 Q 300 520 580 544 M 680 520 Q 940 500 1180 516 M 700 560 Q 950 540 1190 560', {
      fill: 'none',
      stroke: '#9AB867',
      'stroke-width': 5,
      'stroke-linecap': 'round',
      'stroke-dasharray': '30 18',
    }),
    weeds.slice(0, 7).map(([x, y, h], i) => grassClump(x, y, h, i % 2 ? '#6BAF4E' : '#5EA244', -i * 0.3)),
    // 樹樁
    stump(470, 650, 1.15),
    // 丟在一旁的鋤頭（上面爬著蝸牛）
    hoe(200, 712, 1.1),
    snail(150, 702, 1),
    grassClump(250, 720, 44, '#5EA244', -0.6),
    grassClump(40, 744, 40, '#6BAF4E', -1.2),
    // 農夫
    place(farmer(), { x: 760, y: 716, s: 1.18, w: 240, h: 260 }),
    // 想像泡泡：兔子撞上樹樁
    puff([[680, 380, 14], [650, 340, 9], [630, 306, 6]], '#fff'),
    puff([[620, 210, 70], [700, 160, 76], [800, 150, 80], [890, 190, 70], [920, 260, 56], [840, 290, 66], [730, 290, 68], [640, 270, 56], [770, 225, 100]], '#fff'),
    g(
      { transform: 'translate(820 270) scale(0.55)' },
      stump(0, 0, 1),
      g({ class: 'boom' }, star(-20, -96, 52, 24, 8, { fill: '#FFE14D', stroke: '#F2A900', 'stroke-width': 4 }))
    ),
    g({ class: 'bonk' }, g({ transform: 'translate(696 292) scale(0.95)' }, place(rabbit({ dizzy: false }), { x: 60, y: 0, w: 120, h: 80 })),
      path('M 640 236 L 690 236 M 628 258 L 676 258 M 646 280 L 690 280', { stroke: '#9BB7C9', 'stroke-width': 5, 'stroke-linecap': 'round' })),
    // 前景草叢與偷看的特攻隊
    weeds.slice(7, 13).map(([x, y, h], i) => grassClump(x, y, h, i % 2 ? '#5EA244' : '#4E9438', -i * 0.4)),
    g(
      {},
      place(girl({ mouthType: 'o', look: [-3, -1] }), { x: 1000, y: 830, s: 0.62 }),
      place(boy({ mouthType: 'o', look: [-3, -1] }), { x: 1085, y: 836, s: 0.62 }),
      place(cat({ look: [-3, -1], paws: 'up' }), { x: 1152, y: 790, s: 0.62, w: 140, h: 150 }),
      bush(1075, 860, 1.25, '#4E9438', '#6BAF4E'),
      g({ class: 'bob' }, circle(1150, 640, 20, { fill: '#fff', class: 'o' }), text(1150, 641, '?', { 'font-size': 28, 'font-weight': 900, 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: '#E5484D', 'font-family': 'Arial, sans-serif' }))
    ),
  ];
  return {
    w: 1200,
    h: 800,
    title: '看圖猜成語（一）',
    desc: '古代農田裡，一位戴斗笠的農夫坐在樹樁旁，托著下巴發呆，斗笠上結了蜘蛛網；鋤頭被丟在一旁，上面爬著蝸牛，田裡長滿野草。農夫的想像泡泡裡，一隻兔子正撞上樹樁。',
    defs,
    body: body.join(''),
  };
}

const DRAGON_C = {
  spine: [[650, 400], [710, 430], [760, 330], [800, 370], [846, 414], [800, 540], [840, 580], [874, 612], [854, 654], [812, 652]],
  W: 52,
  headScale: 1.25,
  eyes: 'dot',
  painted: true,
  legs: [0.24, 0.58],
};

function painterOnLadder() {
  const s = 0.9;
  const [ex, ey] = dragonEyePos(DRAGON_C);
  const hand = [ex - 84, ey + 28];
  const px = hand[0] - (PAINTER_HAND[0] - 100) * s;
  const py = hand[1] + (300 - PAINTER_HAND[1]) * s;
  const d = [ex - hand[0], ey - hand[1]];
  const m = Math.hypot(d[0], d[1]);
  const u = [d[0] / m, d[1] / m];
  const n = [-u[1], u[0]];
  const at = (k, j = 0) => `${(hand[0] + u[0] * k + n[0] * j).toFixed(1)} ${(hand[1] + u[1] * k + n[1] * j).toFixed(1)}`;
  const rungs = [];
  for (let y = py; y < 700; y += 56) rungs.push(`M ${px - 44} ${y} L ${px + 44} ${y}`);
  return g(
    {},
    path(`M ${px - 40} ${py - 30} L ${px - 52} 712 M ${px + 40} ${py - 30} L ${px + 52} 712`, { stroke: '#8A5A35', 'stroke-width': 10, 'stroke-linecap': 'round' }),
    path(rungs.join(' '), { stroke: '#A8774A', 'stroke-width': 8, 'stroke-linecap': 'round' }),
    place(painter({ brush: false }), { x: px, y: py, s }),
    path(`M ${at(-8)} L ${at(m - 26)}`, { stroke: OUT, 'stroke-width': 10, 'stroke-linecap': 'round' }),
    path(`M ${at(-8)} L ${at(m - 26)}`, { stroke: '#C9A15A', 'stroke-width': 6, 'stroke-linecap': 'round' }),
    path(`M ${at(m - 30, -6)} Q ${at(m - 12, -5)} ${at(m - 2)} Q ${at(m - 12, 5)} ${at(m - 30, 6)} Z`, { fill: '#1d1d22', class: 'o2' }),
    circle(hand[0], hand[1], 10 * s, { fill: '#FFE2CC', class: 'o' }),
    g({ class: 'twinkle' }, star(ex, ey, 40, 14, 8, { fill: '#FFE14D', opacity: 0.8 })),
    g({ class: 'twinkle', style: 'animation-delay:-.9s' }, sparkle(ex + 40, ey - 34, 12, { fill: '#FFF6B0' }), sparkle(ex - 10, ey - 50, 9, { fill: '#FFF6B0' }))
  );
}

// =====================================================================
// 第二課 成語二：看圖猜成語（畫龍點睛）
// =====================================================================
export function sceneIdiom2() {
  const defs = [
    ...characterDefs(),
    linGrad('sky3', [[0, '#7FB6E8'], [1, '#D6ECFF']], { x1: 0, y1: 0, x2: 1, y2: 0.3 }),
    linGrad('storm', [[0, '#3B3F66'], [1, '#6B6FA0']]),
    linGrad('wall', [[0, '#FBF2DC'], [1, '#EFDDB6']]),
    linGrad('floor', [[0, '#D8D2C4'], [1, '#B9B1A1']]),
  ];
  const holeD = 'M 846 200 L 880 236 L 866 280 L 900 316 L 884 372 L 928 420 L 980 404 L 1026 448 L 1080 420 L 1130 452 L 1170 400 L 1200 410 L 1200 196 Z';
  const body = [
    rect(0, 0, 1200, 800, { fill: 'url(#sky3)' }),
    cloud(160, 80, 0.9, 'drift'),
    cloud(470, 60, 0.7, 'drift', -6),
    // 暴風雲與閃電
    path('M 700 0 L 1200 0 L 1200 250 Q 1100 280 1000 240 Q 900 270 820 220 Q 720 200 700 120 Z', { fill: 'url(#storm)' }),
    puff([[760, 110, 60], [860, 70, 70], [980, 60, 76], [1100, 80, 80], [1180, 150, 60]], '#555A86', { stroke: '#3B3F66' }),
    lightning([[790, 110], [760, 180], [790, 180], [756, 250], [820, 166], [790, 166], [816, 110]]),
    lightning([[1150, 100], [1120, 170], [1146, 170], [1110, 250], [1176, 154], [1150, 154], [1172, 100]], 'flash', -1.3),
    // 牆面與瓦頂
    rect(0, 236, 1200, 470, { fill: 'url(#wall)' }),
    rect(0, 236, 1200, 470, { fill: 'none', class: 'o' }),
    path('M 30 270 L 1170 270 M 30 676 L 1170 676', { stroke: '#D9C49A', 'stroke-width': 4 }),
    rect(0, 196, 1200, 46, { fill: '#5E7A6E', class: 'o' }),
    path(Array.from({ length: 25 }, (_, i) => `M ${i * 50} 200 L ${i * 50} 240`).join(' '), { stroke: '#47615A', 'stroke-width': 4 }),
    Array.from({ length: 25 }, (_, i) => circle(i * 50 + 25, 242, 9, { fill: '#7E9C8F', class: 'o2' })),
    rect(0, 700, 1200, 14, { fill: '#B5442F', class: 'o' }),
    rect(0, 714, 1200, 86, { fill: 'url(#floor)' }),
    path('M 0 750 L 1200 750 M 200 714 L 170 800 M 480 714 L 470 800 M 760 714 L 770 800 M 1040 714 L 1070 800', { stroke: '#A39B8A', 'stroke-width': 3 }),
    // 牆上兩條沒點眼睛的白龍
    dragon({
      spine: [[320, 330], [240, 290], [200, 390], [130, 350], [80, 320], [60, 290], [40, 320]],
      W: 44,
      eyes: 'blank',
      painted: true,
      legs: [0.22, 0.55],
    }),
    dragon({
      spine: [[330, 500], [250, 460], [200, 580], [130, 530], [80, 496], [60, 460], [36, 500]],
      W: 44,
      eyes: 'blank',
      painted: true,
      legs: [0.22, 0.55],
    }),
    // 正要被點上眼睛的龍（頭朝左，面向畫家）
    dragon(DRAGON_C),
    // 牆壁破洞，點了眼睛的龍乘雲飛走
    path(holeD, { fill: 'url(#storm)', class: 'o' }),
    lightning([[1010, 236], [990, 300], [1012, 300], [986, 370], [1040, 286], [1016, 286], [1034, 236]], 'flash', -2.1),
    [[860, 470, 14, 20], [910, 500, 10, -30], [1150, 480, 12, 40], [1060, 500, 9, 10], [820, 330, 10, 70]].map(([x, y, s, rot], i) =>
      g({ class: 'bob', style: `animation-delay:${-i * 0.5}s` }, rect(x - s, y - s * 0.6, s * 2, s * 1.2, { fill: '#EFDDB6', class: 'o2', transform: `rotate(${rot} ${x} ${y})` }))
    ),
    g(
      { class: 'fly' },
      puff([[1000, 470, 40], [1060, 480, 46], [1120, 466, 38], [960, 488, 30]], '#fff', { stroke: '#BFD9EA' }),
      dragon({
        spine: [[960, 120], [1060, 180], [1120, 250], [1060, 300], [980, 350], [940, 400], [1040, 440], [1100, 470], [1140, 430], [1150, 400]],
        W: 60,
        eyes: 'dot',
        legs: [0.18, 0.5],
      })
    ),
    // 畫家站在梯子上，用毛筆替龍點上眼睛
    painterOnLadder(),
    // 圍觀的人
    place(villager(), { x: 120, y: 800, s: 1.05, w: 160, h: 240 }),
    place(monk(), { x: 300, y: 800, s: 1.05, w: 160, h: 240 }),
    // 躲在柱子後偷看的特攻隊
    g(
      {},
      place(girl({ mouthType: 'wow', look: [3, -4] }), { x: 966, y: 828, s: 0.6 }),
      place(boy({ mouthType: 'wow', look: [3, -4] }), { x: 1044, y: 834, s: 0.6 }),
      place(cat({ look: [2, -3], paws: 'up', mouthType: 'o' }), { x: 1120, y: 790, s: 0.6, w: 140, h: 150 }),
      rect(900, 770, 320, 40, { rx: 8, fill: '#A79E8C', class: 'o' }),
      path('M 920 782 L 1190 782', { stroke: '#C3BBA9', 'stroke-width': 4, 'stroke-linecap': 'round' })
    ),
  ];
  return {
    w: 1200,
    h: 800,
    title: '看圖猜成語（二）',
    desc: '古代寺廟的白牆上畫著白龍。左邊兩條龍沒有畫眼睛；一位畫家站在梯子上，用毛筆替中間那條龍點上眼睛，眼睛閃閃發光；右上方的牆壁破了一個洞，一條點了眼睛的白龍駕著雲朵飛上打雷閃電的天空，圍觀的人都嚇了一跳。',
    defs,
    body: body.join(''),
  };
}

// =====================================================================
// 首頁：特攻隊成員介紹
// =====================================================================
export function sceneTeam() {
  const body = [
    ellipse(300, 352, 260, 26, { fill: '#000', opacity: 0.08 }),
    place(boy({ armL: 128, armR: 12, mouthType: 'open' }), { x: 160, y: 350, s: 1.15 }),
    place(girl({ armL: 12, armR: 128, mouthType: 'open', eyes: 'happy' }), { x: 440, y: 350, s: 1.15 }),
    place(cat({ eyes: 'happy', paws: 'up' }), { x: 300, y: 352, s: 1.15, w: 140, h: 150 }),
    g({ class: 'twinkle' }, sparkle(300, 90, 16, { fill: '#FFD447' })),
    g({ class: 'twinkle', style: 'animation-delay:-.6s' }, sparkle(560, 120, 12, { fill: '#FF8FA3' })),
    g({ class: 'twinkle', style: 'animation-delay:-1.2s' }, sparkle(40, 130, 12, { fill: '#7FC8FF' })),
  ];
  return {
    w: 600,
    h: 370,
    title: '國語特攻隊',
    desc: '特攻隊成員：穿藍色連帽外套的男孩小宇、穿粉紅色連帽外套的女孩小晴，以及綁紅色頭巾的三花貓墨墨。',
    defs: characterDefs(),
    body: body.join(''),
  };
}

// 墨墨老師（介面中的提示角色）
export function sceneMomo() {
  return {
    w: 160,
    h: 170,
    title: '墨墨',
    desc: '綁紅色頭巾的三花貓墨墨。',
    defs: characterDefs(),
    body: place(cat({ paws: 'up' }), { x: 80, y: 162, s: 1, w: 140, h: 150 }),
  };
}

export function sceneMomoHappy() {
  return {
    w: 160,
    h: 170,
    title: '墨墨',
    desc: '開心的三花貓墨墨。',
    defs: characterDefs(),
    body: place(cat({ paws: 'up', eyes: 'happy', mouthType: 'open' }), { x: 80, y: 162, s: 1, w: 140, h: 150 }),
  };
}

export function sceneMomoThink() {
  return {
    w: 160,
    h: 170,
    title: '墨墨',
    desc: '正在思考的三花貓墨墨。',
    defs: characterDefs(),
    body: place(cat({ paws: 'down', look: [3, -3], mouthType: 'o' }), { x: 80, y: 162, s: 1, w: 140, h: 150 }),
  };
}

// 網站小圖示（墨墨的臉）
export function sceneFavicon() {
  return {
    w: 64,
    h: 64,
    title: '寒假國語特攻隊',
    desc: '三花貓墨墨的臉',
    defs: characterDefs(),
    body: [
      rect(0, 0, 64, 64, { rx: 14, fill: '#FFE8A3' }),
      g({ transform: 'translate(-2.6 6) scale(0.46)' }, cat({ tail: false, eyes: 'happy' })),
    ].join(''),
  };
}

export const SCENES = {
  'lesson1-scene.svg': sceneLesson1,
  'idiom1-riddle.svg': sceneIdiom1,
  'idiom2-riddle.svg': sceneIdiom2,
  'team.svg': sceneTeam,
  'momo.svg': sceneMomo,
  'momo-happy.svg': sceneMomoHappy,
  'momo-think.svg': sceneMomoThink,
  'favicon.svg': sceneFavicon,
};


