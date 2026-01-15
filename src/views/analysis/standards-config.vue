<template>
  <div class="standards-config">
    <!-- 查询条件 -->
    <el-card class="filter-card">
      <el-form
        :inline="true"
        :model="queryForm"
        label-width="110px"
        class="filter-form"
      >
        <el-form-item label="参考标准:">
          <el-select
            v-model="queryForm.referenceStandardId"
            placeholder="请选择参考标准"
            clearable
            filterable
            :loading="referenceLoading"
          >
            <el-option
              v-for="option in referenceStandardOptions"
              :key="option.id"
              :label="option.standardName"
              :value="option.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="指标名称:">
          <el-input
            v-model="queryForm.metricName"
            placeholder="请输入指标名称"
            clearable
            style="width: 220px;"
          />
        </el-form-item>
        <el-form-item label="指标编码:">
          <el-input
            v-model="queryForm.metricCode"
            placeholder="请输入指标编码"
            clearable
            style="width: 220px;"
          />
        </el-form-item>
        <el-form-item label="状态:">
          <el-select
            v-model="queryForm.status"
            placeholder="请选择状态"
            clearable
          >
            <el-option label="启用" :value="1" />
            <el-option label="停用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleQuery">
            查询
          </el-button>
          <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 列表 -->
    <el-card class="table-card">
      <div class="table-toolbar">
        <div class="toolbar-left">
          <el-button type="primary" icon="el-icon-plus" @click="handleCreate">
            新增配置
          </el-button>
          <el-button
            type="danger"
            icon="el-icon-delete"
            :disabled="!selectedRows.length"
            @click="handleBatchDelete"
          >
            批量删除
          </el-button>
          <el-button
            type="success"
            icon="el-icon-upload2"
            @click="openImportDialog"
          >
            导入
          </el-button>
          <el-button
            icon="el-icon-download"
            :loading="exportLoading"
            @click="handleExport"
          >
            导出
          </el-button>
        </div>
        <div class="toolbar-right">
          <el-button
            type="warning"
            plain
            icon="el-icon-finished"
            :loading="activateLoading"
            @click="handleBatchActivate"
          >
            激活参考标准
          </el-button>
        </div>
      </div>

      <div class="table-wrapper">
        <el-table
          class="config-table"
          :data="tableData"
          border
          stripe
          height="calc(100vh - 450px)"
          :loading="loading"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="60" align="center" />
          <el-table-column
            type="index"
            label="序号"
            width="60"
            align="center"
          />
          <el-table-column
            prop="referenceStandard"
            label="参考标准"
            min-width="200"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              {{ getReferenceName(scope.row) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="metricName"
            label="指标名称"
            width="160"
            show-overflow-tooltip
          />
          <el-table-column
            prop="metricCode"
            label="指标编码"
            width="160"
            show-overflow-tooltip
          />
          <el-table-column
            v-for="column in rangeColumns"
            :key="column.prop"
            :prop="column.prop"
            :label="column.label"
            min-width="120"
            align="center"
          >
            <template slot-scope="scope">
              {{ formatRange(scope.row[column.prop]) }}
            </template>
          </el-table-column>
          <el-table-column label="状态" width="140" align="center">
            <template slot-scope="scope">
              <el-switch
                v-model="scope.row.status"
                :active-value="1"
                :inactive-value="0"
                active-text="启用"
                inactive-text="停用"
                :loading="!!scope.row.__statusLoading"
                @change="value => handleStatusChange(scope.row, value)"
              />
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            width="220"
            align="center"
            fixed="right"
          >
            <template slot-scope="scope">
              <el-button type="text" size="mini" @click="openDetail(scope.row)">
                详情
              </el-button>
              <el-button type="text" size="mini" @click="handleEdit(scope.row)">
                编辑
              </el-button>
              <el-button
                type="text"
                size="mini"
                class="danger-text"
                @click="handleDelete(scope.row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <el-pagination
        class="table-pagination"
        layout="total, sizes, prev, pager, next"
        :page-size="pagination.pageSize"
        :current-page="pagination.currentPage"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="640px"
      destroy-on-close
      @close="resetForm"
    >
      <el-form
        ref="configForm"
        :model="formModel"
        :rules="formRules"
        label-width="120px"
      >
        <el-form-item label="参考标准" prop="referenceStandardId">
          <el-select
            v-model="formModel.referenceStandardId"
            placeholder="请选择参考标准"
            filterable
            clearable
            :loading="referenceLoading"
            style="width: 100%;"
            @change="handleFormReferenceChange"
          >
            <el-option
              v-for="option in referenceStandardOptions"
              :key="option.id"
              :label="option.standardName"
              :value="option.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="指标名称" prop="metricName">
          <el-input
            v-model="formModel.metricName"
            placeholder="请输入指标名称"
          />
        </el-form-item>
        <el-form-item label="指标编码" prop="metricCode">
          <el-input
            v-model="formModel.metricCode"
            placeholder="请输入指标编码"
          />
        </el-form-item>
        <el-form-item
          v-for="column in rangeColumns"
          :key="column.prop"
          :label="column.label + '范围'"
          :prop="column.prop"
        >
          <el-input
            v-model="formModel[column.prop]"
            :placeholder="`请输入${column.label}范围，例如 [0,0.5]`"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formModel.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="submitLoading"
          @click="submitForm"
        >
          保存
        </el-button>
      </div>
    </el-dialog>

    <!-- 导入弹窗 -->
    <el-dialog
      title="导入评价标准配置"
      :visible.sync="importDialogVisible"
      width="520px"
      @close="resetImportForm"
    >
      <el-form
        ref="importFormRef"
        :model="importForm"
        :rules="importRules"
        label-width="120px"
      >
        <el-form-item label="参考标准" prop="evaluationViewId">
          <el-select
            v-model="importForm.evaluationViewId"
            placeholder="请选择参考标准"
            filterable
            clearable
            style="width: 100%;"
          >
            <el-option
              v-for="option in referenceStandardOptions"
              :key="option.id"
              :label="option.standardName"
              :value="option.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="上传文件" prop="file">
          <div class="file-picker">
            <el-input
              v-model="importForm.fileName"
              placeholder="请选择Excel文件"
              readonly
            />
            <el-button @click="triggerFileSelect">选择文件</el-button>
            <input
              ref="importFileInput"
              type="file"
              class="hidden-file-input"
              accept=".xls,.xlsx"
              @change="handleImportFileChange"
            />
          </div>
          <p class="upload-tip">支持 .xls、.xlsx 文件格式，单个文件不超过 5MB。</p>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="importLoading"
          @click="submitImport"
        >
          开始导入
        </el-button>
      </div>
    </el-dialog>

    <!-- 详情弹窗 -->
    <el-dialog
      title="评价标准详情"
      :visible.sync="detailDialogVisible"
      width="560px"
    >
      <el-descriptions :column="1" border v-if="detailRecord">
        <el-descriptions-item label="参考标准">
          {{ getReferenceName(detailRecord) }}
        </el-descriptions-item>
        <el-descriptions-item label="指标名称">
          {{ detailRecord.metricName || '--' }}
        </el-descriptions-item>
        <el-descriptions-item label="指标编码">
          {{ detailRecord.metricCode || '--' }}
        </el-descriptions-item>
        <el-descriptions-item
          v-for="column in rangeColumns"
          :key="`detail-${column.prop}`"
          :label="column.label + '范围'"
        >
          {{ formatRange(detailRecord[column.prop]) }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="detailRecord.status === 1 ? 'success' : 'info'">
            {{ detailRecord.status === 1 ? '启用' : '停用' }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="detailDialogVisible = false">
          我已了解
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  addEvaluationConfig,
  batchActivateEvaluationConfig,
  batchDeleteEvaluationConfig,
  exportEvaluationConfig,
  getEvaluationConfigList,
  getEvaluationViewList,
  importEvaluationConfig,
  updateEvaluationConfig
} from '@/api/evaluation'

const defaultFormState = () => ({
  id: null,
  referenceStandardId: '',
  metricName: '',
  metricCode: '',
  classIRange: '',
  classIiRange: '',
  classIiiRange: '',
  classIvRange: '',
  classVRange: '',
  classInferiorVRange: '',
  status: 1
})

export default {
  name: 'StandardsConfig',
  data() {
    return {
      loading: false,
      exportLoading: false,
      activateLoading: false,
      submitLoading: false,
      importLoading: false,
      dialogVisible: false,
      detailDialogVisible: false,
      importDialogVisible: false,
      dialogTitle: '',
      rangeColumns: [
        { prop: 'classIRange', label: 'Ⅰ类' },
        { prop: 'classIiRange', label: 'Ⅱ类' },
        { prop: 'classIiiRange', label: 'Ⅲ类' },
        { prop: 'classIvRange', label: 'Ⅳ类' },
        { prop: 'classVRange', label: 'Ⅴ类' },
        { prop: 'classInferiorVRange', label: '劣Ⅴ类' }
      ],
      queryForm: {
        referenceStandardId: '',
        metricName: '',
        metricCode: '',
        status: ''
      },
      tableData: [],
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      selectedRows: [],
      formModel: defaultFormState(),
      formRules: {
        referenceStandardId: [
          { required: true, message: '请选择参考标准', trigger: 'change' }
        ],
        metricName: [
          { required: true, message: '请输入指标名称', trigger: 'blur' }
        ],
        metricCode: [
          { required: true, message: '请输入指标编码', trigger: 'blur' }
        ],
        status: [{ required: true, message: '请选择状态', trigger: 'change' }]
      },
      detailRecord: null,
      importForm: {
        evaluationViewId: '',
        file: null,
        fileName: ''
      },
      importRules: {
        evaluationViewId: [
          { required: true, message: '请选择参考标准', trigger: 'change' }
        ],
        file: [{ required: true, message: '请上传文件', trigger: 'change' }]
      },
      referenceStandardOptions: [],
      referenceMap: {},
      referenceLoading: false
    }
  },
  created() {
    this.loadReferenceOptions()
    this.loadConfigList()
  },
  methods: {
    // 查询列表
    async loadConfigList() {
      this.loading = true
      try {
        const params = {
          pageNum: this.pagination.currentPage,
          pageSize: this.pagination.pageSize
        }
        if (this.queryForm.referenceStandardId) {
          params.referenceStandardId = this.queryForm.referenceStandardId
        }
        if (this.queryForm.metricName) {
          params.metricName = this.queryForm.metricName.trim()
        }
        if (this.queryForm.metricCode) {
          params.metricCode = this.queryForm.metricCode.trim()
        }
        if (this.queryForm.status !== '' && this.queryForm.status !== null) {
          params.status = this.queryForm.status
        }
        const res = await getEvaluationConfigList(params)
        if (res && (res.code === 200 || res.code === 0 || res.rows || res.data)) {
          const list =
            (Array.isArray(res.rows) && res.rows) ||
            (Array.isArray(res.data) && res.data) ||
            (Array.isArray(res.data?.rows) && res.data.rows) ||
            (Array.isArray(res.data?.records) && res.data.records) ||
            (Array.isArray(res.data?.list) && res.data.list) ||
            []
          this.tableData = list.map(item => ({
            ...item,
            status:
              item.status === 0 || item.status === 1
                ? item.status
                : Number(item.status) === 0
                  ? 0
                  : 1
          }))
          const total =
            res.total ??
            res.data?.total ??
            res.data?.count ??
            res.data?.pagination?.total ??
            list.length
          this.pagination.total = Number(total) || 0
        } else {
          this.tableData = []
          this.pagination.total = 0
        }
      } catch (error) {
        console.error('加载评价标准配置失败:', error)
        this.$message.error('加载评价标准配置失败')
        this.tableData = []
      } finally {
        this.loading = false
      }
    },
    // 查询操作
    handleQuery() {
      this.pagination.currentPage = 1
      this.loadConfigList()
    },
    // 重置
    handleReset() {
      this.queryForm = {
        referenceStandardId: '',
        metricName: '',
        metricCode: '',
        status: ''
      }
      this.pagination.currentPage = 1
      this.loadConfigList()
    },
    // 分页大小
    handleSizeChange(size) {
      this.pagination.pageSize = size
      this.pagination.currentPage = 1
      this.loadConfigList()
    },
    // 页码切换
    handleCurrentChange(page) {
      this.pagination.currentPage = page
      this.loadConfigList()
    },
    // 选择变化
    handleSelectionChange(selection) {
      this.selectedRows = selection
    },
    // 获取参考标准列表
    async loadReferenceOptions() {
      this.referenceLoading = true
      try {
        const res = await getEvaluationViewList({
          pageNum: 1,
          pageSize: 200
        })
        if (res && (res.rows || res.data)) {
          const options = res.rows || res.data || []
          this.referenceStandardOptions = options
          const map = {}
          options.forEach(item => {
            map[item.id] = item.standardName || item.planName || item.referenceStandard
          })
          this.referenceMap = map
        }
      } catch (error) {
        console.error('获取参考标准列表失败:', error)
        this.$message.error('获取参考标准列表失败')
      } finally {
        this.referenceLoading = false
      }
    },
    // 获取参考标准名称
    getReferenceName(row) {
      if (row.referenceStandard) return row.referenceStandard
      if (row.referenceStandardName) return row.referenceStandardName
      if (row.referenceStandardId && this.referenceMap[row.referenceStandardId]) {
        return this.referenceMap[row.referenceStandardId]
      }
      return '--'
    },
    // 显示新增
    handleCreate() {
      this.dialogTitle = '新增评价标准配置'
      this.formModel = defaultFormState()
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.configForm && this.$refs.configForm.clearValidate()
      })
    },
    // 编辑
    handleEdit(row) {
      this.dialogTitle = '编辑评价标准配置'
      this.formModel = {
        id: row.id,
        referenceStandardId: row.referenceStandardId || row.referenceStandardID || '',
        metricName: row.metricName || '',
        metricCode: row.metricCode || '',
        classIRange: row.classIRange || '',
        classIiRange: row.classIiRange || '',
        classIiiRange: row.classIiiRange || '',
        classIvRange: row.classIvRange || '',
        classVRange: row.classVRange || '',
        classInferiorVRange: row.classInferiorVRange || '',
        status:
          row.status === 0 || row.status === 1
            ? row.status
            : Number(row.status) === 0
              ? 0
              : 1
      }
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.configForm && this.$refs.configForm.clearValidate()
      })
    },
    // 表单参考标准变更
    handleFormReferenceChange(value) {
      if (!value) return
      const option = this.referenceStandardOptions.find(item => item.id === value)
      if (option) {
        this.formModel.referenceStandard = option.standardName
      }
    },
    // 重置表单
    resetForm() {
      this.formModel = defaultFormState()
      this.$nextTick(() => {
        this.$refs.configForm && this.$refs.configForm.clearValidate()
      })
    },
    buildConfigPayload(source) {
      if (!source) return {}
      return {
        id: source.id || null,
        referenceStandardId:
          source.referenceStandardId || source.referenceStandardID || '',
        metricName: source.metricName || '',
        metricCode: source.metricCode || '',
        classIRange: source.classIRange || '',
        classIiRange: source.classIiRange || '',
        classIiiRange: source.classIiiRange || '',
        classIvRange: source.classIvRange || '',
        classVRange: source.classVRange || '',
        classInferiorVRange: source.classInferiorVRange || '',
        status:
          source.status === 0 || source.status === 1
            ? source.status
            : Number(source.status) === 0
              ? 0
              : 1
      }
    },
    // 保存
    submitForm() {
      this.$refs.configForm.validate(async valid => {
        if (!valid) return
        this.submitLoading = true
        try {
          const payload = this.buildConfigPayload(this.formModel)
          let res
          if (payload.id) {
            res = await updateEvaluationConfig(payload)
          } else {
            res = await addEvaluationConfig(payload)
          }
          if (res && (res.code === 200 || res.code === 0)) {
            this.$message.success(payload.id ? '修改成功' : '新增成功')
            this.dialogVisible = false
            this.loadConfigList()
          }
        } catch (error) {
          console.error('保存评价标准配置失败:', error)
        } finally {
          this.submitLoading = false
        }
      })
    },
    // 删除单条
    handleDelete(row) {
      this.$confirm(`确认删除指标【${row.metricName || '--'}】的配置吗？`, '提示', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          try {
            const res = await batchDeleteEvaluationConfig([row.id])
            if (res && (res.code === 200 || res.code === 0)) {
              this.$message.success('删除成功')
              this.loadConfigList()
            }
          } catch (error) {
            console.error('删除失败:', error)
            this.$message.error('删除失败，请稍后再试')
          }
        })
        .catch(() => {})
    },
    // 批量删除
    handleBatchDelete() {
      if (!this.selectedRows.length) {
        this.$message.warning('请至少选择一条记录')
        return
      }
      this.$confirm(`确认删除选中的 ${this.selectedRows.length} 条配置吗？`, '提示', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          try {
            const ids = this.selectedRows.map(item => item.id)
            const res = await batchDeleteEvaluationConfig(ids)
            if (res && (res.code === 200 || res.code === 0)) {
              this.$message.success('批量删除成功')
              this.loadConfigList()
            }
          } catch (error) {
            console.error('批量删除失败:', error)
            this.$message.error('批量删除失败，请稍后重试')
          }
        })
        .catch(() => {})
    },
    // 激活参考标准
    handleBatchActivate() {
      if (!this.queryForm.referenceStandardId) {
        this.$message.warning('请先在筛选条件中选择参考标准')
        return
      }
      this.$confirm('确认激活当前参考标准下的全部配置吗？', '提示', {
        confirmButtonText: '激活',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          this.activateLoading = true
          try {
            const res = await batchActivateEvaluationConfig(
              this.queryForm.referenceStandardId
            )
            if (res && (res.code === 200 || res.code === 0)) {
              this.$message.success('激活成功')
              this.loadConfigList()
            }
          } catch (error) {
            console.error('激活参考标准失败:', error)
            this.$message.error('激活失败，请稍后重试')
          } finally {
            this.activateLoading = false
          }
        })
        .catch(() => {})
    },
    // 导出
    async handleExport() {
      this.exportLoading = true
      try {
        const params = {}
        if (this.queryForm.referenceStandardId) {
          params.referenceStandardId = this.queryForm.referenceStandardId
        }
        if (this.queryForm.metricName) {
          params.metricName = this.queryForm.metricName.trim()
        }
        if (this.queryForm.metricCode) {
          params.metricCode = this.queryForm.metricCode.trim()
        }
        if (this.queryForm.status !== '' && this.queryForm.status !== null) {
          params.status = this.queryForm.status
        }
        const response = await exportEvaluationConfig(params)
        const blob = new Blob([response], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `评价标准配置_${new Date().getTime()}.xlsx`
        link.click()
        window.URL.revokeObjectURL(url)
        this.$message.success('导出成功')
      } catch (error) {
        console.error('导出失败:', error)
        this.$message.error('导出失败，请稍后重试')
      } finally {
        this.exportLoading = false
      }
    },
    // 导入 - 打开弹窗
    openImportDialog() {
      if (!this.referenceStandardOptions.length) {
        this.loadReferenceOptions()
      }
      this.importDialogVisible = true
      this.$nextTick(() => {
        this.$refs.importFormRef && this.$refs.importFormRef.clearValidate()
      })
    },
    // 触发文件选择
    triggerFileSelect() {
      if (this.$refs.importFileInput) {
        this.$refs.importFileInput.click()
      }
    },
    // 文件变更
    handleImportFileChange(event) {
      const file = event.target.files && event.target.files[0]
      if (file) {
        const isExcel =
          file.type ===
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          file.type === 'application/vnd.ms-excel' ||
          file.name.endsWith('.xls') ||
          file.name.endsWith('.xlsx')
        const isLt5M = file.size / 1024 / 1024 <= 5
        if (!isExcel) {
          this.$message.error('只能上传Excel文件')
          event.target.value = ''
          return
        }
        if (!isLt5M) {
          this.$message.error('上传文件大小不能超过5MB')
          event.target.value = ''
          return
        }
        this.importForm.file = file
        this.importForm.fileName = file.name
        this.$refs.importFormRef && this.$refs.importFormRef.clearValidate('file')
      }
      // 重置 input value，防止相同文件无法再次选择
      event.target.value = ''
    },
    // 重置导入表单
    resetImportForm() {
      this.importForm = {
        evaluationViewId: '',
        file: null,
        fileName: ''
      }
      this.$nextTick(() => {
        this.$refs.importFormRef && this.$refs.importFormRef.clearValidate()
      })
    },
    // 提交导入
    submitImport() {
      this.$refs.importFormRef.validate(async valid => {
        if (!valid) return
        const formData = new FormData()
        formData.append('file', this.importForm.file)
        this.importLoading = true
        try {
          const res = await importEvaluationConfig(
            formData,
            this.importForm.evaluationViewId
          )
          if (res && (res.code === 200 || res.code === 0)) {
            this.$message.success('导入成功')
            this.importDialogVisible = false
            this.loadConfigList()
          }
        } catch (error) {
          console.error('导入失败:', error)
          this.$message.error('导入失败，请检查文件内容或稍后再试')
        } finally {
          this.importLoading = false
        }
      })
    },
    // 打开详情
    openDetail(row) {
      this.detailRecord = { ...row }
      this.detailDialogVisible = true
    },
    // 格式化范围
    formatRange(range) {
      if (!range) return '--'
      return range
    },
    // 状态切换
    async handleStatusChange(row, value) {
      row.__statusLoading = true
      const original = value === 1 ? 0 : 1
      try {
        const payload = this.buildConfigPayload({
          ...row,
          status: value
        })
        const res = await updateEvaluationConfig(payload)
        if (res && (res.code === 200 || res.code === 0)) {
          this.$message.success('状态更新成功')
        } else {
          row.status = original
        }
      } catch (error) {
        console.error('状态更新失败:', error)
        row.status = original
        this.$message.error('状态更新失败')
      } finally {
        row.__statusLoading = false
      }
    }
  }
}
</script>

<style scoped>
.standards-config {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.filter-card {
  padding-bottom: 0;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
}

.filter-form .el-form-item {
  margin-right: 20px;
  margin-bottom: 12px;
}

.table-card {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.table-wrapper {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.config-table {
  width: 100%;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.danger-text {
  color: #f56c6c;
}

.table-pagination {
  margin-top: 16px;
  text-align: right;
}

.dialog-footer {
  text-align: right;
}

.file-picker {
  display: flex;
  gap: 10px;
  align-items: center;
}

.hidden-file-input {
  display: none;
}

.upload-tip {
  margin-top: 4px;
  color: #909399;
  font-size: 12px;
}
</style>
