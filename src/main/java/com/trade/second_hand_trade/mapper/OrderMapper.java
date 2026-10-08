package com.trade.second_hand_trade.mapper;

import com.github.pagehelper.Page;
import com.trade.second_hand_trade.dto.OrderPageQueryDTO;
import com.trade.second_hand_trade.entity.Order;
import com.trade.second_hand_trade.vo.OrderVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface OrderMapper {

    /**
     * 插入订单
     */
    int insert(Order order);

    /**
     * 根据id查询订单
     */
    Order selectById(Integer id);

    /**
     * 更新订单状态
     */
    int updateStatus(@Param("id") Integer id, @Param("status") String status);

    /**
     * 买家分页查询自己的订单
     */
    Page<OrderVO> pageQueryByBuyer(@Param("buyerId") Integer buyerId,
                                   @Param("dto") OrderPageQueryDTO dto);

    /**
     * 卖家分页查询自己的订单
     */
    Page<OrderVO> pageQueryBySeller(@Param("sellerId") Integer sellerId,
                                    @Param("dto") OrderPageQueryDTO dto);

    /**
     * 查询订单详情（联表商品、买家、卖家）
     */
    OrderVO selectDetailById(Integer id);

    /**
     * 查询超时未付款的订单（超过30分钟，状态为pending）
     */
    java.util.List<Order> selectTimeoutOrders(@Param("minutes") Integer minutes);
}
