package com.trade.second_hand_trade.context;

/**
 * ThreadLocal 工具类（苍穹外卖同款）
 * 拦截器校验 token 后，把用户 id 存进 ThreadLocal
 * Service 层随时可以取当前登录用户的 id
 *
 * 为什么用 ThreadLocal？因为每个请求是一个线程，
 * ThreadLocal 让每个线程有自己独立的变量，不会互相干扰
 */
public class BaseContext {

    private static final ThreadLocal<Integer> threadLocal = new ThreadLocal<>();

    public static void setCurrentId(Integer id) {
        threadLocal.set(id);
    }

    public static Integer getCurrentId() {
        return threadLocal.get();
    }

    public static void removeCurrentId() {
        threadLocal.remove(); // 必须清理，防止内存泄漏
    }
}
