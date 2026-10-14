// 角色設計：小宇（男孩）、小晴（女孩）、墨墨（三花貓），以及成語故事裡的古代人物、兔子與白龍。
// 造型參考 resource/ 海報：男孩藍色連帽外套＋棕色書包、女孩粉紅連帽外套＋馬尾、貓咪綁紅色頭巾。
import { OUT, g, path, circle, ellipse, rect, limb, star, linGrad, radGrad, sampleChain, r2, el } from './lib.mjs';

export const C = {
  skin: '#FFE2CC',
  blush: '#FF8FA3',
  boyHair: '#4A2E21',
  boyHairHi: '#7A5038',
  blue: '#3E7BE6',
  blueDk: '#2D5FC0',
  pants: '#36435E',
  shoeRed: '#E5484D',
  bag: '#B9773A',
  bagDk: '#8E5726',
  girlHair: '#7A4A2E',
  girlHairHi: '#A8704A',
  pink: '#F2708E',
  pinkDk: '#D2557A',
  skirt: '#3E4C80',
  skirtDk: '#2E3A66',
  tights: '#4D4466',
  boot: '#8A5A3A',
  orange: '#F4A04A',
  brown: '#7A4B2A',
  red: '#E53935',
  earPink: '#FFB3C1',
  inkBlack: '#2B2B33',
};

// 每張圖都要放的共用漸層
export function characterDefs() {
  return [
    linGrad('eyeBoy', [[0, '#24150C'], [0.55, '#5A361E'], [1, '#B07444']]),
    linGrad('eyeGirl', [[0, '#2A140C'], [0.5, '#6B3A22'], [1, '#D08A55']]),
    linGrad('eyeAdult', [[0, '#1B1410'], [0.6, '#3E2C22'], [1, '#7A5A45']]),
    radGrad('glowY', [[0, '#FFFBD6', 1], [0.45, '#FFE066', 0.75], [1, '#FFD23F', 0]]),
    radGrad('glowW', [[0, '#FFFFFF', 0.95], [0.5, '#FFF6C8', 0.6], [1, '#FFF6C8', 0]]),
  ];
}

// ---------- 臉部零件 ----------
export function eye(x, y, { grad = 'eyeBoy', s = 1, look = [0, 0], lash = 0 } = {}) {
  const [lx, ly] = look;
  return g(
    { transform: `translate(${x} ${y}) scale(${s})` },
    g(
      { class: 'blink' },
      ellipse(lx * 0.4, ly * 0.4, 10, 13, { fill: `url(#${grad})`, stroke: '#2B1A10', 'stroke-width': 2 }),
      ellipse(lx, ly + 3, 5, 6, { fill: '#160C06', opacity: 0.5 }),
      circle(lx - 3.5, ly - 5, 4, { fill: '#fff' }),
      circle(lx + 4, ly + 5, 2, { fill: '#fff', opacity: 0.9 })
    ),
    path('M -12 -8 Q 0 -19 12 -8', { fill: 'none', stroke: '#2B1A10', 'stroke-width': 3.6, 'stroke-linecap': 'round' }),
    lash ? path(lash < 0 ? 'M -11 -9 L -17 -13' : 'M 11 -9 L 17 -13', { stroke: '#2B1A10', 'stroke-width': 3, 'stroke-linecap': 'round' }) : ''
  );
}

export function happyEye(x, y, s = 1) {
  return path(`M ${x - 10 * s} ${y + 3 * s} Q ${x} ${y - 10 * s} ${x + 10 * s} ${y + 3 * s}`, {
    fill: 'none',
    stroke: '#2B1A10',
    'stroke-width': 4,
    'stroke-linecap': 'round',
  });
}

export function mouth(type, x, y) {
  switch (type) {
    case 'open':
      return g(
        {},
        path(`M ${x - 10} ${y - 3} Q ${x} ${y + 13} ${x + 10} ${y - 3} Z`, { fill: '#B63A3A', class: 'o2' }),
        path(`M ${x - 5} ${y + 3.5} Q ${x} ${y + 8.5} ${x + 5} ${y + 3.5} Q ${x} ${y + 1.5} ${x - 5} ${y + 3.5} Z`, { fill: '#FF8A8A' })
      );
    case 'smile':
      return path(`M ${x - 8} ${y - 2} Q ${x} ${y + 6} ${x + 8} ${y - 2}`, { fill: 'none', class: 'o' });
    case 'o':
      return ellipse(x, y + 2, 5.5, 7, { fill: '#B63A3A', class: 'o2' });
    case 'wow':
      return ellipse(x, y + 3, 7, 9, { fill: '#B63A3A', class: 'o2' });
    case 'cat':
      return path(`M ${x - 8} ${y - 2} Q ${x - 4} ${y + 4} ${x} ${y - 1} Q ${x + 4} ${y + 4} ${x + 8} ${y - 2}`, { fill: 'none', class: 'o2' });
    default:
      return '';
  }
}

const FACE = 'M 40 112 C 40 66, 160 66, 160 112 C 160 152, 132 170, 100 170 C 68 170, 40 152, 40 112 Z';

function arm(px, py, angle, sleeve, cuff, len = 42) {
  return g(
    { transform: `translate(${px} ${py}) rotate(${angle})` },
    rect(-10, -6, 20, len, { rx: 10, fill: sleeve, class: 'o' }),
    rect(-10, len - 14, 20, 8, { rx: 3, fill: cuff, class: 'o2' }),
    circle(0, len + 4, 9.5, { fill: C.skin, class: 'o' })
  );
}

function sneaker(x, y, color) {
  return g(
    {},
    path(`M ${x - 15} ${y + 2} Q ${x - 16} ${y - 11} ${x} ${y - 11} Q ${x + 14} ${y - 11} ${x + 14} ${y + 2} Z`, { fill: color, class: 'o' }),
    path(`M ${x - 14} ${y - 2} L ${x + 13} ${y - 2}`, { stroke: '#fff', 'stroke-width': 3 })
  );
}

