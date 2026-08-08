const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const read = (file) => fs.readFileSync(path.join(__dirname, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(__dirname, file));
const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const xcconfigValue = (source, key) =>
  source.match(new RegExp(`^\\s*${key}\\s*=\\s*(\\S+)`, 'm'))?.[1] || '';

test('iOS shell implements the H5 purchase and release-update bridges', () => {
  assert.ok(exists('ios/BabyEnglishIsland.xcodeproj/project.pbxproj'));
  assert.ok(exists('ios/BabyEnglishIsland.xcodeproj/xcshareddata/xcschemes/BabyEnglishIsland.xcscheme'));
  assert.ok(exists('ios/BabyEnglishIsland/AppDelegate.swift'));
  assert.ok(exists('ios/BabyEnglishIsland/ViewController.swift'));
  assert.ok(exists('ios/BabyEnglishIsland/Info.plist'));

  const appDelegate = read('ios/BabyEnglishIsland/AppDelegate.swift');
  const viewController = read('ios/BabyEnglishIsland/ViewController.swift');
  const project = read('ios/BabyEnglishIsland.xcodeproj/project.pbxproj');
  const scheme = read('ios/BabyEnglishIsland.xcodeproj/xcshareddata/xcschemes/BabyEnglishIsland.xcscheme');
  const shared = read('ios/Config/Shared.xcconfig');
  const marketingVersion = xcconfigValue(shared, 'MARKETING_VERSION');

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
  assert.match(viewController, /window\.BABY_ISLAND_DISABLE_LOCAL_MOCK/);
  assert.match(viewController, /shellConfigApiBase/);
  assert.match(viewController, /shellConfigAllowLocalMockLogin/);
  assert.match(viewController, /babyIslandApi\.setApiBase/);
  assert.doesNotMatch(viewController, /contentController\.add\(self, name:/);
  assert.match(viewController, /final class AssetPackDownloadManager/);
  assert.match(viewController, /URLSessionConfiguration\.background/);
  assert.match(viewController, /config\.allowsCellularAccess = true/);
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
  assert.match(scheme, /BlueprintIdentifier = "A10000000000000000000060"/);
  assert.match(scheme, /buildForArchiving = "YES"/);
  assert.match(project, /Assets\.xcassets/);
  assert.match(project, /PrivacyInfo\.xcprivacy/);
  assert.match(project, /shell-config\.json/);
  assert.match(project, /ASSETCATALOG_COMPILER_APPICON_NAME = AppIcon/);
  assert.match(project, new RegExp(`MARKETING_VERSION = ${escapeRegExp(marketingVersion)}`));
  assert.doesNotMatch(project, /rsync -a --delete "\$ROOT\/assets/);
});

test('iOS ship kit has icon, privacy, launch, team config, export options', () => {
  assert.ok(exists('ios/BabyEnglishIsland/Assets.xcassets/AppIcon.appiconset/AppIcon-1024.png'));
  assert.ok(exists('ios/BabyEnglishIsland/Assets.xcassets/LaunchLogo.imageset/LaunchLogo.png'));
  assert.ok(exists('ios/BabyEnglishIsland/Assets.xcassets/LaunchLogo.imageset/LaunchLogo@2x.png'));
  assert.ok(exists('ios/BabyEnglishIsland/Assets.xcassets/LaunchLogo.imageset/LaunchLogo@3x.png'));
  assert.ok(exists('ios/BabyEnglishIsland/PrivacyInfo.xcprivacy'));
  assert.ok(exists('ios/BabyEnglishIsland/shell-config.json'));
  assert.ok(exists('ios/Config/Team.xcconfig.example'));
  assert.ok(exists('ios/Config/Shared.xcconfig'));
  assert.ok(exists('ios/ExportOptions-TestFlight.plist'));
  assert.ok(exists('tools/assert-ios-archive-contract.mjs'));
  assert.ok(exists('tools/assert-testflight-bundle-media.mjs'));
  assert.ok(exists('tools/testflight-preflight.sh'));
  assert.ok(exists('tools/verify-testflight-handoff.sh'));
  assert.ok(exists('tools/scan-no-apple-secrets.sh'));
  assert.ok(exists('tools/probe-asset-pack-urls.mjs'));
  assert.ok(exists('tools/enable-testflight-workflow.sh'));
  assert.ok(exists('.github/workflows/testflight-preflight.yml'));
  assert.ok(exists('.github/ISSUE_TEMPLATE/testflight-handoff.yml'));
  assert.ok(exists('docs/testflight-github-actions-template.yml'));
  assert.ok(exists('docs/testflight-checklist.md'));
  assert.ok(exists('docs/testflight-secrets.md'));
  assert.ok(exists('docs/iap-product-ids.md'));
  assert.ok(exists('docs/testflight-smoke.md'));
  assert.ok(exists('assets/video/math-story/math-story-video-manifest.json'));
  assert.ok(exists('assets/audio/math-story-theme/math-story-theme-manifest.json'));

  const info = read('ios/BabyEnglishIsland/Info.plist');
  const launchLogoContents = read('ios/BabyEnglishIsland/Assets.xcassets/LaunchLogo.imageset/Contents.json');
  assert.match(info, /嗨洛塔/);
  assert.match(info, /UILaunchScreen/);
  assert.match(info, /ITSAppUsesNonExemptEncryption/);
  assert.match(launchLogoContents, /LaunchLogo@2x\.png/);
  assert.match(launchLogoContents, /LaunchLogo@3x\.png/);
  assert.doesNotMatch(launchLogoContents, /[A-Za-z][A-Za-z0-9._%+-]*@[A-Za-z][A-Za-z0-9.-]*\.[A-Za-z]{2,}/);

  const gitignore = read('.gitignore');
  assert.match(gitignore, /ios\/Config\/Team\.xcconfig/);
  assert.match(gitignore, /\.secrets\//);
  assert.match(gitignore, /\*\.p8/);
  assert.match(gitignore, /\*\.p12/);
  assert.match(gitignore, /\*\.mobileprovision/);

  const ship = read('tools/ship-testflight.sh');
  const exportOptions = read('ios/ExportOptions-TestFlight.plist');
  const viewController = read('ios/BabyEnglishIsland/ViewController.swift');
  assert.match(ship, /EXPORT_OPTS_TEMPLATE/);
  assert.match(ship, /EXPORT_OPTS_WORK/);
  assert.match(ship, /ASC_KEY_ID/);
  assert.match(ship, /ASC_ISSUER_ID/);
  assert.match(ship, /authenticationKeyPath/);
  assert.match(ship, /cleanup_asc_key_tmp/);
  assert.match(ship, /ASC_KEY_TMP_CREATED=1/);
  assert.match(ship, /--static-check/);
  assert.match(ship, /assert-ios-archive-contract\.mjs/);
  assert.match(ship, /scan-no-apple-secrets\.sh/);
  assert.match(ship, /run_handoff_preflight/);
  assert.match(ship, /npm run testflight:preflight/);
  assert.match(ship, /do_archive\(\)[\s\S]*?need_xcode[\s\S]*?run_handoff_preflight/);
  assert.match(ship, /provisioning_updates_enabled/);
  assert.match(ship, /BUILD_NUMBER/);
  assert.match(ship, /current_build_number/);
  assert.match(ship, /next_build_number/);
  assert.match(ship, /resolve_build_number/);
  assert.match(ship, /\^\[1-9\]\[0-9\]\*/);
  assert.match(ship, /Next retry/);
  assert.doesNotMatch(ship, /\n\s*sudo xcode-select/);
  assert.doesNotMatch(ship, /plutil -replace teamID -string "\$tid" "\$EXPORT_OPTS"/);
  assert.match(exportOptions, /<key>teamID<\/key>\s*<string>YOUR_TEAM_ID<\/string>/);
  assert.match(exportOptions, /<key>signingStyle<\/key>\s*<string>automatic<\/string>/);

  const preflight = read('tools/testflight-preflight.sh');
  const archiveContract = read('tools/assert-ios-archive-contract.mjs');
  const githubWorkflow = read('docs/testflight-github-actions-template.yml');
  const enabledGithubWorkflow = read('.github/workflows/testflight-preflight.yml');
  const testflightIssue = read('.github/ISSUE_TEMPLATE/testflight-handoff.yml');
  const readme = read('README.md');
  const devHandoff = read('docs/dev-handoff-testflight.md');
  const fullHandoff = read('docs/handoff-testflight-full-2026-08-07.md');
  const shared = read('ios/Config/Shared.xcconfig');
  const marketingVersion = xcconfigValue(shared, 'MARKETING_VERSION');
  const buildNumber = xcconfigValue(shared, 'CURRENT_PROJECT_VERSION');
  const versionBuild = `${marketingVersion} (${buildNumber})`;
  const versionBuildRe = new RegExp(escapeRegExp(versionBuild));
  const pkg = JSON.parse(read('package.json'));
  assert.match(preflight, /for bin in node npm rsync python3/);
  assert.match(preflight, /need_node_modules "backend" "npm ci --prefix backend"/);
  assert.match(preflight, /need_node_modules "apps\/backend" "npm ci --prefix apps\/backend"/);
  assert.match(preflight, /need_node_modules "apps\/frontend" "npm ci --prefix apps\/frontend"/);
  assert.match(preflight, /bash tools\/scan-no-apple-secrets\.sh/);
  assert.match(preflight, /node tools\/assert-ios-archive-contract\.mjs/);
  assert.match(preflight, /npm test/);
  assert.match(preflight, /node tools\/audit-readiness\.mjs/);
  assert.match(preflight, /git ls-files 'assets\/video\/math-story\/\*\.mp4'/);
  assert.match(preflight, /git-tracked assets ocean=\$git_ocean_count desert=\$git_desert_count math=\$git_math_story_count/);
  assert.match(preflight, /check_git_count math-theme-audio "\$git_math_theme_audio_count" 31/);
  assert.match(preflight, /email-like asset filename/);
  assert.match(preflight, /missing asset filename/);
  assert.match(preflight, /bash tools\/pack-app-www\.sh/);
  assert.match(preflight, /media_gate_args=\("\$OUT"\)/);
  assert.match(preflight, /TESTFLIGHT_BUNDLE_MEDIA_REPORT/);
  assert.match(preflight, /node tools\/assert-testflight-bundle-media\.mjs "\$\{media_gate_args\[@\]\}"/);
  assert.match(preflight, /probe:asset-packs -- --dry-run --sample 12/);
  assert.match(preflight, /ocean_count/);
  assert.match(preflight, /desert_count/);
  assert.match(preflight, /math_story_count/);
  assert.match(preflight, /math_theme_audio_count/);
  assert.match(preflight, /mathThemeAudio=\$math_theme_audio_count/);
  assert.match(preflight, /seeds ocean=\$ocean_count desert=\$desert_count math=\$math_story_count/);
  assert.match(preflight, /BEGIN TESTFLIGHT_HANDOFF_CARD/);
  assert.match(preflight, /verified_commit=\$sha/);
  assert.match(preflight, /bundle_id=com\.baobaoenglish\.island/);
  assert.match(preflight, /preflight=OK/);
  const bundleMediaGate = read('tools/assert-testflight-bundle-media.mjs');
  assert.match(bundleMediaGate, /git-lfs\.github\.com\/spec\/v1/);
  assert.match(bundleMediaGate, /assets\/video\/free-levels/);
  assert.match(bundleMediaGate, /assets\/video\/desert-levels/);
  assert.match(bundleMediaGate, /assets\/video\/math-story/);
  assert.match(bundleMediaGate, /assets\/audio\/math-story-theme/);
  assert.match(bundleMediaGate, /raw\.subarray\(4, 8\)\.equals\(MP4_FTYP\)/);
  assert.match(bundleMediaGate, /--json report\.json/);
  assert.match(bundleMediaGate, /writeFileSync\(jsonPath/);
  assert.match(bundleMediaGate, /lfsPointersClean/);
  assert.match(bundleMediaGate, /280 \* 1024 \* 1024/);
  assert.match(bundleMediaGate, /520 \* 1024 \* 1024/);
  const secretScan = read('tools/scan-no-apple-secrets.sh');
  assert.match(secretScan, /forbidden tracked signing\/secret path/);
  assert.match(secretScan, /ios\/Config\/Team\.xcconfig/);
  assert.match(secretScan, /\*\.mobileprovision/);
  assert.match(secretScan, /PRIVATE KEY/);
  assert.match(secretScan, /real-looking DEVELOPMENT_TEAM/);
  assert.match(archiveContract, /app-release\.json/);
  assert.match(archiveContract, /app-store-connect/);
  assert.match(archiveContract, /PRODUCT_BUNDLE_IDENTIFIER/);
  assert.match(archiveContract, /CODE_SIGN_STYLE/);
  assert.match(archiveContract, /buildForArchiving = "YES"/);
  assert.match(archiveContract, /teamID must stay YOUR_TEAM_ID placeholder/);
  assert.match(archiveContract, /manageAppVersionAndBuildNumber must be false/);
  assert.match(archiveContract, /\.github\/ISSUE_TEMPLATE\/testflight-handoff\.yml/);
  assert.match(archiveContract, /versionBuild/);
  assert.match(archiveContract, /handoff issue version drift/);
  assert.match(archiveContract, /handoff doc version drift/);
  assert.match(preflight, /plistlib\.load/);
  assert.match(preflight, /struct\.unpack\('>IIBB'/);
  assert.match(preflight, /plist\+icon gate OK/);
  assert.match(preflight, /size=\{width\}x\{height\} want=1024x1024/);
  assert.match(preflight, /AppIcon-1024\.png must not contain alpha/);
  const verifyHandoff = read('tools/verify-testflight-handoff.sh');
  assert.match(pkg.scripts['testflight:verify-handoff'], /tools\/verify-testflight-handoff\.sh/);
  assert.match(verifyHandoff, /git clone --no-local "\$SOURCE" "\$DEST"/);
  assert.match(verifyHandoff, /npm ci --prefix apps\/frontend/);
  assert.match(verifyHandoff, /npm run testflight:preflight/);
  assert.match(readme, /testflight:verify-handoff/);
  assert.match(readme, /ship-testflight\.sh --static-check/);
  assert.match(devHandoff, /testflight:verify-handoff/);
  assert.match(devHandoff, /assert-ios-archive-contract\.mjs/);
  assert.match(devHandoff, /assert-testflight-bundle-media\.mjs/);
  assert.match(fullHandoff, /testflight:verify-handoff/);
  assert.match(githubWorkflow, /name: TestFlight Preflight/);
  assert.match(githubWorkflow, /npm run testflight:preflight/);
  assert.match(githubWorkflow, /Emit handoff summary/);
  assert.match(githubWorkflow, /GITHUB_STEP_SUMMARY/);
  assert.match(githubWorkflow, /testflight-readiness-\$\{\{ github\.sha \}\}/);
  assert.match(githubWorkflow, /probe:asset-packs/);
  assert.match(githubWorkflow, /contents: read/);
  assert.equal(enabledGithubWorkflow, githubWorkflow);
  assert.match(testflightIssue, /TestFlight upload handoff/);
  assert.match(testflightIssue, /docs\/dev-handoff-testflight\.md/);
  assert.match(testflightIssue, /docs\/testflight-smoke\.md/);
  assert.match(testflightIssue, /TESTFLIGHT_HANDOFF_CARD/);
  assert.match(testflightIssue, /com\.baobaoenglish\.island/);
  assert.match(testflightIssue, versionBuildRe);
  assert.match(testflightIssue, /Do not paste Apple account emails, Team IDs, certificates/);
  assert.match(readme, /npm ci --prefix backend/);
  assert.match(readme, /\.github\/workflows\/testflight-preflight\.yml` 已启用/);
  assert.match(readme, /TestFlight upload handoff/);
  assert.match(readme, /TESTFLIGHT_HANDOFF_CARD/);
  assert.match(devHandoff, /npm ci --prefix apps\/backend/);
  assert.match(devHandoff, /TestFlight upload handoff/);
  assert.match(devHandoff, /testflight-readiness-<sha>/);
  for (const handoffFile of [
    '.github/ISSUE_TEMPLATE/testflight-handoff.yml',
    'docs/dev-handoff-testflight.md',
    'docs/handoff-testflight-full-2026-08-07.md',
    'docs/testflight-asc-form.md',
    'docs/testflight-checklist.md',
    'docs/testflight-smoke.md',
  ]) {
    assert.match(read(handoffFile), versionBuildRe);
  }
  assert.match(fullHandoff, /npm ci --prefix apps\/frontend/);
  assert.match(fullHandoff, /TESTFLIGHT_HANDOFF_CARD/);
  assert.match(fullHandoff, /assert-ios-archive-contract\.mjs/);
  assert.match(fullHandoff, /assert-testflight-bundle-media\.mjs/);
  assert.match(fullHandoff, /git-tracked assets ocean=10 desert=10 math=31 mathThemeAudio=31/);
  assert.match(read('docs/testflight-checklist.md'), /assert-ios-archive-contract\.mjs/);
  assert.match(read('docs/testflight-checklist.md'), /assert-testflight-bundle-media\.mjs/);
  assert.doesNotMatch(githubWorkflow, /lfs: true/);
  assert.doesNotMatch(githubWorkflow, /ASC_KEY|DEVELOPMENT_TEAM|APP_STORE_CONNECT|p8/);
  assert.doesNotMatch(enabledGithubWorkflow, /ASC_KEY|DEVELOPMENT_TEAM|APP_STORE_CONNECT|p8/);
  assert.doesNotMatch(testflightIssue, /ASC_KEY|APP_STORE_CONNECT|BEGIN PRIVATE|AuthKey_|\.mobileprovision|\.p12/);

  const enableWorkflow = read('tools/enable-testflight-workflow.sh');
  assert.match(enableWorkflow, /testflight-github-actions-template\.yml/);
  assert.match(enableWorkflow, /\.github\/workflows\/testflight-preflight\.yml/);
  assert.match(enableWorkflow, /workflow scope/);

  const swiftVipProductId = viewController.match(/private let vipProductId = "([^"]+)"/)?.[1];
  const shellConfig = JSON.parse(read('ios/BabyEnglishIsland/shell-config.json'));
  assert.equal(shellConfig.apiBase, '');
  assert.equal(shellConfig.allowLocalMockLogin, true);
  assert.equal(shellConfig.iapProductIds.mapVip, 'baby_island_map_vip_001');
  assert.equal(swiftVipProductId, shellConfig.iapProductIds.mapVip);
  assert.match(shellConfig.bundleNote, /Content TestFlight may leave apiBase empty/);
  assert.match(shellConfig.bundleNote, /explicit local mock login/);

  const apiClient = read('auth/apiClient.js');
  assert.match(apiClient, /BABY_ISLAND_API_BASE/);
  assert.match(apiClient, /BABY_ISLAND_DISABLE_LOCAL_MOCK/);
  assert.match(apiClient, /isLocalMockEnabled/);
  assert.match(apiClient, /setApiBase\(window\.BABY_ISLAND_API_BASE\)/);

  const release = JSON.parse(read('app-release.json'));
  assert.equal(release.latestVersion, marketingVersion);
  assert.match(release.updateUrl, /term=%E5%97%A8%E6%B4%9B%E5%A1%94/);

  const mathStoryManifest = JSON.parse(read('assets/video/math-story/math-story-video-manifest.json'));
  assert.equal(mathStoryManifest.entries.length, 31);
  assert.equal(mathStoryManifest.version, '20260807-table-tricks-qualified-31');
  assert.ok(Array.isArray(mathStoryManifest.source_hints));
  assert.equal(mathStoryManifest.sources, undefined);
  assert.doesNotMatch(JSON.stringify(mathStoryManifest), /\/Users\/yr/);
  for (const entry of mathStoryManifest.entries) {
    assert.ok(exists(entry.dest), `missing ${entry.dest}`);
    assert.ok(fs.statSync(path.join(__dirname, entry.dest)).size > 0, `empty ${entry.dest}`);
    assert.match(entry.sha256, /^[a-f0-9]{64}$/);
  }
  const mathThemeManifest = JSON.parse(read('assets/audio/math-story-theme/math-story-theme-manifest.json'));
  assert.equal(mathThemeManifest.entries.length, 31);
  for (const entry of mathThemeManifest.entries) {
    assert.ok(exists(entry.file), `missing ${entry.file}`);
    assert.ok(fs.statSync(path.join(__dirname, entry.file)).size > 0, `empty ${entry.file}`);
  }
});

test('native pack script keeps only seed videos and runtime map assets', () => {
  const packScript = read('tools/pack-app-www.sh');

  assert.match(packScript, /asset-packs\.json/);
  assert.match(packScript, /assets\/video\/free-levels\/level-0\[1-9\]-\*\.mp4/);
  assert.match(packScript, /assets\/video\/free-levels\/level-10-\*\.mp4/);
  assert.match(packScript, /assets\/video\/desert-levels\/level-00\[1-9\]-\*\.mp4/);
  assert.match(packScript, /assets\/video\/desert-levels\/level-010-\*\.mp4/);
  assert.match(packScript, /assets\/video\/math-story\/\*\.mp4/);
  assert.match(packScript, /math-story mp4 count=\$math_story_count want=31/);
  assert.match(packScript, /math-story theme mp3 count=\$math_theme_audio_count want=31/);
  assert.match(packScript, /non-seed course video found in bundle/);
  assert.match(packScript, /raw-v2/);
  assert.match(packScript, /candidates/);
  assert.match(packScript, /front-ocean-v1-video/);
  assert.match(packScript, /ocean L01-10\+desert L001-010\+math-story x31\+theme-audio x31 in/);
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
  assert.match(audit, /shellLocalMockLoginAllowed/);
  assert.match(audit, /allowLocalMockLogin/);
  assert.match(audit, /!shellLocalMockLoginAllowed\(\)/);
  assert.match(audit, /allowLocalMockLogin=true/);
  assert.match(audit, /testflightContentReady/);
  assert.match(audit, /contentTestflightGaps/);
  assert.match(audit, /uploadBlockers/);
  assert.match(audit, /fullFunctionGaps/);
  assert.match(audit, /全功能登录:[\s\S]*?apiBase 为空/);
  assert.match(audit, /TEMP_LOCAL_FULL_ACCESS/);
  assert.match(audit, /assetPackPlaceholders/);
  assert.match(audit, /scriptReleaseVersion/);
  assert.match(audit, /sharedMarketingVersion/);
  assert.match(audit, /projectBuildNumbers/);
  assert.match(audit, /mathStoryVideoCoverage/);
  assert.match(audit, /mathStoryVideos/);
  assert.match(audit, /mathStoryThemeAudio/);
  assert.match(audit, /MATH_STORY_WAYPOINTS/);
  assert.match(audit, /MATH_STORY_VIDEO_VERSION/);
  assert.match(audit, /sourcePathLeaks/);
  assert.match(audit, /sha256File/);
  assert.match(audit, /数学 story 短片契约不一致/);
  assert.match(audit, /math-story mp4 count/);
  assert.match(audit, /数学 story 主题音未就绪/);
  assert.match(audit, /数学 story 主题音契约不一致/);
});

test('ASC handoff keeps hosted legal drafts out of production URLs', () => {
  for (const file of [
    'docs/hosted-legal-pages/privacy.html',
    'docs/hosted-legal-pages/terms.html',
    'docs/hosted-legal-pages/children-privacy.html',
  ]) {
    const page = read(file);
    assert.match(page, /状态:仓内草稿/);
    assert.match(page, /禁止.*ASC.*外测.*公网正式 URL/);
    assert.doesNotMatch(page, /状态:可直接用草稿/);
  }

  const ascForm = read('docs/testflight-asc-form.md');
  assert.match(ascForm, /Internal TestFlight 可先留空/);
  assert.match(ascForm, /External TestFlight \/ App Review/);
  assert.match(ascForm, /页面源码中 `【待填` 计数为 0/);
  assert.match(ascForm, /file:\/\/\.\.\./);
  assert.match(ascForm, /GitHub raw/);

  const handoff = read('docs/handoff-testflight-full-2026-08-07.md');
  assert.match(handoff, /替换并确认前不得作为 ASC\/外测 URL/);
  assert.match(handoff, /Internal TestFlight 可先留空/);
  assert.match(handoff, /`【待填` 计数为 0/);
  assert.doesNotMatch(handoff, /APP上架准备/);
});

test('asset pack URL probe is opt-in and dry-run by default', () => {
  const pkg = JSON.parse(read('package.json'));
  assert.equal(pkg.scripts['probe:asset-packs'], 'node tools/probe-asset-pack-urls.mjs');
  assert.doesNotMatch(pkg.scripts.test, /probe:asset-packs/);
  assert.doesNotMatch(pkg.scripts['testflight:preflight'], /probe:asset-packs/);

  const probe = read('tools/probe-asset-pack-urls.mjs');
  assert.match(probe, /Default is dry-run/);
  assert.match(probe, /!options\.live/);
  assert.match(probe, /downloadUrl/);
  assert.match(probe, /Range: 'bytes=0-0'/);
  assert.match(probe, /HEAD->GET-range/);
});
