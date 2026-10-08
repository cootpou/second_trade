/* 通用工具：格式化、提示、弹窗 */
(function (global) {
  'use strict';

  var STATUS_TEXT = {
    active: '在售',
    sold: '已售出',
    offline: '已下架'
  };

  var ORDER_STATUS_TEXT = {
    pending: '待付款',
    paid: '待收货',
    completed: '已完成',
    cancelled: '已取消'
  };

  var ORDER_STATUS_CLASS = {
    pending: 'tag-warn',
    paid: 'tag-primary',
    completed: 'tag-success',
    cancelled: 'tag'
  };

  function esc(value) {
    if (value === null || value === undefined) return '';
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function money(value) {
    if (value === null || value === undefined || value === '') return '0.00';
    var n = Number(value);
    if (isNaN(n)) return String(value);
    return n.toFixed(2);
  }

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  /** 把 "2026-09-04T18:20:02" 转成友好时间 */
  function time(value) {
    if (!value) return '-';
    var d = new Date(String(value).replace('T', ' ').replace(/-/g, '/'));
    if (isNaN(d.getTime())) return String(value);
    var now = new Date();
    var diff = (now - d) / 1000;
    if (diff < 60) return '刚刚';
    if (diff < 3600) return Math.floor(diff / 60) + ' 分钟前';
    if (diff < 86400 && d.getDate() === now.getDate()) {
      return '今天 ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
    }
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
      ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }

  function statusText(s) { return STATUS_TEXT[s] || s || '-'; }
  function orderStatusText(s) { return ORDER_STATUS_TEXT[s] || s || '-'; }
  function orderStatusClass(s) { return ORDER_STATUS_CLASS[s] || 'tag'; }

  function toast(message, type) {
    var wrap = document.getElementById('toast-wrap');
    if (!wrap) return alert(message);
    var el = document.createElement('div');
    el.className = 'toast' + (type ? ' ' + type : '');
    el.textContent = message;
    wrap.appendChild(el);
    setTimeout(function () {
      el.style.transition = 'opacity .2s';
      el.style.opacity = '0';
      setTimeout(function () { el.remove(); }, 220);
    }, 2400);
  }

  function imageHtml(imagePath, alt, emptyText) {
    if (imagePath) {
      return '<img src="' + esc(imagePath) + '" alt="' + esc(alt || '') + '" ' +
        'onerror="this.style.display=\'none\';this.parentNode.insertAdjacentHTML(\'beforeend\',\'<div class=&quot;thumb-empty&quot;>' +
        esc(emptyText || '暂无图片') + '</div>\')">';
    }
    return '<div class="thumb-empty">' + esc(emptyText || '暂无图片') + '</div>';
  }

  /**
   * 弹出模态框
   * options: { title, body(html), okText, cancelText, onOk(root) -> false 阻止关闭 }
   */
  function modal(options) {
    var root = document.getElementById('modal-root');
    var mask = document.createElement('div');
    mask.className = 'modal-mask';
    mask.innerHTML =
      '<div class="modal">' +
        '<div class="modal-head"><span>' + esc(options.title || '提示') + '</span>' +
          '<button class="icon-btn" data-close type="button">&times;</button></div>' +
        '<div class="modal-body">' + (options.body || '') + '</div>' +
        (options.footer === false ? '' :
        '<div class="modal-foot">' +
          '<button class="btn btn-ghost" data-close type="button">' + esc(options.cancelText || '取消') + '</button>' +
          (options.okText === null ? '' :
            '<button class="btn" data-ok type="button">' + esc(options.okText || '确定') + '</button>') +
        '</div>') +
      '</div>';

    function close() {
      mask.remove();
      if (typeof options.onClose === 'function') options.onClose();
    }

    mask.addEventListener('click', function (e) {
      if (e.target === mask) return close();
      var closeBtn = e.target.closest('[data-close]');
      if (closeBtn) return close();
      var okBtn = e.target.closest('[data-ok]');
      if (okBtn) {
        if (typeof options.onOk === 'function') {
          if (options.onOk(mask, close) === false) return;
        }
        close();
      }
    });

    root.appendChild(mask);
    var first = mask.querySelector('input, textarea, select');
    if (first) setTimeout(function () { first.focus(); }, 30);

    return { el: mask, close: close };
  }

  function confirm(title, text) {
    return new Promise(function (resolve) {
      modal({
        title: title,
        body: '<div style="color:#5b6675">' + esc(text || '') + '</div>',
        okText: '确定',
        onOk: function () { resolve(true); },
        onClose: function () { resolve(false); }
      });
    });
  }

  function empty(text, icon) {
    return '<div class="empty"><div class="empty-icon">' + (icon || '📦') + '</div>' +
      '<div>' + esc(text || '暂无数据') + '</div></div>';
  }

  function loading(text) {
    var cards = '';
    for (var i = 0; i < 8; i++) {
      cards += '<div class="product-card"><div class="skeleton" style="height:150px;border-radius:0"></div>' +
        '<div style="padding:14px"><div class="skeleton" style="height:16px;width:80%"></div>' +
        '<div class="skeleton mt-8" style="height:14px;width:40%"></div></div></div>';
    }
    return '<div class="muted small" style="margin-bottom:10px">' + esc(text || '加载中…') + '</div>' +
      '<div class="grid">' + cards + '</div>';
  }

  global.U = {
    esc: esc,
    money: money,
    time: time,
    statusText: statusText,
    orderStatusText: orderStatusText,
    orderStatusClass: orderStatusClass,
    toast: toast,
    modal: modal,
    confirm: confirm,
    empty: empty,
    loading: loading,
    imageHtml: imageHtml
  };
})(window);
