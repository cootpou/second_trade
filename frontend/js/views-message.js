/* 我的消息：会话列表 + 聊天窗口 */
(function (global) {
  'use strict';

  global.Views = global.Views || {};

  var current = { otherId: null, productId: null, name: '' };
  var timer = null;

  function stopPolling() {
    if (timer) { clearInterval(timer); timer = null; }
  }

  global.Views.messages = {
    nav: 'messages',
    render: function () {
      return '<div class="page-head"><div><h2 class="page-title">我的消息</h2>' +
        '<p class="page-sub">和买家 / 卖家沟通交易细节</p></div></div>' +
        '<div class="msg-layout">' +
          '<div class="card" style="overflow:hidden;display:flex;flex-direction:column">' +
            '<div class="chat-head">会话列表</div>' +
            '<div class="conv-list" id="conv-list"><div class="muted small pad">加载中…</div></div>' +
          '</div>' +
          '<div class="card chat" id="chat">' +
            '<div class="chat-head" id="chat-head">选择左侧会话开始聊天</div>' +
            '<div class="chat-body" id="chat-body">' +
              '<div class="muted" style="margin:auto">还没有选择会话</div>' +
            '</div>' +
            '<div class="chat-foot" id="chat-foot" style="display:none">' +
              '<input class="input" id="msg-input" placeholder="输入消息，回车发送">' +
              '<button class="btn" id="btn-send" type="button">发送</button>' +
            '</div>' +
          '</div>' +
        '</div>';
    },

    mount: function (root, params) {
      if (!Store.isLogin) { location.hash = '#/login'; return; }
      stopPolling();

      var convList = root.querySelector('#conv-list');
      var chatBody = root.querySelector('#chat-body');
      var chatHead = root.querySelector('#chat-head');
      var chatFoot = root.querySelector('#chat-foot');
      var input = root.querySelector('#msg-input');

      function loadConversations() {
        return API.conversations().then(function (list) {
          list = list || [];
          if (!list.length) {
            convList.innerHTML = '<div class="muted small pad">暂无会话，去商品页联系卖家试试～</div>';
            return list;
          }
          convList.innerHTML = list.map(function (c) {
            var otherId = c.user1Id === Store.userId ? c.user2Id : c.user1Id;
            var active = String(otherId) === String(current.otherId) ? ' active' : '';
            return '<div class="conv-item' + active + '" data-other="' + otherId +
              '" data-name="' + U.esc(c.otherUserName || ('用户' + otherId)) +
              '" data-product="' + (c.productId === null || c.productId === undefined ? '' : c.productId) + '">' +
              '<div class="avatar">' + U.esc((c.otherUserName || '?').charAt(0).toUpperCase()) + '</div>' +
              '<div class="conv-main">' +
                '<div class="conv-name">' + U.esc(c.otherUserName || ('用户' + otherId)) +
                  (c.unreadCount ? '<span class="badge" style="position:static">' + c.unreadCount + '</span>' : '') + '</div>' +
                '<div class="conv-last">' + U.esc(c.lastMessageContent || '暂无消息') + '</div>' +
              '</div>' +
            '</div>';
          }).join('');
          return list;
        }).catch(function (err) {
          convList.innerHTML = '<div class="muted small pad">加载失败：' + U.esc(err.message) + '</div>';
          return [];
        });
      }

      function renderMessages(list) {
        if (!list || !list.length) {
          chatBody.innerHTML = '<div class="muted" style="margin:auto">还没有聊天记录，打个招呼吧 👋</div>';
          return;
        }
        chatBody.innerHTML = list.map(function (m) {
          var mine = m.senderId === Store.userId;
          return '<div class="bubble-row' + (mine ? ' mine' : '') + '">' +
            '<div class="bubble">' + U.esc(m.content) + '</div>' +
            '<div class="bubble-time">' + U.time(m.createdAt) + '</div>' +
          '</div>';
        }).join('');
        chatBody.scrollTop = chatBody.scrollHeight;
      }

      function openChat(otherId, productId, name) {
        if (!otherId) return;
        current.otherId = String(otherId);
        current.productId = productId ? String(productId) : '';
        current.name = name || ('用户' + otherId);
        chatHead.textContent = '与 ' + current.name + ' 的聊天' +
          (current.productId ? '（商品 #' + current.productId + '）' : '');
        chatFoot.style.display = 'flex';
        chatBody.innerHTML = '<div class="muted" style="margin:auto">加载中…</div>';
        refresh();
        stopPolling();
        timer = setInterval(refresh, 5000);
      }

      function refresh() {
        if (!current.otherId) return;
        API.conversation(current.otherId, current.productId || null).then(function (list) {
          renderMessages(list);
        }).catch(function (err) {
          chatBody.innerHTML = '<div class="muted" style="margin:auto">' + U.esc(err.message) + '</div>';
        });
      }

      function send() {
        var content = input.value.trim();
        if (!content) return;
        if (!current.otherId) { U.toast('请先选择一位聊天的用户', 'error'); return; }
        input.value = '';
        API.sendMessage({
          receiverId: Number(current.otherId),
          productId: current.productId ? Number(current.productId) : null,
          content: content,
          messageType: 'text'
        }).then(function () {
          refresh();
          loadConversations();
        }).catch(function (err) {
          U.toast(err.message, 'error');
          input.value = content;
        });
      }

      convList.addEventListener('click', function (e) {
        var item = e.target.closest('.conv-item');
        if (!item) return;
        convList.querySelectorAll('.conv-item').forEach(function (el) { el.classList.remove('active'); });
        item.classList.add('active');
        openChat(item.getAttribute('data-other'), item.getAttribute('data-product'), item.getAttribute('data-name'));
      });

      root.querySelector('#btn-send').addEventListener('click', send);
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') send();
      });

      // 从商品页跳转过来：直接打开与卖家的会话
      var other = params && params.other;
      var product = params && params.product;

      loadConversations().then(function (list) {
        if (other) {
          var found = (list || []).filter(function (c) {
            var otherId = c.user1Id === Store.userId ? c.user2Id : c.user1Id;
            return String(otherId) === String(other);
          })[0];
          openChat(other, product, found ? found.otherUserName : null);
          var target = convList.querySelector('[data-other="' + other + '"]');
          if (target) target.classList.add('active');
        } else if ((list || []).length) {
          var first = list[0];
          var firstId = first.user1Id === Store.userId ? first.user2Id : first.user1Id;
          convList.querySelector('.conv-item').classList.add('active');
          openChat(firstId, first.productId, first.otherUserName);
        }
      });

      // 离开页面时停止轮询
      global.__stopMessagePolling = stopPolling;
    }
  };
})(window);
