<template>
  <div class="system-manage-page">
    <div class="page-header">
      <h2>系统管理</h2>
      <p>系统配置与用户权限管理</p>
    </div>
    
    <div class="system-content">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card class="system-card">
            <div slot="header">
              <span>用户管理</span>
            </div>
            <div class="card-content">
              <el-button type="primary" @click="goToUserManage">进入用户管理</el-button>
              <p>管理系统用户账号和权限</p>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="12">
          <el-card class="system-card">
            <div slot="header">
              <span>系统配置</span>
            </div>
            <div class="card-content">
              <p>系统参数配置功能正在开发中...</p>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SystemManage',
  data() {
    return {
    }
  },
  methods: {
    goToUserManage() {
      this.$router.push('/user')
    }
  }
}
</script>

<style scoped>
.system-manage-page {
  padding: 20px;
  overflow-y: auto;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h2 {
  color: #333;
  margin-bottom: 10px;
}

.page-header p {
  color: #666;
  margin: 0;
}

.system-content {
  height: calc(100% - 100px);
}

.system-card {
  height: 300px;
  margin-bottom: 20px;
}

.card-content {
  padding: 20px 0;
  text-align: center;
  color: #999;
}

.card-content p {
  margin-top: 15px;
}
</style>
