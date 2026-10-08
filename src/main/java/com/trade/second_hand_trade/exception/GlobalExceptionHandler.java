package com.trade.second_hand_trade.exception;

import com.trade.second_hand_trade.common.Result;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 捕获业务异常
     */
    @ExceptionHandler(BaseException.class)
    public Result<String> exceptionHandler(BaseException ex) {
        log.error("异常信息：{}", ex.getMessage());
        return Result.error(ex.getMessage());
    }

    /**
     * 静态资源404（如 favicon.ico），不打印错误日志，避免刷屏
     */
    @ExceptionHandler(NoResourceFoundException.class)
    public Result<String> noResourceFoundHandler(NoResourceFoundException ex) {
        return Result.error("资源不存在");
    }

    /**
     * 捕获其他所有异常（兜底）
     */
    @ExceptionHandler(Exception.class)
    public Result<String> exceptionHandler(Exception ex) {
        log.error("系统异常：", ex);
        return Result.error("系统繁忙，请稍后重试");
    }
}
