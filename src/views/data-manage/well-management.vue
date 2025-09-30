<template>
  <div class="well-management">
    <!-- 搜索筛选区域 -->
    <div class="search-section">
      <div class="search-form">
        <label>监测井名称:</label>
        <el-input 
          v-model="searchForm.name" 
          placeholder="请选择监测井名称"
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
        <el-button type="primary" @click="addWell">新增</el-button>
        <el-button type="primary" @click="handleExport">导出</el-button>
      </div>
    </div>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <el-table 
        :data="wellsData" 
        style="width: 100%"
        :loading="loading"
        stripe
        border
      >
        <el-table-column type="selection" width="55" align="center"></el-table-column>
        <el-table-column type="index" label="序号" width="60" align="center"></el-table-column>
        <el-table-column prop="wellNumber" label="监测井编号" width="120" align="center"></el-table-column>
        <el-table-column prop="projectNumber" label="监测项目编号" width="120" align="center"></el-table-column>
        <el-table-column prop="wellType" label="监测井类型" width="120" align="center"></el-table-column>
        <el-table-column prop="affiliation" label="监测井隶属" width="120" align="center"></el-table-column>
        <el-table-column prop="isFaulty" label="是否故障" width="100" align="center"></el-table-column>
        <el-table-column prop="constructionTime" label="建设时间" width="150" align="center"></el-table-column>
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" @click="editWell(scope.row)">编辑</el-button>
            <el-button size="mini" type="success" @click="viewDetails(scope.row)">详情</el-button>
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
    
    <!-- 新增/编辑监测井对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="600px">
      <el-form :model="wellForm" :rules="rules" ref="wellForm" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="监测井编号" prop="wellNumber">
              <el-input v-model="wellForm.wellNumber" placeholder="请输入监测井编号"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="监测项目编号" prop="projectNumber">
              <el-input v-model="wellForm.projectNumber" placeholder="请输入监测项目编号"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="监测井类型" prop="wellType">
              <el-select v-model="wellForm.wellType" placeholder="请选择监测井类型">
                <el-option label="基岩" value="基岩"></el-option>
                <el-option label="松散层" value="松散层"></el-option>
                <el-option label="混合型" value="混合型"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="监测井隶属" prop="affiliation">
              <el-select v-model="wellForm.affiliation" placeholder="请选择监测井隶属">
                <el-option label="国家级" value="国家级"></el-option>
                <el-option label="省级" value="省级"></el-option>
                <el-option label="市级" value="市级"></el-option>
                <el-option label="县级" value="县级"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="是否故障" prop="isFaulty">
              <el-select v-model="wellForm.isFaulty" placeholder="请选择是否故障">
                <el-option label="是" value="是"></el-option>
                <el-option label="否" value="否"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="建设时间" prop="constructionTime">
          <el-date-picker
            v-model="wellForm.constructionTime"
            type="datetime"
            placeholder="请选择建设时间"
            format="yyyy-MM-dd HH:mm:ss"
            value-format="yyyy-MM-dd HH:mm:ss">
          </el-date-picker>
        </el-form-item>
        
        <el-form-item label="备注" prop="description">
          <el-input type="textarea" v-model="wellForm.description" placeholder="请输入备注信息"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveWell">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'WellManagement',
  data() {
    return {
      loading: false,
      searchForm: {
        name: ''
      },
      wellsData: [
        {
          id: 1,
          wellNumber: '12000001',
          projectNumber: '12000001',
          wellType: '基岩',
          affiliation: '国家级',
          isFaulty: '是',
          constructionTime: '2021-11-11 18:07:01',
          description: '基岩监测井'
        }
      ],
      total: 3,
      currentPage: 1,
      pageSize: 20,
      dialogVisible: false,
      dialogTitle: '新增监测井',
      wellForm: {
        wellNumber: '',
        projectNumber: '',
        wellType: '',
        affiliation: '',
        isFaulty: '',
        constructionTime: '',
        description: ''
      },
      rules: {
        wellNumber: [
          { required: true, message: '请输入监测井编号', trigger: 'blur' }
        ],
        projectNumber: [
          { required: true, message: '请输入监测项目编号', trigger: 'blur' }
        ],
        wellType: [
          { required: true, message: '请选择监测井类型', trigger: 'change' }
        ],
        affiliation: [
          { required: true, message: '请选择监测井隶属', trigger: 'change' }
        ],
        isFaulty: [
          { required: true, message: '请选择是否故障', trigger: 'change' }
        ],
        constructionTime: [
          { required: true, message: '请选择建设时间', trigger: 'change' }
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
      this.searchForm.name = ''
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
    // 新增监测井
    addWell() {
      this.dialogTitle = '新增监测井'
      this.wellForm = {
        wellNumber: '',
        projectNumber: '',
        wellType: '',
        affiliation: '',
        isFaulty: '',
        constructionTime: '',
        description: ''
      }
      this.dialogVisible = true
    },
    // 编辑监测井
    editWell(row) {
      this.dialogTitle = '编辑监测井'
      this.wellForm = { ...row }
      this.dialogVisible = true
    },
    // 查看详情
    viewDetails(row) {
      this.$message.info(`查看监测井详情: ${row.wellNumber}`)
    },
    // 保存监测井
    saveWell() {
      this.$refs.wellForm.validate((valid) => {
        if (valid) {
          this.$message.success('监测井信息保存成功')
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
.well-management {
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
