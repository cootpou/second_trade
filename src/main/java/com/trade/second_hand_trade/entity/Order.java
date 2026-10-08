package com.trade.second_hand_trade.entity;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class Order {
    private Integer id;
    private Integer productId;
    private Integer buyerId;
    private Integer sellerId;
    private BigDecimal price;
    private String status;          // pending待付款 / paid待发货 / completed已完成 / cancelled已取消
    private String paymentMethod;
    private String deliveryMethod;
    private String meetupLocation;
    private LocalDateTime meetupTime;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
}
