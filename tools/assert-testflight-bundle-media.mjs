#!/usr/bin/env node
import { closeSync, existsSync, openSync, readdirSync, readSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.argv[2];
const fail = (code, message) => {
  console.error(`[assert-testflight-bundle-media] ${message}`);
  process.exit(code);
};

if (!root) {
  fail(2, 'usage: node tools/assert-testflight-bundle-media.mjs <packed-www-dir>');
}
if (!existsSync(root) || !statSync(root).isDirectory()) {
  fail(2, `packed www dir not found: ${root}`);
}

const LFS_POINTER = Buffer.from('version https://git-lfs.github.com/spec/v1');
const MP4_FTYP = Buffer.from('ftyp');
const ID3 = Buffer.from('ID3');
const MIN_MP4_BYTES = 50_000;
const MIN_MP3_BYTES = 5_000;
const MIN_WWW_BYTES = 280 * 1024 * 1024;
const MAX_WWW_BYTES = 520 * 1024 * 1024;

const rel = (file) => relative(root, file);
const startsWith = (buffer, prefix) =>
  buffer.length >= prefix.length && buffer.subarray(0, prefix.length).equals(prefix);

const readHead = (file, bytes = 256) => {
  const fd = openSync(file, 'r');
  try {
    const buffer = Buffer.alloc(bytes);
    const read = readSync(fd, buffer, 0, bytes, 0);
    return buffer.subarray(0, read);
  } finally {
    closeSync(fd);
  }
};

const allFiles = [];
const walk = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const file = join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(file);
    } else if (entry.isFile()) {
      allFiles.push(file);
    }
  }
};
walk(root);

if (allFiles.length === 0) {
  fail(17, `packed www dir is empty: ${root}`);
}

let totalBytes = 0;
for (const file of allFiles) {
  totalBytes += statSync(file).size;
  if (startsWith(readHead(file), LFS_POINTER)) {
    fail(16, `Git LFS pointer bundled instead of real asset: ${rel(file)}`);
  }
}

const collect = (dirRel, pattern) => {
  const dir = join(root, dirRel);
  if (!existsSync(dir) || !statSync(dir).isDirectory()) {
    fail(16, `required media dir missing: ${dirRel}`);
  }
  const files = readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && pattern.test(entry.name))
    .map((entry) => join(dir, entry.name))
    .sort();
  if (files.length === 0) {
    fail(16, `required media dir empty: ${dirRel}`);
  }
  return files;
};

const mp4s = [
  ...collect('assets/video/free-levels', /\.mp4$/),
  ...collect('assets/video/desert-levels', /\.mp4$/),
  ...collect('assets/video/math-story', /\.mp4$/),
];
const mp3s = collect('assets/audio/math-story-theme', /\.mp3$/);

for (const file of mp4s) {
  const size = statSync(file).size;
  if (size < MIN_MP4_BYTES) {
    fail(16, `mp4 too small: ${rel(file)} bytes=${size}`);
  }
  const raw = readHead(file, 64);
  if (!raw.subarray(4, 8).equals(MP4_FTYP)) {
    fail(16, `not an MP4 ftyp file: ${rel(file)}`);
  }
}

for (const file of mp3s) {
  const size = statSync(file).size;
  if (size < MIN_MP3_BYTES) {
    fail(16, `mp3 too small: ${rel(file)} bytes=${size}`);
  }
  const raw = readHead(file, 16);
  const frameSync = raw.length >= 2 && raw[0] === 0xff && (raw[1] & 0xe0) === 0xe0;
  if (!startsWith(raw, ID3) && !frameSync) {
    fail(16, `not an MP3 file: ${rel(file)}`);
  }
}

if (totalBytes < MIN_WWW_BYTES || totalBytes > MAX_WWW_BYTES) {
  fail(
    17,
    `packed www size out of range: ${(totalBytes / 1024 / 1024).toFixed(1)} MiB want 280-520 MiB`,
  );
}

console.log(
  `[assert-testflight-bundle-media] OK files=${allFiles.length} mp4=${mp4s.length} mp3=${mp3s.length} sizeMiB=${(totalBytes / 1024 / 1024).toFixed(1)}`,
);
