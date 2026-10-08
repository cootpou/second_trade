/* 商品广场 + 商品详情 */
(function (global) {
  'use strict';

  global.Views = global.Views || {};

  function requireLogin() {
    if (Store.isLogin) return true;
    U.toast('请先登录', 'error');
    location.hash = '#/login';
    return false;
  }

  function statusFlag(product) {
    if (product.status === 'sold') return '<span class="status-flag sold">已售出</span>';
    if (product.status === 'offline') return '<span class="status-flag offline">已下架</span>';
    return '';
  }

  function productCard(product) {
    return '' +
      '<article class="product-card" data-id="' + product.id + '">' +
        '<div class="thumb">' + U.imageHtml(product.imagePath, product.title) + statusFlag(product) + '</div>' +
        '<div class="product-body">' +
          '<div class="product-title">' + U.esc(product.title) + '</div>' +
          '<div class="product-meta">' +
            '<span class="tag tag-primary">' + U.esc(product.category || '其他') + '</span>' +
            (product.condition ? '<span class="tag">' + U.esc(product.condition) + '</span>' : '') +
          '</div>' +
          '<div class="product-foot">' +
            '<div><span class="price price-now"><span class="unit">¥</span>' + U.money(product.price) + '</span>' +
              (product.originalPrice && Number(product.originalPrice) > Number(product.price)
                ? ' <span class="price-old">¥' + U.money(product.originalPrice) + '</span>' : '') +
            '</div>' +
          '</div>' +
          '<div class="small muted">' + U.esc(product.sellerName || '匿名') + ' · ' +
            U.esc(product.location || '校内') + ' · ' + U.time(product.createdAt) + '</div>' +
        '</div>' +
      '</article>';
  }

  var homeState = {
    page: 1,
    pageSize: 12,
    keyword: '',
    category: '',
    status: 'active',
    categories: [],
    total: 0
  };

  global.Views.home = {
    nav: 'home',
    render: function () {
      return '' +
        '<section class="hero">' +
          '<h1>校园二手 · 让闲置流动起来</h1>' +
          '<p>教材、数码、生活用品…… 同校同学，当面交易，更省心</p>' +
          '<div class="search-bar">' +
            '<input class="input" id="keyword" placeholder="搜索你想要的宝贝，例如：教材、耳机、自行车" value="' + U.esc(homeState.keyword) + '">' +
            '<button class="btn" id="btn-search" type="button">搜索</button>' +
          '</div>' +
        '</section>' +
        '<div class="filters">' +
          '<div class="chips" id="category-chips"></div>' +
          '<div style="flex:1"></div>' +
          '<select class="select" id="status-filter" style="width:130px">' +
            '<option value="">全部状态</option>' +
            '<option value="active">在售</option>' +
            '<option value="sold">已售出</option>' +
            '<option value="offline">已下架</option>' +
          '</select>' +
        '</div>' +
        '<div id="grid-area"></div>' +
        '<div class="pager" id="pager"></div>';
    },

    mount: function (root) {
      var area = root.querySelector('#grid-area');
      var pager = root.querySelector('#pager');
      var chips = root.querySelector('#category-chips');
      var keywordInput = root.querySelector('#keyword');
      var statusSelect = root.querySelector('#status-filter');

      statusSelect.value = homeState.status || '';

      function renderChips() {
        var html = '<button class="chip' + (homeState.category === '' ? ' active' : '') +
          '" data-cat="" type="button">全部</button>';
        homeState.categories.forEach(function (cat) {
          html += '<button class="chip' + (homeState.category === cat ? ' active' : '') +
            '" data-cat="' + U.esc(cat) + '" type="button">' + U.esc(cat) + '</button>';
        });
        chips.innerHTML = html;
      }

      function renderPager() {
        var totalPages = Math.max(1, Math.ceil(homeState.total / homeState.pageSize));
        if (homeState.total === 0) { pager.innerHTML = ''; return; }
        pager.innerHTML =
          '<button class="btn btn-ghost btn-sm" data-page="' + (homeState.page - 1) + '"' +
            (homeState.page <= 1 ? ' disabled' : '') + ' type="button">上一页</button>' +
          '<span class="page-info">第 ' + homeState.page + ' / ' + totalPages + ' 页 · 共 ' +
            homeState.total + ' 件商品</span>' +
          '<button class="btn btn-ghost btn-sm" data-page="' + (homeState.page + 1) + '"' +
            (homeState.page >= totalPages ? ' disabled' : '') + ' type="button">下一页</button>';
      }

      function load() {
        area.innerHTML = U.loading('正在加载商品…');
        API.productPage({
          page: homeState.page,
          pageSize: homeState.pageSize,
          keyword: homeState.keyword,
          category: homeState.category,
          status: homeState.status
        }).then(function (data) {
          var records = (data && data.records) || [];
          homeState.total = (data && data.total) || 0;
          if (!records.length) {
            area.innerHTML = U.empty('没有找到符合条件的商品，换个条件试试～', '🔍');
          } else {
            area.innerHTML = '<div class="grid">' + records.map(productCard).join('') + '</div>';
          }
          renderPager();
        }).catch(function (err) {
          area.innerHTML = U.empty('加载失败：' + err.message, '⚠️');
        });
      }

      chips.addEventListener('click', function (e) {
        var btn = e.target.closest('.chip');
        if (!btn) return;
        homeState.category = btn.getAttribute('data-cat') || '';
        homeState.page = 1;
        renderChips();
        load();
      });

      area.addEventListener('click', function (e) {
        var card = e.target.closest('.product-card');
        if (card) location.hash = '#/product/' + card.getAttribute('data-id');
      });

      pager.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-page]');
        if (!btn || btn.disabled) return;
        var page = parseInt(btn.getAttribute('data-page'), 10);
        if (isNaN(page) || page < 1) return;
        homeState.page = page;
        load();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });

      root.querySelector('#btn-search').addEventListener('click', function () {
        homeState.keyword = keywordInput.value.trim();
        homeState.page = 1;
        load();
      });

      keywordInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          homeState.keyword = keywordInput.value.trim();
          homeState.page = 1;
          load();
        }
      });

      statusSelect.addEventListener('change', function () {
        homeState.status = statusSelect.value;
        homeState.page = 1;
        load();
      });

      if (homeState.categories.length) {
        renderChips();
        load();
      } else {
        chips.innerHTML = '';
        API.categories().then(function (list) {
          homeState.categories = list || [];
          renderChips();
          load();
        }).catch(function () {
          homeState.categories = [];
          renderChips();
          load();
        });
      }
    }
  };

  /* ============================ 商品详情 ============================ */
  global.Views.productDetail = {
    nav: 'home',
    render: function () { return U.loading('正在加载商品详情…'); },

    mount: function (root, params) {
      var id = params.id;
      var product = null;

      function load() {
        root.innerHTML = '<div class="card pad"><div class="skeleton" style="height:280px"></div></div>';
        API.productDetail(id).then(function (data) {
          product = data;
          render();
        }).catch(function (err) {
          root.innerHTML = U.empty(err.message, '⚠️');
        });
      }

      function render() {
        var mine = Store.isLogin && Store.userId === product.sellerId;
        var html = '' +
          '<div class="muted small" style="margin-bottom:12px">' +
            '<a href="#/home">商品广场</a> / ' + U.esc(product.category || '其他') + '</div>' +
          '<div class="detail">' +
            '<div class="detail-img">' + U.imageHtml(product.imagePath, product.title, '暂无图片') + '</div>' +
            '<div class="card pad">' +
              '<h1 class="detail-title">' + U.esc(product.title) + '</h1>' +
              '<div class="product-meta mt-8">' +
                '<span class="tag tag-primary">' + U.esc(product.category || '其他') + '</span>' +
                (product.condition ? '<span class="tag">' + U.esc(product.condition) + '</span>' : '') +
                '<span class="tag ' + (product.status === 'active' ? 'tag-success' :
                  (product.status === 'sold' ? 'tag-danger' : 'tag')) + '">' +
                  U.statusText(product.status) + '</span>' +
              '</div>' +
              '<div class="detail-price mt-16">' +
                '<span class="price price-now"><span class="unit">¥</span>' + U.money(product.price) + '</span>' +
                (product.originalPrice && Number(product.originalPrice) > Number(product.price)
                  ? '<span class="price-old">原价 ¥' + U.money(product.originalPrice) + '</span>' : '') +
              '</div>' +
              '<dl class="kv mt-16">' +
                '<dt>卖家</dt><dd>' + U.esc(product.sellerName || '匿名') + '</dd>' +
                '<dt>交易地点</dt><dd>' + U.esc(product.location || '未填写') + '</dd>' +
                '<dt>发布时间</dt><dd>' + U.time(product.createdAt) + '</dd>' +
                '<dt>浏览 / 收藏</dt><dd>' + (product.viewCount || 0) + ' / ' + (product.likeCount || 0) + '</dd>' +
              '</dl>' +
              '<div class="action-row" id="actions"></div>' +
            '</div>' +
          '</div>' +
          '<div class="card pad mt-24">' +
            '<h3 style="margin:0 0 12px;font-size:16px">宝贝描述</h3>' +
            '<div class="detail-desc">' + U.esc(product.description || '卖家很懒，没有填写描述～') + '</div>' +
          '</div>';

        root.innerHTML = html;

        var actions = root.querySelector('#actions');
        var buttons = [];

        if (mine) {
          buttons.push('<button class="btn btn-ghost" id="btn-edit" type="button">编辑</button>');
          buttons.push('<button class="btn btn-ghost" id="btn-toggle" type="button">' +
            (product.status === 'active' ? '下架' : '重新上架') + '</button>');
          buttons.push('<button class="btn btn-danger" id="btn-delete" type="button">删除</button>');
        } else {
          buttons.push('<button class="btn btn-ghost" id="btn-fav" type="button">收藏</button>');
          if (product.status === 'active') {
            buttons.push('<button class="btn" id="btn-buy" type="button">立即下单</button>');
          } else {
            buttons.push('<button class="btn" disabled type="button">该商品' +
              U.statusText(product.status) + '</button>');
          }
          buttons.push('<button class="btn btn-ghost" id="btn-contact" type="button">联系卖家</button>');
        }
        buttons.push('<a class="btn btn-ghost" href="#/home" type="button">返回列表</a>');
        actions.innerHTML = buttons.join('');

        bind();

        if (!mine && Store.isLogin) {
          API.checkFavorite(product.id).then(function (fav) {
            var btn = root.querySelector('#btn-fav');
            if (btn) {
              btn.textContent = fav ? '已收藏 ♥' : '收藏 ♡';
              btn.setAttribute('data-fav', fav ? '1' : '0');
            }
          }).catch(function () { /* 未登录或接口异常，忽略 */ });
        }
      }

      function bind() {
        var favBtn = root.querySelector('#btn-fav');
        if (favBtn) {
          favBtn.addEventListener('click', function () {
            if (!requireLogin()) return;
            var isFav = favBtn.getAttribute('data-fav') === '1';
            var call = isFav ? API.removeFavorite(product.id) : API.addFavorite(product.id);
            call.then(function () {
              favBtn.setAttribute('data-fav', isFav ? '0' : '1');
              favBtn.textContent = isFav ? '收藏 ♡' : '已收藏 ♥';
              U.toast(isFav ? '已取消收藏' : '收藏成功', 'success');
            }).catch(function (err) { U.toast(err.message, 'error'); });
          });
        }

        var buyBtn = root.querySelector('#btn-buy');
        if (buyBtn) buyBtn.addEventListener('click', openOrderModal);

        var contactBtn = root.querySelector('#btn-contact');
        if (contactBtn) {
          contactBtn.addEventListener('click', function () {
            if (!requireLogin()) return;
            location.hash = '#/me/messages?other=' + product.sellerId + '&product=' + product.id;
          });
        }

        var editBtn = root.querySelector('#btn-edit');
        if (editBtn) editBtn.addEventListener('click', function () {
          location.hash = '#/edit/' + product.id;
        });

        var toggleBtn = root.querySelector('#btn-toggle');
        if (toggleBtn) toggleBtn.addEventListener('click', function () {
          var nextStatus = product.status === 'active' ? 'offline' : 'active';
          API.updateProductStatus(product.id, nextStatus).then(function () {
            U.toast(nextStatus === 'active' ? '已重新上架' : '已下架', 'success');
            load();
          }).catch(function (err) { U.toast(err.message, 'error'); });
        });

        var deleteBtn = root.querySelector('#btn-delete');
        if (deleteBtn) deleteBtn.addEventListener('click', function () {
          U.confirm('删除商品', '确定要删除「' + product.title + '」吗？删除后不可恢复。').then(function (ok) {
            if (!ok) return;
            API.deleteProduct(product.id).then(function () {
              U.toast('已删除', 'success');
              location.hash = '#/me/products';
            }).catch(function (err) { U.toast(err.message, 'error'); });
          });
        });
      }

      function openOrderModal() {
        if (!requireLogin()) return;
        if (Store.userId === product.sellerId) {
          U.toast('不能购买自己发布的商品', 'error');
          return;
        }
        U.modal({
          title: '确认下单',
          okText: '提交订单',
          body: '' +
            '<div class="card pad" style="box-shadow:none;background:#f8fafd;margin-bottom:18px">' +
              '<div class="between"><span class="muted small">商品</span><b>' + U.esc(product.title) + '</b></div>' +
              '<div class="between mt-8"><span class="muted small">金额</span>' +
                '<span class="price" style="font-size:18px">¥' + U.money(product.price) + '</span></div>' +
            '</div>' +
            '<div class="field"><label>支付方式</label>' +
              '<select class="select" id="paymentMethod">' +
                '<option>微信支付</option><option>支付宝</option><option>当面交易</option>' +
              '</select></div>' +
            '<div class="field"><label>交付方式</label>' +
              '<select class="select" id="deliveryMethod">' +
                '<option>当面交易</option><option>邮寄</option>' +
              '</select></div>' +
            '<div class="field"><label>见面地点</label>' +
              '<input class="input" id="meetupLocation" placeholder="例如：东区宿舍门口 / 图书馆一楼" value="' +
                U.esc(product.location || '') + '"></div>' +
            '<div class="field"><label>见面时间</label>' +
              '<input class="input" id="meetupTime" type="datetime-local"></div>' +
            '<div class="error-text" id="order-error"></div>',
          onOk: function (mask, close) {
            var dto = {
              productId: product.id,
              paymentMethod: mask.querySelector('#paymentMethod').value,
              deliveryMethod: mask.querySelector('#deliveryMethod').value,
              meetupLocation: mask.querySelector('#meetupLocation').value.trim(),
              meetupTime: mask.querySelector('#meetupTime').value || null
            };
            API.submitOrder(dto).then(function () {
              close();
              U.toast('下单成功，请尽快完成付款', 'success');
              location.hash = '#/me/orders?tab=buyer';
            }).catch(function (err) {
              mask.querySelector('#order-error').textContent = err.message;
            });
            return false; // 等接口返回后再关闭
          }
        });
      }

      load();
    }
  };
})(window);