function mapProp(x, y) {
  return g(
    { transform: `translate(${x} ${y}) rotate(-6)` },
    path('M -34 -22 L 34 -24 L 36 20 L -32 22 Z', { fill: '#F7E3B5', class: 'o' }),
    path('M -24 12 Q -10 -14 4 4 T 22 -12', { fill: 'none', stroke: '#C0392B', 'stroke-width': 2.5, 'stroke-dasharray': '4 4' }),
    path('M 18 -18 L 28 -8 M 28 -18 L 18 -8', { stroke: '#C0392B', 'stroke-width': 3.5, 'stroke-linecap': 'round' }),
    path('M -28 -12 Q -22 -16 -16 -12', { fill: 'none', stroke: '#6AA84F', 'stroke-width': 3 }),
    circle(-34, 0, 9.5, { fill: C.skin, class: 'o' }),
    circle(34, 2, 9.5, { fill: C.skin, class: 'o' })
  );
}

// ---------- 小宇（男孩）：盒子 200x280，腳底在 (100,280) ----------
export function boy({ armL = 12, armR = 12, mouthType = 'open', look = [0, 0], holdMap = false, eyes = 'open' } = {}) {
  const hair =
    'M 34 126 C 24 76, 58 48, 100 50 C 142 48, 178 76, 166 126 L 160 114 L 156 98 L 146 106 L 140 90 L 128 102 L 116 86 L 104 102 L 92 86 L 80 102 L 68 88 L 60 106 L 50 98 L 44 114 Z';
  return g(
    { class: 'boy' },
    rect(56, 162, 88, 68, { rx: 20, fill: C.bag, class: 'o' }),
    rect(78, 228, 19, 38, { rx: 8, fill: C.pants, class: 'o' }),
    rect(103, 228, 19, 38, { rx: 8, fill: C.pants, class: 'o' }),
    sneaker(87, 276, C.shoeRed),
    sneaker(113, 276, C.shoeRed),
    path('M 64 168 Q 100 146 136 168 Q 100 178 64 168 Z', { fill: C.blueDk, class: 'o' }),
    path('M 70 168 Q 100 158 130 168 L 139 226 Q 140 238 128 238 L 72 238 Q 60 238 61 226 Z', { fill: C.blue, class: 'o' }),
    path('M 80 208 L 120 208 L 123 228 L 77 228 Z', { fill: C.blueDk, class: 'o2' }),
    path('M 77 172 L 80 214', { stroke: C.bagDk, 'stroke-width': 7, 'stroke-linecap': 'round' }),
    path('M 123 172 L 120 214', { stroke: C.bagDk, 'stroke-width': 7, 'stroke-linecap': 'round' }),
    path('M 94 170 L 92 190 M 106 170 L 108 190', { stroke: '#fff', 'stroke-width': 2.5, 'stroke-linecap': 'round' }),
    circle(92, 192, 2.6, { fill: '#fff' }),
    circle(108, 192, 2.6, { fill: '#fff' }),
    holdMap ? '' : arm(68, 176, armL, C.blue, C.blueDk),
    holdMap ? '' : arm(132, 176, -armR, C.blue, C.blueDk),
    holdMap ? arm(68, 176, -12, C.blue, C.blueDk, 34) : '',
    holdMap ? arm(132, 176, 12, C.blue, C.blueDk, 34) : '',
    holdMap ? mapProp(100, 218) : '',
    // 頭
    circle(41, 132, 10, { fill: C.skin, class: 'o' }),
    circle(159, 132, 10, { fill: C.skin, class: 'o' }),
    path(FACE, { fill: C.skin, class: 'o' }),
    path('M 98 52 C 92 30, 110 18, 122 26 C 112 26, 106 34, 105 52 Z', { fill: C.boyHair, class: 'o' }),
    path(hair, { fill: C.boyHair, class: 'o' }),
    path('M 62 72 Q 100 54 138 72', { fill: 'none', stroke: C.boyHairHi, 'stroke-width': 5, 'stroke-linecap': 'round', opacity: 0.8 }),
    eyes === 'happy' ? [happyEye(78, 128), happyEye(122, 128)] : [eye(78, 126, { look }), eye(122, 126, { look })],
    ellipse(63, 146, 9, 5, { fill: C.blush, opacity: 0.55 }),
    ellipse(137, 146, 9, 5, { fill: C.blush, opacity: 0.55 }),
    mouth(mouthType, 100, 152)
  );
}

