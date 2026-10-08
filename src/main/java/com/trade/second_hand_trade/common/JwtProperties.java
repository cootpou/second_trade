package com.trade.second_hand_trade.common;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * 读取 application.yml 里的 jwt 配置
 * @ConfigurationProperties 自动把 yml 里 jwt.xxx 绑定到这个类的属性
 */
@Data
@Component
@ConfigurationProperties(prefix = "jwt")
public class JwtProperties {
    private String secretKey;   // 密钥
    private Long ttl;           // 有效期（毫秒）
    private String tokenName;   // header 里的字段名
}
