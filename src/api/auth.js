import request from './request'

// 登录验证管理相关API

/**
 * 用户登录
 * @param {Object} data - 登录数据
 * @param {string} data.username - 用户名
 * @param {string} data.password - 密码
 */
export function login(data) {
  return request({
    url: '/login',
    method: 'post',
    data: data
  })
}

/**
 * 获取用户信息
 */
export function getUserInfo() {
  return request({
    url: '/getInfo',
    method: 'get'
  })
}

/**
 * 获取路由信息
 */
export function getRouters() {
  return request({
    url: '/getRouters',
    method: 'get'
  })
}

/**
 * 用户登出
 */
export function logout() {
  return request({
    url: '/logout',
    method: 'post'
  })
}
