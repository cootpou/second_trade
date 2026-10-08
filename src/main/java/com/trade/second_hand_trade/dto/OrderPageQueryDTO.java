package com.trade.second_hand_trade.dto;

import lombok.Data;

@Data
public class OrderPageQueryDTO {
    private Integer page = 1;
    private Integer pageSize = 10;
    private String status;     // 按状态筛选，可空
}
