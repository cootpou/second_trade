package com.trade.second_hand_trade.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;

/**
 * JWT 工具类（苍穹外卖同款）
 * 生成 token：登录成功后调用，把用户 id 等信息放进去
 * 解析 token：拦截器里调用，验证 token 是否合法、取出用户 id
 */
public class JwtUtil {

    /**
     * 生成 JWT 令牌
     * @param secretKey 密钥
     * @param ttl       有效期（毫秒）
     * @param claims    要放进 token 的数据（比如 userId）
     */
    public static String createJWT(String secretKey, long ttl, Map<String, Object> claims) {
        // 指定签名时使用的密钥
        SecretKey key = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));

        // 设置令牌过期时间
        long expireTime = System.currentTimeMillis() + ttl;

        return Jwts.builder()
                .claims(claims)                          // 放入自定义数据
                .expiration(new Date(expireTime))        // 设置过期时间
                .signWith(key)                           // 签名
                .compact();
    }

    /**
     * 解析 JWT 令牌
     * @param secretKey 密钥
     * @param token     要解析的 token
     * @return token 里存放的数据（Claims 本质是个 Map）
     */
    public static Claims parseJWT(String secretKey, String token) {
        SecretKey key = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));

        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
