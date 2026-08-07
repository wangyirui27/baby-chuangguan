// 关卡 ↔ 视频 ↔ OSS key 目录（运维台内容管理）
// 写盘：data/content-catalog.json；发布：asset-packs.json
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const REPO_ROOT_DEFAULT = path.resolve(__dirname, '..', '..');
const DATA_DIR_DEFAULT = path.join(REPO_ROOT_DEFAULT, 'data');
const CATALOG_FILE = 'content-catalog.json';
const ASSET_PACKS_FILE = 'asset-packs.json';

const DEFAULT_MAPS = {
  ocean: {
    mapId: 'ocean',
    title: 'Magic Ocean',
    status: 'active',
    bundledThroughLevel: 10,
    packId: 'ocean-levels-011-200',
    packVersion: '20260803.1',
    downloadUrl: '',
    levelVideoUrlTemplate: '',
    notes: '英语海洋地图；前 10 关包内视频，11+ 走 OSS/CDN。',
  },
  desert: {
    mapId: 'desert',
    title: 'Desert Wonders',
    status: 'active',
    bundledThroughLevel: 10,
    packId: 'desert-levels-011-200',
    packVersion: '20260803.1',
    downloadUrl: '',
    levelVideoUrlTemplate: '',
    notes: '沙漠短语地图；课视频按绑定写入 levels[]。',
  },
  castle: {
    mapId: 'castle',
    title: 'Magic Castle',
    status: 'coming-soon',
    bundledThroughLevel: 0,
    packId: '',
    packVersion: '',
    downloadUrl: '',
    levelVideoUrlTemplate: '',
    notes: 'Coming soon.',
  },
};

/** 与 script.js 前 10 关 + 本地 paid 抽样对齐的种子 */
const SEED_OCEAN_LEVELS = [
  { levelId: 1, slug: 'mom', title: 'Mom', tier: 'free-levels' },
  { levelId: 2, slug: 'dad', title: 'Dad', tier: 'free-levels' },
  { levelId: 3, slug: 'grandma', title: 'Grandma', tier: 'free-levels' },
  { levelId: 4, slug: 'grandpa', title: 'Grandpa', tier: 'free-levels' },
  { levelId: 5, slug: 'hand', title: 'Hand', tier: 'free-levels' },
  { levelId: 6, slug: 'rice', title: 'Rice', tier: 'free-levels' },
  { levelId: 7, slug: 'water', title: 'Water', tier: 'free-levels' },
  { levelId: 8, slug: 'car', title: 'Car', tier: 'free-levels' },
  { levelId: 9, slug: 'dog', title: 'Dog', tier: 'free-levels' },
  { levelId: 10, slug: 'book', title: 'Book', tier: 'free-levels' },
  { levelId: 11, slug: 'pear', title: 'Pear', tier: 'paid-levels' },
  { levelId: 12, slug: 'grape', title: 'Grape', tier: 'paid-levels' },
];

let REPO_ROOT = REPO_ROOT_DEFAULT;
let DATA_DIR = DATA_DIR_DEFAULT;

/** @type {object|null} */
let catalog = null;
let _saveTimer = null;

function setRepoRoot(dir) {
  REPO_ROOT = path.resolve(dir);
}

function setDataDir(dir) {
  DATA_DIR = path.resolve(dir);
}

function catalogPath() {
  return path.join(DATA_DIR, CATALOG_FILE);
}

function assetPacksPath() {
  return path.join(REPO_ROOT, ASSET_PACKS_FILE);
}

function nowIso() {
  return new Date().toISOString();
}

function newId(prefix) {
  return `${prefix}_${crypto.randomBytes(6).toString('hex')}`;
}

function pad2(n) {
  return String(Number(n) || 0).padStart(2, '0');
}

function defaultOssKey(tier, levelId, slug) {
  const t = tier === 'paid-levels' ? 'paid-levels' : 'free-levels';
  return `assets/video/${t}/level-${pad2(levelId)}-${slug}.mp4`;
}

function envPublicBase() {
  return String(
    process.env.OSS_PUBLIC_BASE_URL ||
      process.env.COURSE_VIDEO_BASE ||
      process.env.ASSET_CDN_BASE ||
      '',
  )
    .trim()
    .replace(/\/+$/, '');
}