// ---------- 小晴（女孩）：盒子 200x280 ----------
export function girl({ armL = 12, armR = 12, mouthType = 'open', look = [0, 0], eyes = 'open', armsClass = '' } = {}) {
  const bangs =
    'M 36 126 C 26 70, 70 50, 100 50 C 130 50, 174 70, 164 126 C 162 114, 158 106, 152 100 Q 142 110 130 98 Q 118 112 104 96 Q 90 112 78 98 Q 66 110 54 100 C 48 106, 40 114, 36 126 Z';
  return g(
    { class: 'girl' },
    g(
      { class: 'pony' },
      path('M 60 70 C 14 56, -6 118, 10 166 C 16 188, 38 196, 46 182 C 28 170, 22 128, 52 98 Z', { fill: C.girlHair, class: 'o' }),
      path('M 30 98 C 18 122, 18 150, 28 172', { fill: 'none', stroke: C.girlHairHi, 'stroke-width': 4, 'stroke-linecap': 'round', opacity: 0.8 })
    ),
    path('M 38 118 C 30 64, 170 64, 162 118 L 166 178 Q 150 188 138 174 L 62 174 Q 50 188 34 178 Z', { fill: C.girlHair, class: 'o' }),
    rect(80, 234, 17, 32, { rx: 7, fill: C.tights, class: 'o' }),
    rect(103, 234, 17, 32, { rx: 7, fill: C.tights, class: 'o' }),
    sneaker(88, 276, C.boot),
    sneaker(112, 276, C.boot),
    path('M 64 168 Q 100 148 136 168 Q 100 178 64 168 Z', { fill: C.pinkDk, class: 'o' }),
    path('M 66 216 L 134 216 L 146 248 Q 100 258 54 248 Z', { fill: C.skirt, class: 'o' }),
    path('M 84 220 L 79 250 M 100 220 L 100 253 M 116 220 L 121 250', { stroke: C.skirtDk, 'stroke-width': 2.5, 'stroke-linecap': 'round' }),
    path('M 70 168 Q 100 158 130 168 L 138 220 Q 139 230 128 230 L 72 230 Q 61 230 62 220 Z', { fill: C.pink, class: 'o' }),
    path('M 90 167 L 100 181 L 110 167 Z', { fill: '#fff', class: 'o2' }),
    path('M 82 202 L 118 202 L 121 220 L 79 220 Z', { fill: C.pinkDk, class: 'o2' }),
    g({ class: armsClass }, arm(68, 176, armL, C.pink, C.pinkDk), arm(132, 176, -armR, C.pink, C.pinkDk)),
    circle(41, 132, 10, { fill: C.skin, class: 'o' }),
    circle(159, 132, 10, { fill: C.skin, class: 'o' }),
    path(FACE, { fill: C.skin, class: 'o' }),
    path(bangs, { fill: C.girlHair, class: 'o' }),
    path('M 42 110 C 34 134, 38 154, 48 166 C 46 148, 48 128, 54 112 Z', { fill: C.girlHair, class: 'o' }),
    path('M 158 110 C 166 134, 162 154, 152 166 C 154 148, 152 128, 146 112 Z', { fill: C.girlHair, class: 'o' }),
    path('M 64 70 Q 100 56 136 70', { fill: 'none', stroke: C.girlHairHi, 'stroke-width': 5, 'stroke-linecap': 'round', opacity: 0.8 }),
    circle(58, 70, 7, { fill: C.red, class: 'o2' }),
    circle(49, 79, 6, { fill: '#FF7A8A', class: 'o2' }),
    eyes === 'happy'
      ? [happyEye(78, 128), happyEye(122, 128)]
      : [eye(78, 126, { grad: 'eyeGirl', look, lash: -1, s: 1.05 }), eye(122, 126, { grad: 'eyeGirl', look, lash: 1, s: 1.05 })],
    ellipse(63, 146, 9, 5, { fill: C.blush, opacity: 0.6 }),
    ellipse(137, 146, 9, 5, { fill: C.blush, opacity: 0.6 }),
    mouth(mouthType, 100, 152)
  );
}

// ---------- 墨墨（三花貓）：盒子 140x150，腳底在 (70,150) ----------
let catSeq = 0;
export function cat({ eyes = 'open', look = [0, 0], paws = 'down', mouthType = 'cat', tail = true } = {}) {
  const id = `catClip${++catSeq}`;
  const head = 'M 20 66 C 20 34, 120 34, 120 66 C 120 94, 98 108, 70 108 C 42 108, 20 94, 20 66 Z';
  const earL = 'M 26 52 L 28 10 L 62 34 Z';
  const earR = 'M 78 34 L 112 10 L 114 52 Z';
  const pawY = paws === 'up' ? 104 : 124;
  return g(
    { class: 'cat' },
    el('clipPath', { id }, path(head), path(earL), path(earR)),
    tail
      ? g(
          { class: 'wag' },
          limb('M 96 136 C 130 134, 136 96, 122 82 C 114 74, 104 82, 110 92', C.orange, 11, 3),
          limb('M 122 82 C 114 74, 104 82, 110 92', C.brown, 11, 0)
        )
      : '',
    path('M 42 148 C 34 122, 46 100, 70 100 C 94 100, 106 122, 98 148 Z', { fill: '#fff', class: 'o' }),
    path('M 84 106 C 96 112, 102 128, 98 146 L 88 146 C 92 130, 88 116, 80 108 Z', { fill: C.orange }),
    ellipse(56, 148, 13, 7, { fill: '#fff', class: 'o' }),
    ellipse(84, 148, 13, 7, { fill: '#fff', class: 'o' }),
    ellipse(46, pawY, 9, 11, { fill: '#fff', class: 'o' }),
    ellipse(94, pawY, 9, 11, { fill: '#fff', class: 'o' }),
    path(earL, { fill: '#fff', class: 'o' }),
    path(earR, { fill: '#fff', class: 'o' }),
    path(head, { fill: '#fff', class: 'o' }),
    g(
      { 'clip-path': `url(#${id})` },
      ellipse(30, 44, 34, 30, { fill: C.orange }),
      circle(112, 22, 20, { fill: C.brown }),
      ellipse(110, 54, 16, 13, { fill: C.brown })
    ),
    path(earL, { fill: 'none', class: 'o' }),
    path(earR, { fill: 'none', class: 'o' }),
    path(head, { fill: 'none', class: 'o' }),
    path('M 33 44 L 34 22 L 52 34 Z', { fill: C.earPink }),
    path('M 88 34 L 106 22 L 107 44 Z', { fill: C.earPink }),
    // 紅色頭巾
    path('M 22 50 Q 70 30 118 50 L 119 62 Q 70 44 21 62 Z', { fill: C.red, class: 'o2' }),
    star(70, 46, 6, 2.6, 5, { fill: '#fff' }),
    g(
      { class: 'sway', style: 'transform-origin:0% 50%' },
      path('M 118 54 Q 136 46 142 60 Q 130 60 120 58 Z', { fill: C.red, class: 'o2' }),
      path('M 118 57 Q 132 68 130 80 Q 122 70 116 60 Z', { fill: C.red, class: 'o2' })
    ),
    circle(118, 56, 6, { fill: '#C62828', class: 'o2' }),
    eyes === 'happy'
      ? [happyEye(50, 76, 0.9), happyEye(90, 76, 0.9)]
      : [
          g(
            { class: 'blink' },
            circle(50 + look[0], 75 + look[1], 9, { fill: '#2B1A10' }),
            circle(47 + look[0], 71 + look[1], 3.5, { fill: '#fff' }),
            circle(54 + look[0], 79 + look[1], 1.6, { fill: '#fff' })
          ),
          g(
            { class: 'blink' },
            circle(90 + look[0], 75 + look[1], 9, { fill: '#2B1A10' }),
            circle(87 + look[0], 71 + look[1], 3.5, { fill: '#fff' }),
            circle(94 + look[0], 79 + look[1], 1.6, { fill: '#fff' })
          ),
        ],
    path('M 66 85 L 74 85 L 70 90 Z', { fill: '#FF7A8A', class: 'o2' }),
    mouthType === 'cat'
      ? path('M 61 92 Q 65.5 98 70 92 Q 74.5 98 79 92', { fill: 'none', class: 'o2' })
      : mouth(mouthType, 70, 96),
    path('M 34 88 L 14 84 M 34 93 L 14 95 M 106 88 L 126 84 M 106 93 L 126 95', { stroke: OUT, 'stroke-width': 1.8, 'stroke-linecap': 'round' }),
    ellipse(40, 92, 7, 4, { fill: C.blush, opacity: 0.6 }),
    ellipse(100, 92, 7, 4, { fill: C.blush, opacity: 0.6 })
  );
}

