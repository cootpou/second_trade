package com.trade.second_hand_trade.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Message {
    private Integer id;
    private Integer senderId;
    private Integer receiverId;
    private Integer productId;
    private String content;
    private String messageType;   // text / image
    private Integer isRead;       // 0未读 / 1已读
    private LocalDateTime createdAt;
}
