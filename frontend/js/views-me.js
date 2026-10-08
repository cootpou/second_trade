/* 我的商品 / 我的收藏 / 我的订单 / 个人中心 */
(function (global) {
  'use strict';

  global.Views = global.Views || {};

  function pagerHtml(page, total, pageSize) {
    var totalPages = Math.max(1, Math.ceil((total || 0) / pageSize));
    if (!total) return '';
    return '<div class="pager">' +
      '<button class="btn btn-ghost btn-sm" data-page="' + (page - 1) + '"' + (page <= 1 ? ' disabled' : '') + '>上一页</button>' +
      '<span class="page-info">第 ' + page + ' / ' + totalPages + ' 页 · 共 ' + total + ' 条</span>' +
      '<button class="btn btn-ghost btn-sm" data-page="' + (page + 1) + '"' + (page >= totalPages ? ' disabled' : '') + '>下一页</button>' +
      '</div>';
  }

  function bindPager(root, onPage) {
    root.addEventListener('click', function (e) {
      var btn = e.target.closest('.pager [data-page]');
      if (!btn || btn.disabled) return;
      var page = parseInt(btn.getAttribute('data-page'), 10);
      if (!isNaN(page) && page >= 1) onPage(page);
    });
  }

  function guardLogin() {
    if (Store.isLogin) return true;
    U.toast('请先登录', 'error');
    location.hash = '#/login';
    return false;
  }

  /* ------------------------- 我发布的商品 ------------------------- */
  var myProductState = { page: 1, pageSize: 10, status: '' };

  global.Views.myProducts = {
    nav: 'products',
    render: function () {
      return '<div class="page-head">' +
          '<div><h2 class="page-title">我的商品</h2>' +
            '<p class="page-sub">管理你发布的闲置宝贝，可上下架或删除</p></div>' +
          '<a class="btn" href="#/publish">+ 发布新商品</a>' +
        '</div>' +
        '<div class="tabs" id="status-tabs">' +
          '<button class="tab active" data-status="" type="button">全部</button>' +
          '<button class="tab" data-status="active" type="button">在售</button>' +
          '<button class="tab" data-status="sold" type="button">已售出</button>' +
          '<button class="tab" data-status="offline" type="button">已下架</button>' +
        '</div>' +
        '<div id="list-area">' + U.loading('加载中…') + '</div>' +
        '<div id="pager-area"></div>';
    },

    mount: function (root) {
      if (!guardLogin()) return;
      var area = root.querySelector('#list-area');
      var pagerArea = root.querySelector('#pager-area');

      function load() {
        area.innerHTML = U.loading('加载中…');
        API.myProducts({
          page: myProductState.page,
          pageSize: myProductState.pageSize,
          status: myProductState.status
        }).then(function (data) {
          var records = (data && data.records) || [];
          if (!records.length) {
            area.innerHTML = U.empty('还没有商品，去发布一件闲置吧～', '🧺');
            pagerArea.innerHTML = '';
            return;
          }
          area.innerHTML = '<div class="list">' + records.map(function (p) {
            var toggleText = p.status === 'active' ? '下架' :
              (p.status === 'sold' ? '' : '上架');
            return '<div class="list-item">' +
              '<div class="list-thumb">' + U.imageHtml(p.imagePath, p.title) + '</div>' +
              '<div class="list-main">' +
                '<div class="list-title">' + U.esc(p.title) + '</div>' +
                '<div class="product-meta">' +
                  '<span class="tag ' + (p.status === 'active' ? 'tag-success' :
                    (p.status === 'sold' ? 'tag-danger' : 'tag')) + '">' + U.statusText(p.status) + '</span>' +
                  '<span class="tag">' + U.esc(p.category || '其他') + '</span>' +
                  (p.condition ? '<span class="tag">' + U.esc(p.condition) + '</span>' : '') +
                  '<span class="price">¥' + U.money(p.price) + '</span>' +
                '</div>' +
                '<div class="small muted mt-8">浏览 ' + (p.viewCount || 0) + ' · 收藏 ' + (p.likeCount || 0) +
                  ' · 发布于 ' + U.time(p.createdAt) + '</div>' +
              '</div>' +
              '<div class="list-actions">' +
                '<a class="btn btn-ghost btn-sm" href="#/product/' + p.id + '">查看</a>' +
                '<a class="btn btn-ghost btn-sm" href="#/edit/' + p.id + '">编辑</a>' +
                (toggleText ? '<button class="btn btn-ghost btn-sm" data-toggle="' + p.id + '" data-status="' +
                  (p.status === 'active' ? 'offline' : 'active') + '" type="button">' + toggleText + '</button>' : '') +
                '<button class="btn btn-danger btn-sm" data-del="' + p.id + '" data-title="' + U.esc(p.title) +
                  '" type="button">删除</button>' +
              '</div>' +
            '</div>';
          }).join('') + '</div>';
          pagerArea.innerHTML = pagerHtml(myProductState.page, data.total, myProductState.pageSize);
        }).catch(function (err) {
          area.innerHTML = U.empty('加载失败：' + err.message, '⚠️');
        });
      }

      root.querySelector('#status-tabs').addEventListener('click', function (e) {
        var tab = e.target.closest('[data-status]');
        if (!tab) return;
        root.querySelectorAll('#status-tabs .tab').forEach(function (el) {
          el.classList.toggle('active', el === tab);
        });
        myProductState.status = tab.getAttribute('data-status');
        myProductState.page = 1;
        load();
      });

      area.addEventListener('click', function (e) {
        var toggle = e.target.closest('[data-toggle]');
        if (toggle) {
          API.updateProductStatus(toggle.getAttribute('data-toggle'), toggle.getAttribute('data-status'))
            .then(function () {
              U.toast(toggle.getAttribute('data-status') === 'active' ? '已上架' : '已下架', 'success');
              load();
            }).catch(function (err) { U.toast(err.message, 'error'); });
          return;
        }
        var del = e.target.closest('[data-del]');
        if (del) {
          U.confirm('删除商品', '确定删除「' + del.getAttribute('data-title') + '」吗？').then(function (ok) {
            if (!ok) return;
            API.deleteProduct(del.getAttribute('data-del')).then(function () {
              U.toast('已删除', 'success');
              load();
            }).catch(function (err) { U.toast(err.message, 'error'); });
          });
        }
      });

      bindPager(root, function (page) { myProductState.page = page; load(); });
      load();
    }
  };

  /* ------------------------- 我的收藏 ------------------------- */
  var favState = { page: 1, pageSize: 10 };

  global.Views.favorites = {
    nav: 'favorites',
    render: function () {
      return '<div class="page-head"><div><h2 class="page-title">我的收藏</h2>' +
        '<p class="page-sub">收藏的商品都在这里</p></div></div>' +
        '<div id="list-area">' + U.loading('加载中…') + '</div>' +
        '<div id="pager-area"></div>';
    },
    mount: function (root) {
      if (!guardLogin()) return;
      var area = root.querySelector('#list-area');
      var pagerArea = root.querySelector('#pager-area');

      function load() {
        area.innerHTML = U.loading('加载中…');
        API.myFavorites({ page: favState.page, pageSize: favState.pageSize }).then(function (data) {
          var records = (data && data.records) || [];
          if (!records.length) {
            area.innerHTML = U.empty('还没有收藏任何商品', '💛');
            pagerArea.innerHTML = '';
            return;
          }
          area.innerHTML = '<div class="list">' + records.map(function (f) {
            return '<div class="list-item">' +
              '<div class="list-thumb">' + U.imageHtml(f.productImage, f.productTitle) + '</div>' +
              '<div class="list-main">' +
                '<div class="list-title">' + U.esc(f.productTitle) + '</div>' +
                '<div class="product-meta">' +
                  '<span class="tag ' + (f.productStatus === 'active' ? 'tag-success' : 'tag') + '">' +
                    U.statusText(f.productStatus) + '</span>' +
                  '<span class="tag">卖家：' + U.esc(f.sellerName || '匿名') + '</span>' +
                  '<span class="price">¥' + U.money(f.productPrice) + '</span>' +
                '</div>' +
                '<div class="small muted mt-8">收藏于 ' + U.time(f.createdAt) + '</div>' +
              '</div>' +
              '<div class="list-actions">' +
                '<a class="btn btn-ghost btn-sm" href="#/product/' + f.productId + '">查看</a>' +
                '<button class="btn btn-danger btn-sm" data-del="' + f.productId + '" type="button">取消收藏</button>' +
              '</div>' +
            '</div>';
          }).join('') + '</div>';
          pagerArea.innerHTML = pagerHtml(favState.page, data.total, favState.pageSize);
        }).catch(function (err) {
          area.innerHTML = U.empty('加载失败：' + err.message, '⚠️');
        });
      }

      area.addEventListener('click', function (e) {
        var del = e.target.closest('[data-del]');
        if (!del) return;
        API.removeFavorite(del.getAttribute('data-del')).then(function () {
          U.toast('已取消收藏', 'success');
          load();
        }).catch(function (err) { U.toast(err.message, 'error'); });
      });

      bindPager(root, function (page) { favState.page = page; load(); });
      load();
    }
  };

  /* ------------------------- 我的订单 ------------------------- */
  var orderState = { tab: 'buyer', page: 1, pageSize: 10, status: '' };

  function orderItem(order, tab) {
    var actions = [];
    if (tab === 'buyer') {
      if (order.status === 'pending') {
        actions.push('<button class="btn btn-sm" data-pay="' + order.id + '" type="button">立即付款</button>');
        actions.push('<button class="btn btn-danger btn-sm" data-cancel="' + order.id + '" type="button">取消订单</button>');
      }
    } else {
      if (order.status === 'paid') {
        actions.push('<button class="btn btn-success btn-sm" data-complete="' + order.id + '" type="button">确认完成</button>');
      }
    }
    actions.push('<a class="btn btn-ghost btn-sm" href="#/product/' + order.productId + '">商品</a>');
    if (order.sellerId && tab === 'buyer') {
      actions.push('<a class="btn btn-ghost btn-sm" href="#/me/messages?other=' + order.sellerId +
        '&product=' + order.productId + '">联系卖家</a>');
    }
    if (order.buyerId && tab === 'seller') {
      actions.push('<a class="btn btn-ghost btn-sm" href="#/me/messages?other=' + order.buyerId +
        '&product=' + order.productId + '">联系买家</a>');
    }

    return '<div class="list-item">' +
      '<div class="list-thumb">' + U.imageHtml(order.productImage, order.productTitle) + '</div>' +
      '<div class="list-main">' +
        '<div class="list-title">' + U.esc(order.productTitle || '商品已删除') + '</div>' +
        '<div class="product-meta">' +
          '<span class="tag ' + U.orderStatusClass(order.status) + '">' + U.orderStatusText(order.status) + '</span>' +
          '<span class="tag">订单号 #' + order.id + '</span>' +
          '<span class="price">¥' + U.money(order.price) + '</span>' +
          (order.paymentMethod ? '<span class="tag">' + U.esc(order.paymentMethod) + '</span>' : '') +
          (order.deliveryMethod ? '<span class="tag">' + U.esc(order.deliveryMethod) + '</span>' : '') +
        '</div>' +
        '<div class="small muted mt-8">' +
          U.esc(tab === 'buyer' ? ('卖家：' + (order.sellerName || '匿名')) : ('买家：' + (order.buyerName || '匿名'))) +
          ' · 下单 ' + U.time(order.createdAt) +
          (order.meetupLocation ? ' · 见面地点：' + U.esc(order.meetupLocation) : '') +
          (order.completedAt ? ' · 完成 ' + U.time(order.completedAt) : '') +
        '</div>' +
      '</div>' +
      '<div class="list-actions">' + actions.join('') + '</div>' +
    '</div>';
  }

  global.Views.orders = {
    nav: 'orders',
    render: function (params) {
      if (params && params.tab) orderState.tab = params.tab;
      return '<div class="page-head"><div><h2 class="page-title">我的订单</h2>' +
        '<p class="page-sub">下单后 30 分钟未付款会自动取消</p></div></div>' +
        '<div class="tabs" id="order-tabs">' +
          '<button class="tab' + (orderState.tab === 'buyer' ? ' active' : '') + '" data-tab="buyer" type="button">我买到的</button>' +
          '<button class="tab' + (orderState.tab === 'seller' ? ' active' : '') + '" data-tab="seller" type="button">我卖出的</button>' +
        '</div>' +
        '<div class="filters"><select class="select" id="order-status" style="width:150px">' +
          '<option value="">全部状态</option>' +
          '<option value="pending">待付款</option>' +
          '<option value="paid">待收货</option>' +
          '<option value="completed">已完成</option>' +
          '<option value="cancelled">已取消</option>' +
        '</select></div>' +
        '<div id="list-area">' + U.loading('加载中…') + '</div>' +
        '<div id="pager-area"></div>';
    },
    mount: function (root) {
      if (!guardLogin()) return;
      var area = root.querySelector('#list-area');
      var pagerArea = root.querySelector('#pager-area');
      var statusSelect = root.querySelector('#order-status');
      statusSelect.value = orderState.status;

      function load() {
        area.innerHTML = U.loading('加载中…');
        var call = orderState.tab === 'buyer' ? API.buyerOrders : API.sellerOrders;
        call.call(API, {
          page: orderState.page,
          pageSize: orderState.pageSize,
          status: orderState.status
        }).then(function (data) {
          var records = (data && data.records) || [];
          if (!records.length) {
            area.innerHTML = U.empty(orderState.tab === 'buyer' ? '还没有买到的订单' : '还没有卖出的订单', '🧾');
            pagerArea.innerHTML = '';
            return;
          }
          area.innerHTML = '<div class="list">' + records.map(function (o) {
            return orderItem(o, orderState.tab);
          }).join('') + '</div>';
          pagerArea.innerHTML = pagerHtml(orderState.page, data.total, orderState.pageSize);
        }).catch(function (err) {
          area.innerHTML = U.empty('加载失败：' + err.message, '⚠️');
        });
      }

      root.querySelector('#order-tabs').addEventListener('click', function (e) {
        var tab = e.target.closest('[data-tab]');
        if (!tab) return;
        root.querySelectorAll('#order-tabs .tab').forEach(function (el) {
          el.classList.toggle('active', el === tab);
        });
        orderState.tab = tab.getAttribute('data-tab');
        orderState.page = 1;
        load();
      });

      statusSelect.addEventListener('change', function () {
        orderState.status = statusSelect.value;
        orderState.page = 1;
        load();
      });

      area.addEventListener('click', function (e) {
        var pay = e.target.closest('[data-pay]');
        if (pay) {
          API.payOrder(pay.getAttribute('data-pay')).then(function () {
            U.toast('付款成功，等待卖家发货', 'success');
            load();
          }).catch(function (err) { U.toast(err.message, 'error'); });
          return;
        }
        var cancel = e.target.closest('[data-cancel]');
        if (cancel) {
          U.confirm('取消订单', '确定要取消这笔订单吗？商品会重新上架。').then(function (ok) {
            if (!ok) return;
            API.cancelOrder(cancel.getAttribute('data-cancel')).then(function () {
              U.toast('订单已取消', 'success');
              load();
            }).catch(function (err) { U.toast(err.message, 'error'); });
          });
          return;
        }
        var complete = e.target.closest('[data-complete]');
        if (complete) {
          U.confirm('确认完成', '确认已完成交易吗？').then(function (ok) {
            if (!ok) return;
            API.completeOrder(complete.getAttribute('data-complete')).then(function () {
              U.toast('订单已完成', 'success');
              load();
            }).catch(function (err) { U.toast(err.message, 'error'); });
          });
        }
      });

      bindPager(root, function (page) { orderState.page = page; load(); });
      load();
    }
  };

  /* ------------------------- 个人中心 ------------------------- */
  global.Views.profile = {
    nav: 'profile',
    render: function () {
      if (!Store.isLogin) {
        return '<div class="auth-wrap">' + U.empty('请先登录后查看个人中心', '🔑') +
          '<div class="mt-16" style="text-align:center"><a class="btn" href="#/login">去登录</a></div></div>';
      }
      return '<div id="profile-area">' + U.loading('加载中…') + '</div>';
    },
    mount: function (root) {
      if (!Store.isLogin) return;
      var area = root.querySelector('#profile-area');
      area.innerHTML = U.loading('加载中…');

      Promise.all([
        API.currentUser(),
        API.unreadCount().catch(function () { return 0; })
      ]).then(function (res) {
        var user = res[0] || {};
        var unread = res[1] || 0;
        area.innerHTML = '' +
          '<div class="profile-head">' +
            '<div class="profile-avatar">' + U.esc((user.username || '?').charAt(0).toUpperCase()) + '</div>' +
            '<div class="flex-1">' +
              '<div style="font-size:20px;font-weight:700">' + U.esc(user.username) + '</div>' +
              '<div style="opacity:.9;font-size:13px;margin-top:4px">' +
                U.esc(user.realName || '未填写姓名') + ' · ' +
                U.esc(user.role === 'student' ? '学生用户' : (user.role || '用户')) +
                ' · 学号 ' + U.esc(user.studentId || '未填写') + '</div>' +
            '</div>' +
            '<button class="btn btn-ghost" id="btn-logout" type="button">退出登录</button>' +
          '</div>' +
          '<div class="stat-grid">' +
            '<div class="stat"><div class="stat-num">' + (user.creditScore === null || user.creditScore === undefined ? '-' : user.creditScore) + '</div>' +
              '<div class="stat-label">信用分</div></div>' +
            '<div class="stat"><div class="stat-num">¥' + U.money(user.balance) + '</div>' +
              '<div class="stat-label">账户余额</div></div>' +
            '<div class="stat"><div class="stat-num">' + (user.verified ? '已认证' : '未认证') + '</div>' +
              '<div class="stat-label">身份认证</div></div>' +
            '<div class="stat"><div class="stat-num">' + unread + '</div>' +
              '<div class="stat-label">未读消息</div></div>' +
          '</div>' +
          '<div class="card pad mt-16">' +
            '<h3 style="margin:0 0 14px;font-size:16px">账号信息</h3>' +
            '<dl class="kv">' +
              '<dt>用户 ID</dt><dd>' + U.esc(user.id) + '</dd>' +
              '<dt>手机号</dt><dd>' + U.esc(user.phone || '未填写') + '</dd>' +
              '<dt>邮箱</dt><dd>' + U.esc(user.email || '未填写') + '</dd>' +
              '<dt>注册时间</dt><dd>' + U.time(user.createdAt) + '</dd>' +
              '<dt>上次登录</dt><dd>' + U.time(user.lastLogin) + '</dd>' +
            '</dl>' +
          '</div>' +
          '<div class="flex gap-12 mt-16">' +
            '<a class="btn btn-ghost" href="#/me/products">我的商品</a>' +
            '<a class="btn btn-ghost" href="#/me/favorites">我的收藏</a>' +
            '<a class="btn btn-ghost" href="#/me/orders">我的订单</a>' +
            '<a class="btn btn-ghost" href="#/me/messages">我的消息</a>' +
          '</div>';

        area.querySelector('#btn-logout').addEventListener('click', function () {
          Store.logout();
          U.toast('已退出登录');
          location.hash = '#/home';
        });
      }).catch(function (err) {
        area.innerHTML = U.empty('加载失败：' + err.message, '⚠️');
      });
    }
  };
})(window);
