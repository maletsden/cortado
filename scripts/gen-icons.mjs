// gen-icons.mjs — make app icons with zlib. No deps.
// Dark Luxe bg (#0e0b09) + gold filled coffee-cup glyph.
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';

const BG = [0x0e, 0x0b, 0x09];
const GOLD = [0xe7, 0xc7, 0x9a];

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return (~c) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const t = Buffer.from(type, 'ascii');
  const body = Buffer.concat([t, data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function png(size) {
  // Build RGB pixel field, then add filter byte 0 per row.
  const cx = size / 2, cy = size / 2;
  const cupW = size * 0.42, cupH = size * 0.30;
  const cupL = cx - cupW / 2, cupR = cx + cupW / 2;
  const cupT = cy - cupH / 2 + size * 0.04, cupB = cupT + cupH;
  const r = size * 0.10; // saucer/handle radius scale

  const raw = Buffer.alloc((size * 3 + 1) * size);
  let o = 0;
  for (let y = 0; y < size; y++) {
    raw[o++] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      let col = BG;
      // cup body (rounded rect-ish): inside box
      const inCup = x >= cupL && x <= cupR && y >= cupT && y <= cupB;
      // handle: ring on right side
      const hx = cupR + size * 0.02, hy = (cupT + cupB) / 2;
      const dh = Math.hypot(x - hx, y - hy);
      const inHandle = dh < r && dh > r * 0.55 && x > cupR - size * 0.01;
      // saucer: thin ellipse below cup
      const sy = cupB + size * 0.05;
      const inSaucer = Math.abs(y - sy) < size * 0.018 &&
        Math.abs(x - cx) < cupW * 0.72;
      // steam: two short verticals above cup
      const inSteam = y < cupT - size * 0.02 && y > cupT - size * 0.16 &&
        (Math.abs(x - (cx - size * 0.06)) < size * 0.012 ||
         Math.abs(x - (cx + size * 0.06)) < size * 0.012);
      if (inCup || inHandle || inSaucer || inSteam) col = GOLD;
      raw[o++] = col[0]; raw[o++] = col[1]; raw[o++] = col[2];
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 2;  // color type RGB
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

mkdirSync(new URL('../icons/', import.meta.url), { recursive: true });
for (const s of [192, 512]) {
  const out = new URL(`../icons/icon-${s}.png`, import.meta.url);
  writeFileSync(out, png(s));
  console.log(`wrote icons/icon-${s}.png`);
}
