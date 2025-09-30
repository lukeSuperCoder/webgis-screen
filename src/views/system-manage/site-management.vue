<template>
  <div class="site-management">
    <!-- 搜索筛选区域 -->
    <div class="search-section">
      <div class="search-form">
        <label>站点名称:</label>
        <el-input 
          v-model="searchForm.siteName" 
          placeholder="请选择站点名称"
          style="width: 200px; margin-right: 10px;"
          clearable
        >
          <i slot="suffix" class="el-input__icon el-icon-arrow-down"></i>
        </el-input>
        <el-button type="primary" @click="handleQuery">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button>
          展开
          <i class="el-icon-arrow-down"></i>
        </el-button>
      </div>
      
      <!-- 操作按钮区域 -->
      <div class="action-buttons">
        <el-button type="primary" @click="addSite">新增</el-button>
        <el-button type="primary" @click="handleExport">导出</el-button>
      </div>
    </div>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <el-table 
        :data="sitesData" 
        style="width: 100%"
        :loading="loading"
        stripe
        border
      >
        <el-table-column type="selection" width="55" align="center"></el-table-column>
        <el-table-column type="index" label="序号" width="60" align="center"></el-table-column>
        <el-table-column prop="siteNumber" label="站点编号" width="120" align="center"></el-table-column>
        <el-table-column prop="siteName" label="站点名称" width="120" align="center"></el-table-column>
        <el-table-column prop="siteType" label="站点类型" width="120" align="center"></el-table-column>
        <el-table-column prop="longitude" label="经度" width="120" align="center"></el-table-column>
        <el-table-column prop="latitude" label="纬度" width="120" align="center"></el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="150" align="center"></el-table-column>
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" @click="editSite(scope.row)">编辑</el-button>
            <el-button size="mini" type="success" @click="viewSite(scope.row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[20]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next"
        :total="total"
        style="margin-top: 20px; text-align: right;">
      </el-pagination>
    </el-card>
    
    <!-- 新增/编辑站点对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="600px">
      <el-form :model="siteForm" :rules="rules" ref="siteForm" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="站点编号" prop="siteNumber">
              <el-input v-model="siteForm.siteNumber" placeholder="请输入站点编号"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="站点名称" prop="siteName">
              <el-input v-model="siteForm.siteName" placeholder="请输入站点名称"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="站点类型" prop="siteType">
              <el-select v-model="siteForm.siteType" placeholder="请选择站点类型">
                <el-option label="水质" value="水质"></el-option>
                <el-option label="水文" value="水文"></el-option>
                <el-option label="气象" value="气象"></el-option>
                <el-option label="土壤" value="土壤"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="经度" prop="longitude">
              <el-input v-model="siteForm.longitude" placeholder="请输入经度"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="纬度" prop="latitude">
              <el-input v-model="siteForm.latitude" placeholder="请输入纬度"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="描述" prop="description">
          <el-input type="textarea" v-model="siteForm.description" placeholder="请输入站点描述"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveSite">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'SiteManagement',
  data() {
    return {
      loading: false,
      searchForm: {
        siteName: ''
      },
      sitesData: [
        {
          id: 1,
          siteNumber: '20014321',
          siteName: '站点A',
          siteType: '水质',
          longitude: '117.432341',
          latitude: '24.536773',
          createTime: '2022-01-14 14:56',
          description: '水质监测站点'
        },
        {
          id: 2,
          siteNumber: '71982344',
          siteName: '站点B',
          siteType: '水文',
          longitude: '117.428712',
          latitude: '24.527647',
          createTime: '2023-02-06 18:50',
          description: '水文监测站点'
        }
      ],
      currentPage: 1,
      pageSize: 20,
      total: 3,
      dialogVisible: false,
      dialogTitle: '新增站点',
      siteForm: {
        siteNumber: '',
        siteName: '',
        siteType: '',
        longitude: '',
        latitude: '',
        description: ''
      },
      rules: {
        siteNumber: [
          { required: true, message: '请输入站点编号', trigger: 'blur' }
        ],
        siteName: [
          { required: true, message: '请输入站点名称', trigger: 'blur' }
        ],
        siteType: [
          { required: true, message: '请选择站点类型', trigger: 'change' }
        ],
        longitude: [
          { required: true, message: '请输入经度', trigger: 'blur' }
        ],
        latitude: [
          { required: true, message: '请输入纬度', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 查询
    handleQuery() {
      this.loading = true
      // 模拟查询
      setTimeout(() => {
        this.loading = false
        this.$message.success('查询完成')
      }, 1000)
    },
    // 重置
    handleReset() {
      this.searchForm.siteName = ''
      this.$message.info('重置成功')
    },
    // 导出
    handleExport() {
      this.$message.success('导出功能')
    },
    // 分页大小改变
    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
    },
    // 当前页改变
    handleCurrentChange(val) {
      this.currentPage = val
    },
    // 新增站点
    addSite() {
      this.dialogTitle = '新增站点'
      this.siteForm = {
        siteNumber: '',
        siteName: '',
        siteType: '',
        longitude: '',
        latitude: '',
        description: ''
      }
      this.dialogVisible = true
    },
    // 编辑站点
    editSite(row) {
      this.dialogTitle = '编辑站点'
      this.siteForm = { ...row }
      this.dialogVisible = true
    },
    // 查看站点
    viewSite(row) {
      this.$message.info(`查看站点: ${row.siteName}`)
    },
    // 保存站点
    saveSite() {
      this.$refs.siteForm.validate((valid) => {
        if (valid) {
          this.$message.success('站点信息保存成功')
          this.dialogVisible = false
        } else {
          this.$message.error('请填写完整信息')
        }
      })
    }
  }
}
</script>

<style scoped>
.site-management {
  height: 100%;
}

.search-section {
  margin-bottom: 20px;
  padding: 20px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.search-form {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.search-form label {
  margin-right: 10px;
  font-weight: 500;
  color: #606266;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.table-card {
  flex: 1;
}

.dialog-footer {
  text-align: right;
}
</style>
