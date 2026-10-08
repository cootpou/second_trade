/* 登录 / 注册 */
(function (global) {
  'use strict';

  global.Views = global.Views || {};

  var mode = 'login';

  global.Views.login = {
    nav: 'home',
    render: function () {
      return '' +
        '<div class="auth-wrap">' +
          '<div class="card pad">' +
            '<div class="auth-tabs">' +
              '<button class="tab' + (mode === 'login' ? ' active' : '') + '" data-mode="login" type="button">登录</button>' +
              '<button class="tab' + (mode === 'register' ? ' active' : '') + '" data-mode="register" type="button">注册</button>' +
            '</div>' +
            '<div id="auth-body"></div>' +
          '</div>' +
          '<div class="card pad mt-16 small muted">' +
            '<b>测试账号</b><br>zhangsan / 123456<br>lisi / 123456' +
          '</div>' +
        '</div>';
    },

    mount: function (root, params) {
      if (params && params.mode) mode = params.mode;
      var body = root.querySelector('#auth-body');

      function formHtml() {
        if (mode === 'login') {
          return '' +
            '<div class="field"><label>用户名</label>' +
              '<input class="input" id="username" placeholder="请输入用户名" autocomplete="username"></div>' +
            '<div class="field"><label>密码</label>' +
              '<input class="input" id="password" type="password" placeholder="请输入密码" autocomplete="current-password"></div>' +
            '<div class="error-text" id="auth-error"></div>' +
            '<button class="btn btn-block" id="btn-submit" type="button">登录</button>';
        }
        return '' +
          '<div class="field"><label>用户名 *</label>' +
            '<input class="input" id="username" placeholder="登录账号，例如 xiaoming"></div>' +
          '<div class="field"><label>密码 *</label>' +
            '<input class="input" id="password" type="password" placeholder="至少 6 位"></div>' +
          '<div class="form-grid">' +
            '<div class="field"><label>真实姓名</label><input class="input" id="realName" placeholder="选填"></div>' +
            '<div class="field"><label>学号</label><input class="input" id="studentId" placeholder="选填"></div>' +
            '<div class="field"><label>手机号</label><input class="input" id="phone" placeholder="选填"></div>' +
            '<div class="field"><label>邮箱</label><input class="input" id="email" placeholder="选填"></div>' +
          '</div>' +
          '<div class="error-text" id="auth-error"></div>' +
          '<button class="btn btn-block" id="btn-submit" type="button">注册并登录</button>';
      }

      function renderForm() {
        body.innerHTML = formHtml();
        var submit = body.querySelector('#btn-submit');
        submit.addEventListener('click', onsubmit);
        var pwd = body.querySelector('#password');
        pwd.addEventListener('keydown', function (e) { if (e.key === 'Enter') onsubmit(); });
      }

      function onsubmit() {
        var err = body.querySelector('#auth-error');
        var username = body.querySelector('#username').value.trim();
        var password = body.querySelector('#password').value;
        err.textContent = '';
        if (!username) { err.textContent = '请输入用户名'; return; }
        if (!password) { err.textContent = '请输入密码'; return; }

        var btn = body.querySelector('#btn-submit');
        btn.disabled = true;

        if (mode === 'login') {
          API.login(username, password).then(function (data) {
            Store.setAuth({ id: data.id, username: data.username }, data.token);
            U.toast('欢迎回来，' + data.username, 'success');
            location.hash = '#/home';
          }).catch(function (e) {
            err.textContent = e.message;
            btn.disabled = false;
          });
          return;
        }

        var dto = {
          username: username,
          password: password,
          realName: body.querySelector('#realName').value.trim() || null,
          studentId: body.querySelector('#studentId').value.trim() || null,
          phone: body.querySelector('#phone').value.trim() || null,
          email: body.querySelector('#email').value.trim() || null
        };
        API.register(dto).then(function () {
          return API.login(username, password);
        }).then(function (data) {
          Store.setAuth({ id: data.id, username: data.username }, data.token);
          U.toast('注册成功，已自动登录', 'success');
          location.hash = '#/home';
        }).catch(function (e) {
          err.textContent = e.message;
          btn.disabled = false;
        });
      }

      root.querySelector('.auth-tabs').addEventListener('click', function (e) {
        var tab = e.target.closest('[data-mode]');
        if (!tab) return;
        mode = tab.getAttribute('data-mode');
        root.querySelectorAll('.auth-tabs .tab').forEach(function (el) {
          el.classList.toggle('active', el === tab);
        });
        renderForm();
      });

      renderForm();
    }
  };
})(window);
