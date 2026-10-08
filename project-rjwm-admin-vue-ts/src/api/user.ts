import request from '@/utils/request'
/**
 *
 * 用户模块（登录/注册）
 *
 **/
// 登录
export const login = (data: any) =>
  request({
    'url': '/user/login',
    'method': 'post',
    data
  })
// 注册
export const register = (data: any) =>
  request({
    'url': '/user/register',
    'method': 'post',
    data
  })