function getOssPublicBase() {
  const fromCat =
    catalog && catalog.oss && catalog.oss.publicBaseUrl
      ? String(catalog.oss.publicBaseUrl).trim().replace(/\/+$/, '')
      : '';
  return fromCat || envPublicBase() || '';
}

function publicUrlForKey(ossKey) {
  const base = getOssPublicBase();
  const key = String(ossKey || '').replace(/^\/+/, '');
  if (!key) return '';
  if (!base) return `/${key}`;
  return `${base}/${key}`;
}

function emptyCatalog() {
  return {
    schemaVersion: 1,
    updatedAt: nowIso(),
    oss: {
      publicBaseUrl: envPublicBase(),
      keyPrefix: 'assets/video',
      bucket: String(process.env.OSS_BUCKET || '').trim(),
      endpoint: String(process.env.OSS_ENDPOINT || '').trim(),
      notes:
        'publicBaseUrl 优先目录配置，其次 env OSS_PUBLIC_BASE_URL / COURSE_VIDEO_BASE。对象 key 即 OSS 路径。',
    },
    maps: JSON.parse(JSON.stringify(DEFAULT_MAPS)),
    videos: [],
    levels: [],
  };
}

function normalizeVideo(v) {
  if (!v || typeof v !== 'object') return null;
  const id = String(v.id || '').trim() || newId('vid');
  const ossKey = String(v.ossKey || '').replace(/^\/+/, '');
  return {
    id,
    title: String(v.title || path.basename(ossKey || 'video')).slice(0, 120),
    ossKey,
    localRelPath: String(v.localRelPath || ossKey || '').replace(/^\/+/, ''),
    mapId: v.mapId ? String(v.mapId) : null,
    levelId: v.levelId != null ? Number(v.levelId) || null : null,
    status: ['missing', 'local', 'registered', 'ready'].includes(v.status) ? v.status : 'registered',
    bytesTotal: Math.max(0, Number(v.bytesTotal) || 0),
    sha256: String(v.sha256 || '').slice(0, 64),
    notes: String(v.notes || '').slice(0, 500),
    updatedAt: v.updatedAt || nowIso(),
  };
}

function normalizeLevel(row) {
  if (!row || typeof row !== 'object') return null;
  const mapId = String(row.mapId || 'ocean');
  const levelId = Number(row.levelId) || 0;
  if (!levelId) return null;
  const slug = String(row.slug || `level${levelId}`).replace(/[^a-z0-9-]/gi, '').toLowerCase() || `l${levelId}`;
  const tier = row.tier === 'paid-levels' || levelId > 10 ? 'paid-levels' : 'free-levels';
  const ossKey = String(row.ossKey || defaultOssKey(tier, levelId, slug)).replace(/^\/+/, '');
  return {
    id: `${mapId}:${levelId}`,
    mapId,
    levelId,
    title: String(row.title || slug).slice(0, 80),
    slug,
    tier,
    status: ['draft', 'published', 'offline'].includes(row.status) ? row.status : 'draft',
    videoId: row.videoId ? String(row.videoId) : null,
    ossKey,
    localRelPath: String(row.localRelPath || ossKey).replace(/^\/+/, ''),
    downloadUrlOverride: String(row.downloadUrlOverride || '').trim(),
    bytesTotal: Math.max(0, Number(row.bytesTotal) || 0),
    sha256: String(row.sha256 || '').slice(0, 64),
    notes: String(row.notes || '').slice(0, 500),
    updatedAt: row.updatedAt || nowIso(),
  };
}

function ensureLoaded() {
  if (catalog) return catalog;
  load();
  return catalog;
}

