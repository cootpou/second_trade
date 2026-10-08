package com.trade.second_hand_trade.mapper;

import com.github.pagehelper.Page;
import com.trade.second_hand_trade.dto.ProductPageQueryDTO;
import com.trade.second_hand_trade.entity.Product;
import com.trade.second_hand_trade.vo.ProductVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface ProductMapper {

    List<Product> selectAll();

    Product selectById(Integer id);

    int insert(Product product);

    int update(Product product);

    int deleteById(Integer id);

    /**
     * 分页查询（返回 VO，PageHelper 会自动处理 limit）
     */
    Page<ProductVO> pageQuery(ProductPageQueryDTO dto);

    /**
     * 根据卖家id分页查询商品
     */
    Page<ProductVO> pageQueryBySellerId(@Param("sellerId") Integer sellerId,
                                        @Param("dto") ProductPageQueryDTO dto);

    /**
     * 更新商品状态（上下架）
     */
    int updateStatus(@Param("id") Integer id, @Param("status") String status);
}
