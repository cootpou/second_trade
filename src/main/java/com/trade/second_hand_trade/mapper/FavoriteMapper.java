package com.trade.second_hand_trade.mapper;

import com.github.pagehelper.Page;
import com.trade.second_hand_trade.entity.Favorite;
import com.trade.second_hand_trade.vo.FavoriteVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface FavoriteMapper {

    /**
     * 新增收藏
     */
    int insert(Favorite favorite);

    /**
     * 取消收藏
     */
    int delete(@Param("userId") Integer userId, @Param("productId") Integer productId);

    /**
     * 查询是否已收藏
     */
    Favorite selectByUserAndProduct(@Param("userId") Integer userId,
                                    @Param("productId") Integer productId);

    /**
     * 分页查询我的收藏（联表商品信息）
     */
    Page<FavoriteVO> pageQueryByUser(Integer userId);
}
