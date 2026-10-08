package com.trade.second_hand_trade.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Favorite {
    private Integer id;
    private Integer userId;
    private Integer productId;
    private LocalDateTime createdAt;
}
