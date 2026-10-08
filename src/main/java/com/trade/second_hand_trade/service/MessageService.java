package com.trade.second_hand_trade.service;

import com.trade.second_hand_trade.dto.MessageSendDTO;
import com.trade.second_hand_trade.vo.ConversationVO;
import com.trade.second_hand_trade.vo.MessageVO;

import java.util.List;

public interface MessageService {

    /**
     * 发送消息（自动创建/更新会话）
     */
    Integer send(MessageSendDTO dto);

    /**
     * 查询与某人的聊天记录
     */
    List<MessageVO> getConversationMessages(Integer otherUserId, Integer productId);

    /**
     * 我的会话列表
     */
    List<ConversationVO> myConversations();

    /**
     * 未读消息总数
     */
    Integer unreadCount();
}
