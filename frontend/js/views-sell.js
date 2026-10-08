/* 发布闲置 / 编辑商品 */
(function (global) {
  'use strict';

  global.Views = global.Views || {};

  var CONDITIONS = ['全新', '九五成新', '九成新', '八成新', '七成新', '有使用痕迹'];

  function formHtml(product, categories) {
    product = product || {};
    var catOptions = categories.map(function (c) {
      return '<option value="' + U.esc(c) + '"' +
        (product.category === c ? ' selected' : '') + '>' + U.esc(c) + '</option>';
    }).join('');
    var condOptions = CONDITIONS.map(function (c) {
      return '<option value="' + U.esc(c) + '"' +
        (product.condition === c ? ' selected' : '') + '>' + U.esc(c) + '</option>';
    }).join('');

    return '' +
      '<div class="field"><label>商品标题 *</label>' +
        '<input class="input" id="title" maxlength="60" placeholder="例如：高等数学 同济第七版 教材" value="' +
          U.esc(product.title || '') + '"></div>' +
      '<div class="form-grid">' +
        '<div class="field"><label>售价（元）*</label>' +
          '<input class="input" id="price" type="number" min="0" step="0.01" placeholder="0.00" value="' +
            (product.price !== undefined && product.price !== null ? product.price : '') + '"></div>' +
        '<div class="field"><label>原价（元）</label>' +
          '<input class="input" id="originalPrice" type="number" min="0" step="0.01" placeholder="选填" value="' +
            (product.originalPrice !== undefined && product.originalPrice !== null ? product.originalPrice : '') + '"></div>' +
        '<div class="field"><label>分类</label><select class="select" id="category">' +
          catOptions + '</select></div>' +
        '<div class="field"><label>成色</label><select class="select" id="condition">' +
          condOptions + '</select></div>' +
        '<div class="field"><label>交易地点</label>' +
          '<input class="input" id="location" placeholder="例如：东区宿舍 / 图书馆" value="' +
            U.esc(product.location || '') + '"></div>' +
      '</div>' +
      '<div class="field"><label>商品描述</label>' +
        '<textarea class="textarea" id="description" placeholder="说说商品的新旧程度、使用情况、附件是否齐全等">' +
          U.esc(product.description || '') + '</textarea></div>' +
      '<div class="field"><label>商品图片</label>' +
        '<div class="upload-box">' +
          '<div class="upload-preview" id="preview">' +
            (product.imagePath ? '<img src="' + U.esc(product.imagePath) + '" alt="商品图片">' : '暂无图片') +
          '</div>' +
          '<div>' +
            '<input type="file" id="image" accept="image/*" style="display:none">' +
            '<button class="btn btn-ghost btn-sm" id="btn-upload" type="button">选择图片上传</button>' +
            '<div class="hint">支持 jpg / png，大小不超过 10MB</div>' +
          '</div>' +
        '</div>' +
        '<input type="hidden" id="imagePath" value="' + U.esc(product.imagePath || '') + '">' +
      '</div>' +
      '<div class="error-text" id="sell-error"></div>' +
      '<div class="flex gap-12 mt-8">' +
        '<button class="btn" id="btn-submit" type="button">发布</button>' +
        '<a class="btn btn-ghost" href="#/me/products">我的商品</a>' +
      '</div>';
  }

  function bindForm(root, editing, product) {
    var fileInput = root.querySelector('#image');
    var preview = root.querySelector('#preview');
    var hidden = root.querySelector('#imagePath');

    root.querySelector('#btn-upload').addEventListener('click', function () { fileInput.click(); });

    fileInput.addEventListener('change', function () {
      var file = fileInput.files && fileInput.files[0];
      if (!file) return;
      preview.innerHTML = '<div class="skeleton" style="width:100%;height:100%"></div>';
      API.uploadImage(file).then(function (url) {
        hidden.value = url;
        preview.innerHTML = '<img src="' + U.esc(url) + '" alt="商品图片">';
        U.toast('图片上传成功', 'success');
      }).catch(function (err) {
        preview.innerHTML = '上传失败';
        U.toast(err.message, 'error');
      });
    });

    root.querySelector('#btn-submit').addEventListener('click', function () {
      var err = root.querySelector('#sell-error');
      var title = root.querySelector('#title').value.trim();
      var price = root.querySelector('#price').value;
      var originalPrice = root.querySelector('#originalPrice').value;
      err.textContent = '';

      if (!title) { err.textContent = '请填写商品标题'; return; }
      if (!price || Number(price) <= 0) { err.textContent = '请填写正确的售价'; return; }

      var body = {
        title: title,
        description: root.querySelector('#description').value.trim(),
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : null,
        category: root.querySelector('#category').value,
        condition: root.querySelector('#condition').value,
        location: root.querySelector('#location').value.trim(),
        imagePath: hidden.value || null
      };

      var btn = root.querySelector('#btn-submit');
      btn.disabled = true;

      var call;
      if (editing) {
        body.id = product.id;
        body.status = product.status;
        body.viewCount = product.viewCount || 0;
        body.likeCount = product.likeCount || 0;
        body.sellerId = product.sellerId;
        call = API.updateProduct(body);
      } else {
        call = API.publishProduct(body);
      }

      call.then(function () {
        U.toast(editing ? '修改成功' : '发布成功', 'success');
        location.hash = '#/me/products';
      }).catch(function (e) {
        err.textContent = e.message;
        btn.disabled = false;
      });
    });
  }

  global.Views.publish = {
    nav: 'publish',
    render: function () {
      return '<div class="page-head"><div><h2 class="page-title">发布闲置</h2>' +
        '<p class="page-sub">把闲置的宝贝挂出来，同校同学就能看到啦</p></div></div>' +
        '<div class="card pad" id="sell-card">' + U.loading('加载分类…') + '</div>';
    },
    mount: function (root) {
      if (!Store.isLogin) {
        location.hash = '#/login';
        return;
      }
      var card = root.querySelector('#sell-card');
      API.categories().then(function (categories) {
        card.innerHTML = formHtml({}, categories || []);
        bindForm(card, false, null);
      }).catch(function () {
        card.innerHTML = formHtml({}, ['其他']);
        bindForm(card, false, null);
      });
    }
  };

  global.Views.editProduct = {
    nav: 'products',
    render: function () {
      return '<div class="page-head"><div><h2 class="page-title">编辑商品</h2>' +
        '<p class="page-sub">只能修改自己发布的商品</p></div></div>' +
        '<div class="card pad" id="sell-card">' + U.loading('加载商品信息…') + '</div>';
    },
    mount: function (root, params) {
      if (!Store.isLogin) { location.hash = '#/login'; return; }
      var card = root.querySelector('#sell-card');
      Promise.all([API.productDetail(params.id), API.categories()]).then(function (res) {
        var product = res[0];
        var categories = res[1] || [];
        if (Store.userId !== product.sellerId) {
          card.innerHTML = U.empty('只能编辑自己发布的商品', '🔒');
          return;
        }
        card.innerHTML = formHtml(product, categories);
        bindForm(card, true, product);
        var btn = card.querySelector('#btn-submit');
        if (btn) btn.textContent = '保存修改';
      }).catch(function (err) {
        card.innerHTML = U.empty(err.message, '⚠️');
      });
    }
  };
})(window);
