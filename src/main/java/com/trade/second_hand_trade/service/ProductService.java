package com.trade.second_hand_trade.service;

import com.trade.second_hand_trade.common.PageResult;
import com.trade.second_hand_trade.dto.ProductPageQueryDTO;
import com.trade.second_hand_trade.entity.Product;
import com.trade.second_hand_trade.vo.ProductVO;
import java.util.List;


public interface ProductService {

    /**
     * 分页查询商品
     */
    PageResult pageQuery(ProductPageQueryDTO dto);

    /**
     * 根据id查询商品详情
     */
    ProductVO getById(Integer id);

    /**
     * 新增商品
     */
    void save(Product product);

    /**
     * 更新商品
     */
    void update(Product product);

    /**
     * 删除商品
     */
    void deleteById(Integer id);

    /**
     * 发布商品（自动绑定当前登录用户为卖家）
     */
    void publish(Product product);

    /**
     * 查询当前用户发布的商品（分页）
     */
    PageResult getMyProducts(ProductPageQueryDTO dto);

    /**
     * 商品上下架
     */
    void updateStatus(Integer id, String status);

    /**
     * 获取商品分类列表
     */
    List<String> getCategories();

}
