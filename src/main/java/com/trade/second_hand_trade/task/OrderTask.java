package com.trade.second_hand_trade.task;

import com.trade.second_hand_trade.entity.Order;
import com.trade.second_hand_trade.mapper.OrderMapper;
import com.trade.second_hand_trade.mapper.ProductMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Spring Task 定时任务（苍穹外卖同款）
 * 每1分钟检查一次，超过30分钟未付款的订单自动取消，商品恢复在售
 */
@Component
@Slf4j
public class OrderTask {

    @Autowired
    private OrderMapper orderMapper;

    @Autowired
    private ProductMapper productMapper;

    /**
     * 每分钟执行一次
     * cron表达式：秒 分 时 日 月 周
     * 0 * * * * ? = 每分钟的第0秒执行
     */
    @Scheduled(cron = "0 * * * * ?")
    @Transactional
    public void processTimeoutOrder() {
        List<Order> timeoutOrders = orderMapper.selectTimeoutOrders(30);
        if (timeoutOrders != null && !timeoutOrders.isEmpty()) {
            log.info("定时任务：发现{}个超时未付款订单，自动取消", timeoutOrders.size());
            for (Order order : timeoutOrders) {
                // 1. 订单改为已取消
                orderMapper.updateStatus(order.getId(), "cancelled");
                // 2. 商品恢复在售
                productMapper.updateStatus(order.getProductId(), "active");
                log.info("订单{}已自动取消，商品{}恢复在售", order.getId(), order.getProductId());
            }
        }
    }
}