function load() {
  catalog = null;
  try {
    if (fs.existsSync(catalogPath())) {
      const raw = JSON.parse(fs.readFileSync(catalogPath(), 'utf8'));
      catalog = emptyCatalog();
      if (raw && typeof raw === 'object') {
        catalog.schemaVersion = Number(raw.schemaVersion) || 1;
        catalog.updatedAt = raw.updatedAt || nowIso();
        if (raw.oss && typeof raw.oss === 'object') {
          catalog.oss = { ...catalog.oss, ...raw.oss };
        }
        if (raw.maps && typeof raw.maps === 'object') {
          for (const [k, v] of Object.entries(raw.maps)) {
            catalog.maps[k] = { ...(DEFAULT_MAPS[k] || { mapId: k }), ...v, mapId: k };
          }
        }
        catalog.videos = Array.isArray(raw.videos)
          ? raw.videos.map(normalizeVideo).filter(Boolean)
          : [];
        catalog.levels = Array.isArray(raw.levels)
          ? raw.levels.map(normalizeLevel).filter(Boolean)
          : [];
      }
    }
  } catch (err) {
    console.error('[CONTENT] load failed', err && err.message);
  }
  if (!catalog) catalog = emptyCatalog();
  if (!catalog.levels.length && !catalog.videos.length) {
    seedFromDefaults();
  }
  return catalog;
}

function scheduleSave() {
  if (_saveTimer) clearTimeout(_saveTimer);
  _saveTimer = setTimeout(() => {
    _saveTimer = null;
    flushSave();
  }, 200);
}

