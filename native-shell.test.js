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
  assert.match(viewController, /contentController\.add\(WeakScriptMessageHandler\(self\), name: "babyIslandAssetPack"\)/);
  assert.match(viewController, /contentController\.addUserScript\(Self\.appMetadataScript\(\)\)/);
  assert.match(viewController, /window\.BABY_ISLAND_APP_VERSION/);
  assert.match(viewController, /window\.BABY_ISLAND_API_BASE/);
  assert.match(viewController, /shellConfigApiBase/);
  assert.match(viewController, /babyIslandApi\.setApiBase/);
  assert.doesNotMatch(viewController, /contentController\.add\(self, name:/);
  assert.match(viewController, /final class AssetPackDownloadManager/);
  assert.match(viewController, /URLSessionConfiguration\.background/);
  assert.match(viewController, /cancel \{ \[weak self\] resumeData in/);
  assert.match(viewController, /downloadTask\(withResumeData:/);
  assert.match(viewController, /"babyIslandAssetPackEvent"/);
  assert.match(viewController, /"babyIslandLevelVideoEvent"/);
  assert.match(viewController, /window\.\\\(callback\)/);
  assert.match(viewController, /action\.contains\("level"\)/);
  assert.match(viewController, /private var levelQueues: \[String: \[LevelQueueItem\]\] = \[:\]/);
  assert.match(viewController, /parseLevelQueue\(from: payload, mapId: mapId\)/);
  assert.match(viewController, /startNextQueuedLevel\(mapId: mapId\)/);
  assert.match(viewController, /activeLevelDownloadKey\(mapId: mapId\)/);
  assert.match(viewController, /if record\.levelId != nil \{[\s\S]*?self\.startNextQueuedLevel\(mapId: record\.mapId\)/);
  assert.match(viewController, /sorted \{ \$0\.levelId < \$1\.levelId \}/);
  assert.match(viewController, /String\(format: "%03d", levelId\)/);
  assert.match(viewController, /SKPaymentQueue\.default\(\)\.add\(self\)/);
  assert.match(viewController, /productId == vipProductId/);
  assert.match(viewController, /payload\["action"\] as\? String == "restore"/);
  assert.match(viewController, /SKPaymentQueue\.default\(\)\.restoreCompletedTransactions\(\)/);
  assert.match(viewController, /baby_island_map_vip_001/);
  assert.match(viewController, /UIApplication\.shared\.open\(url\)/);
  assert.match(viewController, /window\.BabyIslandIAPComplete/);
  assert.match(viewController, /window\.babyIslandIAPComplete/);
  assert.match(project, /Copy H5 app/);
  assert.match(project, /tools\/pack-app-www\.sh/);
  assert.match(project, /Assets\.xcassets/);
  assert.match(project, /PrivacyInfo\.xcprivacy/);
  assert.match(project, /shell-config\.json/);
  assert.match(project, /ASSETCATALOG_COMPILER_APPICON_NAME = AppIcon/);
  assert.match(project, /MARKETING_VERSION = 1\.0\.1/);
  assert.doesNotMatch(project, /rsync -a --delete "\$ROOT\/assets/);
});

test('iOS ship kit has icon, privacy, launch, team config, export options', () => {
  assert.ok(exists('ios/BabyEnglishIsland/Assets.xcassets/AppIcon.appiconset/AppIcon-1024.png'));
  assert.ok(exists('ios/BabyEnglishIsland/Assets.xcassets/LaunchLogo.imageset/LaunchLogo.png'));
  assert.ok(exists('ios/BabyEnglishIsland/PrivacyInfo.xcprivacy'));
  assert.ok(exists('ios/BabyEnglishIsland/shell-config.json'));
  assert.ok(exists('ios/Config/Team.xcconfig'));
  assert.ok(exists('ios/Config/Team.xcconfig.example'));
  assert.ok(exists('ios/Config/Shared.xcconfig'));
  assert.ok(exists('ios/ExportOptions-TestFlight.plist'));
  assert.ok(exists('docs/testflight-checklist.md'));
  assert.ok(exists('docs/iap-product-ids.md'));
  assert.ok(exists('docs/testflight-smoke.md'));

  const info = read('ios/BabyEnglishIsland/Info.plist');
  assert.match(info, /嗨洛塔/);
  assert.match(info, /UILaunchScreen/);
  assert.match(info, /ITSAppUsesNonExemptEncryption/);

  const shellConfig = JSON.parse(read('ios/BabyEnglishIsland/shell-config.json'));
  assert.equal(typeof shellConfig.apiBase, 'string');
  assert.equal(shellConfig.iapProductIds.mapVip, 'baby_island_map_vip_001');

  const apiClient = read('auth/apiClient.js');
  assert.match(apiClient, /BABY_ISLAND_API_BASE/);
  assert.match(apiClient, /setApiBase\(window\.BABY_ISLAND_API_BASE\)/);

  const release = JSON.parse(read('app-release.json'));
  assert.equal(release.latestVersion, '1.0.1');
  assert.match(release.updateUrl, /term=%E5%97%A8%E6%B4%9B%E5%A1%94/);
});

test('native pack script keeps only seed videos and runtime map assets', () => {
  const packScript = read('tools/pack-app-www.sh');

  assert.match(packScript, /asset-packs\.json/);
  assert.match(packScript, /assets\/video\/free-levels\/level-0\[1-9\]-\*\.mp4/);
  assert.match(packScript, /assets\/video\/free-levels\/level-10-\*\.mp4/);
  assert.match(packScript, /assets\/video\/desert-levels\/level-00\[1-9\]-\*\.mp4/);
  assert.match(packScript, /assets\/video\/desert-levels\/level-010-\*\.mp4/);
  assert.match(packScript, /non-seed course video found in bundle/);
  assert.match(packScript, /raw-v2/);
  assert.match(packScript, /candidates/);
  assert.match(packScript, /front-ocean-v1-video/);
  assert.match(packScript, /ocean L01-10\+desert L001-010 in/);
  assert.match(packScript, /_dreamina\*/);
  assert.match(packScript, /runtime asset gate OK/);
});

test('release audit tracks whether the iOS shell can be build-verified', () => {
  const audit = read('tools/audit-readiness.mjs');

  assert.match(audit, /execFileSync\('xcodebuild',\s*\['-version'\]/);
  assert.match(audit, /nativeBuildToolReady/);
  assert.match(audit, /tools\/pack-app-www\.sh/);
  assert.match(audit, /babyIslandAssetPack/);
  assert.match(audit, /URLSessionConfiguration\.background/);
  assert.match(audit, /无法编译验证 iOS 原生包/);
  assert.match(audit, /"babyIslandAssetPackEvent"/);
  assert.match(audit, /missingQuestionAudioFirstTen/);
  assert.match(audit, /BABY_ISLAND_API_BASE/);
  assert.match(audit, /shell-config\.json/);
  assert.match(audit, /testflightContentReady/);
});
