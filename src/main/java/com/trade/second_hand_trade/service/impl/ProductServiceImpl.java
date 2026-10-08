package com.trade.second_hand_trade.service.impl;

import com.github.pagehelper.Page;
import com.github.pagehelper.PageHelper;
import com.trade.second_hand_trade.common.PageResult;
import com.trade.second_hand_trade.common.constant.MessageConstant;
import com.trade.second_hand_trade.context.BaseContext;
import com.trade.second_hand_trade.dto.ProductPageQueryDTO;
import com.trade.second_hand_trade.entity.Product;
import com.trade.second_hand_trade.exception.BaseException;
import com.trade.second_hand_trade.mapper.ProductMapper;
import com.trade.second_hand_trade.mapper.UserMapper;
import com.trade.second_hand_trade.entity.User;
import com.trade.second_hand_trade.service.ProductService;
import com.trade.second_hand_trade.vo.ProductVO;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
public class ProductServiceImpl implements ProductService {

    @Autowired
    private ProductMapper productMapper;

    @Autowired
    private UserMapper userMapper;

    // 平台支持的商品分类（常量方式，后续可改为数据库表）
    private static final List<String> CATEGORIES = Arrays.asList(
            "书籍教材", "数码电子", "生活用品", "服饰鞋包",
            "运动户外", "美妆护肤", "乐器", "其他"
    );

    @Override
    public PageResult pageQuery(ProductPageQueryDTO dto) {
        PageHelper.startPage(dto.getPage(), dto.getPageSize());
        Page<ProductVO> page = productMapper.pageQuery(dto);
        return new PageResult(page.getTotal(), page.getResult());
    }

    @Override
    public ProductVO getById(Integer id) {
        Product product = productMapper.selectById(id);
        if (product == null) {
            throw new BaseException(MessageConstant.PRODUCT_NOT_FOUND);
        }
        ProductVO vo = new ProductVO();
        BeanUtils.copyProperties(product, vo);
        // 商品详情需要展示卖家昵称（Product 实体里没有该字段，这里补上）
        User seller = userMapper.getById(product.getSellerId());
        if (seller != null) {
            vo.setSellerName(seller.getUsername());
        }
        return vo;
    }

    @Override
    public void save(Product product) {

    }

    /**
     * 发布商品：sellerId 从 ThreadLocal 取，前端不需要传
     */
    @Override
    public void publish(Product product) {
        Integer currentUserId = BaseContext.getCurrentId();
        product.setSellerId(currentUserId);
        product.setStatus("active");
        product.setViewCount(0);
        product.setLikeCount(0);
        product.setCreatedAt(LocalDateTime.now());
        product.setUpdatedAt(LocalDateTime.now());
        productMapper.insert(product);
    }

    /**
     * 更新商品：只能改自己发布的
     */
    @Override
    public void update(Product product) {
        // 校验是否是自己的商品
        Product exist = productMapper.selectById(product.getId());
        if (exist == null) {
            throw new BaseException(MessageConstant.PRODUCT_NOT_FOUND);
        }
        if (!exist.getSellerId().equals(BaseContext.getCurrentId())) {
            throw new BaseException(MessageConstant.NOT_PRODUCT_OWNER);
        }
        product.setSellerId(null);       // 不允许改卖家
        product.setUpdatedAt(LocalDateTime.now());
        productMapper.update(product);
    }

    /**
     * 删除商品：只能删自己发布的
     */
    @Override
    public void deleteById(Integer id) {
        Product exist = productMapper.selectById(id);
        if (exist == null) {
            throw new BaseException(MessageConstant.PRODUCT_NOT_FOUND);
        }
        if (!exist.getSellerId().equals(BaseContext.getCurrentId())) {
            throw new BaseException(MessageConstant.NOT_PRODUCT_OWNER);
        }
        productMapper.deleteById(id);
    }

    /**
     * 查询当前用户发布的商品
     */
    @Override
    public PageResult getMyProducts(ProductPageQueryDTO dto) {
        Integer currentUserId = BaseContext.getCurrentId();
        PageHelper.startPage(dto.getPage(), dto.getPageSize());
        Page<ProductVO> page = productMapper.pageQueryBySellerId(currentUserId, dto);
        return new PageResult(page.getTotal(), page.getResult());
    }

    /**
     * 商品上下架
     */
    @Override
    public void updateStatus(Integer id, String status) {
        Product exist = productMapper.selectById(id);
        if (exist == null) {
            throw new BaseException(MessageConstant.PRODUCT_NOT_FOUND);
        }
        if (!exist.getSellerId().equals(BaseContext.getCurrentId())) {
            throw new BaseException(MessageConstant.NOT_PRODUCT_OWNER);
        }
        productMapper.updateStatus(id, status);
    }

    /**
     * 获取分类列表
     */
    @Override
    public List<String> getCategories() {
        return CATEGORIES;
    }
}
