package com.trade.second_hand_trade.vo;

import lombok.Data;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 返回给前端的商品视图对象
 * 可以比 entity 多字段（比如卖家昵称），也可以少字段（比如不返回内部状态）
 */
@Data
public class ProductVO implements Serializable {

    private Integer id;
    private Integer sellerId;
    private String sellerName;     // 卖家昵称（entity里没有，需要联表查）
    private String title;
    private String description;
    private BigDecimal price;
    private BigDecimal originalPrice;
    private String category;
    private String condition;
    private String status;
    private String location;
    private String imagePath;
    private Integer viewCount;
    private Integer likeCount;
    private LocalDateTime createdAt;
}
