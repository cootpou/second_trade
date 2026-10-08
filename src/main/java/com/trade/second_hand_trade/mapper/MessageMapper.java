package com.trade.second_hand_trade.mapper;

import com.trade.second_hand_trade.entity.Message;
import com.trade.second_hand_trade.vo.MessageVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface MessageMapper {

    /**
     * 插入消息
     */
    int insert(Message message);

    /**
     * 查询两个用户之间的聊天记录（按时间正序）
     */
    List<MessageVO> selectConversationMessages(@Param("userId") Integer userId,
                                               @Param("otherUserId") Integer otherUserId,
                                               @Param("productId") Integer productId);

    /**
     * 标记消息为已读
     */
    int markAsRead(@Param("senderId") Integer senderId,
                   @Param("receiverId") Integer receiverId,
                   @Param("productId") Integer productId);

    /**
     * 查询未读消息数
     */
    int countUnread(@Param("receiverId") Integer receiverId);

    /**
     * 查询某个会话的未读消息数
     */
    int countUnreadByConversation(@Param("receiverId") Integer receiverId,
                                  @Param("senderId") Integer senderId,
                                  @Param("productId") Integer productId);
}
