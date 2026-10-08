import request from '@/utils/request'
/**
 *
 * 商品管理
 *
 **/

// 商品分页查询
export const getProductPage = (params: any) => {
  return request({
    url: '/product/page',
    method: 'get',
    params
  })
}

// 商品详情
export const getProductDetail = (id: any) => {
  return request({
    url: `/product/detail/${id}`,
    method: 'get'
  })
}

// 商品上下架
export const enableOrDisableProduct = (params: any) => {
  return request({
    url: `/product/status/${params.id}?status=${params.status}`,
    method: 'post'
  })
}

// 删除商品
export const deleProduct = (id: any) => {
  return request({
    url: `/product/${id}`,
    method: 'delete'
  })
}

// 商品分类列表
export const getCategories = () => {
  return request({
    url: '/product/categories',
    method: 'get'
  })
}
