package com.trade.second_hand_trade.config;

import com.trade.second_hand_trade.interceptor.JwtTokenInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfiguration implements WebMvcConfigurer {

    @Autowired
    private JwtTokenInterceptor jwtTokenInterceptor;

    @Value("${upload.path}")
    private String uploadPath;

    @Value("${upload.url-prefix}")
    private String urlPrefix;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(jwtTokenInterceptor)
                .addPathPatterns("/api/**")
                .excludePathPatterns(
                        "/api/user/login",
                        "/api/user/register",
                        "/api/product/page",
                        "/api/product/detail/*",
                        "/api/product/categories",
                        "/images/**"
                );
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 图片静态资源映射
        registry.addResourceHandler(urlPrefix + "**")
                .addResourceLocations("file:" + uploadPath);
    }

    /**
     * 统一跨域配置（CORS）
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
