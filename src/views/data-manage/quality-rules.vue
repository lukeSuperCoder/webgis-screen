<template>
  <div class="quality-rules-view">
    <!-- 查询条件 -->
    <el-card class="filter-card">
      <el-form :model="queryForm" :inline="true" label-width="90px" class="filter-form">
        <el-form-item label="指标名称:">
          <el-input
            v-model="queryForm.metricName"
            placeholder="请输入指标名称"
            clearable
            style="width: 220px"
          />
        </el-form-item>
        <el-form-item label="指标编码:">
          <el-select
            v-model="queryForm.metricCode"
            placeholder="请选择指标编码"
            clearable
            filterable
            style="width: 220px"
            popper-class="metric-select-dropdown"
          >
            <el-option
              v-for="item in metricOptions"
              :key="item.metricCode"
              :label="formatMetricOptionLabel(item)"
              :value="item.metricCode"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="质量等级:">
          <el-select v-model="queryForm.qualityLevel" placeholder="请选择质量等级" clearable style="width: 160px">
            <el-option
              v-for="item in qualityLevels"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleQuery">查询</el-button>
          <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 列表及操作 -->
    <el-card class="table-card">
      <div class="table-toolbar">
        <div class="toolbar-left">
          <el-button type="primary" icon="el-icon-plus" @click="openCreateDialog">新增规则</el-button>
          <el-button
            type="danger"
            icon="el-icon-delete"
            :disabled="selectedRows.length === 0"
            @click="handleBatchDelete"
          >
            批量删除
          </el-button>
          <el-button icon="el-icon-upload2" @click="openImportDialog">导入</el-button>
          <el-button icon="el-icon-download" :loading="exportLoading" @click="handleExport">导出</el-button>
        </div>
        <div class="toolbar-right">
          <span class="result-count">共 {{ total }} 条质控规则</span>
        </div>
      </div>

      <el-table
        :data="tableData"
        border
        stripe
        :loading="loading"
        :row-key="getRowKey"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column label="指标信息" min-width="220">
          <template slot-scope="scope">
            <div class="metric-info">
              <div class="metric-name">{{ scope.row.metricName || '--' }}</div>
              <div class="metric-code">{{ scope.row.metricCode || '--' }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="qualityLevel" label="质量等级" width="120" align="center">
          <template slot-scope="scope">
            <el-tag size="small" type="info">{{ scope.row.qualityLevel || '--' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="范围类型" width="140" align="center">
          <template slot-scope="scope">
            <el-tag :type="getRelationTagType(scope.row.relation)" size="small">
              {{ getRelationText(scope.row.relation) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="下界值" width="120" align="center">
          <template slot-scope="scope">
            {{ formatNumber(scope.row.lowerBound) }}
          </template>
        </el-table-column>
        <el-table-column label="上界值" width="120" align="center">
          <template slot-scope="scope">
            {{ formatNumber(scope.row.upperBound) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="mini" icon="el-icon-edit" @click="openEditDialog(scope.row)">编辑</el-button>
            <el-button type="text" size="mini" icon="el-icon-delete" @click="handleDelete(scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        class="table-pagination"
        layout="total, sizes, prev, pager, next"
        :page-size="pageSize"
        :current-page="currentPage"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="600px" @close="resetRuleForm">
      <el-form ref="ruleFormRef" :model="ruleForm" :rules="formRules" label-width="110px">
        <el-form-item label="指标编码" prop="metricCode">
          <el-select
            v-model="ruleForm.metricCode"
            placeholder="请选择指标编码"
            style="width: 100%"
            filterable
            clearable
            popper-class="metric-select-dropdown"
            @change="handleMetricChange"
          >
            <el-option
              v-for="item in metricOptions"
              :key="item.metricCode"
              :label="formatMetricOptionLabel(item)"
              :value="item.metricCode"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="指标名称" prop="metricName">
          <el-input v-model="ruleForm.metricName" placeholder="请输入指标名称" />
        </el-form-item>
        <el-form-item label="质量等级" prop="qualityLevel">
          <el-select v-model="ruleForm.qualityLevel" placeholder="请选择质量等级" style="width: 100%">
            <el-option
              v-for="item in qualityLevels"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="范围类型" prop="relation">
          <el-select v-model="ruleForm.relation" placeholder="请选择范围类型" style="width: 100%">
            <el-option
              v-for="item in relationOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="下界值 (≥)" prop="lowerBound">
          <el-input-number
            v-model="ruleForm.lowerBound"
            :precision="4"
            :step="0.01"
            :controls="false"
            placeholder="请输入下界值"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="上界值 (≤)" prop="upperBound">
          <el-input-number
            v-model="ruleForm.upperBound"
            :precision="4"
            :step="0.01"
            :controls="false"
            placeholder="请输入上界值"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saveLoading" @click="submitRule">保存</el-button>
      </div>
    </el-dialog>

    <!-- 导入弹窗 -->
    <el-dialog
      title="导入质控规则"
      :visible.sync="importDialogVisible"
      width="520px"
      @close="resetImportForm"
    >
      <el-form ref="importFormRef" :model="importForm" :rules="importRules" label-width="100px">
        <el-form-item label="规则文件" prop="file">
          <div class="file-picker">
            <el-input v-model="importForm.fileName" placeholder="请选择要上传的文件" readonly />
            <el-button @click="triggerFileSelect">选择文件</el-button>
            <input
              ref="fileInputRef"
              type="file"
              class="hidden-file-input"
              accept=".xls,.xlsx,.csv"
              @change="handleFileChange"
            />
          </div>
          <p class="upload-tip">支持 .xls / .xlsx / .csv，单个文件不超过 10 MB。</p>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="importLoading" @click="submitImport">开始导入</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  addQualityRule,
  deleteQualityRule,
  exportQualityRule,
  getQualityRuleList,
  importQualityRule,
  updateQualityRule
} from '@/api/qualityRule'
import { getSampleMetrics } from '@/api/monitorData'

export default {
  name: 'QualityRules',
  data() {
    return {
      loading: false,
      exportLoading: false,
      saveLoading: false,
      importLoading: false,
      dialogVisible: false,
      dialogTitle: '新增质控规则',
      importDialogVisible: false,
      tableData: [],
      total: 0,
      currentPage: 1,
      pageSize: 10,
      selectedRows: [],
      metricOptions: [],
      queryForm: {
        metricName: '',
        metricCode: '',
        qualityLevel: ''
      },
      qualityLevels: [
        { label: 'I类', value: 'I类' },
        { label: 'II类', value: 'II类' },
        { label: 'III类', value: 'III类' },
        { label: 'IV类', value: 'IV类' },
        { label: 'V类', value: 'V类' },
        { label: '劣V类', value: '劣V类' }
      ],
      relationOptions: [
        { label: 'between (开区间)', value: 'between' },
        { label: 'between_equal (闭区间)', value: 'between_equal' },
        { label: 'between_up_equal (左开右闭)', value: 'between_up_equal' },
        { label: 'between_low_equal (左闭右开)', value: 'between_low_equal' }
      ],
      ruleForm: {
        id: null,
        metricCode: '',
        metricName: '',
        qualityLevel: '',
        relation: 'between',
        lowerBound: null,
        upperBound: null
      },
      formRules: {
        metricCode: [{ required: true, message: '请选择指标编码', trigger: 'change' }],
        metricName: [{ required: true, message: '请输入指标名称', trigger: 'blur' }],
        qualityLevel: [{ required: true, message: '请选择质量等级', trigger: 'change' }],
        relation: [{ required: true, message: '请选择范围类型', trigger: 'change' }],
        lowerBound: [{ required: true, message: '请输入下界值', trigger: 'blur' }],
        upperBound: [{ required: true, message: '请输入上界值', trigger: 'blur' }]
      },
      importForm: {
        file: null,
        fileName: ''
      },
      importRules: {
        file: [{ required: true, message: '请上传规则文件', trigger: 'change' }]
      }
    }
  },
  created() {
    this.loadMetricOptions()
    this.loadRuleList()
  },
  methods: {
    getRowKey(row) {
      return row.id || `${row.metricCode}-${row.qualityLevel}`
    },
    formatMetricOptionLabel(item) {
      if (!item) return ''
      const { metricName, metricCode } = item
      return metricName && metricCode ? `${metricName}（${metricCode}）` : metricName || metricCode || ''
    },
    formatNumber(value) {
      if (value === null || value === undefined || value === '') return '--'
      const num = Number(value)
      if (Number.isNaN(num)) return value
      return num.toFixed(4).replace(/0+$/, '').replace(/\.$/, '')
    },
    async loadMetricOptions() {
      try {
        const res = await getSampleMetrics()
        if (res && (res.code === 200 || res.code === 0)) {
          const list = res.data || []
          this.metricOptions = list.map(item => ({
            metricCode: item.metricCode || item.code,
            metricName: item.metricName || item.name || item.metricCode || item.code
          }))
        }
      } catch (error) {
        console.error('加载指标编码列表失败:', error)
        this.$message.error('加载指标编码列表失败')
      }
    },
    async loadRuleList() {
      this.loading = true
      try {
        const params = {
          pageNum: this.currentPage,
          pageSize: this.pageSize
        }
        if (this.queryForm.metricName) {
          params.metricName = this.queryForm.metricName.trim()
        }
        if (this.queryForm.metricCode) {
          params.metricCode = this.queryForm.metricCode
        }
        if (this.queryForm.qualityLevel) {
          params.qualityLevel = this.queryForm.qualityLevel
        }
        const res = await getQualityRuleList(params)
        if (res && (res.code === 200 || res.code === 0 || Array.isArray(res.rows))) {
          const dataRows = res.rows || (res.data && (res.data.records || res.data.rows)) || res.data || []
          const totalCount = res.total || (res.data && res.data.total)
          this.tableData = Array.isArray(dataRows) ? dataRows : []
          this.total = typeof totalCount === 'number' ? totalCount : this.tableData.length
        } else {
          this.tableData = []
          this.total = 0
          this.$message.error(res && res.msg ? res.msg : '获取质控规则失败')
        }
      } catch (error) {
        console.error('获取质控规则失败:', error)
        this.$message.error('获取质控规则失败')
        this.tableData = []
      } finally {
        this.loading = false
      }
    },
    handleQuery() {
      this.currentPage = 1
      this.loadRuleList()
    },
    handleReset() {
      this.queryForm = {
        metricName: '',
        metricCode: '',
        qualityLevel: ''
      }
      this.currentPage = 1
      this.loadRuleList()
    },
    handleSelectionChange(selection) {
      this.selectedRows = selection
    },
    handleSizeChange(size) {
      this.pageSize = size
      this.currentPage = 1
      this.loadRuleList()
    },
    handleCurrentChange(page) {
      this.currentPage = page
      this.loadRuleList()
    },
    openCreateDialog() {
      this.dialogTitle = '新增质控规则'
      this.dialogVisible = true
      this.ruleForm = {
        id: null,
        metricCode: '',
        metricName: '',
        qualityLevel: '',
        relation: 'between',
        lowerBound: null,
        upperBound: null
      }
      this.$nextTick(() => {
        this.$refs.ruleFormRef && this.$refs.ruleFormRef.clearValidate()
      })
    },
    openEditDialog(row) {
      this.dialogTitle = '编辑质控规则'
      this.ruleForm = {
        id: row.id,
        metricCode: row.metricCode,
        metricName: row.metricName,
        qualityLevel: row.qualityLevel,
        relation: row.relation,
        lowerBound: row.lowerBound,
        upperBound: row.upperBound
      }
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.ruleFormRef && this.$refs.ruleFormRef.clearValidate()
      })
    },
    resetRuleForm() {
      this.ruleForm = {
        id: null,
        metricCode: '',
        metricName: '',
        qualityLevel: '',
        relation: 'between',
        lowerBound: null,
        upperBound: null
      }
      this.$nextTick(() => {
        this.$refs.ruleFormRef && this.$refs.ruleFormRef.clearValidate()
      })
    },
    handleMetricChange(code) {
      const target = this.metricOptions.find(item => item.metricCode === code)
      if (target && target.metricName) {
        this.ruleForm.metricName = target.metricName
      }
    },
    validateBounds() {
      const lower = Number(this.ruleForm.lowerBound)
      const upper = Number(this.ruleForm.upperBound)
      if (Number.isNaN(lower) || Number.isNaN(upper)) return true
      if (lower > upper) {
        this.$message.warning('下界值不能大于上界值')
        return false
      }
      return true
    },
    submitRule() {
      this.$refs.ruleFormRef.validate(async valid => {
        if (!valid) return
        if (!this.validateBounds()) return
        this.saveLoading = true
        try {
          const payload = { ...this.ruleForm }
          let res
          if (payload.id) {
            res = await updateQualityRule(payload)
          } else {
            res = await addQualityRule(payload)
          }
          if (res && (res.code === 200 || res.code === 0)) {
            this.$message.success(payload.id ? '修改成功' : '新增成功')
            this.dialogVisible = false
            this.loadRuleList()
          } else {
            this.$message.error(res && res.msg ? res.msg : '保存失败')
          }
        } catch (error) {
          console.error('保存质控规则失败:', error)
        } finally {
          this.saveLoading = false
        }
      })
    },
    confirmDelete(ids, message) {
      this.$confirm(message, '提示', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
        .then(async () => {
          try {
            const res = await deleteQualityRule(ids)
            if (res && (res.code === 200 || res.code === 0)) {
              this.$message.success('删除成功')
              this.loadRuleList()
            } else {
              this.$message.error(res && res.msg ? res.msg : '删除失败')
            }
          } catch (error) {
            console.error('删除质控规则失败:', error)
            this.$message.error('删除失败，请稍后重试')
          }
        })
        .catch(() => {})
    },
    handleDelete(row) {
      if (!row || !row.id) {
        this.$message.warning('缺少规则ID，无法删除')
        return
      }
      this.confirmDelete(row.id, `确定要删除指标 "${row.metricName || row.metricCode}" 的质控规则吗？`)
    },
    handleBatchDelete() {
      if (!this.selectedRows.length) {
        this.$message.warning('请先选择需要删除的记录')
        return
      }
      const ids = this.selectedRows.map(item => item.id).filter(Boolean)
      if (!ids.length) {
        this.$message.warning('所选记录缺少ID，无法删除')
        return
      }
      this.confirmDelete(ids.join(','), `确定要删除选中的 ${ids.length} 条质控规则吗？`)
    },
    async handleExport() {
      this.exportLoading = true
      try {
        const params = {}
        if (this.queryForm.metricName) params.metricName = this.queryForm.metricName.trim()
        if (this.queryForm.metricCode) params.metricCode = this.queryForm.metricCode
        if (this.queryForm.qualityLevel) params.qualityLevel = this.queryForm.qualityLevel
        const res = await exportQualityRule(params)
        const blob = new Blob([res])
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = '质控规则列表.xlsx'
        link.click()
        window.URL.revokeObjectURL(url)
        this.$message.success('导出成功')
      } catch (error) {
        console.error('导出质控规则失败:', error)
        this.$message.error('导出失败，请稍后重试')
      } finally {
        this.exportLoading = false
      }
    },
    openImportDialog() {
      this.importDialogVisible = true
      this.$nextTick(() => {
        this.$refs.importFormRef && this.$refs.importFormRef.clearValidate()
      })
    },
    triggerFileSelect() {
      if (this.$refs.fileInputRef) {
        this.$refs.fileInputRef.click()
      }
    },
    handleFileChange(event) {
      const file = event.target.files && event.target.files[0]
      if (!file) return
      const allowTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv'
      ]
      const isAllowed = allowTypes.includes(file.type) || /\.(xls|xlsx|csv)$/i.test(file.name)
      const isLt10M = file.size / 1024 / 1024 <= 10
      if (!isAllowed) {
        this.$message.error('仅支持 Excel 或 CSV 文件')
        event.target.value = ''
        return
      }
      if (!isLt10M) {
        this.$message.error('上传文件大小不能超过 10MB')
        event.target.value = ''
        return
      }
      this.importForm.file = file
      this.importForm.fileName = file.name
      this.$refs.importFormRef && this.$refs.importFormRef.clearValidate('file')
      event.target.value = ''
    },
    resetImportForm() {
      this.importForm = {
        file: null,
        fileName: ''
      }
      this.$nextTick(() => {
        this.$refs.importFormRef && this.$refs.importFormRef.clearValidate()
      })
    },
    submitImport() {
      this.$refs.importFormRef.validate(async valid => {
        if (!valid) return
        const formData = new FormData()
        formData.append('file', this.importForm.file)
        this.importLoading = true
        try {
          const res = await importQualityRule(formData)
          if (res && (res.code === 200 || res.code === 0)) {
            this.$message.success('导入成功')
            this.importDialogVisible = false
            this.loadRuleList()
          } else {
            this.$message.error(res && res.msg ? res.msg : '导入失败')
          }
        } catch (error) {
          console.error('导入质控规则失败:', error)
          this.$message.error('导入失败，请稍后重试')
        } finally {
          this.importLoading = false
        }
      })
    },
    getRelationTagType(relation) {
      const map = {
        between: 'info',
        between_equal: 'success',
        between_up_equal: 'warning',
        between_low_equal: 'warning'
      }
      return map[relation] || 'info'
    },
    getRelationText(relation) {
      const map = {
        between: '开区间',
        between_equal: '闭区间',
        between_up_equal: '左开右闭',
        between_low_equal: '左闭右开'
      }
      return map[relation] || relation || '--'
    }
  }
}
</script>

<style scoped>
.quality-rules-view {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filter-card,
.table-card {
  border-radius: 8px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 16px;
}

.table-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.toolbar-left > * + * {
  margin-left: 8px;
}

.result-count {
  color: #909399;
  font-size: 13px;
}

.metric-info {
  display: flex;
  flex-direction: column;
  line-height: 1.4;
}

.metric-name {
  font-weight: 600;
  color: #303133;
}

.metric-code {
  color: #909399;
  font-size: 12px;
}

.table-pagination {
  margin-top: 16px;
  text-align: right;
}

.file-picker {
  display: flex;
  gap: 8px;
  align-items: center;
}

.hidden-file-input {
  display: none;
}

.upload-tip {
  margin-top: 6px;
  color: #999;
  font-size: 12px;
}
</style>

<style>
.metric-select-dropdown {
  max-width: 320px !important;
}

.metric-select-dropdown .el-select-dropdown__item {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
