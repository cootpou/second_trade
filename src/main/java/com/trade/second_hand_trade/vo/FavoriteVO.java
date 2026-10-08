package com.trade.second_hand_trade.vo;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class FavoriteVO {
    private Integer id;             // 收藏记录id
    private Integer userId;
    private Integer productId;
    private LocalDateTime createdAt;

    // 联表商品信息
    private String productTitle;
    private BigDecimal productPrice;
    private String productImage;
    private String productStatus;
    private String sellerName;
}
