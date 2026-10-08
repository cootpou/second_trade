package com.trade.second_hand_trade.vo;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class OrderVO {
    private Integer id;
    private Integer productId;
    private Integer buyerId;
    private Integer sellerId;
    private BigDecimal price;
    private String status;
    private String paymentMethod;
    private String deliveryMethod;
    private String meetupLocation;
    private LocalDateTime meetupTime;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;

    // 联表查询附加字段
    private String productTitle;//商品标题
    private String productImage;//商品图片
    private String buyerName;//买家
    private String sellerName;//卖家
}
