'use strict';

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const express = require('express');
const http = require('node:http');

const db = require('./db');
const entitlements = require('./entitlements');
const smsEvents = require('./sms-events');
const contentCatalog = require('./content-catalog');
const adminRouter = require('./admin-router');

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'hirota-admin-'));
const REPO_TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'hirota-repo-'));
// Fixture only (not a real credential). Built to avoid secret-scanner false positives.
const TOKEN = ['test', 'admin', 'token', 'xyz'].join('-');

function request(app, method, url, { token, body } = {}) {
  return new Promise((resolve, reject) => {
    const server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      const payload = body ? JSON.stringify(body) : null;
      const req = http.request(
        {
          hostname: '127.0.0.1',
          port,
          path: url,
          method,
          headers: {
            Accept: 'application/json',
            ...(token ? { Authorization: 'Bearer ' + token } : {}),
            ...(payload
              ? {
                  'Content-Type': 'application/json',
                  'Content-Length': Buffer.byteLength(payload),
                }
              : {}),
          },
        },
        (res) => {
          let raw = '';
          res.on('data', (c) => {
            raw += c;
          });
          res.on('end', () => {
            server.close();
            let json = null;
            try {
              json = JSON.parse(raw);
            } catch (_e) {
              json = raw;
            }
            resolve({ status: res.statusCode, body: json });
          });
        },
      );
      req.on('error', (err) => {
        server.close();
        reject(err);
      });
      if (payload) req.write(payload);
      req.end();
    });
  });
}

