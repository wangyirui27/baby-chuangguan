#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const EXPECTED_BUNDLE_ID = 'com.baobaoenglish.island';
const EXPECTED_DISPLAY_NAME = '嗨洛塔';

const read = (file) => readFileSync(join(ROOT, file), 'utf8');
const fail = (message) => {
  console.error(`[assert-ios-archive-contract] FAIL: ${message}`);
  process.exitCode = 31;
};

function requireFile(file) {
  if (!existsSync(join(ROOT, file))) fail(`missing ${file}`);
}

function xcconfigValue(source, key) {
  return source.match(new RegExp(`^\\s*${key}\\s*=\\s*(\\S+)`, 'm'))?.[1] || '';
}

function pbxValues(source, key) {
  const values = [...source.matchAll(new RegExp(`${key}\\s*=\\s*([^;]+);`, 'g'))]
    .map((m) => m[1].trim());
  return [...new Set(values)];
}

function plistString(source, key) {
  return source.match(new RegExp(`<key>${key}</key>\\s*<string>([^<]*)</string>`))?.[1] || '';
}

function plistBool(source, key) {
  return source.match(new RegExp(`<key>${key}</key>\\s*<(true|false)\\s*/>`))?.[1] || '';
}

function assertAll(label, values, expected) {
  if (!values.length) {
    fail(`${label} missing`);
    return;
  }
  for (const value of values) {
    if (value !== expected) fail(`${label}=${value} want ${expected}`);
  }
}

for (const file of [
  'app-release.json',
  'ios/BabyEnglishIsland.xcodeproj/project.pbxproj',
  'ios/BabyEnglishIsland.xcodeproj/xcshareddata/xcschemes/BabyEnglishIsland.xcscheme',
  'ios/Config/Shared.xcconfig',
  'ios/BabyEnglishIsland/Info.plist',
  'ios/BabyEnglishIsland/PrivacyInfo.xcprivacy',
  'ios/ExportOptions-TestFlight.plist',
  'tools/pack-app-www.sh',
]) {
  requireFile(file);
}

const appRelease = JSON.parse(read('app-release.json'));
const shared = read('ios/Config/Shared.xcconfig');
const pbx = read('ios/BabyEnglishIsland.xcodeproj/project.pbxproj');
const scheme = read('ios/BabyEnglishIsland.xcodeproj/xcshareddata/xcschemes/BabyEnglishIsland.xcscheme');
const info = read('ios/BabyEnglishIsland/Info.plist');
const exportOptions = read('ios/ExportOptions-TestFlight.plist');

const sharedMarketingVersion = xcconfigValue(shared, 'MARKETING_VERSION');
const sharedBuild = xcconfigValue(shared, 'CURRENT_PROJECT_VERSION');
const sharedBundle = xcconfigValue(shared, 'PRODUCT_BUNDLE_IDENTIFIER');

if (sharedMarketingVersion !== appRelease.latestVersion) {
  fail(`Shared MARKETING_VERSION=${sharedMarketingVersion} want app-release latestVersion ${appRelease.latestVersion}`);
}
if (!/^[1-9][0-9]*$/.test(sharedBuild)) fail(`Shared CURRENT_PROJECT_VERSION must be a positive integer: ${sharedBuild}`);
if (sharedBundle !== EXPECTED_BUNDLE_ID) fail(`Shared PRODUCT_BUNDLE_IDENTIFIER=${sharedBundle} want ${EXPECTED_BUNDLE_ID}`);

assertAll('pbx MARKETING_VERSION', pbxValues(pbx, 'MARKETING_VERSION'), sharedMarketingVersion);
assertAll('pbx CURRENT_PROJECT_VERSION', pbxValues(pbx, 'CURRENT_PROJECT_VERSION'), sharedBuild);
assertAll('pbx PRODUCT_BUNDLE_IDENTIFIER', pbxValues(pbx, 'PRODUCT_BUNDLE_IDENTIFIER'), sharedBundle);
assertAll('pbx CODE_SIGN_STYLE', pbxValues(pbx, 'CODE_SIGN_STYLE'), 'Automatic');

if (!pbx.includes('Copy H5 app') || !pbx.includes('tools/pack-app-www.sh')) {
  fail('Xcode Build Phase must copy packed www via tools/pack-app-www.sh');
}

for (const match of pbx.matchAll(/CODE_SIGN_ENTITLEMENTS\s*=\s*([^;]+);/g)) {
  const rel = match[1].trim().replace(/^"|"$/g, '');
  if (rel && !existsSync(join(ROOT, 'ios', rel)) && !existsSync(join(ROOT, rel))) {
    fail(`CODE_SIGN_ENTITLEMENTS points to missing file: ${rel}`);
  }
}

if (!scheme.includes('buildForArchiving = "YES"')) fail('shared scheme is not enabled for archiving');
if (!scheme.includes('BlueprintIdentifier = "A10000000000000000000060"')) fail('shared scheme target identifier drifted');

if (plistString(info, 'CFBundleDisplayName') !== EXPECTED_DISPLAY_NAME) fail('Info CFBundleDisplayName drifted');
if (plistString(info, 'CFBundleName') !== EXPECTED_DISPLAY_NAME) fail('Info CFBundleName drifted');
if (plistString(info, 'CFBundleIdentifier') !== '$(PRODUCT_BUNDLE_IDENTIFIER)') fail('Info CFBundleIdentifier must use PRODUCT_BUNDLE_IDENTIFIER');
if (plistString(info, 'CFBundleShortVersionString') !== '$(MARKETING_VERSION)') fail('Info CFBundleShortVersionString must use MARKETING_VERSION');
if (plistString(info, 'CFBundleVersion') !== '$(CURRENT_PROJECT_VERSION)') fail('Info CFBundleVersion must use CURRENT_PROJECT_VERSION');
if (plistBool(info, 'ITSAppUsesNonExemptEncryption') !== 'false') fail('Info ITSAppUsesNonExemptEncryption must be false');

if (plistString(exportOptions, 'method') !== 'app-store-connect') fail('ExportOptions method must be app-store-connect');
if (plistString(exportOptions, 'destination') !== 'upload') fail('ExportOptions destination must be upload');
if (plistString(exportOptions, 'signingStyle') !== 'automatic') fail('ExportOptions signingStyle must be automatic');
if (plistString(exportOptions, 'teamID') !== 'YOUR_TEAM_ID') fail('ExportOptions teamID must stay YOUR_TEAM_ID placeholder');
if (plistBool(exportOptions, 'manageAppVersionAndBuildNumber') !== 'false') {
  fail('ExportOptions manageAppVersionAndBuildNumber must be false');
}
if (plistBool(exportOptions, 'uploadSymbols') !== 'true') fail('ExportOptions uploadSymbols must be true');

if (process.exitCode) process.exit();

console.log(`[assert-ios-archive-contract] OK bundle=${sharedBundle} version=${sharedMarketingVersion} build=${sharedBuild}`);
