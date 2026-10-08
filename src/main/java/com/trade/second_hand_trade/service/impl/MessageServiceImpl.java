package com.trade.second_hand_trade.service.impl;

import com.trade.second_hand_trade.context.BaseContext;
import com.trade.second_hand_trade.dto.MessageSendDTO;
import com.trade.second_hand_trade.entity.Conversation;
import com.trade.second_hand_trade.entity.Message;
import com.trade.second_hand_trade.mapper.ConversationMapper;
import com.trade.second_hand_trade.mapper.MessageMapper;
import com.trade.second_hand_trade.service.MessageService;
import com.trade.second_hand_trade.vo.ConversationVO;
import com.trade.second_hand_trade.vo.MessageVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MessageServiceImpl implements MessageService {

    @Autowired
    private MessageMapper messageMapper;

    @Autowired
    private ConversationMapper conversationMapper;

    /**
     * 发送消息（事务：插入消息 + 创建/更新会话）
     */
    @Override
    @Transactional
    public Integer send(MessageSendDTO dto) {
        Integer currentUserId = BaseContext.getCurrentId();

        // 1. 插入消息
        Message message = new Message();
        message.setSenderId(currentUserId);
        message.setReceiverId(dto.getReceiverId());
        message.setProductId(dto.getProductId());
        message.setContent(dto.getContent());
        message.setMessageType(dto.getMessageType() != null ? dto.getMessageType() : "text");
        message.setIsRead(0);
        message.setCreatedAt(LocalDateTime.now());
        messageMapper.insert(message);

        // 2. 查找会话（user1存较小id，user2存较大id，方便查询）
        Integer user1Id = Math.min(currentUserId, dto.getReceiverId());
        Integer user2Id = Math.max(currentUserId, dto.getReceiverId());
        Conversation conversation = conversationMapper.selectByUsersAndProduct(
                user1Id, user2Id, dto.getProductId());

        if (conversation == null) {
            // 3. 不存在则新建会话
            conversation = new Conversation();
            conversation.setUser1Id(user1Id);
            conversation.setUser2Id(user2Id);
            conversation.setProductId(dto.getProductId());
            conversation.setLastMessageId(message.getId());
            conversation.setLastMessageTime(message.getCreatedAt());
            conversationMapper.insert(conversation);
        } else {
            // 4. 存在则更新最后一条消息
            conversationMapper.updateLastMessage(conversation.getId(), message.getId(), message.getCreatedAt());
        }

        return message.getId();
    }

    /**
     * 查询聊天记录（同时标记对方发给我的消息为已读）
     */
    @Override
    @Transactional
    public List<MessageVO> getConversationMessages(Integer otherUserId, Integer productId) {
        Integer currentUserId = BaseContext.getCurrentId();

        // 标记对方发给我的消息为已读
        messageMapper.markAsRead(otherUserId, currentUserId, productId);

        // 查询聊天记录
        return messageMapper.selectConversationMessages(currentUserId, otherUserId, productId);
    }

    /**
     * 我的会话列表（补充未读消息数）
     */
    @Override
    public List<ConversationVO> myConversations() {
        Integer currentUserId = BaseContext.getCurrentId();
        List<ConversationVO> conversations = conversationMapper.selectConversationsByUser(currentUserId);

        // 为每个会话补充未读消息数
        for (ConversationVO conv : conversations) {
            // 对方是user1还是user2
            Integer otherUserId = conv.getUser1Id().equals(currentUserId)
                    ? conv.getUser2Id() : conv.getUser1Id();
            int unread = messageMapper.countUnreadByConversation(currentUserId, otherUserId, conv.getProductId());
            conv.setUnreadCount(unread);
        }

        return conversations;
    }

    @Override
    public Integer unreadCount() {
        Integer currentUserId = BaseContext.getCurrentId();
        return messageMapper.countUnread(currentUserId);
    }
}
