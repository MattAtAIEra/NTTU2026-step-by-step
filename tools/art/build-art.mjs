// 產生網站插圖：node tools/art/build-art.mjs
// 輸出到 site/images/，每張 SVG 都是獨立檔案（內含動畫樣式），可直接部署。
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { svgDoc } from './lib.mjs';
import { SCENES } from './scenes.mjs';

const outDir = join(dirname(fileURLToPath(import.meta.url)), '../../site/images');
mkdirSync(outDir, { recursive: true });

for (const [file, build] of Object.entries(SCENES)) {
  const svg = svgDoc(build());
  writeFileSync(join(outDir, file), svg);
  console.log(`${file.padEnd(22)} ${(svg.length / 1024).toFixed(1)} KB`);
}
