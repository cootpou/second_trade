package com.trade.second_hand_trade.interceptor;

import com.trade.second_hand_trade.common.JwtProperties;
import com.trade.second_hand_trade.context.BaseContext;
import com.trade.second_hand_trade.util.JwtUtil;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * JWT 令牌拦截器（苍穹外卖同款）
 * 所有需要登录的请求，先经过这里校验 token
 * token 合法 → 把 userId 放进 ThreadLocal → 放行
 * token 非法或过期 → 返回 401，不放行
 */
@Slf4j
@Component
public class JwtTokenInterceptor implements HandlerInterceptor {

    @Autowired
    private JwtProperties jwtProperties;

    /**
     * 请求进入 Controller 之前执行
     * return true = 放行，return false = 拦截
     */
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {

        // 如果不是映射到 Controller 方法的请求（比如静态资源），直接放行
        if (!(handler instanceof HandlerMethod)) {
            return true;
        }

        // 1. 从请求头里取出 token
        String token = request.getHeader(jwtProperties.getTokenName());

        // 2. 校验 token
        try {
            log.info("JWT 拦截器校验 token：{}", token);
            Claims claims = JwtUtil.parseJWT(jwtProperties.getSecretKey(), token);

            // 3. 从 token 里取出用户 id，放进 ThreadLocal
            Integer userId = Integer.valueOf(claims.get("userId").toString());
            BaseContext.setCurrentId(userId);
            log.info("当前登录用户 id：{}", userId);

            return true; // 放行
        } catch (Exception e) {
            // token 无效、过期、为空，都走这里
            log.error("JWT 校验失败：{}", e.getMessage());
            response.setStatus(401);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"code\":0,\"msg\":\"未登录或登录已过期\",\"data\":null}");
            return false; // 拦截
        }
    }

    /**
     * 请求结束后执行，必须清理 ThreadLocal
     */
    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        BaseContext.removeCurrentId();
    }
}
