package com.trade.second_hand_trade.vo;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class MessageVO {
    private Integer id;
    private Integer senderId;
    private Integer receiverId;
    private Integer productId;
    private String content;
    private String messageType;
    private Integer isRead;
    private LocalDateTime createdAt;

    private String senderName;
    private String receiverName;
}
