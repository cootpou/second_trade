package com.trade.second_hand_trade.dto;

import lombok.Data;
import java.io.Serializable;

@Data
public class UserRegisterDTO implements Serializable {
    private String username;
    private String password;
    private String email;
    private String phone;
    private String studentId;
    private String realName;
}
