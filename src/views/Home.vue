<template>
  <el-container class="main-container">
    <!-- 顶部标题栏 -->
    <el-header height="60px" class="header">
      <div class="header-left">
        <div class="header-logo">
        </div>
        <div class="header-title">
          锡林郭勒盟地下水环境监管系统
        </div>
      </div>
      
      <!-- 顶部导航菜单 -->
      <div class="header-nav">
        <el-menu
          :default-active="activeMenuIndex"
          class="header-menu"
          mode="horizontal"
          text-color="#fff"
          active-text-color="#409EFF"
          router>
          <el-menu-item index="/monitor">
            <i class="el-icon-s-home"></i>
            <span>综合监测</span>
          </el-menu-item>
          <el-menu-item index="/analysis">
            <i class="el-icon-data-analysis"></i>
            <span>评价分析</span>
          </el-menu-item>
          <el-menu-item index="/data">
            <i class="el-icon-document"></i>
            <span>数据管理</span>
          </el-menu-item>
          <el-menu-item index="/system">
            <i class="el-icon-setting"></i>
            <span>系统管理</span>
          </el-menu-item>
        </el-menu>
      </div>
      
      <!-- 右侧用户信息 -->
      <div class="header-right">
        <div class="user-info">
          <i class="el-icon-user user-icon"></i>
          <span class="welcome-text">欢迎您, {{ userInfo.userName || '' }}</span>
          <i class="el-icon-switch-button logout-icon" @click="handleLogout"></i>
        </div>
      </div>
    </el-header>
    <div class="content-container"> 
      <router-view></router-view>
    </div>
  </el-container>
</template>

<script>
import { getUserInfo } from '@/api/auth'

export default {
  name: 'Home',
  components: {
  },
  data() {
    return {
      userInfo: {}
    }
  },
  async mounted() {
    await this.loadUserInfo()
  },
  computed: {
    activeMenuIndex() {
      const path = this.$route.path
      // 根据当前路径判断激活的菜单项
      if (path.startsWith('/analysis')) {
        return '/analysis'
      } else if (path.startsWith('/data')) {
        return '/data'
      } else if (path.startsWith('/system')) {
        return '/system'
      } else if (path.startsWith('/monitor')) {
        return '/monitor'
      }
      return path
    }
  },
  methods: {
    async loadUserInfo() {
      try {
        const res = await getUserInfo()
        if (res.code === 200 && res.user) {
          this.userInfo = res.user
          localStorage.setItem('userInfo', JSON.stringify(res.user))
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
        // 如果获取用户信息失败，尝试从localStorage获取
        const cachedUserInfo = localStorage.getItem('userInfo')
        if (cachedUserInfo) {
          this.userInfo = JSON.parse(cachedUserInfo)
        }
      }
    },
    handleLogout() {
      // 清理所有登录相关的本地存储
      localStorage.removeItem('isLogin')
      localStorage.removeItem('userInfo')
      localStorage.removeItem('token')
      this.$router.push('/login')
      this.$message.success('已退出登录')
    }
  }
}
</script>

<style scoped>
.main-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 顶部标题栏样式 */
.header {
  background: linear-gradient(135deg, #554ee6 0%, #7c4cce 100%);
  color: white;
  padding: 0 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 20px rgba(79, 70, 229, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  position: relative;
  overflow: hidden;
}

.header::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
}


.header-left {
  display: flex;
  align-items: center;
}

.header-logo {
  width: 40px;
  height: 40px;
  font-size: 26px;
  margin-right: 12px;
  color: #ffffff;
  background: url('../assets/logo.png') no-repeat center center;
  background-size: 100% 100%;
}

.header-title {
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: #ffffff;
}

.header-nav {
  flex: 1;
  display: flex;
  justify-content: center;
  position: relative;
  z-index: 2;
}

.header-menu {
  border-bottom: none;
  background: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.header-menu .el-menu-item {
  border-bottom: 3px solid transparent;
  padding: 0 24px;
  margin: 0 6px;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  color: #ffffff !important;
  background-color: transparent !important;
  overflow: hidden;
}

.header-menu .el-menu-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
}

.header-menu .el-menu-item:hover::before {
  left: 100%;
}

.header-menu .el-menu-item:hover {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%) !important;
  border-radius: 8px;
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  border-bottom-color: rgba(255, 255, 255, 0.3);
  color: #ffffff !important;
}

.header-menu .el-menu-item.is-active {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%) !important;
  border-bottom-color: #ffffff;
  border-radius: 8px;
  transform: translateY(-1px);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.2);
  color: #ffffff !important;
  position: relative;
}

