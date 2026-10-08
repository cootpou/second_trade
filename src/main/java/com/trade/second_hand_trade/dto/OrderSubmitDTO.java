package com.trade.second_hand_trade.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class OrderSubmitDTO {
    private Integer productId;          // 要购买的商品id
    private String paymentMethod;       // 支付方式：微信/支付宝/面交
    private String deliveryMethod;      // 交付方式：面交/邮寄
    private String meetupLocation;      // 面交地点
    private LocalDateTime meetupTime;   // 面交时间
}
