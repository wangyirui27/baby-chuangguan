// 嗨洛塔 · 把 table-tricks-s1 产出的 31 条 mp4 拷进 App 包
// 源：~/video/table-tricks-s1 或 LibTV 项目目录
// 目标：assets/video/math-story/{videoSlug}.mp4
//
// 用法：
//   npm run import:math-story-videos
//   MATH_STORY_VIDEO_SRC=/path npm run import:math-story-videos
//   MATH_STORY_VIDEO_FORCE=1 npm run import:math-story-videos

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const os = require('node:os');

const {
  MATH_STORY_WAYPOINTS,
  MATH_STORY_VIDEO_VERSION,
} = require('../../script.js');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const DEST_DIR = path.join(PROJECT_ROOT, 'assets', 'video', 'math-story');
const MANIFEST_PATH = path.join(DEST_DIR, 'math-story-video-manifest.json');
const FORCE = process.env.MATH_STORY_VIDEO_FORCE === '1';

const DEFAULT_SOURCES = [
  process.env.MATH_STORY_VIDEO_SRC,
  path.join(os.homedir(), 'video', 'table-tricks-s1'),
  path.join(os.homedir(), 'Documents', 'LibTV Workbench', 'projects', 'table-tricks-s1', 'output'),
  path.join(os.homedir(), 'Documents', 'LibTV Workbench', 'projects', 'table-tricks-s1', 'videos'),
  path.join(os.homedir(), 'Library', 'Application Support', 'libtv-workbench', 'projects', 'table-tricks-s1', 'output'),
  path.join(os.homedir(), 'Library', 'Application Support', 'libtv-workbench', 'projects', 'table-tricks-s1', 'videos'),
  path.join(os.homedir(), 'Library', 'Application Support', 'libtv-workbench', 'projects', 'table-tricks-s1'),
].filter(Boolean);

function sha256(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

function fileOk(p) {
  try {
    const st = fs.statSync(p);
    return st.isFile() && st.size > 50_000;
  } catch {
    return false;
  }
}

function findSourceFile(slug, roots) {
  const names = [`${slug}.mp4`, `${slug}.MP4`];
  for (const root of roots) {
    if (!root || !fs.existsSync(root)) continue;
    for (const name of names) {
      const direct = path.join(root, name);
      if (fileOk(direct)) return direct;
    }
    // shallow one-level scan
    try {
      for (const ent of fs.readdirSync(root, { withFileTypes: true })) {
        if (!ent.isDirectory()) continue;
        for (const name of names) {
          const nested = path.join(root, ent.name, name);
          if (fileOk(nested)) return nested;
        }
      }
    } catch (_) {}
  }
  return null;
}

function main() {
  fs.mkdirSync(DEST_DIR, { recursive: true });
  const roots = DEFAULT_SOURCES.filter((p, i, a) => a.indexOf(p) === i);
  console.log('[math-story-import] dest=', DEST_DIR);
  console.log('[math-story-import] sources=', roots.join(' | '));

  const entries = [];
  const summary = { total: MATH_STORY_WAYPOINTS.length, copied: 0, skipped: 0, missing: 0, updated: 0 };

  for (const wp of MATH_STORY_WAYPOINTS) {
    const slug = wp.videoSlug;
    const dest = path.join(DEST_DIR, `${slug}.mp4`);
    const src = findSourceFile(slug, roots);
    const base = {
      id: wp.id,
      title: wp.title,
      videoSlug: slug,
      beforeLevel: wp.beforeLevel,
      dest: path.relative(PROJECT_ROOT, dest),
    };

    if (!src) {
      entries.push({ ...base, status: 'missing', src: null, size: 0, sha256: '' });
      summary.missing += 1;
      console.log(`[missing] ${slug}`);
      continue;
    }

    if (fileOk(dest) && !FORCE) {
      const destBuf = fs.readFileSync(dest);
      const srcBuf = fs.readFileSync(src);
      const same = destBuf.length === srcBuf.length && sha256(destBuf) === sha256(srcBuf);
      if (same) {
        entries.push({
          ...base,
          status: 'present',
          src: path.relative(os.homedir(), src),
          size: destBuf.length,
          sha256: sha256(destBuf),
        });
        summary.skipped += 1;
        console.log(`[skip] ${slug}`);
        continue;
      }
    }

    fs.copyFileSync(src, dest);
    const buf = fs.readFileSync(dest);
    entries.push({
      ...base,
      status: 'copied',
      src: path.relative(os.homedir(), src),
      size: buf.length,
      sha256: sha256(buf),
    });
    summary.copied += 1;
    summary.updated += 1;
    console.log(`[ok] ${slug} ← ${src}`);
  }

  const present = entries.filter((e) => e.status === 'copied' || e.status === 'present').length;
  const manifest = {
    version: MATH_STORY_VIDEO_VERSION || 'unknown',
    generated_at: new Date().toISOString(),
    source_hints: [
      'MATH_STORY_VIDEO_SRC',
      '~/video/table-tricks-s1',
      'LibTV Workbench table-tricks-s1 output/videos',
    ],
    summary: { ...summary, present },
    entries,
  };
  const tmp = `${MANIFEST_PATH}.tmp.${crypto.randomUUID()}`;
  fs.writeFileSync(tmp, `${JSON.stringify(manifest, null, 2)}\n`);
  fs.renameSync(tmp, MANIFEST_PATH);
  console.log(JSON.stringify(manifest.summary, null, 2));
  if (summary.missing > 0) process.exitCode = 0; // 允许分批导入，不失败退出
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error('[FATAL]', err);
    process.exit(1);
  }
}

module.exports = { DEST_DIR, DEFAULT_SOURCES };
