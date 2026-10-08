package com.trade.second_hand_trade.controller;

import com.trade.second_hand_trade.common.PageResult;
import com.trade.second_hand_trade.common.Result;
import com.trade.second_hand_trade.dto.OrderPageQueryDTO;
import com.trade.second_hand_trade.dto.OrderSubmitDTO;
import com.trade.second_hand_trade.service.OrderService;
import com.trade.second_hand_trade.vo.OrderVO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/order")
@Slf4j
public class OrderController {

    @Autowired
    private OrderService orderService;

    /**
     * 下单（需登录）
     */
    @PostMapping("/submit")
    public Result<Integer> submit(@RequestBody OrderSubmitDTO dto) {
        log.info("下单：productId={}", dto.getProductId());
        Integer orderId = orderService.submit(dto);
        return Result.success(orderId);
    }

    /**
     * 我买到的订单（买家视角，需登录）
     */
    @GetMapping("/buyer")
    public Result<PageResult> buyerOrders(OrderPageQueryDTO dto) {
        log.info("买家查询订单");
        return Result.success(orderService.pageQueryBuyer(dto));
    }

    /**
     * 我卖出的订单（卖家视角，需登录）
     */
    @GetMapping("/seller")
    public Result<PageResult> sellerOrders(OrderPageQueryDTO dto) {
        log.info("卖家查询订单");
        return Result.success(orderService.pageQuerySeller(dto));
    }

    /**
     * 订单详情（需登录）
     */
    @GetMapping("/{id}")
    public Result<OrderVO> detail(@PathVariable Integer id) {
        return Result.success(orderService.detail(id));
    }

    /**
     * 取消订单（买家操作，需登录）
     */
    @PostMapping("/cancel/{id}")
    public Result<String> cancel(@PathVariable Integer id) {
        log.info("取消订单：id={}", id);
        orderService.cancel(id);
        return Result.success();
    }

    /**
     * 付款（买家操作，需登录）
     */
    @PostMapping("/pay/{id}")
    public Result<String> pay(@PathVariable Integer id) {
        log.info("付款：id={}", id);
        orderService.pay(id);
        return Result.success();
    }

    /**
     * 发货/完成（卖家操作，需登录）
     */
    @PostMapping("/complete/{id}")
    public Result<String> complete(@PathVariable Integer id) {
        log.info("完成订单：id={}", id);
        orderService.complete(id);
        return Result.success();
    }
}
