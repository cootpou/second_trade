package com.trade.second_hand_trade.exception;

/**
 * 业务异常基类
 * 业务逻辑出错时抛这个，全局异常处理器统一捕获
 */
public class BaseException extends RuntimeException {
    public BaseException(String msg) {
        super(msg);
    }
}
