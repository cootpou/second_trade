package com.trade.second_hand_trade.dto;

import lombok.Data;

@Data
public class MessageSendDTO {
    private Integer receiverId;   // 接收者id
    private Integer productId;    // 关联商品id（可空，纯聊天时不传）
    private String content;       // 消息内容
    private String messageType;   // text / image
}
