<template>
  <div class="quality-rules">
    <!-- 搜索筛选区域 -->
    <div class="search-section">
      <div class="search-form">
        <label>质控名称:</label>
        <el-input 
          v-model="searchForm.name" 
          placeholder="请选择质控名称"
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
        <el-button type="primary" @click="addRule">新增</el-button>
        <el-button type="primary" @click="handleExport">导出</el-button>
      </div>
    </div>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <el-table 
        :data="rulesData" 
        style="width: 100%"
        :loading="loading"
        stripe
        border
      >
        <el-table-column type="selection" width="55" align="center"></el-table-column>
        <el-table-column type="index" label="序号" width="60" align="center"></el-table-column>
        <el-table-column prop="monitoringMethod" label="监测方式" width="120" align="center"></el-table-column>
        <el-table-column prop="monitoringElement" label="监测要素" width="120" align="center"></el-table-column>
        <el-table-column prop="qualityControlId" label="质控标识" width="120" align="center"></el-table-column>
        <el-table-column prop="qualityControlRange" label="质控范围" width="120" align="center"></el-table-column>
        <el-table-column prop="specialValue" label="特殊值" width="120" align="center"></el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="150" align="center"></el-table-column>
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" @click="editRule(scope.row)">编辑</el-button>
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
    
    <!-- 新增/编辑规则对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="600px">
      <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="120px">
        <el-form-item label="监测方式" prop="monitoringMethod">
          <el-select v-model="ruleForm.monitoringMethod" placeholder="请选择监测方式">
            <el-option label="人工监测" value="人工监测"></el-option>
            <el-option label="自动监测" value="自动监测"></el-option>
            <el-option label="在线监测" value="在线监测"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="监测要素" prop="monitoringElement">
          <el-select v-model="ruleForm.monitoringElement" placeholder="请选择监测要素">
            <el-option label="电导率" value="电导率"></el-option>
            <el-option label="浊度" value="浊度"></el-option>
            <el-option label="pH值" value="pH值"></el-option>
            <el-option label="溶解氧" value="溶解氧"></el-option>
            <el-option label="氨氮" value="氨氮"></el-option>
            <el-option label="总磷" value="总磷"></el-option>
            <el-option label="总氮" value="总氮"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="质控标识" prop="qualityControlId">
          <el-input v-model="ruleForm.qualityControlId" placeholder="请输入质控标识"></el-input>
        </el-form-item>
        <el-form-item label="质控范围" prop="qualityControlRange">
          <el-input v-model="ruleForm.qualityControlRange" placeholder="如：[0,800]"></el-input>
        </el-form-item>
        <el-form-item label="特殊值" prop="specialValue">
          <el-input v-model="ruleForm.specialValue" placeholder="如：0,1000"></el-input>
        </el-form-item>
        <el-form-item label="规则描述" prop="description">
          <el-input type="textarea" v-model="ruleForm.description" placeholder="请输入规则描述"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRule">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'QualityRules',
  data() {
    return {
      loading: false,
      searchForm: {
        name: ''
      },
      rulesData: [
        {
          id: 1,
          monitoringMethod: '人工监测',
          monitoringElement: '电导率',
          qualityControlId: 'cond',
          qualityControlRange: '[0,800]',
          specialValue: '0',
          createTime: '2023-11-06 04:16',
          description: '电导率质控规则'
        },
        {
          id: 2,
          monitoringMethod: '人工监测',
          monitoringElement: '浊度',
          qualityControlId: 'turb',
          qualityControlRange: '[0,800]',
          specialValue: '0,1000',
          createTime: '2023-05-13 18:18',
          description: '浊度质控规则'
        }
      ],
      total: 3,
      currentPage: 1,
      pageSize: 20,
      dialogVisible: false,
      dialogTitle: '新增规则',
      ruleForm: {
        monitoringMethod: '',
        monitoringElement: '',
        qualityControlId: '',
        qualityControlRange: '',
        specialValue: '',
        description: ''
      },
      rules: {
        monitoringMethod: [
          { required: true, message: '请选择监测方式', trigger: 'change' }
        ],
        monitoringElement: [
          { required: true, message: '请选择监测要素', trigger: 'change' }
        ],
        qualityControlId: [
          { required: true, message: '请输入质控标识', trigger: 'blur' }
        ],
        qualityControlRange: [
          { required: true, message: '请输入质控范围', trigger: 'blur' }
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
    // 新增规则
    addRule() {
      this.dialogTitle = '新增规则'
      this.ruleForm = {
        monitoringMethod: '',
        monitoringElement: '',
        qualityControlId: '',
        qualityControlRange: '',
        specialValue: '',
        description: ''
      }
      this.dialogVisible = true
    },
    // 编辑规则
    editRule(row) {
      this.dialogTitle = '编辑规则'
      this.ruleForm = { ...row }
      this.dialogVisible = true
    },
    // 查看详情
    viewDetails(row) {
      this.$message.info(`查看规则详情: ${row.monitoringElement}`)
    },
    // 保存规则
    saveRule() {
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          this.$message.success('规则保存成功')
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
.quality-rules {
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
