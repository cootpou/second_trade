package com.trade.second_hand_trade.service.impl;

import com.trade.second_hand_trade.common.JwtProperties;
import com.trade.second_hand_trade.common.constant.MessageConstant;
import com.trade.second_hand_trade.dto.UserLoginDTO;
import com.trade.second_hand_trade.dto.UserRegisterDTO;
import com.trade.second_hand_trade.entity.User;
import com.trade.second_hand_trade.exception.BaseException;
import com.trade.second_hand_trade.mapper.UserMapper;
import com.trade.second_hand_trade.service.UserService;
import com.trade.second_hand_trade.util.JwtUtil;
import com.trade.second_hand_trade.vo.UserLoginVO;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private JwtProperties jwtProperties;

    // BCrypt 密码加密器（Spring Security 提供）
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    /**
     * 用户注册
     */
    @Override
    public void register(UserRegisterDTO dto) {
        // 1. 检查用户名是否已存在
        User existUser = userMapper.getByUsername(dto.getUsername());
        if (existUser != null) {
            throw new BaseException(MessageConstant.USERNAME_ALREADY_EXISTS);
        }

        // 2. 密码加密（BCrypt 每次加密结果不同，自带盐值，无法反推）
        String encodedPassword = passwordEncoder.encode(dto.getPassword());

        // 3. 组装用户对象，补全默认值
        User user = new User();
        BeanUtils.copyProperties(dto, user);
        user.setPasswordHash(encodedPassword);
        user.setRole("student");
        user.setCreditScore(100);
        user.setBalance(BigDecimal.ZERO);
        user.setStatus("active");
        user.setVerified(0);
        user.setCreatedAt(LocalDateTime.now());

        // 4. 插入数据库
        userMapper.insert(user);
    }

    /**
     * 用户登录
     */
    @Override
    public UserLoginVO login(UserLoginDTO dto) {
        // 1. 根据用户名查用户
        User user = userMapper.getByUsername(dto.getUsername());
        if (user == null) {
            throw new BaseException(MessageConstant.USERNAME_NOT_FOUND);
        }

        // 2. 校验账号状态
        if (!"active".equals(user.getStatus())) {
            throw new BaseException(MessageConstant.ACCOUNT_LOCKED);
        }

        // 3. 校验密码（BCrypt 比对，不是简单 equals）
        if (!passwordEncoder.matches(dto.getPassword(), user.getPasswordHash())) {
            throw new BaseException(MessageConstant.PASSWORD_ERROR);
        }

        // 4. 更新最后登录时间
        user.setLastLogin(LocalDateTime.now());
        userMapper.update(user);

        // 5. 生成 JWT token，把用户 id 放进去
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId());
        String token = JwtUtil.createJWT(
                jwtProperties.getSecretKey(),
                jwtProperties.getTtl(),
                claims
        );

        // 6. 封装返回值
        UserLoginVO vo = new UserLoginVO();
        vo.setId(user.getId());
        vo.setUsername(user.getUsername());
        vo.setToken(token);
        return vo;
    }

    @Override
    public User getById(Integer id) {
        return userMapper.getById(id);
    }
}
