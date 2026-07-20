#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const filePath = path.join(__dirname, 'apiClient.js');
const source = fs.readFileSync(filePath, 'utf8');

const sandbox = {};
sandbox.window = sandbox;
sandbox.document = { cookie: '' };
sandbox.sessionStorage = {
  _s: {},
  getItem(k) { return this._s[k] || null; },
  setItem(k, v) { this._s[k] = String(v); },
  removeItem(k) { delete this._s[k]; },
};
sandbox.localStorage = sandbox.sessionStorage;
sandbox.console = console;
sandbox.fetch = () => Promise.reject(new TypeError('fetch failed (test)'));
sandbox.location = { protocol: 'http:' };

vm.createContext(sandbox);
vm.runInContext(source, sandbox);

(async () => {
  try {
    const r = await sandbox.babyIslandApi.verifyCode('123', '1234');
    console.log('SUCCESS', r);
  } catch (e) {
    console.log('ERROR message:', e.message);
    console.log('ERROR code:', e.code);
    console.log('ERROR status:', e.status);
  }
})();
