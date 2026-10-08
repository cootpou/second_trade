package com.trade.second_hand_trade.service.impl;

import com.github.pagehelper.Page;
import com.github.pagehelper.PageHelper;
import com.trade.second_hand_trade.common.PageResult;
import com.trade.second_hand_trade.common.constant.MessageConstant;
import com.trade.second_hand_trade.context.BaseContext;
import com.trade.second_hand_trade.dto.OrderPageQueryDTO;
import com.trade.second_hand_trade.dto.OrderSubmitDTO;
import com.trade.second_hand_trade.entity.Order;
import com.trade.second_hand_trade.entity.Product;
import com.trade.second_hand_trade.exception.BaseException;
import com.trade.second_hand_trade.mapper.OrderMapper;
import com.trade.second_hand_trade.mapper.ProductMapper;
import com.trade.second_hand_trade.service.OrderService;
import com.trade.second_hand_trade.vo.OrderVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class OrderServiceImpl implements OrderService {

    @Autowired
    private OrderMapper orderMapper;

    @Autowired
    private ProductMapper productMapper;

    /**
     * 下单（⭐ 面试重点：@Transactional 声明式事务）
     * 原子操作：1.校验商品  2.生成订单  3.商品状态改为"已售出"
     * 任意一步失败，全部回滚
     */
    @Override
    @Transactional
    public Integer submit(OrderSubmitDTO dto) {
        Integer currentUserId = BaseContext.getCurrentId();

        // 1. 校验商品是否存在
        Product product = productMapper.selectById(dto.getProductId());
        if (product == null) {
            throw new BaseException(MessageConstant.PRODUCT_NOT_FOUND);
        }

        // 2. 校验商品是否在售
        if (!"active".equals(product.getStatus())) {
            throw new BaseException(MessageConstant.PRODUCT_NOT_ON_SALE);
        }

        // 3. 不能买自己发布的商品
        if (product.getSellerId().equals(currentUserId)) {
            throw new BaseException(MessageConstant.CANNOT_BUY_OWN_PRODUCT);
        }

        // 4. 生成订单
        Order order = new Order();
        order.setProductId(dto.getProductId());
        order.setBuyerId(currentUserId);
        order.setSellerId(product.getSellerId());
        order.setPrice(product.getPrice());
        order.setStatus("pending");
        order.setPaymentMethod(dto.getPaymentMethod());
        order.setDeliveryMethod(dto.getDeliveryMethod());
        order.setMeetupLocation(dto.getMeetupLocation());
        order.setMeetupTime(dto.getMeetupTime());
        order.setCreatedAt(LocalDateTime.now());
        orderMapper.insert(order);

        // 5. 商品状态改为"已售出"
        productMapper.updateStatus(dto.getProductId(), "sold");

        return order.getId();
    }

    /**
     * 买家查询自己的订单
     */
    @Override
    public PageResult pageQueryBuyer(OrderPageQueryDTO dto) {
        Integer currentUserId = BaseContext.getCurrentId();
        PageHelper.startPage(dto.getPage(), dto.getPageSize());
        Page<OrderVO> page = orderMapper.pageQueryByBuyer(currentUserId, dto);
        return new PageResult(page.getTotal(), page.getResult());
    }

    /**
     * 卖家查询自己的订单
     */
    @Override
    public PageResult pageQuerySeller(OrderPageQueryDTO dto) {
        Integer currentUserId = BaseContext.getCurrentId();
        PageHelper.startPage(dto.getPage(), dto.getPageSize());
        Page<OrderVO> page = orderMapper.pageQueryBySeller(currentUserId, dto);
        return new PageResult(page.getTotal(), page.getResult());
    }

    /**
     * 订单详情（买家或卖家都能看自己相关的订单）
     */
    @Override
    public OrderVO detail(Integer id) {
        OrderVO order = orderMapper.selectDetailById(id);
        if (order == null) {
            throw new BaseException(MessageConstant.ORDER_NOT_FOUND);
        }
        Integer currentUserId = BaseContext.getCurrentId();
        // 只有买家或卖家能查看
        if (!order.getBuyerId().equals(currentUserId) && !order.getSellerId().equals(currentUserId)) {
            throw new BaseException(MessageConstant.NOT_ORDER_OWNER);
        }
        return order;
    }

    /**
     * 买家取消订单（商品恢复在售）
     */
    @Override
    @Transactional
    public void cancel(Integer id) {
        Order order = orderMapper.selectById(id);
        if (order == null) {
            throw new BaseException(MessageConstant.ORDER_NOT_FOUND);
        }
        // 只有买家能取消
        if (!order.getBuyerId().equals(BaseContext.getCurrentId())) {
            throw new BaseException(MessageConstant.NOT_ORDER_OWNER);
        }
        // 只有待付款状态能取消
        if (!"pending".equals(order.getStatus())) {
            throw new BaseException(MessageConstant.ORDER_STATUS_ERROR);
        }
        // 1. 订单改为已取消
        orderMapper.updateStatus(id, "cancelled");
        // 2. 商品恢复在售
        productMapper.updateStatus(order.getProductId(), "active");
    }

    /**
     * 买家付款（pending → paid）
     */
    @Override
    public void pay(Integer id) {
        Order order = orderMapper.selectById(id);
        if (order == null) {
            throw new BaseException(MessageConstant.ORDER_NOT_FOUND);
        }
        if (!order.getBuyerId().equals(BaseContext.getCurrentId())) {
            throw new BaseException(MessageConstant.NOT_ORDER_OWNER);
        }
        if (!"pending".equals(order.getStatus())) {
            throw new BaseException(MessageConstant.ORDER_STATUS_ERROR);
        }
        orderMapper.updateStatus(id, "paid");
    }

    /**
     * 卖家发货/完成（paid → completed）
     */
    @Override
    public void complete(Integer id) {
        Order order = orderMapper.selectById(id);
        if (order == null) {
            throw new BaseException(MessageConstant.ORDER_NOT_FOUND);
        }
        if (!order.getSellerId().equals(BaseContext.getCurrentId())) {
            throw new BaseException(MessageConstant.NOT_ORDER_OWNER);
        }
        if (!"paid".equals(order.getStatus())) {
            throw new BaseException(MessageConstant.ORDER_STATUS_ERROR);
        }
        orderMapper.updateStatus(id, "completed");
    }
}