.header-menu .el-menu-item.is-active::after {
  content: '';
  position: absolute;
  bottom: -3px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 3px;
  background: linear-gradient(90deg, #ffffff, #e0e7ff, #ffffff);
  border-radius: 2px;
  box-shadow: 0 0 12px rgba(255, 255, 255, 0.6);
}

.header-menu .el-menu-item i {
  margin-right: 5px;
  font-size: 16px;
  transition: all 0.3s ease;
  position: relative;
  z-index: 2;
}

.header-menu .el-menu-item:hover i {
  transform: scale(1.1);
  color: #e0e7ff !important;
}

.header-menu .el-menu-item.is-active i {
  transform: scale(1.05);
  color: #ffffff !important;
}

.header-menu .el-menu-item span {
  font-weight: 500;
  position: relative;
  z-index: 2;
  letter-spacing: 0.5px;
}

.header-menu .el-menu-item:hover span {
  color: #e0e7ff !important;
  font-weight: 600;
}

.header-menu .el-menu-item.is-active span {
  color: #ffffff !important;
  font-weight: 600;
}

/* 确保Element UI的默认样式被覆盖 */
.header-menu .el-menu-item:focus {
  background-color: transparent !important;
  color: #ffffff !important;
}

.header-menu .el-menu-item:active {
  background-color: rgba(255, 255, 255, 0.1) !important;
  color: #ffffff !important;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
}

.user-icon {
  font-size: 18px;
  color: #ffffff;
}

.welcome-text {
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
  white-space: nowrap;
}

.logout-icon {
  font-size: 18px;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 4px;
  border-radius: 50%;
}

.logout-icon:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

/* 内容区域样式 */
.content-container {
  flex: 1;
  height: calc(100vh - 60px);
  background-color: #f8fafc;
}


/* 响应式设计 - 保持单行布局 */
@media (max-width: 1200px) {
  .header {
    padding: 0 20px;
  }
  
  .header-menu .el-menu-item {
    padding: 0 12px;
    margin: 0 4px;
  }
  
  .header-title {
    font-size: 18px;
  }
  
  .header-logo {
    width: 30px;
    height: 30px;
    font-size: 24px;
    margin-right: 10px;
  }
  
  .welcome-text {
    font-size: 13px;
  }
  
  .user-info {
    padding: 6px 12px;
    gap: 10px;
  }
}

@media (max-width: 992px) {
  .header {
    padding: 0 15px;
  }
  
  .header-title {
    font-size: 16px;
  }
  
  .header-logo {
    width: 20px;
    height: 20px;
    font-size: 22px;
    margin-right: 8px;
  }
  
  .header-menu .el-menu-item {
    padding: 0 10px;
    margin: 0 2px;
  }
  
  .header-menu .el-menu-item span {
    font-size: 13px;
  }
  
  .welcome-text {
    font-size: 12px;
  }
  
  .user-info {
    padding: 5px 10px;
    gap: 8px;
  }
  
  .user-icon,
  .logout-icon {
    font-size: 16px;
  }
}

@media (max-width: 768px) {
  .header {
    padding: 0 12px;
  }
  
  .header-title {
    font-size: 14px;
    letter-spacing: 0.3px;
  }
  
  .header-logo {
    width: 18px;
    height: 18px;
    font-size: 20px;
    margin-right: 6px;
  }
  
  .header-menu .el-menu-item {
    padding: 0 8px;
    margin: 0 1px;
  }
  
  .header-menu .el-menu-item span {
    font-size: 12px;
  }
  
  .header-menu .el-menu-item i {
    font-size: 14px;
    margin-right: 4px;
  }
  
  .welcome-text {
    font-size: 11px;
  }
  
  .user-info {
    padding: 4px 8px;
    gap: 6px;
  }
  
  .user-icon,
  .logout-icon {
    font-size: 14px;
  }
}

@media (max-width: 576px) {
  .header {
    padding: 0 8px;
  }
  
  .header-title {
    font-size: 13px;
  }
  
  .header-logo {
    width: 16px;
    height: 16px;
    font-size: 18px;
    margin-right: 4px;
  }
  
  .header-menu .el-menu-item {
    padding: 0 6px;
    margin: 0;
  }
  
  .header-menu .el-menu-item span {
    font-size: 11px;
  }
  
  .header-menu .el-menu-item i {
    font-size: 13px;
    margin-right: 3px;
  }
  
  .welcome-text {
    font-size: 10px;
  }
  
  .user-info {
    padding: 3px 6px;
    gap: 4px;
  }
  
  .user-icon,
  .logout-icon {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .header {
    padding: 0 6px;
  }
  
  .header-title {
    font-size: 12px;
    letter-spacing: 0.2px;
  }
  
  .header-logo {
    width: 14px;
    height: 14px;
    font-size: 16px;
    margin-right: 3px;
  }
  
  .header-menu .el-menu-item {
    padding: 0 4px;
  }
  
  .header-menu .el-menu-item span {
    font-size: 10px;
  }
  
  .header-menu .el-menu-item i {
    font-size: 12px;
    margin-right: 2px;
  }
  
  .welcome-text {
    display: none;
  }
  
  .user-info {
    padding: 2px 4px;
    gap: 3px;
  }
  
  .user-icon,
  .logout-icon {
    font-size: 12px;
  }
}
</style> 