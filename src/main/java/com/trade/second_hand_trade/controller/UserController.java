package com.trade.second_hand_trade.controller;

import com.trade.second_hand_trade.common.Result;
import com.trade.second_hand_trade.context.BaseContext;
import com.trade.second_hand_trade.dto.UserLoginDTO;
import com.trade.second_hand_trade.dto.UserRegisterDTO;
import com.trade.second_hand_trade.entity.User;
import com.trade.second_hand_trade.service.UserService;
import com.trade.second_hand_trade.vo.UserLoginVO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@Slf4j
public class UserController {

    @Autowired
    private UserService userService;

    /**
     * 用户注册
     * POST /api/user/register（放行，不需要登录）
     */
    @PostMapping("/register")
    public Result<String> register(@RequestBody UserRegisterDTO dto) {
        log.info("用户注册：{}", dto.getUsername());
        userService.register(dto);
        return Result.success();
    }

    /**
     * 用户登录
     * POST /api/user/login（放行，不需要登录）
     */
    @PostMapping("/login")
    public Result<UserLoginVO> login(@RequestBody UserLoginDTO dto) {
        log.info("用户登录：{}", dto.getUsername());
        UserLoginVO vo = userService.login(dto);
        return Result.success(vo);
    }

    /**
     * 获取当前登录用户信息
     * GET /api/user/current（需要登录，被拦截器校验）
     */
    @GetMapping("/current")
    public Result<User> getCurrentUser() {
        Integer userId = BaseContext.getCurrentId(); // 从 ThreadLocal 取
        log.info("获取当前用户信息，id：{}", userId);
        User user = userService.getById(userId);
        user.setPasswordHash(null); // 不返回密码
        return Result.success(user);
    }
}
