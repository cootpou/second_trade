package com.trade.second_hand_trade.service.impl;

import com.github.pagehelper.Page;
import com.github.pagehelper.PageHelper;
import com.trade.second_hand_trade.common.PageResult;
import com.trade.second_hand_trade.common.constant.MessageConstant;
import com.trade.second_hand_trade.context.BaseContext;
import com.trade.second_hand_trade.entity.Favorite;
import com.trade.second_hand_trade.entity.Product;
import com.trade.second_hand_trade.exception.BaseException;
import com.trade.second_hand_trade.mapper.FavoriteMapper;
import com.trade.second_hand_trade.mapper.ProductMapper;
import com.trade.second_hand_trade.service.FavoriteService;
import com.trade.second_hand_trade.vo.FavoriteVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class FavoriteServiceImpl implements FavoriteService {

    @Autowired
    private FavoriteMapper favoriteMapper;

    @Autowired
    private ProductMapper productMapper;

    @Override
    public void add(Integer productId) {
        Integer userId = BaseContext.getCurrentId();

        // 校验商品存在
        Product product = productMapper.selectById(productId);
        if (product == null) {
            throw new BaseException(MessageConstant.PRODUCT_NOT_FOUND);
        }

        // 防止重复收藏
        Favorite exist = favoriteMapper.selectByUserAndProduct(userId, productId);
        if (exist != null) {
            return; // 已收藏，直接返回，不报错
        }

        Favorite favorite = new Favorite();
        favorite.setUserId(userId);
        favorite.setProductId(productId);
        favorite.setCreatedAt(LocalDateTime.now());
        favoriteMapper.insert(favorite);
    }

    @Override
    public void remove(Integer productId) {
        Integer userId = BaseContext.getCurrentId();
        favoriteMapper.delete(userId, productId);
    }

    @Override
    public boolean isFavorited(Integer productId) {
        Integer userId = BaseContext.getCurrentId();
        return favoriteMapper.selectByUserAndProduct(userId, productId) != null;
    }

    @Override
    public PageResult myFavorites(Integer page, Integer pageSize) {
        Integer userId = BaseContext.getCurrentId();
        PageHelper.startPage(page, pageSize);
        Page<FavoriteVO> result = favoriteMapper.pageQueryByUser(userId);
        return new PageResult(result.getTotal(), result.getResult());
    }
}
