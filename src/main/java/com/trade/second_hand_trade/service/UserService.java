package com.trade.second_hand_trade.service;

import com.trade.second_hand_trade.dto.UserLoginDTO;
import com.trade.second_hand_trade.dto.UserRegisterDTO;
import com.trade.second_hand_trade.entity.User;
import com.trade.second_hand_trade.vo.UserLoginVO;

public interface UserService {

    /**
     * 用户注册
     */
    void register(UserRegisterDTO dto);

    /**
     * 用户登录，返回 token 和用户信息
     */
    UserLoginVO login(UserLoginDTO dto);

    /**
     * 根据 id 查询用户
     */
    User getById(Integer id);
}
