package com.trade.second_hand_trade.controller;

import com.trade.second_hand_trade.common.Result;
import com.trade.second_hand_trade.dto.MessageSendDTO;
import com.trade.second_hand_trade.service.MessageService;
import com.trade.second_hand_trade.vo.ConversationVO;
import com.trade.second_hand_trade.vo.MessageVO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/message")
@Slf4j
public class MessageController {

    @Autowired
    private MessageService messageService;

    /**
     * 发送消息
     */
    @PostMapping("/send")
    public Result<Integer> send(@RequestBody MessageSendDTO dto) {
        log.info("发送消息：to={}, content={}", dto.getReceiverId(), dto.getContent());
        Integer messageId = messageService.send(dto);
        return Result.success(messageId);
    }

    /**
     * 查询与某人的聊天记录
     */
    @GetMapping("/conversation")
    public Result<List<MessageVO>> conversation(@RequestParam Integer otherUserId,
                                                @RequestParam(required = false) Integer productId) {
        return Result.success(messageService.getConversationMessages(otherUserId, productId));
    }

    /**
     * 我的会话列表
     */
    @GetMapping("/conversations")
    public Result<List<ConversationVO>> conversations() {
        return Result.success(messageService.myConversations());
    }

    /**
     * 未读消息总数
     */
    @GetMapping("/unread-count")
    public Result<Integer> unreadCount() {
        return Result.success(messageService.unreadCount());
    }
}
