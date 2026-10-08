/* 登录态存储（token 放 localStorage，请求时通过 token 头带给后端） */
(function (global) {
  'use strict';

  var TOKEN_KEY = 'sht_token';
  var USER_KEY = 'sht_user';

  var state = {
    token: null,
    user: null,
    unread: 0
  };

  function load() {
    try {
      state.token = localStorage.getItem(TOKEN_KEY) || null;
      var raw = localStorage.getItem(USER_KEY);
      state.user = raw ? JSON.parse(raw) : null;
    } catch (e) {
      state.token = null;
      state.user = null;
    }
  }

  load();

  global.Store = {
    get token() { return state.token; },
    get user() { return state.user; },
    get userId() { return state.user ? state.user.id : null; },
    get username() { return state.user ? state.user.username : null; },
    get isLogin() { return !!(state.token && state.user); },
    get unread() { return state.unread; },

    setUnread: function (n) { state.unread = n || 0; },

    setAuth: function (user, token) {
      state.user = user;
      state.token = token;
      try {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      } catch (e) { /* ignore */ }
    },

    logout: function () {
      state.token = null;
      state.user = null;
      state.unread = 0;
      try {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      } catch (e) { /* ignore */ }
    }
  };
})(window);
