#!/usr/bin/env node
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const { levels } = require('../script.js');
const wordManifest = require('../assets/audio/words/word-audio-manifest.json');

const expectedFirstTen = [
  '1:Mom/妈妈',
  '2:Dad/爸爸',
  '3:Grandma/奶奶',
  '4:Grandpa/爷爷',
  '5:Hand/手',
  '6:Rice/饭',
  '7:Water/水',
  '8:Car/车',
  '9:Dog/狗',
  '10:Book/书',
];
const forbiddenNonNounWords = new Set(['love', 'bath', 'good night']);

const entries = Array.isArray(wordManifest.entries)
  ? new Map(wordManifest.entries.map((entry) => [String(entry.word || '').toLowerCase(), entry]))
  : new Map(Object.entries(wordManifest.entries || {}));

function stripVersion(src) {
  return String(src || '').split(/[?#]/)[0];
}

function fileExists(relativePath) {
  return Boolean(relativePath) && existsSync(join(ROOT, relativePath));
}

function staleHundredMentions() {
  return [
    'packages/contracts/openapi/openapi.yaml',
    'packages/contracts/generation-manifest.json',
  ].filter((file) => /100 levels/i.test(readFileSync(join(ROOT, file), 'utf8')));
}

const firstTen = levels.slice(0, 10).map((level) => `${level.id}:${level.title}/${level.zhTitle}`);
const missingQuestionAudio = [];
const missingWordAudio = [];
const missingFirstTenVideos = [];
const nonNounTopicLevels = levels.filter((level) => /Colors|Numbers|Actions/.test(level.topic));
const nonNounWordLevels = levels.filter((level) => forbiddenNonNounWords.has(String(level.title || '').toLowerCase()));

for (const level of levels) {
  const slug = level.title.toLowerCase().replace(/\s+/g, '-');
  const questionAudio = `assets/audio/questions-holly/level-${String(level.id).padStart(2, '0')}-${slug}.mp3`;
  if (!fileExists(questionAudio)) missingQuestionAudio.push(`${level.id}:${level.title}`);

  const word = String(level.options[level.correct] || '').toLowerCase();
  const wordAudio = entries.get(word)?.url;
  if (!fileExists(wordAudio)) missingWordAudio.push(`${level.id}:${word}`);

  if (level.id <= 10 && !fileExists(stripVersion(level.videoSrc))) {
    missingFirstTenVideos.push(`${level.id}:${level.title}`);
  }
}

// TF / 内测硬门槛：前 10 关题语音；全量 187 缺项记 gap，不挡缩小范围 releaseReady 审计里的 hardFailures
const missingQuestionAudioFirstTen = missingQuestionAudio.filter((entry) => {
  const id = Number(String(entry).split(':')[0]);
  return Number.isFinite(id) && id >= 1 && id <= 10;
});
const missingQuestionAudioBeyondSeed = missingQuestionAudio.length - missingQuestionAudioFirstTen.length;

const appRelease = JSON.parse(readFileSync(join(ROOT, 'app-release.json'), 'utf8'));

function nativeShellReady() {
  const projectFile = 'ios/BabyEnglishIsland.xcodeproj/project.pbxproj';
  const appDelegateFile = 'ios/BabyEnglishIsland/AppDelegate.swift';
  const viewControllerFile = 'ios/BabyEnglishIsland/ViewController.swift';
  const infoFile = 'ios/BabyEnglishIsland/Info.plist';
  const packScriptFile = 'tools/pack-app-www.sh';
  const assetPackManifestFile = 'asset-packs.json';
  const appIconFile = 'ios/BabyEnglishIsland/Assets.xcassets/AppIcon.appiconset/AppIcon-1024.png';
  const privacyFile = 'ios/BabyEnglishIsland/PrivacyInfo.xcprivacy';
  const shellConfigFile = 'ios/BabyEnglishIsland/shell-config.json';
  if (![
    projectFile,
    appDelegateFile,
    viewControllerFile,
    infoFile,
    packScriptFile,
    assetPackManifestFile,
    appIconFile,
    privacyFile,
    shellConfigFile,
  ].every(fileExists)) return false;

  const project = readFileSync(join(ROOT, projectFile), 'utf8');
  const viewController = readFileSync(join(ROOT, viewControllerFile), 'utf8');
  const appDelegate = readFileSync(join(ROOT, appDelegateFile), 'utf8');
  const packScript = readFileSync(join(ROOT, packScriptFile), 'utf8');
  const infoPlist = readFileSync(join(ROOT, infoFile), 'utf8');
  const shellConfig = JSON.parse(readFileSync(join(ROOT, shellConfigFile), 'utf8'));

  const viewNeedles = [
    'WKWebView',
    'StoreKit',
    'SKPaymentQueue.default().add',
    'babyIslandIAP',
    'babyIslandAppUpdate',
    'BabyIslandIAPComplete',
    'UIApplication.shared.open',
    'baby_island_map_vip_001',
    'babyIslandAssetPack',
    'URLSessionConfiguration.background',
    'downloadTask(withResumeData:',
    // Event name is a string payload, not window.xxx property assignment
    '"babyIslandAssetPackEvent"',
    'BABY_ISLAND_API_BASE',
    'shellConfigApiBase',
  ];

  return viewNeedles.every((needle) => viewController.includes(needle))
    && appDelegate.includes('handleEventsForBackgroundURLSession')
    && appDelegate.includes('AssetPackDownloadManager.backgroundCompletionHandler')
    && project.includes('Copy H5 app')
    && project.includes('tools/pack-app-www.sh')
    && project.includes('Assets.xcassets')
    && project.includes('PrivacyInfo.xcprivacy')
    && project.includes('shell-config.json')
    && packScript.includes('assets/video/free-levels/level-0[1-9]-*.mp4')
    && packScript.includes('non-seed course video found in bundle')
    && infoPlist.includes('嗨洛塔')
    && typeof shellConfig.apiBase === 'string';
}

const nativeReady = nativeShellReady();

function nativeBuildToolReady() {
  try {
    const output = execFileSync('xcodebuild', ['-version'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    return /Xcode\s+\d/.test(output);
  } catch {
    return false;
  }
}

const nativeBuildReady = nativeBuildToolReady();

function shellApiBaseConfigured() {
  try {
    const shellConfig = JSON.parse(
      readFileSync(join(ROOT, 'ios/BabyEnglishIsland/shell-config.json'), 'utf8'),
    );
    return Boolean(String(shellConfig.apiBase || '').trim());
  } catch {
    return false;
  }
}

function teamIdConfigured() {
  try {
    const team = readFileSync(join(ROOT, 'ios/Config/Team.xcconfig'), 'utf8');
    const match = team.match(/^\s*DEVELOPMENT_TEAM\s*=\s*(\S+)/m);
    return Boolean(match && match[1] && match[1] !== 'YOUR_TEAM_ID');
  } catch {
    return false;
  }
}

function assetPackRemoteCoverage() {
  try {
    const manifest = JSON.parse(readFileSync(join(ROOT, 'asset-packs.json'), 'utf8'));
    const maps = Array.isArray(manifest.maps) ? manifest.maps : [];
    const out = {};
    for (const mapId of ['ocean', 'desert']) {
      const pack = maps.find((m) => m && m.mapId === mapId) || {};
      const listed = Array.isArray(pack.levels) ? pack.levels : [];
      const byId = new Map(
        listed
          .filter((row) => row && Number(row.levelId) > 0 && String(row.downloadUrl || '').trim())
          .map((row) => [Number(row.levelId), String(row.downloadUrl).trim()]),
      );
      const missingRemote = [];
      let realOss = 0;
      let placeholder = 0;
      for (let id = 11; id <= 200; id += 1) {
        const url = byId.get(id);
        if (!url) {
          missingRemote.push(id);
          continue;
        }
        if (/cdn\.example|example\.hirota|localhost|127\.0\.0\.1/i.test(url)) placeholder += 1;
        if (/baobao-chuangguan\.oss|aliyuncs\.com|oss-cn-/i.test(url)) realOss += 1;
      }
      out[mapId] = {
        listed: byId.size,
        missingRemote11to200: missingRemote.length,
        realOssUrls: realOss,
        placeholderUrls: placeholder,
      };
    }
    return out;
  } catch {
    return {
      ocean: { listed: 0, missingRemote11to200: 190, realOssUrls: 0, placeholderUrls: 0 },
      desert: { listed: 0, missingRemote11to200: 190, realOssUrls: 0, placeholderUrls: 0 },
    };
  }
}

const remoteCoverage = assetPackRemoteCoverage();
const desertSeedMissing = [];
for (let id = 1; id <= 10; id += 1) {
  // filenames come from DESERT_FREE_LEVEL_VIDEOS in script; existence via glob
  const pad = String(id).padStart(3, '0');
  const dir = join(ROOT, 'assets/video/desert-levels');
  try {
    const found = require('node:fs')
      .readdirSync(dir)
      .some((name) => name.startsWith(`level-${pad}-`) && name.endsWith('.mp4') && !name.includes('.before'));
    if (!found) desertSeedMissing.push(id);
  } catch {
    desertSeedMissing.push(id);
  }
}

const hardFailures = [
  ...(JSON.stringify(firstTen) !== JSON.stringify(expectedFirstTen) ? ['前 10 关设定被改动。'] : []),
  ...(levels.length !== 200 ? [`当前只有 ${levels.length} 关，不是 200 关。`] : []),
  ...(missingQuestionAudioFirstTen.length
    ? [`前 10 关缺少 ${missingQuestionAudioFirstTen.length} 个题目语音。`]
    : []),
  ...(missingWordAudio.length ? [`缺少 ${missingWordAudio.length} 个单词音频。`] : []),
  ...(missingFirstTenVideos.length ? [`前 10 关缺少 ${missingFirstTenVideos.length} 个视频。`] : []),
  ...(desertSeedMissing.length ? [`沙漠前 10 关包内视频缺 ${desertSeedMissing.length} 个。`] : []),
  ...(nonNounTopicLevels.length ? [`仍有 ${nonNounTopicLevels.length} 关属于颜色/数字/动作，不是高频名词关。`] : []),
  ...(nonNounWordLevels.length ? [`仍有 ${nonNounWordLevels.length} 个非名词词条：${nonNounWordLevels.map((level) => `${level.id}:${level.title}`).join(', ')}。`] : []),
  ...(staleHundredMentions().map((file) => `${file} 仍有 100 levels 文档残留。`)),
];

const remoteGaps = [];
for (const mapId of ['ocean', 'desert']) {
  const c = remoteCoverage[mapId] || {};
  if ((c.missingRemote11to200 || 0) > 0) {
    remoteGaps.push(`${mapId} L11–200 清单缺 downloadUrl ${c.missingRemote11to200} 条（不挡种子 TF）。`);
  } else if ((c.placeholderUrls || 0) > 0) {
    remoteGaps.push(`${mapId} L11–200 仍有 ${c.placeholderUrls} 条占位 CDN（不挡种子 TF）。`);
  }
}

const gaps = [
  ...(!nativeReady ? ['未发现可检查的 iOS 原生壳，VIP 内购和发版更新仍只是 H5 桥预留。'] : []),
  ...(!nativeBuildReady ? ['未安装完整 Xcode 或 xcode-select 未指向 Xcode，无法编译验证 iOS 原生包。'] : []),
  ...(!appRelease.updateUrl ? ['app-release.json 没有 App Store updateUrl，更新弹窗无法直达商店。'] : []),
  ...remoteGaps,
  ...(missingQuestionAudioBeyondSeed > 0
    ? [`全量题语音仍缺 ${missingQuestionAudioBeyondSeed} 个（不挡缩小范围 TestFlight 内测）。`]
    : []),
  ...(!shellApiBaseConfigured()
    ? ['ios/BabyEnglishIsland/shell-config.json 的 apiBase 为空：file:// 壳登录/同步前需填生产 HTTPS 源。']
    : []),
  ...(!teamIdConfigured()
    ? ['ios/Config/Team.xcconfig 未填 DEVELOPMENT_TEAM，Archive 前需写 Team ID 或在 Xcode Signing 里选队。']
    : []),
];

const result = {
  ok: {
    firstTenLocked: JSON.stringify(firstTen) === JSON.stringify(expectedFirstTen),
    levelCount: levels.length,
    missingQuestionAudio: missingQuestionAudio.length,
    missingQuestionAudioFirstTen: missingQuestionAudioFirstTen.length,
    missingWordAudio: missingWordAudio.length,
    missingFirstTenVideos: missingFirstTenVideos.length,
    desertSeedMissing: desertSeedMissing.length,
    remoteCourseVideos: remoteCoverage,
    nonNounWords: nonNounWordLevels.length,
    nativeShellReady: nativeReady,
    nativeBuildToolReady: nativeBuildReady,
    shellApiBaseConfigured: shellApiBaseConfigured(),
    teamIdConfigured: teamIdConfigured(),
    // hard = content blockers for seed TF; gaps = account/Xcode/API still open
    releaseReady: hardFailures.length === 0 && gaps.length === 0,
    testflightContentReady: hardFailures.length === 0 && nativeReady,
  },
  hardFailures,
  gaps,
};

console.log(JSON.stringify(result, null, 2));
if (hardFailures.length) process.exitCode = 1;
if (process.argv.includes('--strict') && gaps.length) process.exitCode = 1;
