/**
 * apps/frontend/src/api/client.js
 * ─────────────────────────────────────────────────────────────────────────────
 * 宝宝闯关统一 API 客户端
 *
 * 契约来源: packages/contracts/openapi/openapi.yaml
 * 类型定义: packages/contracts/src/types/api.ts
 *
 * 设计原则:
 *  - 页面业务代码只能调用此模块，不散落完整 URL
 *  - 所有请求使用相对路径 /api/*，由 Vite proxy 路由到正确后端
 *  - Mock/Real 切换完全由环境变量控制，页面业务代码无感知
 *  - 严格使用 fixtures 中的 fixture 字段，不手写漂移
 *  - 后端不可用时抛出明确错误，绝不本地生成伪 token/session
 *
 * Mock 模式行为（VITE_API_MODE=mock）:
 *  - Vite proxy 将 /api/* → localhost:3001（独立 Mock Server）
 *  - Mock Server 严格返回 fixtures 数据
 *  - verify-code: 任意 6 位数字（除 000000/111111/123457）→ 成功
 *  - send-code: 42s 冷却（每 IP），格式校验同真实后端
 *  - session: 需要 Bearer token（verify-code 成功时颁发）
 *  - logout: 清除 token，始终返回 200
 *
 * Real 模式行为（VITE_API_MODE=real）:
 *  - Vite proxy 将 /api/* → localhost:3000（真实后端）
 *  - session token 存储在 sessionStorage（file://）或 cookie（HTTP）
 *
 * 使用方式:
 *   import { babyIslandApi } from './api/client.js';
 *   // 或在 legacy script.js 环境通过 window.babyIslandApi 访问
 * ─────────────────────────────────────────────────────────────────────────────
 */

