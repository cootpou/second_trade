package com.trade.second_hand_trade.vo;

import lombok.Data;
import java.io.Serializable;

@Data
public class UserLoginVO implements Serializable {
    private Integer id;
    private String username;
    private String token;  // JWT 令牌，前端存起来，后续请求放 header 里
}