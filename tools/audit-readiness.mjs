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

const appRelease = JSON.parse(readFileSync(join(ROOT, 'app-release.json'), 'utf8'));
function nativeShellReady() {
  const projectFile = 'ios/BabyEnglishIsland.xcodeproj/project.pbxproj';
  const appDelegateFile = 'ios/BabyEnglishIsland/AppDelegate.swift';
  const viewControllerFile = 'ios/BabyEnglishIsland/ViewController.swift';
  const infoFile = 'ios/BabyEnglishIsland/Info.plist';
  const packScriptFile = 'tools/pack-app-www.sh';
  const assetPackManifestFile = 'asset-packs.json';
  if (![projectFile, appDelegateFile, viewControllerFile, infoFile, packScriptFile, assetPackManifestFile].every(fileExists)) return false;

  const project = readFileSync(join(ROOT, projectFile), 'utf8');
  const viewController = readFileSync(join(ROOT, viewControllerFile), 'utf8');
  const appDelegate = readFileSync(join(ROOT, appDelegateFile), 'utf8');
  const packScript = readFileSync(join(ROOT, packScriptFile), 'utf8');
  return [
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
    'window.babyIslandAssetPackEvent',
  ].every((needle) => viewController.includes(needle))
    && appDelegate.includes('handleEventsForBackgroundURLSession')
    && appDelegate.includes('AssetPackDownloadManager.backgroundCompletionHandler')
    && project.includes('Copy H5 app')
    && project.includes('tools/pack-app-www.sh')
    && packScript.includes('assets/video/free-levels/level-0[1-9]-*.mp4')
    && packScript.includes('non-seed course video found in bundle');
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

const hardFailures = [
  ...(JSON.stringify(firstTen) !== JSON.stringify(expectedFirstTen) ? ['前 10 关设定被改动。'] : []),
  ...(levels.length !== 200 ? [`当前只有 ${levels.length} 关，不是 200 关。`] : []),
  ...(missingQuestionAudio.length ? [`缺少 ${missingQuestionAudio.length} 个题目语音。`] : []),
  ...(missingWordAudio.length ? [`缺少 ${missingWordAudio.length} 个单词音频。`] : []),
  ...(missingFirstTenVideos.length ? [`前 10 关缺少 ${missingFirstTenVideos.length} 个视频。`] : []),
  ...(nonNounTopicLevels.length ? [`仍有 ${nonNounTopicLevels.length} 关属于颜色/数字/动作，不是高频名词关。`] : []),
  ...(nonNounWordLevels.length ? [`仍有 ${nonNounWordLevels.length} 个非名词词条：${nonNounWordLevels.map((level) => `${level.id}:${level.title}`).join(', ')}。`] : []),
  ...(staleHundredMentions().map((file) => `${file} 仍有 100 levels 文档残留。`)),
];

const gaps = [
  ...(!nativeReady ? ['未发现可检查的 iOS 原生壳，VIP 内购和发版更新仍只是 H5 桥预留。'] : []),
  ...(!nativeBuildReady ? ['未安装完整 Xcode 或 xcode-select 未指向 Xcode，无法编译验证 iOS 原生包。'] : []),
  ...(!appRelease.updateUrl ? ['app-release.json 没有 App Store updateUrl，更新弹窗无法直达商店。'] : []),
  ...(levels.filter((level) => !level.videoSrc).length ? [`${levels.filter((level) => !level.videoSrc).length} 关还没有课程视频。`] : []),
];

const result = {
  ok: {
    firstTenLocked: JSON.stringify(firstTen) === JSON.stringify(expectedFirstTen),
    levelCount: levels.length,
    missingQuestionAudio: missingQuestionAudio.length,
    missingWordAudio: missingWordAudio.length,
    missingFirstTenVideos: missingFirstTenVideos.length,
    nonNounWords: nonNounWordLevels.length,
    nativeShellReady: nativeReady,
    nativeBuildToolReady: nativeBuildReady,
    releaseReady: hardFailures.length === 0 && gaps.length === 0,
  },
  hardFailures,
  gaps,
};

console.log(JSON.stringify(result, null, 2));
if (hardFailures.length) process.exitCode = 1;
if (process.argv.includes('--strict') && gaps.length) process.exitCode = 1;
