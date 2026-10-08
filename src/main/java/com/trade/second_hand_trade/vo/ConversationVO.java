package com.trade.second_hand_trade.vo;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ConversationVO {
    private Integer id;
    private Integer user1Id;
    private Integer user2Id;
    private Integer productId;
    private Integer lastMessageId;
    private LocalDateTime lastMessageTime;

    // 联表附加字段
    private String otherUserName;    // 对方用户名
    private String lastMessageContent; // 最后一条消息内容
    private String productTitle;
    private Integer unreadCount;     // 未读消息数
}
