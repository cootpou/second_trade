import Vue from "vue";
import Router from "vue-router";
import Layout from "@/layout/index.vue";
import {
  getToken,
  setToken,
  removeToken,
  setUserInfo,
  getUserInfo,
  removeUserInfo
} from "@/utils/cookies";
import store from "@/store";

Vue.use(Router);

const router = new Router({
  scrollBehavior: (to, from, savedPosition) => {
    if (savedPosition) {
      return savedPosition;
    }
    return { x: 0, y: 0 };
  },
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/login",
      component: () =>
        import(/* webpackChunkName: "login" */ "@/views/login/index.vue"),
      meta: { title: "校园二手交易平台管理后台", hidden: true, notNeedAuth: true }
    },
    {
      path: "/404",
      component: () => import(/* webpackChunkName: "404" */ "@/views/404.vue"),
      meta: { title: "校园二手交易平台管理后台", hidden: true, notNeedAuth: true }
    },
    {
      path: "/",
      component: Layout,
      redirect: "/dashboard",
      children: [
        {
          path: "dashboard",
          component: () =>
            import(/* webpackChunkName: "dashboard" */ "@/views/dashboard/index.vue"),
          name: "Dashboard",
          meta: {
            title: "工作台",
            icon: "dashboard",
            affix: true
          }
        },
        {
          path: "product",
          component: () =>
            import(/* webpackChunkName: "product" */ "@/views/product/index.vue"),
          meta: {
            title: "商品管理",
            icon: "icon-dish"
          }
        },
        {
          path: "order",
          component: () =>
            import(/* webpackChunkName: "order" */ "@/views/order/index.vue"),
          meta: {
            title: "订单管理",
            icon: "icon-order"
          }
        },
        {
          path: "user",
          component: () =>
            import(/* webpackChunkName: "user" */ "@/views/user/index.vue"),
          meta: {
            title: "用户管理",
            icon: "icon-employee"
          }
        },
        {
          path: "category",
          component: () =>
            import(/* webpackChunkName: "category" */ "@/views/category/index.vue"),
          meta: {
            title: "分类管理",
            icon: "icon-category"
          }
        }
      ]
    },
    {
      path: "*",
      redirect: "/404",
      meta: { hidden: true }
    }
  ]
});

export default router;
