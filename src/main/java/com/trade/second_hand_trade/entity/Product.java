package com.trade.second_hand_trade.entity;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class Product {
    private Integer id;
    private Integer sellerId;
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
    private LocalDateTime updatedAt;
    private LocalDateTime expiresAt;
}
