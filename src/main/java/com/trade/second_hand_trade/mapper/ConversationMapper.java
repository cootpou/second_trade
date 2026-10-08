package com.trade.second_hand_trade.mapper;

import com.trade.second_hand_trade.entity.Conversation;
import com.trade.second_hand_trade.vo.ConversationVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ConversationMapper {

    /**
     * 查找会话（两个用户+商品维度）
     */
    Conversation selectByUsersAndProduct(@Param("user1Id") Integer user1Id,
                                         @Param("user2Id") Integer user2Id,
                                         @Param("productId") Integer productId);

    /**
     * 新增会话
     */
    int insert(Conversation conversation);

    /**
     * 更新会话最后一条消息
     */
    int updateLastMessage(@Param("id") Integer id,
                          @Param("lastMessageId") Integer lastMessageId,
                          @Param("lastMessageTime") java.time.LocalDateTime lastMessageTime);

    /**
     * 查询用户的会话列表（联表对方用户、商品、最后消息）
     */
    List<ConversationVO> selectConversationsByUser(Integer userId);
}
