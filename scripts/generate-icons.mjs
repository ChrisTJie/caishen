import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const publicDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');
mkdirSync(publicDir, { recursive: true });

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crc]);
}

function encodePng(width, height, paint) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    const row = y * (width * 4 + 1);
    raw[row] = 0;
    for (let x = 0; x < width; x++) {
      const [r, g, b, a = 255] = paint(x, y, width, height);
      const i = row + 1 + x * 4;
      raw[i] = r;
      raw[i + 1] = g;
      raw[i + 2] = b;
      raw[i + 3] = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function paintIcon(x, y, w, h) {
  const cx = (w - 1) / 2;
  const cy = (h - 1) / 2;
  const dx = x - cx;
  const dy = y - cy;
  const d = Math.hypot(dx, dy);
  const r = w * 0.42;
  if (d > r) return [153, 27, 27, 255];
  if (d > r * 0.88) return [184, 134, 11, 255];
  if (d > r * 0.8) return [255, 215, 0, 255];
  const ingot = Math.abs(dx) < w * 0.18 && Math.abs(dy) < h * 0.12;
  if (ingot) return [255, 248, 180, 255];
  return [180, 24, 24, 255];
}

function pngIcon(size) {
  return encodePng(size, size, paintIcon);
}

function icoFromPng(pngBuf, size) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);
  const entry = Buffer.alloc(16);
  entry[0] = size >= 256 ? 0 : size;
  entry[1] = size >= 256 ? 0 : size;
  entry.writeUInt32LE(pngBuf.length, 8);
  entry.writeUInt32LE(22, 12);
  return Buffer.concat([header, entry, pngBuf]);
}

const png32 = pngIcon(32);
writeFileSync(join(publicDir, 'pwa-512x512.png'), pngIcon(512));
writeFileSync(join(publicDir, 'pwa-192x192.png'), pngIcon(192));
writeFileSync(join(publicDir, 'apple-touch-icon.png'), pngIcon(180));
writeFileSync(join(publicDir, 'favicon-32x32.png'), png32);
writeFileSync(join(publicDir, 'favicon.ico'), icoFromPng(png32, 32));

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="64" fill="#991b1b"/>
  <circle cx="256" cy="256" r="176" fill="#b8860b"/>
  <circle cx="256" cy="256" r="158" fill="#ffd700"/>
  <circle cx="256" cy="256" r="128" fill="#b41818"/>
  <rect x="176" y="226" width="160" height="60" rx="12" fill="#fff8b4"/>
</svg>
`;
writeFileSync(join(publicDir, 'favicon.svg'), svg);
writeFileSync(join(publicDir, 'mask-icon.svg'), svg);

const tiles = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 72 72">
  <path d="M0 36h72M36 0v72M0 0l72 72M72 0L0 72M18 0v72M54 0v72M0 18h72M0 54h72"
        fill="none" stroke="#ffffff" stroke-width="1" opacity="0.22"/>
</svg>
`;
writeFileSync(join(publicDir, 'oriental-tiles.svg'), tiles);

console.log('Generated PWA icons in public/');
