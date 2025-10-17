<template>
  <div class="quality-rules">
    <!-- 搜索筛选区域 -->
    <div class="search-section">
      <div class="search-form">
        <label>指标编码:</label>
        <el-input 
          v-model="searchForm.metricCode" 
          placeholder="请输入指标编码"
          style="width: 200px; margin-right: 10px;"
          clearable
        />
        <label>质量等级:</label>
        <el-select 
          v-model="searchForm.qualityLevel" 
          placeholder="请选择质量等级"
          style="width: 150px; margin-right: 10px;"
          clearable
        >
          <el-option label="I类" value="I类"></el-option>
          <el-option label="II类" value="II类"></el-option>
          <el-option label="III类" value="III类"></el-option>
          <el-option label="IV类" value="IV类"></el-option>
          <el-option label="V类" value="V类"></el-option>
          <el-option label="劣V类" value="劣V类"></el-option>
        </el-select>
        <el-button type="primary" @click="handleQuery">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
      
      <!-- 操作按钮区域 -->
      <div class="action-buttons">
        <el-button type="primary" @click="addRule">新增</el-button>
        <el-button type="danger" @click="handleBatchDelete" :disabled="selectedRows.length === 0">批量删除</el-button>
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
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center"></el-table-column>
        <el-table-column type="index" label="序号" width="60" align="center"></el-table-column>
        <el-table-column prop="metricCode" label="指标编码" width="120" align="center"></el-table-column>
        <el-table-column prop="qualityLevel" label="质量等级" width="100" align="center"></el-table-column>
        <el-table-column prop="relation" label="范围区间" width="120" align="center">
          <template slot-scope="scope">
            <el-tag :type="getRelationTagType(scope.row.relation)">
              {{ getRelationText(scope.row.relation) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lowerBound" label="下界值" width="100" align="center"></el-table-column>
        <el-table-column prop="upperBound" label="上界值" width="100" align="center"></el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="150" align="center"></el-table-column>
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" @click="editRule(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="deleteRule(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next"
        :total="total"
        style="margin-top: 20px; text-align: right;">
      </el-pagination>
    </el-card>
    
    <!-- 新增/编辑规则对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="600px">
      <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="120px">
        <el-form-item label="指标编码" prop="metricCode">
          <el-input 
            v-model="ruleForm.metricCode" 
            placeholder="请选择指标编码"
            style="width: 100%"
          ></el-input>
        </el-form-item>
        <el-form-item label="质量等级" prop="qualityLevel">
          <el-select v-model="ruleForm.qualityLevel" placeholder="请选择质量等级" style="width: 100%">
            <el-option label="I类" value="I类"></el-option>
            <el-option label="II类" value="II类"></el-option>
            <el-option label="III类" value="III类"></el-option>
            <el-option label="IV类" value="IV类"></el-option>
            <el-option label="V类" value="V类"></el-option>
            <el-option label="劣V类" value="劣V类"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="范围区间" prop="relation">
          <el-select v-model="ruleForm.relation" placeholder="请选择范围区间" style="width: 100%">
            <el-option label="between (开区间)" value="between"></el-option>
            <el-option label="between_equal (闭区间)" value="between_equal"></el-option>
            <el-option label="between_up_equal (左开右闭)" value="between_up_equal"></el-option>
            <el-option label="between_low_equal (左闭右开)" value="between_low_equal"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="下界值" prop="lowerBound">
          <el-input-number 
            v-model="ruleForm.lowerBound" 
            placeholder="请输入下界值"
            :precision="2"
            style="width: 100%"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="上界值" prop="upperBound">
          <el-input-number 
            v-model="ruleForm.upperBound" 
            placeholder="请输入上界值"
            :precision="2"
            style="width: 100%"
          ></el-input-number>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRule" :loading="saveLoading">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getMetricList, addMetric, updateMetric, deleteMetric } from '@/api/qualityMetric'

export default {
  name: 'QualityRules',
  data() {
    return {
      loading: false,
      saveLoading: false,
      searchForm: {
        metricCode: '',
        qualityLevel: ''
      },
      rulesData: [],
      total: 0,
      currentPage: 1,
      pageSize: 10,
      selectedRows: [],
      dialogVisible: false,
      dialogTitle: '新增指标标准',
      ruleForm: {
        id: null,
        metricCode: '',
        qualityLevel: '',
        relation: '',
        upperBound: null,
        lowerBound: null
      },
      rules: {
        metricCode: [
          { required: true, message: '请选择指标编码', trigger: 'change' }
        ],
        qualityLevel: [
          { required: true, message: '请选择质量等级', trigger: 'change' }
        ],
        relation: [
          { required: true, message: '请选择范围区间', trigger: 'change' }
        ],
        upperBound: [
          { required: true, message: '请输入上界值', trigger: 'blur' }
        ],
        lowerBound: [
          { required: true, message: '请输入下界值', trigger: 'blur' }
        ]
      }
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    // 加载数据
    async loadData() {
      this.loading = true
      try {
        const params = {
          pageNum: this.currentPage,
          pageSize: this.pageSize,
          ...this.searchForm
        }
        const response = await getMetricList(params)
        if (response.code === 200 || response.code === 0) {
          this.rulesData = response.rows || []
          this.total = response.total || 0
        }
      } catch (error) {
        this.$message.error('加载数据失败')
        console.error('加载数据失败:', error)
      } finally {
        this.loading = false
      }
    },
    // 查询
    handleQuery() {
      this.currentPage = 1
      this.loadData()
    },
    // 重置
    handleReset() {
      this.searchForm = {
        metricCode: '',
        qualityLevel: ''
      }
      this.currentPage = 1
      this.loadData()
    },
    // 导出
    handleExport() {
      this.$message.success('导出功能开发中')
    },
    // 分页大小改变
    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
      this.loadData()
    },
    // 当前页改变
    handleCurrentChange(val) {
      this.currentPage = val
      this.loadData()
    },
    // 选择改变
    handleSelectionChange(selection) {
      this.selectedRows = selection
    },
    // 新增规则
    addRule() {
      this.dialogTitle = '新增指标标准'
      this.ruleForm = {
        id: null,
        metricCode: '',
        qualityLevel: '',
        relation: '',
        upperBound: null,
        lowerBound: null
      }
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.ruleForm && this.$refs.ruleForm.clearValidate()
      })
    },
    // 编辑规则
    editRule(row) {
      this.dialogTitle = '编辑指标标准'
      this.ruleForm = { ...row }
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.ruleForm && this.$refs.ruleForm.clearValidate()
      })
    },
    // 删除规则
    deleteRule(row) {
      this.$confirm(`确定要删除指标标准 "${row.metricCode}" 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const response = await deleteMetric(row.id)
          if (response.code === 200 || response.code === 0) {
            this.$message.success('删除成功')
            this.loadData()
          }
        } catch (error) {
          this.$message.error('删除失败')
          console.error('删除失败:', error)
        }
      })
    },
    // 批量删除
    handleBatchDelete() {
      if (this.selectedRows.length === 0) {
        this.$message.warning('请选择要删除的数据')
        return
      }
      this.$confirm(`确定要删除选中的 ${this.selectedRows.length} 条记录吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const ids = this.selectedRows.map(row => row.id).join(',')
          const response = await deleteMetric(ids)
          if (response.code === 200 || response.code === 0) {
            this.$message.success('批量删除成功')
            this.loadData()
          }
        } catch (error) {
          this.$message.error('批量删除失败')
          console.error('批量删除失败:', error)
        }
      })
    },
    // 保存规则
    async saveRule() {
      this.$refs.ruleForm.validate(async (valid) => {
        if (valid) {
          this.saveLoading = true
          try {
            let response
            if (this.ruleForm.id) {
              // 编辑
              response = await updateMetric(this.ruleForm)
            } else {
              // 新增
              response = await addMetric(this.ruleForm)
            }
            if (response.code === 200 || response.code === 0) {
              this.$message.success(this.ruleForm.id ? '修改成功' : '新增成功')
              this.dialogVisible = false
              this.loadData()
            }
          } catch (error) {
            this.$message.error(this.ruleForm.id ? '修改失败' : '新增失败')
            console.error('保存失败:', error)
          } finally {
            this.saveLoading = false
          }
        } else {
          this.$message.error('请填写完整信息')
        }
      })
    },
    // 获取范围区间标签类型
    getRelationTagType(relation) {
      const typeMap = {
        'between': 'info',
        'between_equal': 'success',
        'between_up_equal': 'warning',
        'between_low_equal': 'warning'
      }
      return typeMap[relation] || 'info'
    },
    // 获取范围区间文本
    getRelationText(relation) {
      const textMap = {
        'between': '开区间',
        'between_equal': '闭区间',
        'between_up_equal': '左开右闭',
        'between_low_equal': '左闭右开'
      }
      return textMap[relation] || relation
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
