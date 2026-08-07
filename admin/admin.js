(() => {
  const TOKEN_KEY = 'hirota_admin_token';
  const PAGE_SIZES = [10, 20, 50, 100];
  const pages = {
    users: { page: 1, limit: 20, total: 0, totalPages: 1, q: '' },
    sms: { page: 1, limit: 20, total: 0, totalPages: 1 },
    vips: { page: 1, limit: 20, total: 0, totalPages: 1 },
    levels: { page: 1, limit: 20, total: 0, totalPages: 1 },
    videos: { page: 1, limit: 20, total: 0, totalPages: 1 },
  };

  const $ = (id) => document.getElementById(id);

  const gate = $('gate');
  const appEl = $('app');
  const toastEl = $('toast');
  const gateError = $('gateError');
  const tokenInput = $('tokenInput');
  const healthPill = $('healthPill');
  const statsGrid = $('statsGrid');
  const usersBody = $('usersBody');
  const smsBody = $('smsBody');
  const vipBody = $('vipBody');
  const rankBody = $('rankBody');
  const userQ = $('userQ');

  function getToken() {
    return sessionStorage.getItem(TOKEN_KEY) || '';
  }

  function setToken(t) {
    if (t) sessionStorage.setItem(TOKEN_KEY, t);
    else sessionStorage.removeItem(TOKEN_KEY);
  }

  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.hidden = false;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => {
      toastEl.hidden = true;
    }, 2200);
  }

  function fmtTime(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return String(iso);
    return d.toLocaleString('zh-CN', { hour12: false });
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function applyPageMeta(key, data) {
    const st = pages[key];
    if (!st || !data) return;
    st.page = Math.max(1, Number(data.page) || st.page || 1);
    st.limit = Math.max(1, Number(data.limit) || st.limit || 20);
    st.total = Math.max(0, Number(data.total) || 0);
    st.totalPages = Math.max(
      1,
      Number(data.totalPages) || Math.ceil(st.total / st.limit) || 1,
    );
    if (st.page > st.totalPages) st.page = st.totalPages;
  }

  function renderPager(key) {
    const host = document.querySelector('[data-pager="' + key + '"]');
    const st = pages[key];
    if (!host || !st) return;
    const sizes = PAGE_SIZES.map(function (n) {
      return (
        '<option value="' +
        n +
        '"' +
        (Number(n) === Number(st.limit) ? ' selected' : '') +
        '>' +
        n +
        '</option>'
      );
    }).join('');
    host.innerHTML =
      '<button type="button" class="btn small ghost" data-pager-act="first"' +
      (st.page <= 1 ? ' disabled' : '') +
      '>首页</button>' +
      '<button type="button" class="btn small ghost" data-pager-act="prev"' +
      (st.page <= 1 ? ' disabled' : '') +
      '>上一页</button>' +
      '<span class="pager-meta">第 ' +
      st.page +
      ' / ' +
      st.totalPages +
      ' 页 · 共 ' +
      st.total +
      ' 条</span>' +
      '<button type="button" class="btn small ghost" data-pager-act="next"' +
      (st.page >= st.totalPages ? ' disabled' : '') +
      '>下一页</button>' +
      '<button type="button" class="btn small ghost" data-pager-act="last"' +
      (st.page >= st.totalPages ? ' disabled' : '') +
      '>末页</button>' +
      '<label class="pager-size">每页<select data-pager-limit aria-label="每页条数">' +
      sizes +
      '</select></label>';
  }

  async function gotoPage(key, nextPage) {
    const st = pages[key];
    if (!st) return;
    st.page = Math.max(1, Math.min(st.totalPages || 1, Number(nextPage) || 1));
    try {
      if (key === 'users') await loadUsers();
      else if (key === 'sms') await loadSms();
      else if (key === 'vips') await loadVips();
      else if (key === 'levels' || key === 'videos') await loadContent();
    } catch (e) {
      showToast(e.message);
    }
  }

  function wirePagers() {
    document.querySelectorAll('[data-pager]').forEach(function (host) {
      if (host.dataset.wired === '1') return;
      host.dataset.wired = '1';
      host.addEventListener('click', function (e) {
        const btn = e.target.closest('[data-pager-act]');
        if (!btn || btn.disabled) return;
        const key = host.getAttribute('data-pager');
        const st = pages[key];
        if (!st) return;
        const act = btn.getAttribute('data-pager-act');
        if (act === 'first') gotoPage(key, 1);
        else if (act === 'prev') gotoPage(key, st.page - 1);
        else if (act === 'next') gotoPage(key, st.page + 1);
        else if (act === 'last') gotoPage(key, st.totalPages);
      });
      host.addEventListener('change', function (e) {
        const sel = e.target.closest('[data-pager-limit]');
        if (!sel) return;
        const key = host.getAttribute('data-pager');
        const st = pages[key];
        if (!st) return;
        st.limit = Number(sel.value) || 20;
        st.page = 1;
        gotoPage(key, 1);
      });
    });
  }

  async function api(path, options = {}) {
    const headers = Object.assign({ Accept: 'application/json' }, options.headers || {});
    const token = getToken();
    if (token) headers.Authorization = 'Bearer ' + token;
    if (options.body && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
    const res = await fetch('/api/admin' + path, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    let data = null;
    try {
      data = await res.json();
    } catch (_e) {
      data = null;
    }
    if (!res.ok) {
      const err = new Error((data && (data.error || data.code)) || res.statusText || '请求失败');
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  }

  function showApp() {
    gate.hidden = true;
    appEl.hidden = false;
  }

  function showGate(msg) {
    appEl.hidden = true;
    gate.hidden = false;
    if (msg) {
      gateError.hidden = false;
      gateError.textContent = msg;
    } else {
      gateError.hidden = true;
      gateError.textContent = '';
    }
  }

  async function enter() {
    const token = tokenInput.value.trim();
    if (!token) {
      showGate('请输入 ADMIN_TOKEN');
      return;
    }
    setToken(token);
    try {
      await api('/health');
      showGate('');
      showApp();
      await refreshAll();
    } catch (e) {
      setToken('');
      showGate(e.message || '鉴权失败');
    }
  }

  function logout() {
    setToken('');
    showGate('');
    tokenInput.value = '';
  }

  function renderStats(stats, health) {
    const cards = [
      ['用户总数', stats.users.total, ''],
      ['今日新增', stats.users.newToday, ''],
      ['7日新增', stats.users.new7d, ''],
      ['今日活跃', stats.users.activeToday, '按最近登录'],
      ['7日活跃', stats.users.active7d, '按最近登录'],
      ['封禁', stats.users.banned, ''],
      ['活跃会话', stats.sessions.active, ''],
      ['VIP', stats.vip.active, ''],
      ['短信成功24h', stats.sms.sent24h, ''],
      ['短信失败24h', stats.sms.failed24h, ''],
      ['待验证码', stats.sms.pendingVerifications, ''],
      ['SMS', health.smsProvider || (health.sms && health.sms.provider) || '—', health.sms && health.sms.kind],
    ];
    statsGrid.innerHTML = cards
      .map(
        ([k, v, s]) =>
          '<div class="stat"><div class="k">' +
          escapeHtml(k) +
          '</div><div class="v">' +
          escapeHtml(v) +
          '</div>' +
          (s ? '<div class="s">' + escapeHtml(s) + '</div>' : '') +
          '</div>',
      )
      .join('');

    const ok = health && health.status === 'ok';
    healthPill.textContent =
      (health.nodeEnv || 'dev') +
      ' · ' +
      (health.smsProvider || 'sms?') +
      (ok ? ' · ok' : ' · bad');
    healthPill.classList.toggle('bad', !ok);
  }

  async function loadOverview() {
    const [health, stats, ranks] = await Promise.all([
      api('/health'),
      api('/stats'),
      api('/rankings?windowDays=7&limit=20'),
    ]);
    renderStats(stats, health);

    const items = ranks.items || [];
    rankBody.innerHTML = items.length
      ? items
          .map(
            (r) =>
              '<tr><td>' +
              escapeHtml(r.rank) +
              '</td><td>' +
              escapeHtml(r.name || '—') +
              '</td><td>' +
              escapeHtml(r.score) +
              '</td></tr>',
          )
          .join('')
      : '<tr><td colspan="3">暂无排行数据</td></tr>';
  }

  async function loadUsers() {
    const st = pages.users;
    const q = encodeURIComponent(st.q || '');
    const data = await api(
      '/users?page=' + st.page + '&limit=' + st.limit + '&q=' + q + '&fullPhone=1',
    );
    applyPageMeta('users', data);
    renderPager('users');
    const items = data.items || [];
    usersBody.innerHTML = items.length
      ? items
          .map((u) => {
            const banBtn =
              u.status === 'banned'
                ? '<button type="button" class="btn small" data-act="unban" data-id="' +
                  escapeHtml(u.id) +
                  '">解封</button>'
                : '<button type="button" class="btn small danger" data-act="ban" data-id="' +
                  escapeHtml(u.id) +
                  '">封禁</button>';
            const vipBtn = u.vipActive
              ? '<button type="button" class="btn small" data-act="vip-off" data-id="' +
                escapeHtml(u.id) +
                '">撤VIP</button>'
              : '<button type="button" class="btn small" data-act="vip-on" data-id="' +
                escapeHtml(u.id) +
                '">授VIP</button>';
            return (
              '<tr>' +
              '<td>' +
              escapeHtml(u.phone || '—') +
              '<div class="muted" style="margin:4px 0 0;font-size:11px">' +
              escapeHtml(u.id) +
              '</div></td>' +
              '<td>' +
              (u.status === 'banned'
                ? '<span class="badge bad">banned</span>'
                : '<span class="badge ok">active</span>') +
              '</td>' +
              '<td>' +
              (u.vipActive ? '<span class="badge warn">VIP</span>' : '—') +
              '</td>' +
              '<td>' +
              escapeHtml(u.activeSessionCount || 0) +
              '</td>' +
              '<td>' +
              escapeHtml(fmtTime(u.createdAt)) +
              '</td>' +
              '<td>' +
              escapeHtml(fmtTime(u.lastLoginAt)) +
              '</td>' +
              '<td class="actions">' +
              banBtn +
              '<button type="button" class="btn small" data-act="kick" data-id="' +
              escapeHtml(u.id) +
              '">踢下线</button>' +
              vipBtn +
              '</td></tr>'
            );
          })
          .join('')
      : '<tr><td colspan="7">无用户</td></tr>';
  }

  async function loadSms() {
    const st = pages.sms;
    const data = await api('/sms-events?page=' + st.page + '&limit=' + st.limit);
    applyPageMeta('sms', data);
    renderPager('sms');
    const items = data.items || [];
    smsBody.innerHTML = items.length
      ? items
          .map(
            (e) =>
              '<tr><td>' +
              escapeHtml(fmtTime(e.at)) +
              '</td><td>' +
              escapeHtml(e.phoneMasked || '—') +
              '</td><td>' +
              (e.ok ? '<span class="badge ok">ok</span>' : '<span class="badge bad">fail</span>') +
              '</td><td>' +
              escapeHtml(e.provider || '—') +
              '</td><td>' +
              escapeHtml(e.errorCode || '—') +
              '</td></tr>',
          )
          .join('')
      : '<tr><td colspan="5">暂无发送记录</td></tr>';
  }

  async function loadVips() {
    const st = pages.vips;
    const data = await api('/vips?page=' + st.page + '&limit=' + st.limit);
    applyPageMeta('vips', data);
    renderPager('vips');
    const items = data.items || [];
    vipBody.innerHTML = items.length
      ? items
          .map(
            (v) =>
              '<tr><td>' +
              escapeHtml(v.userId) +
              '</td><td>' +
              escapeHtml(v.productId || '—') +
              '</td><td>' +
              escapeHtml(v.source || '—') +
              '</td><td>' +
              escapeHtml(v.platform || '—') +
              '</td><td>' +
              escapeHtml(fmtTime(v.updatedAt)) +
              '</td></tr>',
          )
          .join('')
      : '<tr><td colspan="5">暂无 VIP</td></tr>';
  }

  function fmtBytes(n) {
    const v = Number(n) || 0;
    if (v < 1024) return v + ' B';
    if (v < 1024 * 1024) return (v / 1024).toFixed(1) + ' KB';
    return (v / (1024 * 1024)).toFixed(1) + ' MB';
  }

  async function loadContent() {
    const ls = pages.levels;
    const vs = pages.videos;
    const [ov, levels, videos] = await Promise.all([
      api('/content/overview'),
      api(
        '/content/levels?page=' +
          ls.page +
          '&limit=' +
          ls.limit +
          '&mapId=' +
          encodeURIComponent(($('levelMapFilter') && $('levelMapFilter').value) || '') +
          '&status=' +
          encodeURIComponent(($('levelStatusFilter') && $('levelStatusFilter').value) || 'all') +
          '&q=' +
          encodeURIComponent(($('levelQ') && $('levelQ').value.trim()) || ''),
      ),
      api(
        '/content/videos?page=' +
          vs.page +
          '&limit=' +
          vs.limit +
          '&q=' +
          encodeURIComponent(($('videoQ') && $('videoQ').value.trim()) || ''),
      ),
    ]);
    applyPageMeta('levels', levels);
    applyPageMeta('videos', videos);
    renderPager('levels');
    renderPager('videos');

    if ($('ossBaseInput')) {
      $('ossBaseInput').value = (ov.oss && ov.oss.publicBaseUrl) || '';
    }
    if ($('contentOverview')) {
      const c = ov.counts || {};
      const maps = (ov.maps || [])
        .map((m) => m.mapId + ':' + (m.stats && m.stats.withVideo) + 'vid')
        .join(' · ');
      $('contentOverview').textContent =
        '目录更新 ' +
        fmtTime(ov.updatedAt) +
        ' · 关卡 ' +
        (c.levels || 0) +
        '（发布 ' +
        (c.levelsPublished || 0) +
        '） · 视频 ' +
        (c.videos || 0) +
        ' · OSS前缀 ' +
        ((ov.oss && ov.oss.publicBaseUrl) || '未配置') +
        (maps ? ' · ' + maps : '');
    }

    const litems = levels.items || [];
    $('levelsBody').innerHTML = litems.length
      ? litems
          .map((l) => {
            const url = (l.resolved && l.resolved.downloadUrl) || '';
            const localOk = l.resolved && l.resolved.localExists;
            return (
              '<tr>' +
              '<td><strong>' +
              escapeHtml(l.mapId) +
              '</strong> #' +
              escapeHtml(l.levelId) +
              '</td>' +
              '<td>' +
              escapeHtml(l.title) +
              '<div class="muted mono">' +
              escapeHtml(l.slug) +
              '</div></td>' +
              '<td><span class="badge ' +
              (l.status === 'published' ? 'ok' : l.status === 'offline' ? 'bad' : 'warn') +
              '">' +
              escapeHtml(l.status) +
              '</span></td>' +
              '<td class="mono cell-clip" title="' +
              escapeHtml(l.ossKey || '') +
              '">' +
              escapeHtml(l.ossKey || '—') +
              '</td>' +
              '<td class="mono cell-clip" title="' +
              escapeHtml(url) +
              '">' +
              escapeHtml(url || '—') +
              '</td>' +
              '<td>' +
              (localOk ? '<span class="badge ok">有</span>' : '<span class="badge">无</span>') +
              '</td>' +
              '<td class="actions">' +
              '<button type="button" class="btn small" data-lact="publish" data-map="' +
              escapeHtml(l.mapId) +
              '" data-level="' +
              escapeHtml(l.levelId) +
              '">发布</button>' +
              '<button type="button" class="btn small" data-lact="draft" data-map="' +
              escapeHtml(l.mapId) +
              '" data-level="' +
              escapeHtml(l.levelId) +
              '">草稿</button>' +
              '<button type="button" class="btn small" data-lact="offline" data-map="' +
              escapeHtml(l.mapId) +
              '" data-level="' +
              escapeHtml(l.levelId) +
              '">下架</button>' +
              '<button type="button" class="btn small" data-lact="edit-key" data-map="' +
              escapeHtml(l.mapId) +
              '" data-level="' +
              escapeHtml(l.levelId) +
              '" data-key="' +
              escapeHtml(l.ossKey || '') +
              '">改Key</button>' +
              (l.videoId
                ? '<button type="button" class="btn small danger" data-lact="unbind" data-map="' +
                  escapeHtml(l.mapId) +
                  '" data-level="' +
                  escapeHtml(l.levelId) +
                  '">解绑</button>'
                : '') +
              '</td></tr>'
            );
          })
          .join('')
      : '<tr><td colspan="7">无关卡，可先「扫描本地视频」</td></tr>';

    const vitems = videos.items || [];
    $('videosBody').innerHTML = vitems.length
      ? vitems
          .map((v) => {
            const url = (v.resolved && v.resolved.downloadUrl) || '';
            return (
              '<tr>' +
              '<td>' +
              escapeHtml(v.title) +
              '<div class="muted mono">' +
              escapeHtml(v.id) +
              '</div></td>' +
              '<td><span class="badge">' +
              escapeHtml(v.status) +
              '</span></td>' +
              '<td class="mono cell-clip" title="' +
              escapeHtml(v.ossKey) +
              '">' +
              escapeHtml(v.ossKey) +
              '</td>' +
              '<td>' +
              (v.mapId && v.levelId ? escapeHtml(v.mapId + ' #' + v.levelId) : '—') +
              '</td>' +
              '<td>' +
              escapeHtml(fmtBytes(v.bytesTotal)) +
              '</td>' +
              '<td class="mono cell-clip" title="' +
              escapeHtml(url) +
              '">' +
              escapeHtml(url || '—') +
              '</td>' +
              '<td class="actions">' +
              '<button type="button" class="btn small" data-vact="ready" data-id="' +
              escapeHtml(v.id) +
              '">标ready</button>' +
              '<button type="button" class="btn small" data-vact="bind" data-id="' +
              escapeHtml(v.id) +
              '">绑关卡</button>' +
              '<button type="button" class="btn small" data-vact="edit-key" data-id="' +
              escapeHtml(v.id) +
              '" data-key="' +
              escapeHtml(v.ossKey || '') +
              '">改Key</button>' +
              '</td></tr>'
            );
          })
          .join('')
      : '<tr><td colspan="7">无视频记录</td></tr>';
  }

  async function refreshAll() {
    await Promise.all([loadOverview(), loadUsers(), loadSms(), loadVips(), loadContent()]);
  }

  document.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      const name = tab.getAttribute('data-tab');
      ['users', 'sms', 'vip', 'rank', 'levels', 'videos'].forEach((n) => {
        const panel = $('panel-' + n);
        if (panel) panel.hidden = n !== name;
      });
    });
  });

  wirePagers();

  $('loginBtn').addEventListener('click', enter);
  tokenInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') enter();
  });
  $('logoutBtn').addEventListener('click', logout);
  $('refreshBtn').addEventListener('click', () => {
    refreshAll()
      .then(() => showToast('已刷新'))
      .catch((e) => showToast(e.message));
  });
  $('searchUsersBtn').addEventListener('click', () => {
    pages.users.q = userQ.value.trim();
    pages.users.page = 1;
    loadUsers().catch((e) => showToast(e.message));
  });
  userQ.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') $('searchUsersBtn').click();
  });

  usersBody.addEventListener('click', async (ev) => {
    const btn = ev.target.closest('button[data-act]');
    if (!btn) return;
    const id = btn.getAttribute('data-id');
    const act = btn.getAttribute('data-act');
    try {
      if (act === 'ban') {
        if (!confirm('确认封禁？将踢掉全部会话。')) return;
        await api('/users/' + id + '/ban', { method: 'POST', body: { reason: 'admin' } });
        showToast('已封禁');
      } else if (act === 'unban') {
        await api('/users/' + id + '/unban', { method: 'POST', body: {} });
        showToast('已解封');
      } else if (act === 'kick') {
        await api('/users/' + id + '/revoke-sessions', { method: 'POST', body: {} });
        showToast('已踢下线');
      } else if (act === 'vip-on') {
        await api('/users/' + id + '/vip', { method: 'POST', body: {} });
        showToast('已授予 VIP');
      } else if (act === 'vip-off') {
        await api('/users/' + id + '/vip/revoke', { method: 'POST', body: {} });
        showToast('已撤销 VIP');
      }
      await Promise.all([loadUsers(), loadOverview(), loadVips()]);
    } catch (e) {
      showToast(e.message);
    }
  });

  if ($('searchLevelsBtn')) {
    $('searchLevelsBtn').addEventListener('click', () => {
      pages.levels.page = 1;
      loadContent().catch((e) => showToast(e.message));
    });
  }
  if ($('levelQ')) {
    $('levelQ').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        pages.levels.page = 1;
        loadContent().catch((err) => showToast(err.message));
      }
    });
  }
  if ($('levelMapFilter')) {
    $('levelMapFilter').addEventListener('change', () => {
      pages.levels.page = 1;
      loadContent().catch((e) => showToast(e.message));
    });
  }
  if ($('levelStatusFilter')) {
    $('levelStatusFilter').addEventListener('change', () => {
      pages.levels.page = 1;
      loadContent().catch((e) => showToast(e.message));
    });
  }
  if ($('searchVideosBtn')) {
    $('searchVideosBtn').addEventListener('click', () => {
      pages.videos.page = 1;
      loadContent().catch((e) => showToast(e.message));
    });
  }
  if ($('videoQ')) {
    $('videoQ').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        pages.videos.page = 1;
        loadContent().catch((err) => showToast(err.message));
      }
    });
  }
  if ($('saveOssBtn')) {
    $('saveOssBtn').addEventListener('click', async () => {
      try {
        await api('/content/oss', {
          method: 'PATCH',
          body: { publicBaseUrl: $('ossBaseInput').value.trim() },
        });
        showToast('已保存 OSS 前缀');
        await loadContent();
      } catch (e) {
        showToast(e.message);
      }
    });
  }
  if ($('scanLocalBtn')) {
    $('scanLocalBtn').addEventListener('click', async () => {
      try {
        const r = await api('/content/scan-local', { method: 'POST', body: {} });
        showToast('扫描 ' + (r.scanned || 0) + ' 个文件');
        pages.levels.page = 1;
        pages.videos.page = 1;
        await loadContent();
      } catch (e) {
        showToast(e.message);
      }
    });
  }
  if ($('publishPacksBtn')) {
    $('publishPacksBtn').addEventListener('click', async () => {
      if (!confirm('将已发布关卡的视频关系写入 asset-packs.json，确认？')) return;
      try {
        const r = await api('/content/publish-asset-packs', { method: 'POST', body: {} });
        const n = (r.maps || []).reduce((s, m) => s + (m.publishedLevels || 0), 0);
        showToast('已发布 · 远程关 ' + n);
        await loadContent();
      } catch (e) {
        showToast(e.message);
      }
    });
  }
  if ($('registerVideoBtn')) {
    $('registerVideoBtn').addEventListener('click', async () => {
      try {
        const body = {
          ossKey: $('newVideoOssKey').value.trim(),
          title: $('newVideoTitle').value.trim() || undefined,
          mapId: $('newVideoMapId').value.trim() || undefined,
          levelId: $('newVideoLevelId').value ? Number($('newVideoLevelId').value) : undefined,
        };
        await api('/content/videos', { method: 'POST', body });
        showToast('已登记视频');
        $('newVideoOssKey').value = '';
        $('newVideoTitle').value = '';
        pages.videos.page = 1;
        await loadContent();
      } catch (e) {
        showToast(e.message);
      }
    });
  }

  if ($('levelsBody')) {
    $('levelsBody').addEventListener('click', async (ev) => {
      const btn = ev.target.closest('button[data-lact]');
      if (!btn) return;
      const mapId = btn.getAttribute('data-map');
      const levelId = btn.getAttribute('data-level');
      const act = btn.getAttribute('data-lact');
      try {
        if (act === 'publish' || act === 'draft' || act === 'offline') {
          const status = act === 'publish' ? 'published' : act;
          await api('/content/levels/' + mapId + '/' + levelId, {
            method: 'PUT',
            body: { status },
          });
          showToast('关卡已设为 ' + status);
        } else if (act === 'edit-key') {
          const next = prompt('OSS Key（对象路径）', btn.getAttribute('data-key') || '');
          if (next == null) return;
          await api('/content/levels/' + mapId + '/' + levelId, {
            method: 'PUT',
            body: { ossKey: next.trim() },
          });
          showToast('已更新 ossKey');
        } else if (act === 'unbind') {
          await api('/content/levels/' + mapId + '/' + levelId + '/unbind-video', {
            method: 'POST',
            body: {},
          });
          showToast('已解绑视频');
        }
        await loadContent();
      } catch (e) {
        showToast(e.message);
      }
    });
  }

  if ($('videosBody')) {
    $('videosBody').addEventListener('click', async (ev) => {
      const btn = ev.target.closest('button[data-vact]');
      if (!btn) return;
      const id = btn.getAttribute('data-id');
      const act = btn.getAttribute('data-vact');
      try {
        if (act === 'ready') {
          await api('/content/videos/' + id, { method: 'PATCH', body: { status: 'ready' } });
          showToast('已标记 ready');
        } else if (act === 'edit-key') {
          const next = prompt('OSS Key', btn.getAttribute('data-key') || '');
          if (next == null) return;
          await api('/content/videos/' + id, {
            method: 'PATCH',
            body: { ossKey: next.trim() },
          });
          showToast('已更新视频 Key');
        } else if (act === 'bind') {
          const mapId = prompt('绑定到地图 mapId', 'ocean');
          if (!mapId) return;
          const levelId = prompt('关卡号 levelId', '11');
          if (!levelId) return;
          await api('/content/levels/' + mapId.trim() + '/' + Number(levelId) + '/bind-video', {
            method: 'POST',
            body: { videoId: id },
          });
          showToast('已绑定关卡');
        }
        await loadContent();
      } catch (e) {
        showToast(e.message);
      }
    });
  }

  if (getToken()) {
    api('/health')
      .then(() => {
        showApp();
        return refreshAll();
      })
      .catch(() => {
        setToken('');
        showGate('登录已失效，请重新输入 token');
      });
  }
})();