// ---------- 兔子（側面奔跑），盒子 120x80，腳底 (60,80)，面向右 ----------
export function rabbit({ dizzy = false, color = '#FFFFFF' } = {}) {
  return g(
    { class: 'rabbit' },
    ellipse(24, 64, 17, 8, { fill: color, class: 'o', transform: 'rotate(-18 24 64)' }),
    path('M 70 22 C 56 -6, 44 -12, 46 4 C 48 14, 58 24, 66 32 Z', { fill: color, class: 'o' }),
    path('M 64 24 C 56 6, 50 0, 51 6 C 53 14, 58 20, 63 27 Z', { fill: C.earPink }),
    ellipse(48, 50, 30, 20, { fill: color, class: 'o' }),
    circle(17, 44, 8, { fill: color, class: 'o' }),
    limb('M 68 58 L 92 68', color, 9, 3),
    circle(80, 36, 18, { fill: color, class: 'o' }),
    path('M 80 22 C 74 -8, 86 -14, 90 0 C 92 10, 88 18, 86 24 Z', { fill: color, class: 'o' }),
    path('M 82 18 C 80 2, 85 -4, 87 2 C 88 8, 86 14, 85 19 Z', { fill: C.earPink }),
    dizzy
      ? path('M 86 34 m -4 0 a 4 4 0 1 1 4 4 a 6 6 0 1 1 -6 -6', { fill: 'none', stroke: '#2B1A10', 'stroke-width': 2, 'stroke-linecap': 'round' })
      : g({}, circle(86, 33, 4, { fill: '#2B1A10' }), circle(84.6, 31.6, 1.4, { fill: '#fff' })),
    circle(97, 38, 2.6, { fill: '#FF7A8A' }),
    ellipse(84, 44, 5, 3, { fill: C.blush, opacity: 0.6 })
  );
}

