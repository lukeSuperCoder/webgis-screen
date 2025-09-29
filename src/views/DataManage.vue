<template>
  <div class="data-manage-page">
    <div class="page-header">
      <h2>数据管理</h2>
      <p>监测数据录入、查询与管理</p>
    </div>
    
    <div class="data-content">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-card class="data-card">
            <div slot="header">
              <span>数据录入</span>
            </div>
            <div class="card-content">
              <p>监测数据录入功能正在开发中...</p>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="8">
          <el-card class="data-card">
            <div slot="header">
              <span>数据查询</span>
            </div>
            <div class="card-content">
              <p>历史数据查询功能正在开发中...</p>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="8">
          <el-card class="data-card">
            <div slot="header">
              <span>数据导出</span>
            </div>
            <div class="card-content">
              <p>数据导出功能正在开发中...</p>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DataManage',
  data() {
    return {
    }
  }
}
</script>

<style scoped>
.data-manage-page {
  padding: 20px;
  height: 100%;
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

.data-content {
  height: calc(100% - 100px);
}

.data-card {
  height: 250px;
  margin-bottom: 20px;
}

.card-content {
  padding: 20px 0;
  text-align: center;
  color: #999;
}
</style>
