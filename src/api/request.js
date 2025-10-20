import axios from 'axios'
import { Message } from 'element-ui'
import router from '../router'

// 创建axios实例
const service = axios.create({
  baseURL: 'http://localhost:8090', // API的base_url
  timeout: 15000 // 请求超时时间
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 添加token到请求头
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    console.log(error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data
    // 根据OpenAPI定义的响应格式处理
    if (res.code !== 200 && res.code !== 0) {
      if (res.code === 401) {
        localStorage.removeItem('token')
        router.push('/login')
        return Promise.reject(new Error('请先登录'))
      } else {
        Message({
          message: res.msg || '请求失败',
          type: 'error',
          duration: 5 * 1000
        })
        return Promise.reject(new Error(res.msg || '请求失败'))
      }
    }
    return res
  },
  error => {
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service 