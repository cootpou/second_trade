package com.trade.second_hand_trade.entity;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class User {
    private Integer id;
    private String username;
    private String passwordHash;
    private String email;
    private String phone;
    private String studentId;
    private String realName;
    private String role;
    private Integer creditScore;
    private BigDecimal balance;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;
    private Integer verified;
}