// ---------- 宋國農夫（坐姿），盒子 240x260，底部中心 (120,260) ----------
export function farmer() {
  const face = 'M 70 100 C 70 60, 170 60, 170 100 C 170 136, 146 154, 120 154 C 94 154, 70 136, 70 100 Z';
  return g(
    { class: 'farmer' },
    // 盤腿的下半身
    path('M 36 250 Q 34 212 82 208 L 158 208 Q 206 212 204 250 Q 120 266 36 250 Z', { fill: '#8A6A47', class: 'o' }),
    ellipse(72, 250, 17, 9, { fill: C.skin, class: 'o' }),
    ellipse(168, 250, 17, 9, { fill: C.skin, class: 'o' }),
    path('M 60 248 L 84 248 M 156 248 L 180 248', { stroke: '#C9A15A', 'stroke-width': 4, 'stroke-linecap': 'round' }),
    // 上衣（麻布短衣，右衽）
    path('M 76 150 Q 120 138 164 150 L 174 222 Q 120 234 66 222 Z', { fill: '#D9B57A', class: 'o' }),
    path('M 136 148 L 90 218', { stroke: '#9C7840', 'stroke-width': 8, 'stroke-linecap': 'round' }),
    path('M 104 148 L 116 166', { stroke: '#9C7840', 'stroke-width': 7, 'stroke-linecap': 'round' }),
    path('M 70 202 Q 120 214 170 202', { fill: 'none', stroke: '#6E4F25', 'stroke-width': 7, 'stroke-linecap': 'round' }),
    // 右手放在腿上
    limb('M 158 164 Q 176 196 150 214', '#D9B57A', 20, 3),
    circle(148, 214, 10, { fill: C.skin, class: 'o' }),
    // 頭
    circle(68, 108, 10, { fill: C.skin, class: 'o' }),
    circle(172, 108, 10, { fill: C.skin, class: 'o' }),
    path(face, { fill: C.skin, class: 'o' }),
    path('M 66 106 C 62 72, 82 62, 120 62 C 158 62, 178 72, 174 106 L 166 92 L 158 86 L 82 86 L 74 92 Z', { fill: '#2E2A28', class: 'o' }),
    // 充滿期待地盯著左邊的樹樁
    eye(95, 113, { grad: 'eyeAdult', look: [-4, 1], s: 0.92 }),
    eye(143, 113, { grad: 'eyeAdult', look: [-4, 1], s: 0.92 }),
    path('M 84 93 Q 94 87 104 91 M 134 91 Q 144 87 154 93', { fill: 'none', stroke: '#2E2A28', 'stroke-width': 3, 'stroke-linecap': 'round' }),
    ellipse(82, 130, 9, 5, { fill: C.blush, opacity: 0.55 }),
    ellipse(158, 130, 9, 5, { fill: C.blush, opacity: 0.55 }),
    path('M 110 134 Q 120 142 130 134', { fill: 'none', class: 'o' }),
    path('M 129 137 Q 132 146 129 151 Q 125 146 129 137 Z', { fill: '#9AD8F5', class: 'o2' }),
    circle(108, 148, 1.6, { fill: '#6b5a50' }),
    circle(116, 150, 1.6, { fill: '#6b5a50' }),
    circle(124, 150, 1.6, { fill: '#6b5a50' }),
    // 左手撐下巴（手肘靠在膝蓋上）
    limb('M 82 162 Q 52 196 70 214 Q 92 196 106 160', '#D9B57A', 20, 3),
    circle(108, 156, 11, { fill: C.skin, class: 'o' }),
    // 斗笠＋蜘蛛網
    path('M 12 84 L 120 22 L 228 84 Q 120 104 12 84 Z', { fill: '#E7C27C', class: 'o' }),
    path('M 120 22 L 48 92 M 120 22 L 84 97 M 120 22 L 120 99 M 120 22 L 156 97 M 120 22 L 192 92', { stroke: '#C49A4E', 'stroke-width': 2 }),
    path('M 30 87 Q 120 106 210 87', { fill: 'none', stroke: '#B7893D', 'stroke-width': 3 }),
    g(
      { opacity: 0.85 },
      path('M 14 86 L 14 122 M 14 86 L 40 116 M 14 86 L 50 96', { stroke: '#fff', 'stroke-width': 1.6 }),
      path('M 14 96 Q 22 96 25 92 M 14 106 Q 28 106 34 100 M 14 116 Q 32 114 42 104', { fill: 'none', stroke: '#fff', 'stroke-width': 1.4 }),
      g(
        { class: 'dangle' },
        path('M 30 104 L 30 132', { stroke: '#fff', 'stroke-width': 1.2 }),
        ellipse(30, 136, 4, 5, { fill: '#3a3a3a' }),
        path('M 25 133 L 21 130 M 25 137 L 21 139 M 35 133 L 39 130 M 35 137 L 39 139', { stroke: '#3a3a3a', 'stroke-width': 1.3 })
      )
    )
  );
}

// ---------- 畫家張僧繇（站姿），盒子 200x300，腳底 (100,300) ----------
export const PAINTER_HAND = [182, 126];
export function painter({ brush = true } = {}) {
  const face = 'M 44 112 C 44 70, 156 70, 156 112 C 156 150, 130 166, 100 166 C 70 166, 44 150, 44 112 Z';
  return g(
    { class: 'painter' },
    path('M 60 92 C 50 120, 46 150, 40 176 L 52 178 C 58 150, 64 122, 70 96 Z', { fill: C.inkBlack, class: 'o2' }),
    path('M 140 92 C 150 120, 154 150, 160 176 L 148 178 C 142 150, 136 122, 130 96 Z', { fill: C.inkBlack, class: 'o2' }),
    ellipse(84, 298, 14, 7, { fill: '#2B2B33', class: 'o2' }),
    ellipse(116, 298, 14, 7, { fill: '#2B2B33', class: 'o2' }),
    path('M 64 170 Q 100 158 136 170 L 152 292 Q 100 302 48 292 Z', { fill: '#3AA6A0', class: 'o' }),
    path('M 88 164 L 100 186 L 112 164', { fill: 'none', stroke: '#fff', 'stroke-width': 6, 'stroke-linejoin': 'round' }),
    path('M 118 164 L 80 240', { stroke: '#22807B', 'stroke-width': 8, 'stroke-linecap': 'round' }),
    path('M 58 216 Q 100 226 142 216', { fill: 'none', stroke: '#F2C14E', 'stroke-width': 8, 'stroke-linecap': 'round' }),
    path('M 104 222 L 98 252 M 110 222 L 112 250', { stroke: '#F2C14E', 'stroke-width': 4, 'stroke-linecap': 'round' }),
    // 左手拿墨碟
    path('M 66 172 Q 40 200 36 240 L 66 244 Q 72 214 80 186 Z', { fill: '#3AA6A0', class: 'o' }),
    circle(54, 238, 10, { fill: C.skin, class: 'o' }),
    ellipse(54, 232, 20, 6, { fill: '#fff', class: 'o2' }),
    ellipse(54, 231, 12, 3.4, { fill: '#2B2B33' }),
    // 右手高舉毛筆
    path('M 128 170 Q 152 146 172 122 L 190 138 Q 168 168 146 202 Z', { fill: '#3AA6A0', class: 'o' }),
    brush ? path('M 184 122 L 232 82', { stroke: '#C9A15A', 'stroke-width': 7, 'stroke-linecap': 'round' }) : '',
    brush ? path('M 228 86 Q 238 70 252 64 Q 246 78 236 90 Z', { fill: '#1d1d22', class: 'o2' }) : '',
    circle(182, 126, 10.5, { fill: C.skin, class: 'o' }),
    // 頭
    circle(43, 120, 9, { fill: C.skin, class: 'o' }),
    circle(157, 120, 9, { fill: C.skin, class: 'o' }),
    path(face, { fill: C.skin, class: 'o' }),
    path('M 46 106 C 46 82, 60 74, 100 74 C 140 74, 154 82, 154 106 L 146 96 L 54 96 Z', { fill: '#1E1E24', class: 'o' }),
    path('M 50 96 C 48 56, 152 56, 150 96 Z', { fill: C.inkBlack, class: 'o' }),
    ellipse(100, 52, 26, 20, { fill: C.inkBlack, class: 'o' }),
    path('M 52 92 L 148 92', { stroke: '#4A4A55', 'stroke-width': 4 }),
    eye(80, 122, { grad: 'eyeAdult', look: [3, -3], s: 0.95 }),
    eye(120, 122, { grad: 'eyeAdult', look: [3, -3], s: 0.95 }),
    path('M 68 104 L 90 108 M 132 108 L 110 104', { stroke: '#1E1E24', 'stroke-width': 4, 'stroke-linecap': 'round' }),
    ellipse(66, 142, 8, 4.5, { fill: C.blush, opacity: 0.5 }),
    ellipse(134, 142, 8, 4.5, { fill: C.blush, opacity: 0.5 }),
    path('M 86 146 Q 93 141 100 145 Q 107 141 114 146', { fill: 'none', stroke: '#1E1E24', 'stroke-width': 3.5, 'stroke-linecap': 'round' }),
    path('M 95 152 Q 100 156 105 152', { fill: 'none', class: 'o2' }),
    path('M 96 164 Q 100 178 104 164 Z', { fill: '#1E1E24' })
  );
}

