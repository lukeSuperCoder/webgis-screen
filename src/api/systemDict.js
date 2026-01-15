import request from './request'

// 数据字典管理相关API

/**
 * 获取字典数据列表
 * @param {Object} params - 查询参数
 */
export function getDictDataList(params) {
  return request({
    url: '/system/dict/data/list',
    method: 'get',
    params
  })
}

/**
 * 获取字典数据详情
 * @param {string|number} dictCode - 字典编码
 */
export function getDictDataInfo(dictCode) {
  return request({
    url: `/system/dict/data/${dictCode}`,
    method: 'get'
  })
}

/**
 * 添加字典数据
 * @param {Object} data - 字典数据
 */
export function addDictData(data) {
  return request({
    url: '/system/dict/data',
    method: 'post',
    data
  })
}

/**
 * 更新字典数据
 * @param {Object} data - 字典数据
 */
export function updateDictData(data) {
  return request({
    url: '/system/dict/data',
    method: 'put',
    data
  })
}

/**
 * 删除字典数据
 * @param {string|Array} dictCodes - 字典编码或编码数组
 */
export function deleteDictData(dictCodes) {
  return request({
    url: '/system/dict/data',
    method: 'delete',
    data: dictCodes
  })
}

/**
 * 导出字典数据
 * @param {Object} params - 查询参数
 */
export function exportDictData(params) {
  return request({
    url: '/system/dict/data/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

/**
 * 获取字典类型列表
 * @param {Object} params - 查询参数
 */
export function getDictTypeList(params) {
  return request({
    url: '/system/dict/type/list',
    method: 'get',
    params
  })
}

/**
 * 获取字典类型详情
 * @param {string|number} dictId - 字典类型ID
 */
export function getDictTypeInfo(dictId) {
  return request({
    url: `/system/dict/type/${dictId}`,
    method: 'get'
  })
}

/**
 * 添加字典类型
 * @param {Object} data - 字典类型数据
 */
export function addDictType(data) {
  return request({
    url: '/system/dict/type',
    method: 'post',
    data
  })
}

/**
 * 更新字典类型
 * @param {Object} data - 字典类型数据
 */
export function updateDictType(data) {
  return request({
    url: '/system/dict/type',
    method: 'put',
    data
  })
}

/**
 * 删除字典类型
 * @param {string|Array} dictIds - 字典类型ID或ID数组
 */
export function deleteDictType(dictIds) {
  return request({
    url: '/system/dict/type',
    method: 'delete',
    data: dictIds
  })
}

/**
 * 导出字典类型
 * @param {Object} params - 查询参数
 */
export function exportDictType(params) {
  return request({
    url: '/system/dict/type/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

/**
 * 获取字典类型选项
 * @param {Object} params - 查询参数
 */
export function getDictTypeOptions(params) {
  return request({
    url: '/system/dict/type/optionselect',
    method: 'get',
    params
  })
}

/**
 * 刷新字典缓存
 */
export function refreshDictCache() {
  return request({
    url: '/system/dict/type/refreshCache',
    method: 'delete'
  })
}
