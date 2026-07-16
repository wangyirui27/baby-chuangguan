// 宝宝闯关 · 安全与限流模块
// IP 限流、通用安全中间件

'use strict';

/**
 * 基于 IP 的速率限制器（内存中）
 * 配置应用于特定路由（如 send-code）
 */
class IpRateLimiter {
  /**
   * @param {number} maxRequests - 窗口期内最大请求数
   * @param {number} windowMs - 窗口期毫秒数
   */
  constructor(maxRequests = 20, windowMs = 15 * 60 * 1000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    /** @type {Map<string, number[]>} */
    this.store = new Map();
  }

  /**
   * 清理过期条目
   * @param {string} ip
   */
  _prune(ip) {
    const now = Date.now();
    const entries = this.store.get(ip);
    if (!entries) return [];
    const recent = entries.filter(t => now - t < this.windowMs);
    if (recent.length === 0) {
      this.store.delete(ip);
      return [];
    }
    this.store.set(ip, recent);
    return recent;
  }

  /**
   * 中间件工厂函数
   * 返回 Express 中间件
   */
  middleware() {
    return (req, res, next) => {
      const ip = req.ip || req.connection.remoteAddress || 'unknown';
      const recent = this._prune(ip);

      if (recent.length >= this.maxRequests) {
        return res.status(429).json({
          error: '发送太频繁，请稍后再试',
          code: 'IP_RATE_LIMITED',
        });
      }

      recent.push(Date.now());
      this.store.set(ip, recent);
      next();
    };
  }

  /**
   * 重置指定 IP 的计数（用于测试）
   * @param {string} ip
   */
  reset(ip) {
    this.store.delete(ip);
  }

  /**
   * 重置所有计数（用于测试）
   */
  resetAll() {
    this.store.clear();
  }
}

// 单例 — app 全局共享一个 IP 限流器
const ipLimiter = new IpRateLimiter(20, 15 * 60 * 1000);

module.exports = {
  IpRateLimiter,
  ipLimiter,
};