// ---------- 和尚（圍觀），盒子 160x240，腳底 (80,240) ----------
export function monk() {
  const face = 'M 24 92 C 24 50, 136 50, 136 92 C 136 128, 110 144, 80 144 C 50 144, 24 128, 24 92 Z';
  return g(
    { class: 'monk' },
    ellipse(64, 238, 13, 6, { fill: '#5b4636', class: 'o2' }),
    ellipse(96, 238, 13, 6, { fill: '#5b4636', class: 'o2' }),
    path('M 44 146 Q 80 134 116 146 L 128 234 Q 80 244 32 234 Z', { fill: '#9A9A9A', class: 'o' }),
    path('M 98 142 L 52 232 L 72 236 L 116 150 Z', { fill: '#B5532F', class: 'o2' }),
    path('M 44 150 Q 18 128 20 104', { fill: 'none', stroke: OUT, 'stroke-width': 24, 'stroke-linecap': 'round' }),
    path('M 44 150 Q 18 128 20 104', { fill: 'none', stroke: '#9A9A9A', 'stroke-width': 18, 'stroke-linecap': 'round' }),
    circle(20, 98, 9.5, { fill: C.skin, class: 'o' }),
    path('M 116 150 Q 142 128 140 104', { fill: 'none', stroke: OUT, 'stroke-width': 24, 'stroke-linecap': 'round' }),
    path('M 116 150 Q 142 128 140 104', { fill: 'none', stroke: '#9A9A9A', 'stroke-width': 18, 'stroke-linecap': 'round' }),
    circle(140, 98, 9.5, { fill: C.skin, class: 'o' }),
    circle(23, 100, 9, { fill: C.skin, class: 'o' }),
    circle(137, 100, 9, { fill: C.skin, class: 'o' }),
    path(face, { fill: C.skin, class: 'o' }),
    path('M 50 64 Q 70 54 92 58', { fill: 'none', stroke: '#fff', 'stroke-width': 5, 'stroke-linecap': 'round', opacity: 0.8 }),
    eye(62, 96, { grad: 'eyeAdult', look: [3, -4], s: 0.9 }),
    eye(98, 96, { grad: 'eyeAdult', look: [3, -4], s: 0.9 }),
    path('M 52 80 Q 62 74 72 79 M 88 79 Q 98 74 108 80', { fill: 'none', stroke: '#6b5a50', 'stroke-width': 3, 'stroke-linecap': 'round' }),
    ellipse(46, 114, 8, 4.5, { fill: C.blush, opacity: 0.5 }),
    ellipse(114, 114, 8, 4.5, { fill: C.blush, opacity: 0.5 }),
    mouth('wow', 80, 120)
  );
}

// ---------- 古代村婦（圍觀、手指天空），盒子 160x240 ----------
export function villager() {
  const face = 'M 24 96 C 24 54, 136 54, 136 96 C 136 132, 110 148, 80 148 C 50 148, 24 132, 24 96 Z';
  return g(
    { class: 'villager' },
    ellipse(64, 238, 12, 6, { fill: '#7a3b4a', class: 'o2' }),
    ellipse(96, 238, 12, 6, { fill: '#7a3b4a', class: 'o2' }),
    path('M 46 150 Q 80 138 114 150 L 128 234 Q 80 244 32 234 Z', { fill: '#F29E7C', class: 'o' }),
    path('M 92 148 L 56 222', { stroke: '#D9745A', 'stroke-width': 7, 'stroke-linecap': 'round' }),
    path('M 40 196 Q 80 206 120 196', { fill: 'none', stroke: '#6B8FD6', 'stroke-width': 8, 'stroke-linecap': 'round' }),
    path('M 50 160 Q 36 186 52 200', { fill: 'none', stroke: OUT, 'stroke-width': 24, 'stroke-linecap': 'round' }),
    path('M 50 160 Q 36 186 52 200', { fill: 'none', stroke: '#F29E7C', 'stroke-width': 18, 'stroke-linecap': 'round' }),
    circle(56, 200, 9, { fill: C.skin, class: 'o' }),
    path('M 112 156 Q 140 130 154 96', { fill: 'none', stroke: OUT, 'stroke-width': 24, 'stroke-linecap': 'round' }),
    path('M 112 156 Q 140 130 154 96', { fill: 'none', stroke: '#F29E7C', 'stroke-width': 18, 'stroke-linecap': 'round' }),
    circle(156, 90, 9, { fill: C.skin, class: 'o' }),
    path('M 158 82 L 166 64', { stroke: OUT, 'stroke-width': 8, 'stroke-linecap': 'round' }),
    path('M 158 82 L 166 64', { stroke: C.skin, 'stroke-width': 4, 'stroke-linecap': 'round' }),
    circle(80, 34, 22, { fill: '#2E2A28', class: 'o' }),
    path('M 70 20 L 98 44', { stroke: '#E9C46A', 'stroke-width': 4, 'stroke-linecap': 'round' }),
    circle(98, 44, 4, { fill: '#E53935' }),
    circle(23, 104, 9, { fill: C.skin, class: 'o' }),
    circle(137, 104, 9, { fill: C.skin, class: 'o' }),
    path(face, { fill: C.skin, class: 'o' }),
    path('M 24 104 C 18 64, 50 50, 80 50 C 110 50, 142 64, 136 104 C 128 86, 110 76, 80 76 C 52 76, 32 86, 24 104 Z', { fill: '#2E2A28', class: 'o' }),
    eye(62, 100, { grad: 'eyeAdult', look: [4, -4], s: 0.9, lash: -1 }),
    eye(98, 100, { grad: 'eyeAdult', look: [4, -4], s: 0.9, lash: 1 }),
    ellipse(46, 118, 8, 4.5, { fill: C.blush, opacity: 0.6 }),
    ellipse(114, 118, 8, 4.5, { fill: C.blush, opacity: 0.6 }),
    mouth('o', 80, 124)
  );
}

