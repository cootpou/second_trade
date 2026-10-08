/* 后端接口封装：全部走 Nginx 网关的 /api/ 前缀 */
(function (global) {
  'use strict';

  var BASE = '/api';

  function buildQuery(params) {
    if (!params) return '';
    var parts = [];
    Object.keys(params).forEach(function (key) {
      var value = params[key];
      if (value === null || value === undefined || value === '') return;
      parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
    });
    return parts.length ? '?' + parts.join('&') : '';
  }

  function request(path, options) {
    options = options || {};
    var url = BASE + path + buildQuery(options.params);
    var headers = {};
    if (Store.token) headers['token'] = Store.token;

    var init = { method: options.method || 'GET', headers: headers };

    if (options.form) {
      init.body = options.form; // FormData：不要手动设置 Content-Type
    } else if (options.data !== undefined && options.data !== null) {
      headers['Content-Type'] = 'application/json';
      init.body = JSON.stringify(options.data);
    }

    return fetch(url, init).then(function (res) {
      if (res.status === 401) {
        Store.logout();
        if (location.hash.indexOf('#/login') !== 0) {
          location.hash = '#/login';
          U.toast('登录已过期，请重新登录', 'error');
        }
        throw new Error('未登录或登录已过期');
      }
      var contentType = res.headers.get('content-type') || '';
      if (contentType.indexOf('application/json') === -1) {
        if (!res.ok) throw new Error('请求失败（HTTP ' + res.status + '）');
        return res.text();
      }
      return res.json().then(function (json) {
        if (json && json.code === 1) return json.data;
        throw new Error((json && json.msg) || '请求失败（HTTP ' + res.status + '）');
      });
    });
  }

  var API = {
    request: request,

    /* ---- 用户 ---- */
    login: function (username, password) {
      return request('/user/login', { method: 'POST', data: { username: username, password: password } });
    },
    register: function (dto) {
      return request('/user/register', { method: 'POST', data: dto });
    },
    currentUser: function () {
      return request('/user/current');
    },

    /* ---- 商品 ---- */
    productPage: function (params) {
      return request('/product/page', { params: params });
    },
    productDetail: function (id) {
      return request('/product/detail/' + id);
    },
    categories: function () {
      return request('/product/categories');
    },
    publishProduct: function (product) {
      return request('/product', { method: 'POST', data: product });
    },
    updateProduct: function (product) {
      return request('/product', { method: 'PUT', data: product });
    },
    deleteProduct: function (id) {
      return request('/product/' + id, { method: 'DELETE' });
    },
    myProducts: function (params) {
      return request('/product/my', { params: params });
    },
    updateProductStatus: function (id, status) {
      return request('/product/status/' + id, { method: 'POST', params: { status: status } });
    },
    uploadImage: function (file) {
      var form = new FormData();
      form.append('file', file);
      return request('/product/upload', { method: 'POST', form: form });
    },

    /* ---- 收藏 ---- */
    addFavorite: function (productId) {
      return request('/favorite/' + productId, { method: 'POST' });
    },
    removeFavorite: function (productId) {
      return request('/favorite/' + productId, { method: 'DELETE' });
    },
    checkFavorite: function (productId) {
      return request('/favorite/check/' + productId);
    },
    myFavorites: function (params) {
      return request('/favorite/my', { params: params });
    },

    /* ---- 订单 ---- */
    submitOrder: function (dto) {
      return request('/order/submit', { method: 'POST', data: dto });
    },
    buyerOrders: function (params) {
      return request('/order/buyer', { params: params });
    },
    sellerOrders: function (params) {
      return request('/order/seller', { params: params });
    },
    orderDetail: function (id) {
      return request('/order/' + id);
    },
    cancelOrder: function (id) {
      return request('/order/cancel/' + id, { method: 'POST' });
    },
    payOrder: function (id) {
      return request('/order/pay/' + id, { method: 'POST' });
    },
    completeOrder: function (id) {
      return request('/order/complete/' + id, { method: 'POST' });
    },

    /* ---- 消息 ---- */
    sendMessage: function (dto) {
      return request('/message/send', { method: 'POST', data: dto });
    },
    conversation: function (otherUserId, productId) {
      return request('/message/conversation', { params: { otherUserId: otherUserId, productId: productId } });
    },
    conversations: function () {
      return request('/message/conversations');
    },
    unreadCount: function () {
      return request('/message/unread-count');
    }
  };

  global.API = API;
})(window);