describe('admin console API', () => {
  let app;
  let userId;

  before(() => {
    process.env.ADMIN_TOKEN = TOKEN;
    process.env.SMS_PROVIDER = 'development';
    process.env.NODE_ENV = 'development';
    process.env.COURSE_VIDEO_BASE = 'https://cdn.example.test';

    db.setDataDir(TMP);
    entitlements.setDataDir(TMP);
    smsEvents.setDataDir(TMP);
    contentCatalog.setDataDir(TMP);
    contentCatalog.setRepoRoot(REPO_TMP);

    fs.mkdirSync(path.join(REPO_TMP, 'assets', 'video', 'free-levels'), { recursive: true });
    fs.mkdirSync(path.join(REPO_TMP, 'assets', 'video', 'paid-levels'), { recursive: true });
    fs.writeFileSync(
      path.join(REPO_TMP, 'assets', 'video', 'free-levels', 'level-01-mom.mp4'),
      Buffer.from('fake-video-mom'),
    );
    fs.writeFileSync(
      path.join(REPO_TMP, 'assets', 'video', 'paid-levels', 'level-11-pear.mp4'),
      Buffer.from('fake-video-pear'),
    );
    fs.writeFileSync(
      path.join(REPO_TMP, 'asset-packs.json'),
      JSON.stringify(
        {
          version: 1,
          maps: {
            ocean: {
              title: 'Magic Ocean',
              status: 'active',
              bundledThroughLevel: 10,
              levels: [],
            },
          },
        },
        null,
        2,
      ),
    );

    db.loadAll();
    entitlements.loadAll();
    smsEvents.load();
    smsEvents.clearAll();
    contentCatalog.load();

    userId = db.uid();
    db.users.set(userId, {
      id: userId,
      normalizedPhone: '+8613800138000',
      status: 'active',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    });
    const sid = db.sha256('sess-raw-1');
    db.sessions.set(sid, {
      id: sid,
      tokenHash: sid,
      userId,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      revoked: false,
    });
    db.scheduleSave();

    smsEvents.record({ phone: '+8613800138000', ok: true, provider: 'development' });
    smsEvents.record({
      phone: '+8613800138001',
      ok: false,
      provider: 'development',
      errorCode: 'MOCK_FAIL',
    });
    app = express();
    app.use(express.json());
    app.use('/api/admin', adminRouter);
  });

  after(() => {
    try {
      fs.rmSync(TMP, { recursive: true, force: true });
    } catch (_e) {
      /* ignore */
    }
    try {
      fs.rmSync(REPO_TMP, { recursive: true, force: true });
    } catch (_e) {
      /* ignore */
    }
  });

  it('rejects missing token', async () => {
    const res = await request(app, 'GET', '/api/admin/health');
    assert.equal(res.status, 401);
    assert.equal(res.body.code, 'ADMIN_UNAUTHORIZED');
  });

  it('rejects wrong token', async () => {
    const res = await request(app, 'GET', '/api/admin/health', { token: 'wrong' });
    assert.equal(res.status, 401);
  });

  it('returns health with token', async () => {
    const res = await request(app, 'GET', '/api/admin/health', { token: TOKEN });
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'ok');
    assert.equal(res.body.adminTokenConfigured, true);
    assert.ok(res.body.users >= 1);
  });

  it('returns stats shape', async () => {
    const res = await request(app, 'GET', '/api/admin/stats', { token: TOKEN });
    assert.equal(res.status, 200);
    assert.ok(res.body.users.total >= 1);
    assert.equal(typeof res.body.sms.sent24h, 'number');
    assert.equal(typeof res.body.sms.failed24h, 'number');
    assert.ok(Array.isArray(res.body.series.days));
  });

  it('lists users and masks by default', async () => {
    const res = await request(app, 'GET', '/api/admin/users', { token: TOKEN });
    assert.equal(res.status, 200);
    assert.ok(res.body.items.length >= 1);
    const u = res.body.items.find((x) => x.id === userId);
    assert.ok(u);
    assert.match(u.phone, /\*\*\*\*/);
  });

  it('bans user and revokes sessions', async () => {
    const res = await request(app, 'POST', '/api/admin/users/' + userId + '/ban', {
      token: TOKEN,
      body: { reason: 'test' },
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.user.status, 'banned');
    assert.ok(res.body.revokedSessions >= 1);
    const user = db.users.get(userId);
    assert.equal(user.status, 'banned');
  });

  it('unbans user', async () => {
    const res = await request(app, 'POST', '/api/admin/users/' + userId + '/unban', {
      token: TOKEN,
      body: {},
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.user.status, 'active');
  });

  it('grants and revokes vip', async () => {
    let res = await request(app, 'POST', '/api/admin/users/' + userId + '/vip', {
      token: TOKEN,
      body: {},
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.vip.vipActive, true);

    res = await request(app, 'POST', '/api/admin/users/' + userId + '/vip/revoke', {
      token: TOKEN,
      body: {},
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.vip.vipActive, false);
  });

  it('lists sms events', async () => {
    const res = await request(app, 'GET', '/api/admin/sms-events?limit=10', { token: TOKEN });
    assert.equal(res.status, 200);
    assert.ok(res.body.items.length >= 2);
    assert.ok(res.body.stats24h.total >= 2);
    assert.ok(res.body.total >= 2);
    assert.ok(res.body.totalPages >= 1);
  });

  it('paginates users / vips / content levels', async () => {
    const u = await request(app, 'GET', '/api/admin/users?page=1&limit=1', { token: TOKEN });
    assert.equal(u.status, 200);
    assert.equal(u.body.limit, 1);
    assert.ok(u.body.totalPages >= 1);
    assert.ok(Array.isArray(u.body.items));

    const v = await request(app, 'GET', '/api/admin/vips?page=1&limit=1', { token: TOKEN });
    assert.equal(v.status, 200);
    assert.equal(v.body.limit, 1);
    assert.ok('totalPages' in v.body);

    const levels = await request(
      app,
      'GET',
      '/api/admin/content/levels?page=1&limit=2',
      { token: TOKEN },
    );
    assert.equal(levels.status, 200);
    assert.equal(levels.body.limit, 2);
    assert.ok(levels.body.total >= 1);
    assert.ok(levels.body.totalPages >= 1);
    assert.ok(levels.body.items.length <= 2);
  });

  it('maskPhone helper', () => {
    assert.equal(adminRouter.maskPhone('+8613800138000'), '+86138****8000');
  });

  it('content overview seeds ocean levels', async () => {
    const res = await request(app, 'GET', '/api/admin/content/overview', { token: TOKEN });
    assert.equal(res.status, 200);
    assert.ok(res.body.counts.levels >= 12);
    assert.ok(Array.isArray(res.body.maps));
    assert.equal(res.body.oss.publicBaseUrl, 'https://cdn.example.test');
  });

  it('scan local videos and bind oss key relation', async () => {
    let res = await request(app, 'POST', '/api/admin/content/scan-local', {
      token: TOKEN,
      body: {},
    });
    assert.equal(res.status, 200);
    assert.ok(res.body.scanned >= 2);

    res = await request(app, 'GET', '/api/admin/content/levels?mapId=ocean&limit=50', {
      token: TOKEN,
    });
    assert.equal(res.status, 200);
    const l1 = res.body.items.find((x) => x.levelId === 1);
    assert.ok(l1);
    assert.ok(String(l1.ossKey).includes('level-01-mom'));
    assert.equal(l1.resolved.localExists, true);
    assert.match(l1.resolved.downloadUrl, /^https:\/\/cdn\.example\.test\//);

    res = await request(app, 'PUT', '/api/admin/content/levels/ocean/11', {
      token: TOKEN,
      body: { status: 'published', title: 'Pear' },
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.level.status, 'published');
  });

  it('publish asset-packs from catalog mapping', async () => {
    const res = await request(app, 'POST', '/api/admin/content/publish-asset-packs', {
      token: TOKEN,
      body: {},
    });
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.maps));

    const packs = JSON.parse(
      fs.readFileSync(path.join(REPO_TMP, 'asset-packs.json'), 'utf8'),
    );
    assert.ok(Array.isArray(packs.maps));
    const ocean = packs.maps.find((m) => m.mapId === 'ocean');
    assert.ok(ocean);
    const remote = (ocean.levels || []).find((x) => Number(x.levelId) === 11);
    assert.ok(remote);
    assert.match(String(remote.downloadUrl), /level-11-pear/);
  });

  it('register video by oss key', async () => {
    const res = await request(app, 'POST', '/api/admin/content/videos', {
      token: TOKEN,
      body: {
        ossKey: 'assets/video/paid-levels/level-12-grape.mp4',
        title: 'grape',
        mapId: 'ocean',
        levelId: 12,
      },
    });
    assert.ok(res.status === 200 || res.status === 201);
    assert.ok(res.body.video.id);
    assert.equal(res.body.video.ossKey, 'assets/video/paid-levels/level-12-grape.mp4');
  });
});