// ---------- 白龍 ----------
export function dragonEyePos({ spine, W = 56, headScale = 1 }) {
  const [p0, c1] = spine;
  const t = [c1[0] - p0[0], c1[1] - p0[1]];
  const m = Math.hypot(t[0], t[1]);
  const f = [-t[0] / m, -t[1] / m];
  const flipY = f[0] < 0 ? -1 : 1;
  const hs = (W / 56) * headScale;
  const lx = 36 * hs;
  const ly = -16 * hs * flipY;
  return [p0[0] + f[0] * lx - f[1] * ly, p0[1] + f[1] * lx + f[0] * ly];
}

// spine：龍身的三次貝茲曲線鏈，從頭（起點）到尾巴（終點）。
// eyes：'blank'（沒點眼睛）或 'dot'（點上眼睛、發光）
export function dragon({ spine, W = 56, eyes = 'blank', painted = false, legs = [0.24, 0.6], headScale = 1, cls = '' }) {
  const pal = painted
    ? { body: '#FBF8F0', belly: '#F1E7CF', fin: '#D6E4E8', horn: '#E3D3A8', line: '#8A8172', scale: '#B9B2A2', claw: '#CBBE94' }
    : { body: '#FFFFFF', belly: '#FFF1C4', fin: '#8FD3E8', horn: '#F2C94C', line: OUT, scale: '#9BC3D4', claw: '#F2C94C' };
  const sw = painted ? 2.4 : 3;
  const { pts } = sampleChain(spine, 150);
  const N = pts.length;
  const f0 = [-pts[0].t[0], -pts[0].t[1]];
  const backSide = f0[0] < 0 ? -1 : 1;
  const wAt = (s) => (s < 0.12 ? W * (0.74 + (0.26 * s) / 0.12) : W * (1 - 0.86 * Math.pow((s - 0.12) / 0.88, 1.2)));
  const nrm = (q) => [-q.t[1] * backSide, q.t[0] * backSide];
  const off = (q, k) => {
    const n = nrm(q);
    const w = wAt(q.s);
    return [q.p[0] + n[0] * w * k, q.p[1] + n[1] * w * k];
  };
  const P = (p) => `${r2(p[0])} ${r2(p[1])}`;
  const st = { stroke: pal.line, 'stroke-width': sw, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' };

  // 背鰭
  const spikes = [];
  for (let i = 8; i < N - 10; i += 7) {
    const q = pts[i + 2];
    const n = nrm(q);
    const a = off(pts[i], 0.44);
    const b = off(pts[i + 5], 0.44);
    const m = off(q, 0.5);
    const h = W * 0.34 * (1 - q.s * 0.55);
    const tip = [m[0] + n[0] * h + q.t[0] * W * 0.14, m[1] + n[1] * h + q.t[1] * W * 0.14];
    spikes.push(path(`M ${P(a)} L ${P(tip)} L ${P(b)} Z`, { fill: pal.fin, ...st }));
  }

  // 龍爪
  const legEls = legs.map((s) => {
    const q = pts[Math.round(s * (N - 1))];
    const n = nrm(q);
    const base = off(q, -0.3);
    const dir = [-n[0] * 0.75 + q.t[0] * 0.65, -n[1] * 0.75 + q.t[1] * 0.65];
    const len = W * 0.8;
    const knee = [base[0] + dir[0] * len * 0.55 - q.t[0] * W * 0.2, base[1] + dir[1] * len * 0.55 - q.t[1] * W * 0.2];
    const foot = [base[0] + dir[0] * len, base[1] + dir[1] * len];
    const claws = [-45, 0, 45].map((deg) => {
      const r = (deg * Math.PI) / 180;
      const cd = [dir[0] * Math.cos(r) - dir[1] * Math.sin(r), dir[0] * Math.sin(r) + dir[1] * Math.cos(r)];
      const tip = [foot[0] + cd[0] * W * 0.22, foot[1] + cd[1] * W * 0.22];
      return path(`M ${P(foot)} L ${P(tip)}`, { stroke: pal.claw, 'stroke-width': W * 0.08, 'stroke-linecap': 'round' });
    });
    return g({}, limb(`M ${P(base)} Q ${P(knee)} ${P(foot)}`, pal.body, W * 0.26, sw), ...claws);
  });

  // 身體外框
  const left = pts.map((q) => off(q, 0.5));
  const right = pts.map((q) => off(q, -0.5)).reverse();
  const bodyD = `M ${left.map(P).join(' L ')} L ${right.map(P).join(' L ')} Z`;

  // 腹甲
  const i0 = 4;
  const i1 = N - 8;
  const bOut = pts.slice(i0, i1).map((q) => off(q, -0.5));
  const bIn = pts.slice(i0, i1).map((q) => off(q, -0.16)).reverse();
  const bellyD = `M ${bOut.map(P).join(' L ')} L ${bIn.map(P).join(' L ')} Z`;
  const segs = [];
  for (let i = i0 + 3; i < i1; i += 4) segs.push(`M ${P(off(pts[i], -0.5))} L ${P(off(pts[i], -0.16))}`);

  // 鱗片
  const scales = [];
  for (let i = 10; i < N - 14; i += 6) {
    const q = pts[i];
    const n = nrm(q);
    const c = off(q, 0.14);
    const r = wAt(q.s) * 0.13;
    const A = [c[0] + n[0] * r, c[1] + n[1] * r];
    const B = [c[0] + q.t[0] * r * 1.3, c[1] + q.t[1] * r * 1.3];
    const D = [c[0] - n[0] * r, c[1] - n[1] * r];
    scales.push(`M ${P(A)} Q ${P(B)} ${P(D)}`);
  }

  // 尾巴的鬃毛
  const qe = pts[N - 1];
  const ne = nrm(qe);
  const te = qe.t;
  const at = (a, b) => [qe.p[0] + te[0] * a + ne[0] * b, qe.p[1] + te[1] * a + ne[1] * b];
  const k = W / 56;
  const tuft = `M ${P(at(-4 * k, 7 * k))} Q ${P(at(18 * k, 26 * k))} ${P(at(36 * k, 14 * k))} Q ${P(at(28 * k, 6 * k))} ${P(at(44 * k, -2 * k))} Q ${P(at(26 * k, -8 * k))} ${P(at(32 * k, -24 * k))} Q ${P(at(12 * k, -16 * k))} ${P(at(-4 * k, -7 * k))} Z`;

  // 頭（朝 +x 畫，再旋轉到龍身起點）
  const ang = (Math.atan2(f0[1], f0[0]) * 180) / Math.PI;
  const hs = (W / 56) * headScale;
  const flipY = f0[0] < 0 ? -1 : 1;
  const hst = { stroke: pal.line, 'stroke-width': sw / hs, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' };
  const eyeEl =
    eyes === 'dot'
      ? g(
          {},
          circle(36, -16, 26, { fill: 'url(#glowY)', class: 'pulse' }),
          circle(36, -16, 11, { fill: '#fff', ...hst }),
          circle(38, -16, 7, { fill: '#1d1d22' }),
          circle(35.5, -18.5, 2.6, { fill: '#fff' })
        )
      : circle(36, -16, 11, { fill: '#fff', ...hst });
  const head = g(
    { transform: `translate(${P(pts[0].p)}) rotate(${r2(ang)}) scale(${r2(hs)} ${r2(hs * flipY)})` },
    path('M 10 -26 L -18 -42 L -6 -20 L -34 -22 L -12 -6 L -36 6 L -10 10 L -26 26 L 4 20 L -2 36 L 16 22 Z', { fill: pal.fin, ...hst }),
    limb('M 20 -32 Q 8 -56 -14 -64', pal.horn, 7, (sw / hs) * 0.8),
    limb('M 8 -50 Q 16 -60 12 -70', pal.horn, 5, (sw / hs) * 0.8),
    path('M 26 10 L 74 14 L 70 26 L 30 24 Z', { fill: painted ? '#E8C9B8' : '#C0392B' }),
    path('M 20 14 L 72 20 Q 86 22 84 30 Q 80 36 66 34 L 26 30 Q 10 26 20 14 Z', { fill: pal.body, ...hst }),
    path('M -4 8 C -10 -26, 14 -42, 38 -38 C 52 -36, 60 -28, 64 -22 L 90 -18 C 102 -16, 106 -2, 98 6 L 86 12 L 30 12 C 14 14, 0 18, -4 8 Z', { fill: pal.body, ...hst }),
    path('M 58 12 L 62 21 L 66 12 Z M 72 13 L 75 20 L 78 13 Z', { fill: '#fff', ...hst, 'stroke-width': 1.2 / hs }),
    ellipse(92, -8, 3.2, 2.2, { fill: pal.line }),
    path('M 18 -30 Q 36 -38 52 -26', { fill: 'none', stroke: pal.line, 'stroke-width': 4 / hs, 'stroke-linecap': 'round' }),
    eyeEl,
    path('M 86 2 C 112 8, 122 30, 144 24', { fill: 'none', stroke: pal.horn, 'stroke-width': 3.4, 'stroke-linecap': 'round' }),
    path('M 84 -12 C 104 -32, 126 -26, 140 -40', { fill: 'none', stroke: pal.horn, 'stroke-width': 3.4, 'stroke-linecap': 'round' }),
    path('M 38 30 L 44 48 L 52 32 Z', { fill: pal.fin, ...hst })
  );

  return g(
    { class: cls },
    ...legEls,
    path(tuft, { fill: pal.fin, ...st }),
    ...spikes,
    path(bodyD, { fill: pal.body, ...st }),
    path(bellyD, { fill: pal.belly }),
    path(segs.join(' '), { stroke: painted ? '#D7C9A6' : '#E2B866', 'stroke-width': 1.6 }),
    path(scales.join(' '), { fill: 'none', stroke: pal.scale, 'stroke-width': 1.8, 'stroke-linecap': 'round' }),
    path(bodyD, { fill: 'none', ...st }),
    head
  );
}
