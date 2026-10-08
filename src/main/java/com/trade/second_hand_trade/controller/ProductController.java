package com.trade.second_hand_trade.controller;

import com.trade.second_hand_trade.common.PageResult;
import com.trade.second_hand_trade.common.Result;
import com.trade.second_hand_trade.common.constant.MessageConstant;
import com.trade.second_hand_trade.dto.ProductPageQueryDTO;
import com.trade.second_hand_trade.entity.Product;
import com.trade.second_hand_trade.exception.BaseException;
import com.trade.second_hand_trade.service.ProductService;
import com.trade.second_hand_trade.vo.ProductVO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/product")
@Slf4j
public class ProductController {

    @Autowired
    private ProductService productService;

    @Value("${upload.path}")
    private String uploadPath;

    @Value("${upload.url-prefix}")
    private String urlPrefix;

    /**
     * 分页查询商品列表（游客可访问）
     */
    @GetMapping("/page")
    public Result<PageResult> page(ProductPageQueryDTO dto) {
        log.info("商品分页查询：{}", dto);
        return Result.success(productService.pageQuery(dto));
    }

    /**
     * 商品详情（游客可访问）
     */
    @GetMapping("/detail/{id}")
    public Result<ProductVO> getById(@PathVariable Integer id) {
        return Result.success(productService.getById(id));
    }

    /**
     * 发布商品（需登录，sellerId 自动绑定当前用户）
     */
    @PostMapping
    public Result<String> publish(@RequestBody Product product) {
        log.info("发布商品：{}", product.getTitle());
        productService.publish(product);
        return Result.success();
    }

    /**
     * 修改商品（需登录，只能改自己的）
     */
    @PutMapping
    public Result<String> update(@RequestBody Product product) {
        log.info("修改商品：id={}", product.getId());
        productService.update(product);
        return Result.success();
    }

    /**
     * 删除商品（需登录，只能删自己的）
     */
    @DeleteMapping("/{id}")
    public Result<String> delete(@PathVariable Integer id) {
        log.info("删除商品：id={}", id);
        productService.deleteById(id);
        return Result.success();
    }

    /**
     * 我的商品列表（需登录）
     */
    @GetMapping("/my")
    public Result<PageResult> myProducts(ProductPageQueryDTO dto) {
        log.info("查询我的商品");
        return Result.success(productService.getMyProducts(dto));
    }

    /**
     * 商品上下架（需登录）
     */
    @PostMapping("/status/{id}")
    public Result<String> updateStatus(@PathVariable Integer id,
                                       @RequestParam String status) {
        log.info("商品上下架：id={}, status={}", id, status);
        productService.updateStatus(id, status);
        return Result.success();
    }

    /**
     * 商品分类列表（游客可访问）
     */
    @GetMapping("/categories")
    public Result<List<String>> categories() {
        return Result.success(productService.getCategories());
    }

    /**
     * 图片上传（需登录）
     */
    @PostMapping("/upload")
    public Result<String> upload(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BaseException(MessageConstant.UPLOAD_FAILED);
        }

        String originalFilename = file.getOriginalFilename();
        String suffix = originalFilename.substring(originalFilename.lastIndexOf("."));
        String newFilename = UUID.randomUUID().toString() + suffix;

        File dir = new File(uploadPath);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        try {
            file.transferTo(new File(uploadPath + newFilename));
        } catch (IOException e) {
            log.error("图片上传失败", e);
            throw new BaseException(MessageConstant.UPLOAD_FAILED);
        }

        String imageUrl = urlPrefix + newFilename;
        log.info("图片上传成功：{}", imageUrl);
        return Result.success(imageUrl);
    }
}
