package com.trade.second_hand_trade.dto;

import lombok.Data;
import java.io.Serializable;

/**
 * 商品分页查询参数
 * 前端传：页码、每页条数、分类、状态、搜索关键字
 */
@Data
public class ProductPageQueryDTO implements Serializable {

    private int page = 1;          // 页码，默认第1页
    private int pageSize = 10;     // 每页条数，默认10条
    private String category;       // 分类筛选
    private String status;         // 状态筛选
    private String keyword;        // 搜索关键字（匹配标题）
}
