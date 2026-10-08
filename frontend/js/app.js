/* 应用入口：哈希路由 + 顶栏状态 */
(function (global) {
  'use strict';

  var viewEl = document.getElementById('view');
  var navEl = document.getElementById('nav');
  var userEl = document.getElementById('user-area');
  var badgeEl = document.getElementById('unread-badge');
  var notFound = {
    nav: '',
    render: function () {
      return U.empty('页面不存在，回到商品广场看看吧', '🧭') +
        '<div class="mt-16" style="text-align:center"><a class="btn" href="#/home">返回首页</a></div>';
    }
  };

  var routes = [
    { re: /^\/?$|^\/home$/, view: 'home' },
    { re: /^\/product\/(\d+)$/, view: 'productDetail', keys: ['id'] },
    { re: /^\/publish$/, view: 'publish' },
    { re: /^\/edit\/(\d+)$/, view: 'editProduct', keys: ['id'] },
    { re: /^\/login$/, view: 'login' },
    { re: /^\/me\/products$/, view: 'myProducts' },
    { re: /^\/me\/favorites$/, view: 'favorites' },
    { re: /^\/me\/orders$/, view: 'orders' },
    { re: /^\/me\/messages$/, view: 'messages' },
    { re: /^\/me\/profile$/, view: 'profile' }
  ];

  function parseHash() {
    var raw = location.hash.replace(/^#/, '') || '/home';
    var parts = raw.split('?');
    var path = parts[0] || '/home';
    var query = {};
    if (parts[1]) {
      parts[1].split('&').forEach(function (kv) {
        if (!kv) return;
        var i = kv.indexOf('=');
        var k = i === -1 ? kv : kv.slice(0, i);
        var v = i === -1 ? '' : decodeURIComponent(kv.slice(i + 1));
        query[k] = v;
      });
    }
    return { path: path, query: query };
  }

  function resolve(path) {
    for (var i = 0; i < routes.length; i++) {
      var m = routes[i].re.exec(path);
      if (m) {
        var params = {};
        (routes[i].keys || []).forEach(function (key, idx) { params[key] = m[idx + 1]; });
        return { name: routes[i].view, params: params };
      }
    }
    return { name: null, params: {} };
  }

  function renderHeader(viewName) {
    navEl.querySelectorAll('a').forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('data-nav') === viewName);
    });

    if (Store.isLogin) {
      var name = Store.username || '我';
      userEl.innerHTML =
        '<a class="user-chip" href="#/me/profile" title="个人中心">' +
          '<span class="avatar">' + U.esc(name.charAt(0).toUpperCase()) + '</span>' +
          '<span>' + U.esc(name) + '</span>' +
        '</a>' +
        '<button class="btn btn-ghost btn-sm" id="btn-logout-top" type="button">退出</button>';
      userEl.querySelector('#btn-logout-top').addEventListener('click', function () {
        Store.logout();
        U.toast('已退出登录');
        location.hash = '#/home';
        renderHeader(currentNav);
      });
    } else {
      userEl.innerHTML =
        '<a class="btn btn-ghost btn-sm" href="#/login">登录</a>' +
        '<a class="btn btn-sm" href="#/login?mode=register">注册</a>';
    }

    if (badgeEl) {
      var unread = Store.unread || 0;
      badgeEl.hidden = !unread;
      badgeEl.textContent = unread > 99 ? '99+' : unread;
    }
  }

  var currentNav = '';

  function dispatch() {
    var parsed = parseHash();
    var matched = resolve(parsed.path);
    var view = matched.name ? Views[matched.name] : null;
    if (!view) view = notFound;

    var params = Object.assign({}, matched.params, parsed.query);
    currentNav = view.nav || '';

    if (typeof global.__stopMessagePolling === 'function' && matched.name !== 'messages') {
      global.__stopMessagePolling();
      global.__stopMessagePolling = null;
    }

    document.title = (view.title ? view.title + ' · ' : '') + '校园二手交易平台';
    viewEl.innerHTML = view.render(params) || '';
    renderHeader(currentNav);
    try {
      view.mount(viewEl, params);
    } catch (e) {
      console.error(e);
      viewEl.innerHTML = U.empty('页面渲染出错：' + e.message, '⚠️');
    }
    window.scrollTo({ top: 0 });
    refreshUnread();
  }

  function refreshUnread() {
    if (!Store.isLogin) {
      Store.setUnread(0);
      if (badgeEl) badgeEl.hidden = true;
      return;
    }
    API.unreadCount().then(function (n) {
      Store.setUnread(n || 0);
      if (badgeEl && navEl) {
        var unread = Store.unread;
        badgeEl.hidden = !unread;
        badgeEl.textContent = unread > 99 ? '99+' : unread;
      }
    }).catch(function () { /* 忽略未读数错误 */ });
  }

  window.addEventListener('hashchange', dispatch);
  setInterval(refreshUnread, 20000);

  if (!location.hash) location.hash = '#/home';
  dispatch();
})(window);
