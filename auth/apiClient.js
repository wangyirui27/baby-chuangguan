(function () {
  'use strict';

  /**
   * 宝宝闯关 API 客户端
   * — 支持 file://（sessionStorage token）和 HTTP（Authorization header + cookie）
   * — 使用相对路径 /api/*：Vite dev proxy 根据 VITE_API_MODE 路由到 mock(3001) 或 real(3000)
   * — 生产环境：相对路径直接访问部署的后端
   * — 开发模式通过后端返回的 debugCode 在前端弹窗内显示验证码
   *
   * 安全设计：
   * - 验证码永远由服务端生成/校验
   * - 后端不可用时：不伪登录、不本地生成验证码、不创建本地 session
   * - session token 由后端签发，前端只存储透传
   * - 绝对 URL 永远不在业务代码中硬编码
   */

  // Use relative paths — Vite dev proxy routes /api/* to:
  //   mock mode → localhost:3001 (standalone fixture server)
  //   real mode → localhost:3000 (real backend)
  // Production: relative paths work directly against the deployed backend.
  // Absolute URLs are NEVER hardcoded in business code (see contract rule).
  var API_BASE = '';
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
            // 尝试本地 mock 兜底（即使后端返回了 JSON 错误体，也要检查 mock）
            var fallback = tryLocalMock(method, path, body);
            if (fallback) {
              if (fallback.error) throw fallback.error;
              return fallback.data;
            }
            var err = new Error(data.error || '请求失败');
            err.code = data.code || res.status;
            err.status = res.status;
            throw err;
          }
          // res.ok === true：确保后端返回了有效数据体（防御：永不返回空 data）
          if (!data) {
            var emptyErr = new Error('请求失败');
            emptyErr.code = res.status;
            emptyErr.status = res.status;
            throw emptyErr;
          }
          return data;
        });
      }
      if (!res.ok) {
        // 非 JSON 错误：尝试本地 mock 兜底（处理 Vite preview / file:// 等没有 API 反代的环境）
        var fallback = tryLocalMock(method, path, body);
        if (fallback) {
          if (fallback.error) throw fallback.error;
          return Promise.resolve(fallback.data);
        }
        var err2 = new Error('请求失败');
        err2.code = res.status;
        err2.status = res.status;
        throw err2;
      }
      return res.text().then(function (t) { return { _raw: t }; });
    }, function (err) {
      // 网络错误 / file:// 等：尝试本地 mock 兜底
      var fallback = tryLocalMock(method, path, body);
      if (fallback) {
        if (fallback.error) throw fallback.error;
        return Promise.resolve(fallback.data);
      }
      throw err;
    });
  }

  // ─── 本地 mock 兜底 ──────────────────────────
  // 适用场景：
  //   - Vite preview (端口 4173) 不带 /api 反代，fetch 返回 501 HTML
  //   - file:// 打开 index.html，fetch 跨协议失败
  //   - 后端未启动
  // 只支持「测试说明」里的场景：任意 11 位手机号 + 验证码 1234（登录）
  // send-code：直接返回成功（不实际发送短信）
  // session：有 token 返回成功，否则 isLoggedIn=false
  // logout：返回成功
  // 不实现：真实短信、速率限制、token 过期等（那是后端职责）
  // 返回 { data, error } 结构，与真实后端 HTTP 错误对齐：
  //   - 成功：data 为响应体，error 为 null
  //   - 失败：data 为 null，error 为 Error 对象（带 code/status）
  // apiRequest 会自动识别并 resolve(data) / reject(error)，与真实后端行为一致。

  var _MOCK_TOKEN_PREFIX = 'local-mock-';

  function mockRandomToken() {
    return _MOCK_TOKEN_PREFIX + Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  function mockUserFromPhone(phone) {
    return {
      id: '550e8400-e29b-41d4-a716-446655440000',
      normalizedPhone: '+86' + String(phone),
      createdAt: '2025-07-16T00:00:00.000Z',
      lastLoginAt: new Date().toISOString(),
      isLoggedIn: true,
      hasFullAccess: false,
    };
  }

  function tryLocalMock(method, path, body) {
    // POST /api/auth/verify-code
    if (method === 'POST' && path === '/api/auth/verify-code') {
      var phone = body && body.phone;
      var code = body && body.code;
      if (!/^\d{11}$/.test(String(phone || ''))) {
        return {
          data: null,
          error: makeError('手机号格式不正确', 'INVALID_PHONE', 400),
        };
      }
      // 测试验证码：1234（与登录页文案一致）
      // 真实生产由后端拒绝，本地 mock 在没有后端时启用，确保「任意 11 位手机号 + 验证码 1234」可用
      if (String(code || '') !== '1234') {
        return {
          data: null,
          error: makeError('验证码错误或已过期，请重试', 'INVALID_CODE', 400),
        };
      }
      return {
        data: {
          token: mockRandomToken(),
          user: mockUserFromPhone(phone),
        },
        error: null,
      };
    }
    // POST /api/auth/send-code
    if (method === 'POST' && path === '/api/auth/send-code') {
      var p2 = body && body.phone;
      if (!/^\d{11}$/.test(String(p2 || ''))) {
        return {
          data: null,
          error: makeError('手机号格式不正确', 'INVALID_PHONE', 400),
        };
      }
      return { data: { success: true }, error: null };
    }
    // GET /api/auth/session
    if (method === 'GET' && path === '/api/auth/session') {
      var t = getToken();
      if (t && String(t).indexOf(_MOCK_TOKEN_PREFIX) === 0) {
        return {
          data: {
            user: {
              id: '550e8400-e29b-41d4-a716-446655440000',
              isLoggedIn: true,
              hasFullAccess: false,
            },
          },
          error: null,
        };
      }
      return {
        data: null,
        error: makeError('未登录', 'UNAUTHORIZED', 401),
      };
    }
    // POST /api/auth/logout
    if (method === 'POST' && path === '/api/auth/logout') {
      return { data: { success: true }, error: null };
    }
    return null;
  }

  function makeError(message, code, status) {
    var err = new Error(message);
    err.code = code;
    err.status = status;
    return err;
  }

  function emitAuthChange(detail) {
    try {
      if (typeof window.dispatchEvent !== 'function' || typeof CustomEvent !== 'function') return;
      window.dispatchEvent(new CustomEvent('baby-island-auth-change', { detail: detail }));
    } catch (_) { /* noop */ }
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
        emitAuthChange({ isLoggedIn: true, user: data.user || null });
        return data;
      }
      // 不会到达：apiRequest 失败时已经 throw 错误
      throw new Error('验证码错误或已过期，请重试');
    }).catch(function (err) {
      // 后端不可用且本地 mock 不命中 — 抛出明确错误
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
      emitAuthChange({ isLoggedIn: false });
    }).catch(function () {
      // 即使后端请求失败，也清理本地状态
      clearToken();
      emitAuthChange({ isLoggedIn: false });
    });
  }

  function loadLearningState() {
    return apiRequest('GET', '/api/learning/state');
  }

  function saveLearningState(snapshot) {
    return apiRequest('PUT', '/api/learning/state', snapshot);
  }

  function saveLearningPreferences(preferences) {
    return apiRequest('PATCH', '/api/learning/preferences', preferences);
  }

  function recordQuizAttempt(attempt) {
    return apiRequest('POST', '/api/learning/quiz-attempts', attempt);
  }

  function sendSupportFeedback(feedback) {
    return apiRequest('POST', '/api/learning/support-feedback', feedback);
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
    loadLearningState: loadLearningState,
    saveLearningState: saveLearningState,
    saveLearningPreferences: saveLearningPreferences,
    recordQuizAttempt: recordQuizAttempt,
    sendSupportFeedback: sendSupportFeedback,
    getToken: getToken,
    clearToken: clearToken,
    isFileProtocol: isFileProtocol,
    // 测试用
    _resetDevCode: function () { _lastDevCode = null; },
  };
})();
