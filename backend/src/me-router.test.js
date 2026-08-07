'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const express = require('express');
const fs = require('fs');
const os = require('os');
const path = require('path');

const entitlements = require('./entitlements');
const { createMeRouter, createRankingsRouter } = require('./me-router');

function createServer() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'me-ent-'));
  entitlements.setDataDir(tmp);
  entitlements.loadAll();

  const app = express();
  app.use(express.json());
  app.use(
    '/api/me',
    createMeRouter({
      requireAuth: (req, res, next) => {
        if (req.headers.authorization !== 'Bearer good') {
          return res.status(401).json({ error: '未登录', code: 'UNAUTHORIZED' });
        }
        req.user = { id: 'user-1' };
        next();
      },
    }),
  );
  app.use('/api/rankings', createRankingsRouter());

  return new Promise((resolve, reject) => {
    const server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      resolve({
        server,
        baseUrl: `http://127.0.0.1:${server.address().port}`,
        tmp,
      });
    });
    server.on('error', reject);
  });
}

async function request(baseUrl, method, pathName, body, token = 'good') {
  const res = await fetch(`${baseUrl}${pathName}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json();
  return { status: res.status, data };
}

test('me entitlements vip claim + rankings', async () => {
  const { server, baseUrl } = await createServer();
  try {
    let r = await request(baseUrl, 'GET', '/api/me/entitlements');
    assert.equal(r.status, 200);
    assert.equal(r.data.hasFullAccess, false);

    r = await request(baseUrl, 'POST', '/api/me/entitlements/vip', {
      productId: 'vip_map_unlock',
      platform: 'ios',
      receipt: 'tx-demo-1',
    });
    assert.equal(r.status, 200);
    assert.equal(r.data.hasFullAccess, true);
    assert.equal(r.data.vip.vipActive, true);

    r = await request(baseUrl, 'GET', '/api/me/entitlements');
    assert.equal(r.data.hasFullAccess, true);

    r = await request(baseUrl, 'POST', '/api/me/ranking', {
      starsAll: 12,
      stars7d: 5,
      childName: '豆豆',
    });
    assert.equal(r.status, 200);

    r = await request(baseUrl, 'GET', '/api/rankings?windowDays=7', undefined, 'none');
    assert.equal(r.status, 200);
    assert.ok(Array.isArray(r.data.items));
    assert.ok(r.data.items.length >= 1);
    assert.equal(r.data.items[0].score, 5);
  } finally {
    server.close();
  }
});
