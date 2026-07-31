// OSS 前端：签名 URL（私有桶）或 公网前缀 或 本地静态

const crypto = require('crypto');

// ── 配置读取 ──

function getOssPublicBaseUrl() {
  const raw = process.env.OSS_PUBLIC_BASE_URL;
  if (typeof raw !== 'string') return '';
  return raw.trim().replace(/\/+$/, '');
}

function isOssPublicEnabled() {
  return getOssPublicBaseUrl().length > 0;
}

function getSignedOssConfig() {
  const accessKeyId = process.env.OSS_ACCESS_KEY_ID;
  const accessKeySecret = process.env.OSS_ACCESS_KEY_SECRET;
  const endpoint = process.env.OSS_ENDPOINT;
  const bucket = process.env.OSS_BUCKET;
  if (!accessKeyId || !accessKeySecret || !endpoint || !bucket) {
    return null;
  }
  return { accessKeyId, accessKeySecret, endpoint, bucket };
}

function isSignedOssEnabled() {
  return getSignedOssConfig() !== null;
}

function isOssEnabled() {
  return isSignedOssEnabled() || isOssPublicEnabled();
}

/**
 * 返回静态后端模式：signed-oss | oss | local
 */
function getStaticBackend() {
  if (isSignedOssEnabled()) return 'signed-oss';
  if (isOssPublicEnabled()) return 'oss';
  return 'local';
}

// ── 签名 URL 生成（Aliyun OSS V2）──

function hmacSha1(key, data) {
  return crypto.createHmac('sha1', key).update(data).digest('base64');
}

/**
 * 生成 Aliyun OSS 带签名的临时下载 URL。
 * 签名算法：Aliyun OSS V2（Header 签名 / URL 签名共用规范的 StringToSign）
 *
 * @param {string} objectKey — OSS 对象键名，如 'assets/audio/foo.mp3'
 * @param {number} expiresInSeconds — 签名有效期秒数，默认 3600
 * @param {{ accessKeyId: string, accessKeySecret: string, endpoint: string, bucket: string }} config
 * @returns {string} 完整签名 URL
 */
function getSignedUrl(objectKey, expiresInSeconds, config) {
  const { accessKeyId, accessKeySecret, endpoint, bucket } = config || getSignedOssConfig();
  const ttl = expiresInSeconds || 3600;
  const expires = Math.floor(Date.now() / 1000) + ttl;

  // 确保 objectKey 不以 / 开头（拼接时统一加 /）
  const key = String(objectKey || '').replace(/^\/+/, '');
  const objectPath = `/${key}`;

  // CanonicalizedResource = /{bucket}/{objectKey}
  const canonicalizedResource = `/${bucket}${objectPath}`;

  // StringToSign（GET 请求，无 Content-MD5 / Content-Type / 自定义 OSS headers）
  const stringToSign = `GET\n\n\n${expires}\n${canonicalizedResource}`;

  const signature = hmacSha1(accessKeySecret, stringToSign);
  const encodedSignature = encodeURIComponent(signature);

  return `https://${bucket}.${endpoint}${objectPath}?OSSAccessKeyId=${encodeURIComponent(accessKeyId)}&Expires=${expires}&Signature=${encodedSignature}`;
}

// ── 公开URL（非签名，公有桶）──

function getPublicUrl(relPath) {
  const base = getOssPublicBaseUrl();
  const cleaned = String(relPath || '').replace(/^\/+/, '');
  if (!base) return `/${cleaned}`;
  return cleaned ? `${base}/${cleaned}` : base;
}

// ── 路径提取（中间件共用）──

/**
 * 从请求中拆出相对路径，兼容全局挂载和 /assets 下挂载。
 */
function extractRelPath(req) {
  const originalPath = (req.originalUrl || req.url || '').split('?')[0];
  if (originalPath === '/assets' || originalPath.startsWith('/assets/')) {
    return originalPath.replace(/^\/+/, '');
  }
  // mounted at /assets: req.url like /foo.webp
  const suffix = (req.url || '').split('?')[0];
  if (suffix === '/' || suffix === '') return 'assets';
  return `assets${suffix}`;
}

function extractQueryString(req) {
  const full = req.originalUrl || req.url || '';
  const idx = full.indexOf('?');
  if (idx < 0) return '';
  // 保留原始 ? 或 & 连接符——调用方根据目标 URL 是否已有 ? 来决定
  return { qs: full.slice(idx + 1), prefix: '?' };
}

// ── Express 中间件 ──

/**
 * 对 /assets/* 生成签名 URL（私有桶优先），或 302 到公网前缀，或 fallback 本地。
 */
function assetsRedirectMiddleware(req, res, next) {
  const relPath = extractRelPath(req);
  const qsObj = extractQueryString(req);
  // 追加请求中的查询参数：目标 URL 已有 ?，所以用 & 拼接
  const appendQs = (baseUrl) => {
    if (!qsObj) return baseUrl;
    const sep = baseUrl.includes('?') ? '&' : '?';
    return baseUrl + sep + qsObj.qs;
  };

  // 1) 签名 OSS 优先
  const signedConfig = getSignedOssConfig();
  if (signedConfig) {
    return res.redirect(302, appendQs(getSignedUrl(relPath, 3600, signedConfig)));
  }

  // 2) 公网 OSS
  if (isOssPublicEnabled()) {
    return res.redirect(302, appendQs(getPublicUrl(relPath)));
  }

  // 3) 本地静态
  return next();
}

// ── 导出 ──

module.exports = {
  isOssEnabled,
  isOssPublicEnabled,
  isSignedOssEnabled,
  getStaticBackend,
  getPublicUrl,
  getSignedUrl,
  assetsRedirectMiddleware,
};
