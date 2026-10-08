package com.trade.second_hand_trade.mapper;

import com.trade.second_hand_trade.entity.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper {

    /**
     * 根据用户名查询用户（登录时用）
     */
    User getByUsername(String username);

    /**
     * 根据 id 查询用户
     */
    User getById(Integer id);

    /**
     * 新增用户（注册时用）
     */
    int insert(User user);

    /**
     * 更新用户信息
     */
    int update(User user);
}
