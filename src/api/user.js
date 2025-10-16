import request from './request'

// 用户信息管理相关API

/**
 * 获取用户列表
 * @param {Object} params - 查询参数
 */
export function getUserList(params) {
  return request({
    url: '/system/user/list',
    method: 'get',
    params
  })
}

/**
 * 获取用户详情
 * @param {string|number} userId - 用户ID
 */
export function getUserInfo(userId) {
  return request({
    url: `/system/user/${userId}`,
    method: 'get'
  })
}

/**
 * 添加用户
 * @param {Object} data - 用户数据
 */
export function addUser(data) {
  return request({
    url: '/system/user',
    method: 'post',
    data
  })
}

/**
 * 更新用户
 * @param {Object} data - 用户数据
 */
export function updateUser(data) {
  return request({
    url: '/system/user',
    method: 'put',
    data
  })
}

/**
 * 删除用户
 * @param {string|Array} userIds - 用户ID或ID数组
 */
export function deleteUser(userIds) {
  return request({
    url: '/system/user',
    method: 'delete',
    data: userIds
  })
}

/**
 * 导出用户
 * @param {Object} params - 查询参数
 */
export function exportUser(params) {
  return request({
    url: '/system/user/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

/**
 * 导入用户数据
 * @param {FormData} formData - 包含文件的表单数据
 */
export function importUserData(formData) {
  return request({
    url: '/system/user/importData',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 下载用户导入模板
 */
export function downloadUserTemplate() {
  return request({
    url: '/system/user/importTemplate',
    method: 'get',
    responseType: 'blob'
  })
}

/**
 * 修改用户状态
 * @param {Object} data - 状态数据
 */
export function changeUserStatus(data) {
  return request({
    url: '/system/user/changeStatus',
    method: 'put',
    data
  })
}

/**
 * 重置用户密码
 * @param {Object} data - 密码重置数据
 */
export function resetUserPassword(data) {
  return request({
    url: '/system/user/resetPwd',
    method: 'put',
    data
  })
}

/**
 * 获取部门树
 * @param {Object} params - 查询参数
 */
export function getUserDeptTree(params) {
  return request({
    url: '/system/user/deptTree',
    method: 'get',
    params
  })
}

/**
 * 获取用户授权角色
 * @param {string|number} userId - 用户ID
 */
export function getUserAuthRole(userId) {
  return request({
    url: `/system/user/authRole/${userId}`,
    method: 'get'
  })
}

/**
 * 保存用户授权角色
 * @param {Object} data - 授权数据
 */
export function saveUserAuthRole(data) {
  return request({
    url: '/system/user/authRole',
    method: 'put',
    data
  })
} 