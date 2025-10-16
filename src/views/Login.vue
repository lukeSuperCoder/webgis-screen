<template>
  <div class="login-container">
    <el-card class="login-card">
      <div class="title">呼伦贝尔市地下水环境监管系统</div>
      <el-form :model="loginForm" :rules="rules" ref="loginForm" class="login-form">
        <el-form-item prop="username">
          <el-input 
            v-model="loginForm.username"
            prefix-icon="el-icon-user"
            placeholder="请输入用户名">
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input 
            v-model="loginForm.password"
            prefix-icon="el-icon-lock"
            type="password"
            placeholder="请输入密码"
            @keyup.enter.native="handleLogin">
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button 
            type="primary" 
            @click="handleLogin" 
            class="login-button"
            :loading="loading">
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { login } from '@/api/auth'

export default {
  name: 'Login',
  data() {
    return {
      loginForm: {
        username: '',
        password: ''
      },
      loading: false,
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    handleLogin() {
      this.$refs.loginForm.validate(async valid => {
        if (valid) {
          this.loading = true
          try {
            // 调用新的登录API，传递对象参数
            const res = await login({
              username: this.loginForm.username,
              password: this.loginForm.password
            })
            // 根据OpenAPI定义的响应格式处理
            if (res.code === 200 && res.token) {
              // 存储token
              localStorage.setItem('token', res.token)
              localStorage.setItem('isLogin', 'true')
              
              this.$message.success('登录成功')
              // 跳转到主页
              this.$router.push('/')
            } else {
              this.$message.error(res.msg || '登录失败')
            }
          } catch (error) {
            console.error('登录失败:', error)
            this.$message.error(error.message || '登录失败，请重试')
          } finally {
            this.loading = false
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #409EFF, #36D1DC);
}

.login-card {
  width: 400px;
  padding: 20px;
  border-radius: 8px;
}

.title {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 30px;
}

.login-form {
  margin-top: 20px;
}

.login-button {
  width: 100%;
}

/* 添加输入框动画效果 */
.el-input__inner:focus {
  border-color: #409EFF;
  transition: all 0.3s ease;
}

/* 添加按钮悬停效果 */
.login-button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
  transition: all 0.3s ease;
}

/* 添加卡片阴影效果 */
.login-card {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}

.login-card:hover {
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
}
</style> 