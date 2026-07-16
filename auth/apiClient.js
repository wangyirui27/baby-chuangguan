(function () {
  'use strict';

  /**
   * 宝宝闯关 API 客户端
   * — 支持 file://（sessionStorage token）和 HTTP（Authorization header）
   * — API_BASE 可配置（默认 http://localhost:3000）
   * — 开发模式通过后端返回的 debugCode 在前端弹窗内显示验证码
   *
   * 安全设计：
   * - 验证码永远由服务端生成/校验
   * - 后端不可用时：不伪登录、不本地生成验证码、不创建本地 session
   * - session token 由后端签发，前端只存储透传
   */

  var API_BASE = 'http://localhost:3000';
  var _lastDevCode = null;

  // ─── 协议检测 ────────────────────────────────

  function isFileProtocol() {
    try {
      return window.location.protocol === 'file:';
    } catch (_) {
      return false;
    }
  }

  // ─── Token 存取 ──────────────────────────────

  function getToken() {
    if (isFileProtocol()) {
      try { return sessionStorage.getItem('baby-island-auth-token'); } catch (_) { return null; }
    }
    // HTTP: cookie 由后端设置，前端无需手动读写；这里作为 fallback
    var match = document.cookie.match(/(?:^|;\s*)session_token=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : null;
  }

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
      if (token) {
        document.cookie = 'session_token=' + encodeURIComponent(token)
          + '; path=/; SameSite=Lax; max-age=2592000';
      } else {
        document.cookie = 'session_token=; path=/; SameSite=Lax; max-age=0';
      }
    }
  }

  function clearToken() {
    setToken(null);
  }

  // ─── 通用请求 ────────────────────────────────

  function apiRequest(method, path, body) {
    var url = API_BASE + path;
    var options = {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      // 重要：file:// 场景 fetch 使用 cors 模式，确保 null origin 被服务端接受
      mode: 'cors',
      credentials: isFileProtocol() ? 'omit' : 'include',
    };

    var token = getToken();
    if (token) {
      options.headers['Authorization'] = 'Bearer ' + token;
    }

    if (body !== undefined && body !== null) {
      options.body = JSON.stringify(body);
    }

    return fetch(url, options).then(function (res) {
      // 非 JSON 响应兜底
      var contentType = res.headers.get('content-type') || '';
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
      return res.text().then(function (t) { return { _raw: t }; });
    });
  }

  // ─── 公开 API ────────────────────────────────

  function setApiBase(url) {
    API_BASE = url;
  }

  function getApiBase() {
    return API_BASE;
  }

  /** 获取最近一次开发模式后端返回的验证码 */
  function getLastDevCode() {
    return _lastDevCode;
  }

  /**
   * 发送验证码
   * @param {string} phone - 手机号（11 位数字）
   * @returns {Promise<{success: boolean}>}
   */
  function sendVerificationCode(phone) {
    _lastDevCode = null;

    return apiRequest('POST', '/api/auth/send-code', { phone: phone }).then(function (data) {
      // 开发模式：后端返回 debugCode 用于 UI 显示（仅当 NODE_ENV=development && SMS_PROVIDER=development）
      if (data && data.debugCode) {
        _lastDevCode = String(data.debugCode);
      }
      return data;
    }).catch(function (err) {
      // 后端不可用 — 抛出明确错误，绝不本地生成验证码
      var error = new Error('登录服务未启动，连接失败');
      error.code = 'CONNECTION_FAILED';
      error.status = 0;
      throw error;
    });
  }

  /**
   * 校验验证码 → 登录
   * @param {string} phone
   * @param {string} code
   * @returns {Promise<{success: boolean, token?: string, user?: object}>}
   */
  function verifyCode(phone, code) {
    return apiRequest('POST', '/api/auth/verify-code', {
      phone: phone,
      code: code,
    }).then(function (data) {
      if (data && data.token) {
        setToken(data.token);
      }
      return data;
    }).catch(function (err) {
      // 后端不可用 — 绝不本地校验或生成伪 session
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
    // 始终发起 API 请求：HttpOnly cookie 由浏览器自动携带，JS 无需手动读取
    // 若后端无有效 session，会返回 401，catch 分支清理 token
    return apiRequest('GET', '/api/auth/session').then(function (data) {
      // 确保 token 已存储在本地（可能来自 HttpOnly cookie）
      var token = getToken();
      if (!token && data.user) {
        // HttpOnly cookie 已存在，JS 虽不可读但 session 有效
      }
      return { isLoggedIn: true, user: data.user || data };
    }).catch(function () {
      // token 无效或后端不可用，清理本地 token，绝不维持伪 session
      clearToken();
      return { isLoggedIn: false };
    });
  }

  /**
   * 退出登录
   * @returns {Promise<void>}
   */
  function logout() {
    return apiRequest('POST', '/api/auth/logout').then(function () {
      clearToken();
    }).catch(function () {
      // 即使后端请求失败，也清理本地状态
      clearToken();
    });
  }

  // ─── 全局导出 ────────────────────────────────

  window.babyIslandApi = {
    setApiBase: setApiBase,
    getApiBase: getApiBase,
    getLastDevCode: getLastDevCode,
    sendVerificationCode: sendVerificationCode,
    verifyCode: verifyCode,
    checkSession: checkSession,
    logout: logout,
    getToken: getToken,
    clearToken: clearToken,
    isFileProtocol: isFileProtocol,
    // 测试用
    _resetDevCode: function () { _lastDevCode = null; },
  };
})();
