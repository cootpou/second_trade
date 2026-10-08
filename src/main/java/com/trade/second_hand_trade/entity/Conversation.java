package com.trade.second_hand_trade.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Conversation {
    private Integer id;
    private Integer user1Id;
    private Integer user2Id;
    private Integer productId;
    private Integer lastMessageId;
    private LocalDateTime lastMessageTime;
}
