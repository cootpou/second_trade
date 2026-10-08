package com.trade.second_hand_trade.controller;

import com.trade.second_hand_trade.common.PageResult;
import com.trade.second_hand_trade.common.Result;
import com.trade.second_hand_trade.service.FavoriteService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/favorite")
@Slf4j
public class FavoriteController {

    @Autowired
    private FavoriteService favoriteService;

    /**
     * 收藏商品
     */
    @PostMapping("/{productId}")
    public Result<String> add(@PathVariable Integer productId) {
        log.info("收藏商品：productId={}", productId);
        favoriteService.add(productId);
        return Result.success();
    }

    /**
     * 取消收藏
     */
    @DeleteMapping("/{productId}")
    public Result<String> remove(@PathVariable Integer productId) {
        log.info("取消收藏：productId={}", productId);
        favoriteService.remove(productId);
        return Result.success();
    }

    /**
     * 是否已收藏
     */
    @GetMapping("/check/{productId}")
    public Result<Boolean> check(@PathVariable Integer productId) {
        return Result.success(favoriteService.isFavorited(productId));
    }

    /**
     * 我的收藏列表
     */
    @GetMapping("/my")
    public Result<PageResult> myFavorites(@RequestParam(defaultValue = "1") Integer page,
                                          @RequestParam(defaultValue = "10") Integer pageSize) {
        return Result.success(favoriteService.myFavorites(page, pageSize));
    }
}
