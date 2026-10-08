package com.trade.second_hand_trade;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@MapperScan("com.trade.second_hand_trade.mapper")
@EnableScheduling   // 开启Spring Task定时任务
public class SecondHandTradeApplication {
    public static void main(String[] args) {
        SpringApplication.run(SecondHandTradeApplication.class, args);
    }
}
