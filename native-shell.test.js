const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const read = (file) => fs.readFileSync(path.join(__dirname, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(__dirname, file));

test('iOS shell implements the H5 purchase and release-update bridges', () => {
  assert.ok(exists('ios/BabyEnglishIsland.xcodeproj/project.pbxproj'));
  assert.ok(exists('ios/BabyEnglishIsland/AppDelegate.swift'));
  assert.ok(exists('ios/BabyEnglishIsland/ViewController.swift'));
  assert.ok(exists('ios/BabyEnglishIsland/Info.plist'));

  const appDelegate = read('ios/BabyEnglishIsland/AppDelegate.swift');
  const viewController = read('ios/BabyEnglishIsland/ViewController.swift');
  const project = read('ios/BabyEnglishIsland.xcodeproj/project.pbxproj');

  assert.match(appDelegate, /@main/);
  assert.match(appDelegate, /IslandViewController\(\)/);
  assert.match(viewController, /import StoreKit/);
  assert.match(viewController, /WKWebView/);
  assert.match(viewController, /final class WeakScriptMessageHandler/);
  assert.match(viewController, /weak var target: WKScriptMessageHandler\?/);
  assert.match(viewController, /contentController\.add\(WeakScriptMessageHandler\(self\), name: "babyIslandIAP"\)/);
  assert.match(viewController, /contentController\.add\(WeakScriptMessageHandler\(self\), name: "babyIslandAppUpdate"\)/);
  assert.doesNotMatch(viewController, /contentController\.add\(self, name:/);
  assert.match(viewController, /SKPaymentQueue\.default\(\)\.add\(self\)/);
  assert.match(viewController, /productId == vipProductId/);
  assert.match(viewController, /payload\["action"\] as\? String == "restore"/);
  assert.match(viewController, /SKPaymentQueue\.default\(\)\.restoreCompletedTransactions\(\)/);
  assert.match(viewController, /baby_island_map_vip_001/);
  assert.match(viewController, /UIApplication\.shared\.open\(url\)/);
  assert.match(viewController, /window\.BabyIslandIAPComplete/);
  assert.match(viewController, /window\.babyIslandIAPComplete/);
  assert.match(project, /Copy H5 app/);
  assert.match(project, /index\.html/);
  assert.match(project, /app-release\.json/);
  assert.match(project, /rsync -a --delete/);
  assert.match(project, /ROOT\/assets/);
});

test('release audit tracks whether the iOS shell can be build-verified', () => {
  const audit = read('tools/audit-readiness.mjs');

  assert.match(audit, /execFileSync\('xcodebuild', \['-version'\]/);
  assert.match(audit, /nativeBuildToolReady/);
  assert.match(audit, /无法编译验证 iOS 原生包/);
});
