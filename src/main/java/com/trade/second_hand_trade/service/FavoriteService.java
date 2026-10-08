package com.trade.second_hand_trade.service;

import com.trade.second_hand_trade.common.PageResult;
import com.trade.second_hand_trade.vo.FavoriteVO;

public interface FavoriteService {

    /**
     * 收藏商品
     */
    void add(Integer productId);

    /**
     * 取消收藏
     */
    void remove(Integer productId);

    /**
     * 是否已收藏
     */
    boolean isFavorited(Integer productId);

    /**
     * 我的收藏列表
     */
    PageResult myFavorites(Integer page, Integer pageSize);
}