(function (globalThis) {
  'use strict';

  // ── 协议检测 ───────────────────────────────────────────────────────

  function isFileProtocol() {
    try {
      return window.location.protocol === 'file:';
    } catch (_) {
      return false;
    }
  }

  // ── Token 存取 ─────────────────────────────────────────────────────

  /**
   * 获取当前 session token
   * file:// 场景: sessionStorage
   * HTTP 场景: cookie (HttpOnly cookie 由浏览器自动携带)
   */
  function getToken() {
    if (isFileProtocol()) {
      try {
        return sessionStorage.getItem('baby-island-auth-token');
      } catch (_) {
        return null;
      }
    }
    // HTTP: token 可能在 HttpOnly cookie 中（JS 不可读），也可能在 sessionStorage
    // fallback: 尝试从 Authorization header 角度读取（实际上这只是提示）
    // 真实场景：后端通过 cookie 自动携带，JS 侧仅做状态标记
    var match = document.cookie.match(/(?:^|;\s*)session_token=([^;]*)/);
    if (match) {
      return decodeURIComponent(match[1]);
    }
    // 如果 cookie 没有，尝试 sessionStorage（某些场景下 token 也存这里）
    try {
      return sessionStorage.getItem('baby-island-auth-token');
    } catch (_) {
      return null;
    }
  }

  /**
   * 存储 session token
   */
  function setToken(token) {
    if (isFileProtocol()) {
      try {
        if (token) {
          sessionStorage.setItem('baby-island-auth-token', token);
        } else {
          sessionStorage.removeItem('baby-island-auth-token');
        }
      } catch (_) { /* noop */ }
    } else {
      // HTTP: 存 cookie（后端也可能设置 HttpOnly cookie）
      // 对于 JS 可写的场景，同时存 sessionStorage 作为状态标记
      try { sessionStorage.setItem('baby-island-auth-token', token || ''); } catch (_) { /* noop */ }
      if (token) {
        document.cookie =
          'session_token=' +
          encodeURIComponent(token) +
          '; path=/; SameSite=Lax; max-age=2592000';
      } else {
        document.cookie =
          'session_token=; path=/; SameSite=Lax; max-age=0';
      }
    }
  }

  /**
   * 清除 session token
   */
  function clearToken() {
    setToken(null);
    try { sessionStorage.removeItem('baby-island-auth-token'); } catch (_) { /* noop */ }
  }

  // ── 核心请求 ───────────────────────────────────────────────────────

  /**
   * 通用 fetch 封装
   * @param {string} method  - HTTP method
   * @param {string} path    - 相对路径，如 /api/auth/send-code
   * @param {object} body    - 请求体（自动 JSON 序列化）
   * @returns {Promise<object>} 解析后的 JSON 数据
   */
  function apiRequest(method, path, body) {
    // 始终使用相对路径 — Vite proxy 根据 VITE_API_MODE 路由到正确后端
    // 绝对不允许在此拼接完整 URL
    var options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      // file:// 场景需要 cors 模式避免 null origin 问题
      mode: 'cors',
      credentials: isFileProtocol() ? 'omit' : 'include',
    };

    // 注入 Bearer token（后端据此识别 session）
    var token = getToken();
    if (token) {
      options.headers['Authorization'] = 'Bearer ' + token;
    }

    if (body !== undefined && body !== null) {
      options.body = JSON.stringify(body);
    }

    return fetch(path, options).then(function (res) {
      var contentType = (res.headers.get('content-type') || '');

      if (contentType.indexOf('application/json') !== -1) {
        return res.json().then(function (data) {
          if (!res.ok) {
            var err = new Error(data.error || '请求失败');
            err.code = data.code || res.status;
            err.status = res.status;
            throw err;
          }
          return data;
        });
      }

      if (!res.ok) {
        var err2 = new Error('请求失败');
        err2.code = res.status;
        err2.status = res.status;
        throw err2;
      }

      // 非 JSON 响应
      return res.text().then(function (t) { return { _raw: t }; });
    });
  }

  // ── 公开 API ───────────────────────────────────────────────────────

  /**
   * 发送短信验证码
   * @param {string} phone - 11 位手机号
   * @returns {Promise<{success: boolean, debugCode?: string}>}
   */
  function sendVerificationCode(phone) {
    return apiRequest('POST', '/api/auth/send-code', { phone: phone })
      .then(function (data) {
        // 开发模式后端可能返回 debugCode（仅 development + SMS_PROVIDER=development）
        // 不在 mock 模式返回（mock server 不模拟 dev debugCode）
        return data;
      })
      .catch(function (err) {
        // 后端不可用或网络错误
        var error = new Error('登录服务未启动，连接失败');
        error.code = 'CONNECTION_FAILED';
        error.status = 0;
        throw error;
      });
  }

  /**
   * 校验验证码并登录
   * @param {string} phone - 11 位手机号
   * @param {string} code  - 6 位验证码
   * @returns {Promise<{token: string, user: object}>}
   */
  function verifyCode(phone, code) {
    return apiRequest('POST', '/api/auth/verify-code', {
      phone: phone,
      code: code,
    })
      .then(function (data) {
        if (data && data.token) {
          setToken(data.token);
        }
        return data;
      })
      .catch(function (err) {
        if (!err.status || err.status === 0) {
          var error = new Error('登录服务未启动，连接失败');
          error.code = 'CONNECTION_FAILED';
          error.status = 0;
          throw error;
        }
        throw err;
      });
  }

  /**
   * 检查当前 session 是否有效
   * @returns {Promise<{isLoggedIn: boolean, user?: object}>}
   */
  function checkSession() {
    return apiRequest('GET', '/api/auth/session')
      .then(function (data) {
        return { isLoggedIn: true, user: data.user || data };
      })
      .catch(function () {
        // session 无效，清理 token
        clearToken();
        return { isLoggedIn: false };
      });
  }

  /**
   * 退出登录
   * @returns {Promise<void>}
   */
  function logout() {
    return apiRequest('POST', '/api/auth/logout')
      .then(function () {
        clearToken();
      })
      .catch(function () {
        // 即使请求失败也清理本地状态
        clearToken();
      });
  }

  /**
   * 读取 API base URL（仅供诊断，页面业务代码不应使用）
   * @returns {string}
   */
  function getApiBase() {
    // 相对路径模式下，base URL 由浏览器/Vite 决定
    // 返回当前 origin 作为参考
    try {
      return window.location.origin;
    } catch (_) {
      return '(unknown)';
    }
  }

  /**
   * 设置 API base URL（向后兼容 — 当前版本忽略此调用）
   * 新设计使用相对路径，此函数仅作向后兼容存根
   * @param {string} _url
   */
  function setApiBase(_url) {
    // 相对路径模式下不支持切换 base URL
    // 保留此函数仅向后兼容旧调用方
    console.warn('[apiClient] setApiBase() is deprecated — using relative /api paths via Vite proxy');
  }

  /**
   * 获取最近一次开发模式后端返回的验证码（仅 development + SMS_PROVIDER=development）
   * Mock 模式下永远返回 null（mock server 不返回 debugCode）
   * @returns {string|null}
   */
  function getLastDevCode() {
    return null;
  }

  /**
   * 重置开发验证码（测试用）
   */
  function _resetDevCode() {
    // noop — mock 模式不存储 dev code
  }

  // ── 全局导出 ───────────────────────────────────────────────────────

  globalThis.babyIslandApi = {
    // 向后兼容别名
    setApiBase: setApiBase,
    getApiBase: getApiBase,
    getLastDevCode: getLastDevCode,
    _resetDevCode: _resetDevCode,
    sendVerificationCode: sendVerificationCode,
    verifyCode: verifyCode,
    checkSession: checkSession,
    logout: logout,
    getToken: getToken,
    clearToken: clearToken,
    isFileProtocol: isFileProtocol,
  };

})(typeof globalThis !== 'undefined' ? globalThis : window);
