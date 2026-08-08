#!/usr/bin/env node
import { readFile } from 'node:fs/promises';

const DEFAULT_SAMPLE_LEVELS = [11, 50, 100, 200];

class CliError extends Error {
  constructor(message, code = 2) {
    super(message);
    this.code = code;
  }
}

function valueAfter(argv, index, key, raw) {
  const equalsAt = raw.indexOf('=');
  if (equalsAt >= 0) return [raw.slice(equalsAt + 1), index];
  if (index + 1 >= argv.length) throw new CliError(`${key} needs a value`);
  return [argv[index + 1], index + 1];
}

function parseArgs(argv) {
  const options = {
    all: false,
    concurrency: 4,
    dryRun: false,
    file: 'asset-packs.json',
    live: false,
    map: 'all',
    sample: '',
    timeoutMs: 8000,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const raw = argv[i];
    const key = raw.split('=')[0];
    if (raw === '--help' || raw === '-h') {
      options.help = true;
    } else if (raw === '--all') {
      options.all = true;
    } else if (raw === '--dry-run') {
      options.dryRun = true;
    } else if (raw === '--live' || raw === '--probe') {
      options.live = true;
    } else if (key === '--file') {
      [options.file, i] = valueAfter(argv, i, key, raw);
    } else if (key === '--map') {
      [options.map, i] = valueAfter(argv, i, key, raw);
    } else if (key === '--sample') {
      [options.sample, i] = valueAfter(argv, i, key, raw);
    } else if (key === '--timeout-ms' || key === '--timeout') {
      const [value, next] = valueAfter(argv, i, key, raw);
      options.timeoutMs = Number(value);
      i = next;
    } else if (key === '--concurrency') {
      const [value, next] = valueAfter(argv, i, key, raw);
      options.concurrency = Number(value);
      i = next;
    } else {
      throw new CliError(`unknown argument: ${raw}`);
    }
  }

  if (!Number.isInteger(options.timeoutMs) || options.timeoutMs <= 0) {
    throw new CliError('--timeout-ms must be a positive integer');
  }
  if (!Number.isInteger(options.concurrency) || options.concurrency <= 0) {
    throw new CliError('--concurrency must be a positive integer');
  }
  return options;
}

function printHelp() {
  console.log(`Usage: node tools/probe-asset-pack-urls.mjs [options]

Default is dry-run: it parses asset-packs.json and prints selected URLs without network.

Options:
  --live              Send HEAD requests; falls back to Range GET on 403/405.
  --dry-run           Force no-network mode, even with --live.
  --all               Select every URL instead of the default level sample.
  --sample N|all      Select N evenly spaced URLs, or all.
  --map ocean|desert|all
  --file PATH         Default: asset-packs.json
  --timeout-ms N      Default: 8000
  --concurrency N     Default: 4
`);
}

function collectEntries(assetPacks) {
  const entries = [];
  for (const map of assetPacks.maps || []) {
    for (const level of map.levels || []) {
      if (!level.downloadUrl) continue;
      let parsed;
      try {
        parsed = new URL(level.downloadUrl);
      } catch {
        throw new CliError(`invalid URL for ${map.mapId} L${level.levelId}: ${level.downloadUrl}`);
      }
      if (parsed.protocol !== 'https:') {
        throw new CliError(`non-HTTPS URL for ${map.mapId} L${level.levelId}: ${level.downloadUrl}`);
      }
      entries.push({
        mapId: map.mapId,
        levelId: level.levelId,
        url: level.downloadUrl,
      });
    }
  }
  return entries.sort((a, b) => a.mapId.localeCompare(b.mapId) || a.levelId - b.levelId);
}

function takeEvenly(items, count) {
  if (count >= items.length) return [...items];
  if (count <= 1) return items.length ? [items[0]] : [];
  const chosen = new Map();
  for (let i = 0; i < count; i += 1) {
    const index = Math.round((i * (items.length - 1)) / (count - 1));
    const item = items[index];
    chosen.set(`${item.mapId}:${item.levelId}`, item);
  }
  return [...chosen.values()];
}

function selectDefaultSample(entries) {
  const byMap = new Map();
  for (const entry of entries) {
    if (!byMap.has(entry.mapId)) byMap.set(entry.mapId, []);
    byMap.get(entry.mapId).push(entry);
  }

  const selected = [];
  for (const items of byMap.values()) {
    const byLevel = new Map(items.map((item) => [item.levelId, item]));
    const preferred = DEFAULT_SAMPLE_LEVELS.map((levelId) => byLevel.get(levelId)).filter(Boolean);
    selected.push(...(preferred.length ? preferred : takeEvenly(items, Math.min(4, items.length))));
  }
  return selected;
}

function selectEntries(entries, options) {
  const filtered = options.map === 'all'
    ? entries
    : entries.filter((entry) => entry.mapId === options.map);
  if (!filtered.length) throw new CliError(`no URLs selected for map=${options.map}`);

  if (options.all || options.sample === 'all') return filtered;
  if (options.sample) {
    const count = Number(options.sample);
    if (!Number.isInteger(count) || count <= 0) throw new CliError('--sample must be a positive integer or all');
    return takeEvenly(filtered, count);
  }
  return selectDefaultSample(filtered);
}

async function requestOnce(url, method, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const headers = method === 'GET' ? { Range: 'bytes=0-0' } : {};
  try {
    const response = await fetch(url, { method, headers, redirect: 'follow', signal: controller.signal });
    const result = {
      contentLength: response.headers.get('content-length') || '',
      contentType: response.headers.get('content-type') || '',
      finalUrl: response.url,
      ok: response.status >= 200 && response.status < 400,
      status: response.status,
    };
    if (response.body) await response.body.cancel().catch(() => {});
    return result;
  } catch (error) {
    return {
      error: error.name === 'AbortError' ? 'timeout' : error.message,
      ok: false,
      status: 0,
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function probeEntry(entry, options) {
  const startedAt = Date.now();
  const head = await requestOnce(entry.url, 'HEAD', options.timeoutMs);
  if (head.status === 403 || head.status === 405) {
    const range = await requestOnce(entry.url, 'GET', options.timeoutMs);
    return {
      ...entry,
      ...range,
      headStatus: head.status,
      method: 'HEAD->GET-range',
      ms: Date.now() - startedAt,
    };
  }
  return {
    ...entry,
    ...head,
    method: 'HEAD',
    ms: Date.now() - startedAt,
  };
}

async function mapLimit(items, limit, task) {
  const results = [];
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const index = next;
      next += 1;
      results[index] = await task(items[index]);
    }
  });
  await Promise.all(workers);
  return results;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  const assetPacks = JSON.parse(await readFile(options.file, 'utf8'));
  const allEntries = collectEntries(assetPacks);
  const selected = selectEntries(allEntries, options);
  const dryRun = options.dryRun || !options.live;

  if (dryRun) {
    console.log(JSON.stringify({
      mode: 'dry-run',
      network: false,
      file: options.file,
      totalUrls: allEntries.length,
      selectedUrls: selected.length,
      urls: selected,
    }, null, 2));
    return;
  }

  const results = await mapLimit(selected, options.concurrency, (entry) => probeEntry(entry, options));
  const failures = results.filter((result) => !result.ok);
  console.log(JSON.stringify({
    mode: 'live',
    checked: results.length,
    ok: results.length - failures.length,
    fail: failures.length,
    failures,
    results,
  }, null, 2));
  process.exitCode = failures.length ? 1 : 0;
}

main().catch((error) => {
  console.error(`[asset-pack-probe] ${error.message}`);
  process.exit(error.code || 1);
});
