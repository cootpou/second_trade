package com.trade.second_hand_trade.service;

import com.trade.second_hand_trade.common.PageResult;
import com.trade.second_hand_trade.dto.OrderPageQueryDTO;
import com.trade.second_hand_trade.dto.OrderSubmitDTO;
import com.trade.second_hand_trade.vo.OrderVO;

public interface OrderService {

    /**
     * 下单（@Transactional 事务：生成订单 + 商品改为已售出）
     */
    Integer submit(OrderSubmitDTO dto);

    /**
     * 买家查询自己的订单
     */
    PageResult pageQueryBuyer(OrderPageQueryDTO dto);

    /**
     * 卖家查询自己的订单
     */
    PageResult pageQuerySeller(OrderPageQueryDTO dto);

    /**
     * 订单详情
     */
    OrderVO detail(Integer id);

    /**
     * 买家取消订单（商品恢复在售）
     */
    void cancel(Integer id);

    /**
     * 买家付款（pending → paid）
     */
    void pay(Integer id);

    /**
     * 卖家发货/完成（paid → completed）
     */
    void complete(Integer id);
}
