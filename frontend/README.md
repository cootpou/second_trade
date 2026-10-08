# 校园二手交易平台 —— 前端（静态页 + Nginx 网关）

前端是一套**零依赖的静态站点**（HTML + CSS + 原生 JS，无需 Node/npm、无需打包），
由 Nginx 直接托管，浏览器通过 **80 端口**访问；所有数据请求经 Nginx 反向代理到
Spring Boot 后端（8080），图片同样通过 `/images/` 代理。

```
浏览器 ──▶ Nginx(:80) ──┬── /           前端静态页（本目录）
                        ├── /api/       反向代理 ▶ Spring Boot :8080
                        ├── /images/    反向代理 ▶ 后端图片静态资源
                        └── /ws/        WebSocket 代理
```

## 目录结构

```
frontend/
├── index.html            页面骨架 + 顶栏导航
├── css/app.css           全部样式（设计变量、卡片、表单、各类页面组件）
├── js/util.js            工具：格式化、Toast、弹窗、图片占位
├── js/store.js           登录态（localStorage 保存 token / 用户信息）
├── js/api.js             接口封装（统一处理 code!=1 与 401）
├── js/views-home.js      商品广场 + 商品详情
├── js/views-auth.js      登录 / 注册
├── js/views-sell.js      发布闲置 / 编辑商品
├── js/views-me.js        我的商品 / 我的收藏 / 我的订单 / 个人中心
├── js/views-message.js   我的消息（会话列表 + 聊天窗口）
├── js/app.js             哈希路由 + 顶栏状态 + 未读消息轮询
└── docs/                 页面截图
```

## 启动步骤

1. 启动 MySQL（数据库 `trading_db`，账号密码见 `src/main/resources/application.yml`）。
2. 启动后端：

   ```powershell
   cd D:\Downloads\second_hand_trade
   java -jar target\second_hand_trade-0.0.1-SNAPSHOT.jar
   ```

   （源码有改动时先重新打包：`mvn -o package -DskipTests`）

3. 启动 Nginx 网关：

   ```powershell
   cd D:\Downloads\second_hand_trade\nginx-1.20.2
   start nginx.exe
   ```

   改过配置后热加载：`nginx.exe -s reload`

4. 浏览器打开 <http://localhost>（测试账号 `zhangsan / 123456`、`lisi / 123456`）。

## 页面路由 ↔ 后端接口

| 页面 | 路由 | 主要接口 |
| --- | --- | --- |
| 商品广场 | `#/home` | `GET /api/product/page`、`GET /api/product/categories` |
| 商品详情 | `#/product/:id` | `GET /api/product/detail/{id}` |
| 发布闲置 | `#/publish` | `POST /api/product`、`POST /api/product/upload` |
| 编辑商品 | `#/edit/:id` | `PUT /api/product` |
| 登录 / 注册 | `#/login` | `POST /api/user/login`、`POST /api/user/register` |
| 我的商品 | `#/me/products` | `GET /api/product/my`、`POST /api/product/status/{id}`、`DELETE /api/product/{id}` |
| 我的收藏 | `#/me/favorites` | `GET /api/favorite/my`、`POST/DELETE /api/favorite/{id}` |
| 我的订单 | `#/me/orders` | `GET /api/order/buyer`、`/seller`、`POST /api/order/pay|cancel|complete/{id}` |
| 我的消息 | `#/me/messages` | `GET /api/message/conversations`、`/conversation`、`POST /api/message/send` |
| 个人中心 | `#/me/profile` | `GET /api/user/current`、`GET /api/message/unread-count` |

登录后前端把 JWT 存在 `localStorage`，每次请求通过请求头 `token` 带给后端；
后端返回 401 时前端会自动清除登录态并跳转登录页。

## 状态字典

| 商品状态 | 含义 | 订单状态 | 含义 |
| --- | --- | --- | --- |
| `active` | 在售 | `pending` | 待付款（30 分钟未付自动取消） |
| `sold` | 已售出 | `paid` | 已付款待收货 |
| `offline` | 已下架 | `completed` / `cancelled` | 已完成 / 已取消 |