function flushSave() {
  ensureLoaded();
  catalog.updatedAt = nowIso();
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const tmp = `${catalogPath()}.${process.pid}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(catalog, null, 2));
    fs.renameSync(tmp, catalogPath());
  } catch (err) {
    console.error('[CONTENT] save failed', err && err.message);
  }
}

function seedFromDefaults() {
  const videos = [];
  const levels = [];
  for (const seed of SEED_OCEAN_LEVELS) {
    const ossKey = defaultOssKey(seed.tier, seed.levelId, seed.slug);
    const localPath = path.join(REPO_ROOT, ossKey);
    let bytes = 0;
    let status = 'missing';
    try {
      if (fs.existsSync(localPath)) {
        bytes = fs.statSync(localPath).size;
        status = 'local';
      }
    } catch (_e) {
      /* ignore */
    }
    const vid = newId('vid');
    videos.push(
      normalizeVideo({
        id: vid,
        title: `L${pad2(seed.levelId)} ${seed.title}`,
        ossKey,
        localRelPath: ossKey,
        mapId: 'ocean',
        levelId: seed.levelId,
        status,
        bytesTotal: bytes,
      }),
    );
    levels.push(
      normalizeLevel({
        mapId: 'ocean',
        levelId: seed.levelId,
        title: seed.title,
        slug: seed.slug,
        tier: seed.tier,
        status: status === 'missing' ? 'draft' : 'published',
        videoId: vid,
        ossKey,
        localRelPath: ossKey,
        bytesTotal: bytes,
      }),
    );
  }
  catalog.videos = videos;
  catalog.levels = levels;
  catalog.updatedAt = nowIso();
  scheduleSave();
}

function scanLocalVideos() {
  ensureLoaded();
  const roots = [
    path.join(REPO_ROOT, 'assets', 'video', 'free-levels'),
    path.join(REPO_ROOT, 'assets', 'video', 'paid-levels'),
  ];
  const found = [];
  const re = /^level-(\d+)-([a-z0-9-]+)\.mp4$/i;

  for (const dir of roots) {
    let names = [];
    try {
      if (!fs.existsSync(dir)) continue;
      names = fs.readdirSync(dir).filter((n) => n.endsWith('.mp4') && !n.includes('.before-'));
    } catch (_e) {
      continue;
    }
    const tier = path.basename(dir);
    for (const name of names) {
      const m = name.match(re);
      if (!m) continue;
      const levelId = Number(m[1]);
      const slug = m[2].toLowerCase();
      const ossKey = `assets/video/${tier}/${name}`;
      let bytes = 0;
      try {
        bytes = fs.statSync(path.join(dir, name)).size;
      } catch (_e) {
        /* */
      }
      found.push({ levelId, slug, tier, ossKey, bytesTotal: bytes, mapId: 'ocean' });
    }
  }

  let addedVideos = 0;
  let linkedLevels = 0;

  for (const f of found) {
    let video = catalog.videos.find((v) => v.ossKey === f.ossKey);
    if (!video) {
      video = normalizeVideo({
        id: newId('vid'),
        title: `L${pad2(f.levelId)} ${f.slug}`,
        ossKey: f.ossKey,
        localRelPath: f.ossKey,
        mapId: f.mapId,
        levelId: f.levelId,
        status: 'local',
        bytesTotal: f.bytesTotal,
      });
      catalog.videos.push(video);
      addedVideos += 1;
    } else {
      video.status = 'local';
      video.bytesTotal = f.bytesTotal || video.bytesTotal;
      video.localRelPath = f.ossKey;
      video.updatedAt = nowIso();
    }

    let level = catalog.levels.find((l) => l.mapId === f.mapId && l.levelId === f.levelId);
    if (!level) {
      level = normalizeLevel({
        mapId: f.mapId,
        levelId: f.levelId,
        title: f.slug,
        slug: f.slug,
        tier: f.tier,
        status: 'published',
        videoId: video.id,
        ossKey: f.ossKey,
        localRelPath: f.ossKey,
        bytesTotal: f.bytesTotal,
      });
      catalog.levels.push(level);
      linkedLevels += 1;
    } else if (!level.videoId) {
      level.videoId = video.id;
      level.ossKey = f.ossKey;
      level.localRelPath = f.ossKey;
      level.bytesTotal = f.bytesTotal || level.bytesTotal;
      level.slug = f.slug;
      level.updatedAt = nowIso();
      if (level.status === 'draft') level.status = 'published';
      linkedLevels += 1;
    } else {
      // 保持人工绑定，只刷新本地体积
      if (level.ossKey === f.ossKey) {
        level.bytesTotal = f.bytesTotal || level.bytesTotal;
      }
    }

    video.mapId = level.mapId;
    video.levelId = level.levelId;
  }

  catalog.updatedAt = nowIso();
  scheduleSave();
  return { scanned: found.length, addedVideos, linkedLevels, files: found };
}

function enrichLevel(level) {
  const video = level.videoId ? catalog.videos.find((v) => v.id === level.videoId) : null;
  const ossKey = (video && video.ossKey) || level.ossKey;
  const downloadUrl = level.downloadUrlOverride || publicUrlForKey(ossKey);
  const localAbs = path.join(REPO_ROOT, level.localRelPath || ossKey);
  let localExists = false;
  try {
    localExists = fs.existsSync(localAbs);
  } catch (_e) {
    localExists = false;
  }
  return {
    ...level,
    video: video
      ? {
          id: video.id,
          title: video.title,
          ossKey: video.ossKey,
          status: video.status,
          bytesTotal: video.bytesTotal,
        }
      : null,
    resolved: {
      ossKey,
      downloadUrl,
      publicBaseUrl: getOssPublicBase(),
      localExists,
      publishable: level.status === 'published' && Boolean(ossKey),
    },
  };
}

function listMaps() {
  ensureLoaded();
  return Object.values(catalog.maps).map((m) => {
    const levels = catalog.levels.filter((l) => l.mapId === m.mapId);
    const published = levels.filter((l) => l.status === 'published').length;
    const withVideo = levels.filter((l) => l.videoId).length;
    return {
      ...m,
      stats: {
        levels: levels.length,
        published,
        withVideo,
      },
    };
  });
}

function updateMap(mapId, patch = {}) {
  ensureLoaded();
  const id = String(mapId);
  if (!catalog.maps[id]) {
    catalog.maps[id] = { mapId: id, title: id, status: 'draft', bundledThroughLevel: 0 };
  }
  const m = catalog.maps[id];
  const allowed = [
    'title',
    'status',
    'bundledThroughLevel',
    'packId',
    'packVersion',
    'downloadUrl',
    'levelVideoUrlTemplate',
    'notes',
  ];
  for (const k of allowed) {
    if (patch[k] !== undefined) {
      if (k === 'bundledThroughLevel') m[k] = Math.max(0, Number(patch[k]) || 0);
      else m[k] = typeof patch[k] === 'string' ? patch[k] : patch[k];
    }
  }
  m.mapId = id;
  catalog.updatedAt = nowIso();
  scheduleSave();
  return m;
}

function listLevels({ mapId, status, q, page = 1, limit = 50 } = {}) {
  ensureLoaded();
  let rows = catalog.levels.map(enrichLevel);
  if (mapId) rows = rows.filter((l) => l.mapId === String(mapId));
  if (status && status !== 'all') rows = rows.filter((l) => l.status === status);
  if (q) {
    const s = String(q).toLowerCase();
    rows = rows.filter(
      (l) =>
        String(l.levelId).includes(s) ||
        (l.title && l.title.toLowerCase().includes(s)) ||
        (l.slug && l.slug.toLowerCase().includes(s)) ||
        (l.ossKey && l.ossKey.toLowerCase().includes(s)),
    );
  }
  rows.sort((a, b) => a.mapId.localeCompare(b.mapId) || a.levelId - b.levelId);
  const total = rows.length;
  const p = Math.max(1, Number(page) || 1);
  const lim = Math.min(200, Math.max(1, Number(limit) || 50));
  const start = (p - 1) * lim;
  return {
    page: p,
    limit: lim,
    total,
    totalPages: Math.max(1, Math.ceil(total / lim) || 1),
    items: rows.slice(start, start + lim),
  };
}

function getLevel(mapId, levelId) {
  ensureLoaded();
  const level = catalog.levels.find(
    (l) => l.mapId === String(mapId) && l.levelId === Number(levelId),
  );
  return level ? enrichLevel(level) : null;
}

function upsertLevel(mapId, levelId, patch = {}) {
  ensureLoaded();
  const mid = String(mapId);
  const lid = Number(levelId);
  if (!lid) {
    const err = new Error('invalid levelId');
    err.code = 'INVALID_LEVEL';
    throw err;
  }
  let level = catalog.levels.find((l) => l.mapId === mid && l.levelId === lid);
  if (!level) {
    level = normalizeLevel({
      mapId: mid,
      levelId: lid,
      title: patch.title || `Level ${lid}`,
      slug: patch.slug,
      tier: lid > 10 ? 'paid-levels' : 'free-levels',
      status: 'draft',
    });
    catalog.levels.push(level);
  }
  const allowed = [
    'title',
    'slug',
    'status',
    'tier',
    'ossKey',
    'localRelPath',
    'downloadUrlOverride',
    'bytesTotal',
    'sha256',
    'notes',
    'videoId',
  ];
  for (const k of allowed) {
    if (patch[k] !== undefined) {
      if (k === 'bytesTotal') level[k] = Math.max(0, Number(patch[k]) || 0);
      else if (k === 'videoId') level[k] = patch[k] ? String(patch[k]) : null;
      else if (k === 'status') {
        if (['draft', 'published', 'offline'].includes(patch[k])) level[k] = patch[k];
      } else level[k] = typeof patch[k] === 'string' ? String(patch[k]).trim() : patch[k];
    }
  }
  if (patch.slug) {
    level.slug = String(patch.slug)
      .replace(/[^a-z0-9-]/gi, '')
      .toLowerCase();
  }
  if (!level.ossKey && level.slug) {
    level.ossKey = defaultOssKey(level.tier, level.levelId, level.slug);
    level.localRelPath = level.ossKey;
  }
  level.updatedAt = nowIso();
  catalog.updatedAt = nowIso();
  scheduleSave();
  return enrichLevel(level);
}

function bindLevelVideo(mapId, levelId, videoId) {
  ensureLoaded();
  const video = catalog.videos.find((v) => v.id === String(videoId));
  if (!video) {
    const err = new Error('视频不存在');
    err.code = 'VIDEO_NOT_FOUND';
    throw err;
  }
  const level = upsertLevel(mapId, levelId, {
    videoId: video.id,
    ossKey: video.ossKey,
    localRelPath: video.localRelPath || video.ossKey,
    bytesTotal: video.bytesTotal,
  });
  video.mapId = String(mapId);
  video.levelId = Number(levelId);
  video.updatedAt = nowIso();
  scheduleSave();
  return level;
}

function unbindLevelVideo(mapId, levelId) {
  ensureLoaded();
  const level = catalog.levels.find(
    (l) => l.mapId === String(mapId) && l.levelId === Number(levelId),
  );
  if (!level) {
    const err = new Error('关卡不存在');
    err.code = 'LEVEL_NOT_FOUND';
    throw err;
  }
  if (level.videoId) {
    const video = catalog.videos.find((v) => v.id === level.videoId);
    if (video && video.mapId === level.mapId && video.levelId === level.levelId) {
      video.mapId = null;
      video.levelId = null;
      video.updatedAt = nowIso();
    }
  }
  level.videoId = null;
  level.updatedAt = nowIso();
  scheduleSave();
  return enrichLevel(level);
}

function listVideos({ q, status, page = 1, limit = 50 } = {}) {
  ensureLoaded();
  let rows = catalog.videos.slice();
  if (status && status !== 'all') rows = rows.filter((v) => v.status === status);
  if (q) {
    const s = String(q).toLowerCase();
    rows = rows.filter(
      (v) =>
        (v.title && v.title.toLowerCase().includes(s)) ||
        (v.ossKey && v.ossKey.toLowerCase().includes(s)) ||
        (v.id && v.id.toLowerCase().includes(s)),
    );
  }
  rows.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
  const total = rows.length;
  const p = Math.max(1, Number(page) || 1);
  const lim = Math.min(200, Math.max(1, Number(limit) || 50));
  const start = (p - 1) * lim;
  const items = rows.slice(start, start + lim).map((v) => ({
    ...v,
    resolved: {
      downloadUrl: publicUrlForKey(v.ossKey),
      publicBaseUrl: getOssPublicBase(),
    },
  }));
  return {
    page: p,
    limit: lim,
    total,
    totalPages: Math.max(1, Math.ceil(total / lim) || 1),
    items,
  };
}

function registerVideo(input = {}) {
  ensureLoaded();
  const ossKey = String(input.ossKey || '').replace(/^\/+/, '');
  if (!ossKey || !ossKey.endsWith('.mp4')) {
    const err = new Error('ossKey 必填且须为 .mp4 路径');
    err.code = 'INVALID_OSS_KEY';
    throw err;
  }
  let existing = catalog.videos.find((v) => v.ossKey === ossKey);
  if (existing) {
    if (input.title) existing.title = String(input.title).slice(0, 120);
    if (input.notes != null) existing.notes = String(input.notes).slice(0, 500);
    if (input.mapId != null) existing.mapId = input.mapId ? String(input.mapId) : null;
    if (input.levelId != null) existing.levelId = input.levelId ? Number(input.levelId) : null;
    existing.updatedAt = nowIso();
    scheduleSave();
    return existing;
  }
  const localRel = String(input.localRelPath || ossKey).replace(/^\/+/, '');
  let bytes = Number(input.bytesTotal) || 0;
  let status = 'registered';
  try {
    const abs = path.join(REPO_ROOT, localRel);
    if (fs.existsSync(abs)) {
      bytes = fs.statSync(abs).size;
      status = 'local';
    }
  } catch (_e) {
    /* */
  }
  const video = normalizeVideo({
    id: newId('vid'),
    title: input.title || path.basename(ossKey),
    ossKey,
    localRelPath: localRel,
    mapId: input.mapId || null,
    levelId: input.levelId != null ? Number(input.levelId) : null,
    status,
    bytesTotal: bytes,
    notes: input.notes || '',
  });
  catalog.videos.push(video);
  scheduleSave();

  if (video.mapId && video.levelId) {
    bindLevelVideo(video.mapId, video.levelId, video.id);
  }
  return video;
}

function updateVideo(videoId, patch = {}) {
  ensureLoaded();
  const video = catalog.videos.find((v) => v.id === String(videoId));
  if (!video) {
    const err = new Error('视频不存在');
    err.code = 'VIDEO_NOT_FOUND';
    throw err;
  }
  if (patch.title != null) video.title = String(patch.title).slice(0, 120);
  if (patch.ossKey != null) {
    const key = String(patch.ossKey).replace(/^\/+/, '');
    if (!key.endsWith('.mp4')) {
      const err = new Error('ossKey 须为 .mp4');
      err.code = 'INVALID_OSS_KEY';
      throw err;
    }
    video.ossKey = key;
  }
  if (patch.localRelPath != null) video.localRelPath = String(patch.localRelPath).replace(/^\/+/, '');
  if (patch.status != null && ['missing', 'local', 'registered', 'ready'].includes(patch.status)) {
    video.status = patch.status;
  }
  if (patch.bytesTotal != null) video.bytesTotal = Math.max(0, Number(patch.bytesTotal) || 0);
  if (patch.sha256 != null) video.sha256 = String(patch.sha256).slice(0, 64);
  if (patch.notes != null) video.notes = String(patch.notes).slice(0, 500);
  video.updatedAt = nowIso();

  // 同步已绑定关卡的 ossKey
  for (const level of catalog.levels) {
    if (level.videoId === video.id) {
      level.ossKey = video.ossKey;
      level.localRelPath = video.localRelPath || video.ossKey;
      level.bytesTotal = video.bytesTotal || level.bytesTotal;
      level.updatedAt = nowIso();
    }
  }
  scheduleSave();
  return {
    ...video,
    resolved: { downloadUrl: publicUrlForKey(video.ossKey), publicBaseUrl: getOssPublicBase() },
  };
}

function updateOssConfig(patch = {}) {
  ensureLoaded();
  if (patch.publicBaseUrl != null) {
    catalog.oss.publicBaseUrl = String(patch.publicBaseUrl).trim().replace(/\/+$/, '');
  }
  if (patch.keyPrefix != null) {
    catalog.oss.keyPrefix = String(patch.keyPrefix).trim().replace(/^\/+|\/+$/g, '') || 'assets/video';
  }
  if (patch.bucket != null) catalog.oss.bucket = String(patch.bucket).trim();
  if (patch.endpoint != null) catalog.oss.endpoint = String(patch.endpoint).trim();
  if (patch.notes != null) catalog.oss.notes = String(patch.notes).slice(0, 500);
  catalog.updatedAt = nowIso();
  scheduleSave();
  return getOssStatus();
}

function getOssStatus() {
  ensureLoaded();
  const base = getOssPublicBase();
  return {
    publicBaseUrl: base,
    configured: Boolean(base),
    catalogOss: { ...catalog.oss },
    env: {
      OSS_PUBLIC_BASE_URL: Boolean(String(process.env.OSS_PUBLIC_BASE_URL || '').trim()),
      OSS_BUCKET: Boolean(String(process.env.OSS_BUCKET || '').trim()),
      OSS_ENDPOINT: Boolean(String(process.env.OSS_ENDPOINT || '').trim()),
      OSS_ACCESS_KEY_ID: Boolean(String(process.env.OSS_ACCESS_KEY_ID || '').trim()),
      signedReady: Boolean(
        process.env.OSS_ACCESS_KEY_ID &&
          process.env.OSS_ACCESS_KEY_SECRET &&
          process.env.OSS_ENDPOINT &&
          process.env.OSS_BUCKET,
      ),
    },
    note: '目录存 ossKey；客户端 downloadUrl = publicBaseUrl + / + ossKey（或关卡 downloadUrlOverride）',
  };
}

function overview() {
  ensureLoaded();
  const levels = catalog.levels;
  const videos = catalog.videos;
  return {
    updatedAt: catalog.updatedAt,
    oss: getOssStatus(),
    maps: listMaps(),
    counts: {
      levels: levels.length,
      levelsPublished: levels.filter((l) => l.status === 'published').length,
      levelsOffline: levels.filter((l) => l.status === 'offline').length,
      levelsWithVideo: levels.filter((l) => l.videoId).length,
      videos: videos.length,
      videosLocal: videos.filter((v) => v.status === 'local').length,
    },
  };
}

/**
 * 把已发布关卡的视频关系写回 asset-packs.json，供 App 读取 downloadUrl。
 * App hydrateAssetPackManifest 要求 maps 为数组（Array.isArray）。
 */
function publishAssetPacks() {
  ensureLoaded();
  flushSave();

  let existing = {
    schemaVersion: 1,
    app: {
      minVersion: '1.0.0',
      bundledThroughLevel: 10,
      bridge: 'babyIslandAssetPack',
    },
    maps: [],
  };
  try {
    if (fs.existsSync(assetPacksPath())) {
      existing = JSON.parse(fs.readFileSync(assetPacksPath(), 'utf8'));
    }
  } catch {
    /* keep default */
  }

  /** @type {Map<string, object>} */
  const byId = new Map();
  if (Array.isArray(existing.maps)) {
    for (const m of existing.maps) {
      if (m && m.mapId) byId.set(String(m.mapId), m);
    }
  } else if (existing.maps && typeof existing.maps === 'object') {
    for (const [k, m] of Object.entries(existing.maps)) {
      if (m && typeof m === 'object') byId.set(String(m.mapId || k), { ...m, mapId: m.mapId || k });
    }
  }

  /** @type {object[]} */
  const outMaps = [];
  const written = new Set();

  for (const map of Object.values(catalog.maps)) {
    const prev = byId.get(map.mapId) || {};
    const publishedLevels = catalog.levels
      .filter((l) => l.mapId === map.mapId && l.status === 'published' && (l.ossKey || l.publicUrl))
      .sort((a, b) => a.levelId - b.levelId)
      .map((l) => {
        const downloadUrl = l.publicUrl || publicUrlForKey(l.ossKey);
        return {
          levelId: l.levelId,
          title: l.title,
          slug: l.slug,
          ossKey: l.ossKey,
          downloadUrl,
          bytesTotal: l.bytesTotal || 0,
          sha256: l.sha256 || '',
          status: l.status,
        };
      });

    // App normalize 只保留 levelId+downloadUrl+bytes+sha256
    const packLevels = publishedLevels
      .filter((l) => l.levelId > (map.bundledThroughLevel || 0) && l.downloadUrl)
      .map((l) => ({
        levelId: l.levelId,
        downloadUrl: l.downloadUrl,
        bytesTotal: l.bytesTotal,
        sha256: l.sha256,
      }));

    outMaps.push({
      mapId: map.mapId,
      title: map.title || prev.title || map.mapId,
      status: map.status || prev.status || 'active',
      bundledThroughLevel:
        map.bundledThroughLevel != null ? map.bundledThroughLevel : prev.bundledThroughLevel != null ? prev.bundledThroughLevel : 10,
      packId: map.packId || prev.packId || '',
      packVersion: map.packVersion || prev.packVersion || '',
      downloadUrl: map.downloadUrl || prev.downloadUrl || '',
      levelVideoUrlTemplate: map.levelVideoUrlTemplate || prev.levelVideoUrlTemplate || '',
      levels: packLevels,
      levelMedia: publishedLevels,
      totalBytes: packLevels.reduce((s, l) => s + (l.bytesTotal || 0), 0),
      sha256: prev.sha256 || '',
      notes: map.notes || prev.notes || '',
      publishedAt: nowIso(),
    });
    written.add(map.mapId);
  }

  // 保留 catalog 未覆盖但原文件有的 map
  for (const [id, prev] of byId) {
    if (!written.has(id)) outMaps.push(prev);
  }

  const out = {
    schemaVersion: Number(existing.schemaVersion || existing.version) || 1,
    app: existing.app || {
      minVersion: '1.0.0',
      bundledThroughLevel: 10,
      bridge: 'babyIslandAssetPack',
    },
    maps: outMaps,
    contentCatalogUpdatedAt: catalog.updatedAt,
  };

  const tmp = `${assetPacksPath()}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(out, null, 2));
  fs.renameSync(tmp, assetPacksPath());
  return {
    ok: true,
    path: ASSET_PACKS_FILE,
    maps: outMaps.map((m) => ({
      mapId: m.mapId,
      publishedLevels: (m.levels || []).length,
      mediaEntries: (m.levelMedia || []).length,
    })),
  };
}

module.exports = {
  setRepoRoot,
  setDataDir,
  load,
  flushSave,
  overview,
  listMaps,
  updateMap,
  listLevels,
  getLevel,
  upsertLevel,
  bindLevelVideo,
  unbindLevelVideo,
  listVideos,
  registerVideo,
  updateVideo,
  scanLocalVideos,
  updateOssConfig,
  getOssStatus,
  publishAssetPacks,
  publicUrlForKey,
  defaultOssKey,
  SEED_OCEAN_LEVELS,
};
