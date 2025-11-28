<template>
  <div class="well-management">
    <!-- 搜索筛选区域 -->
    <div class="search-section">
      <div class="search-form">
        <el-form :inline="true" :model="searchForm" class="search-form-inline">
          <el-form-item label="监测井编码:">
            <el-input 
              v-model="searchForm.wellCode" 
              placeholder="请输入监测井编码"
              style="width: 200px;"
              clearable
            />
          </el-form-item>
          <el-form-item label="地区:">
            <el-cascader
              v-model="searchForm.regionCodes"
              :options="regionOptions"
              :props="regionProps"
              placeholder="请选择省市区"
              style="width: 300px;"
              clearable
              @change="handleRegionChange"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQuery">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
            <el-button type="success" @click="handleImport">导入</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <div class="table-toolbar">
        <div class="toolbar-left">
          <el-button
            type="danger"
            icon="el-icon-delete"
            :disabled="selectedRows.length === 0"
            @click="handleBatchDelete"
          >
            批量删除
          </el-button>
        </div>
        <div class="toolbar-right">
          <span class="result-count">共 {{ total }} 条监测井数据</span>
        </div>
      </div>

      <el-table
        :data="wellsData"
        style="width: 100%"
        :loading="loading"
        stripe
        border
        :row-key="getRowKey"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" align="center"></el-table-column>
        <el-table-column type="index" label="序号" width="60" align="center"></el-table-column>
        <el-table-column prop="wellCode" label="监测井编码" width="150" align="center"></el-table-column>
        <el-table-column prop="provinceName" label="省份" width="120" align="center"></el-table-column>
        <el-table-column prop="cityName" label="城市" width="120" align="center"></el-table-column>
        <el-table-column prop="countyName" label="区县" width="120" align="center"></el-table-column>
        <el-table-column prop="longitude" label="经度" width="120" align="center"></el-table-column>
        <el-table-column prop="latitude" label="纬度" width="120" align="center"></el-table-column>
        <el-table-column prop="wellDepth" label="井深(m)" width="100" align="center"></el-table-column>
        <el-table-column prop="wellOwnershipUnit" label="井权单位" width="120" align="center"></el-table-column>
        <el-table-column prop="burialCondition" label="埋藏条件" width="120" align="center"></el-table-column>
        <el-table-column prop="aquiferMedium" label="含水介质" width="120" align="center"></el-table-column>
        <el-table-column label="监测点类型" width="150" align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.isAreaMonitoringPoint" type="primary" size="mini">区域监测点</el-tag>
            <el-tag v-if="scope.row.isWaterSourceMonitoringPoint" type="success" size="mini">水源监测点</el-tag>
            <el-tag v-if="scope.row.isPollutionSourceMonitoringPoint" type="warning" size="mini">污染源监测点</el-tag>
            <span v-if="!scope.row.isAreaMonitoringPoint && !scope.row.isWaterSourceMonitoringPoint && !scope.row.isPollutionSourceMonitoringPoint">-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" @click="editWell(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
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
    
    <!-- 新增/编辑监测井对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="1000px">
      <el-form :model="wellForm" :rules="rules" ref="wellForm" label-width="140px">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="监测井编码" prop="wellCode">
              <el-input v-model="wellForm.wellCode" placeholder="请输入监测井编码"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="项目ID" prop="projectId">
              <el-input v-model="wellForm.projectId" placeholder="请输入项目ID"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="井深(m)" prop="wellDepth">
              <el-input v-model="wellForm.wellDepth" placeholder="请输入井深"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="地区" prop="regionCodes">
              <el-cascader
                v-model="wellForm.regionCodes"
                :options="regionOptions"
                :props="regionProps"
                placeholder="请选择省市区"
                style="width: 100%;"
                clearable
                @change="handleWellFormRegionChange"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="经度" prop="longitude">
              <el-input v-model="wellForm.longitude" placeholder="请输入经度"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="纬度" prop="latitude">
              <el-input v-model="wellForm.latitude" placeholder="请输入纬度"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="井权单位">
              <el-select v-model="wellForm.wellOwnershipUnit" placeholder="请选择井权单位">
                <el-option label="机民井" value="机民井"></el-option>
                <el-option label="国家井" value="国家井"></el-option>
                <el-option label="地方井" value="地方井"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="埋藏条件">
              <el-select v-model="wellForm.burialCondition" placeholder="请选择埋藏条件">
                <el-option label="潜水" value="潜水"></el-option>
                <el-option label="承压水" value="承压水"></el-option>
                <el-option label="混合水" value="混合水"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="含水介质">
              <el-select v-model="wellForm.aquiferMedium" placeholder="请选择含水介质">
                <el-option label="孔隙水" value="孔隙水"></el-option>
                <el-option label="裂隙水" value="裂隙水"></el-option>
                <el-option label="岩溶水" value="岩溶水"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="井管材质">
              <el-select v-model="wellForm.wellPipeMaterial" placeholder="请选择井管材质">
                <el-option label="钢管" value="钢管"></el-option>
                <el-option label="塑料管" value="塑料管"></el-option>
                <el-option label="其他" value="其他"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="区域监测点">
              <el-switch v-model="wellForm.isAreaMonitoringPoint"></el-switch>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="水源监测点">
              <el-switch v-model="wellForm.isWaterSourceMonitoringPoint"></el-switch>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="污染源监测点">
              <el-switch v-model="wellForm.isPollutionSourceMonitoringPoint"></el-switch>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="污染源信息">
          <el-input type="textarea" v-model="wellForm.pollutionSourceInfo" placeholder="请输入污染源信息" :rows="2"></el-input>
        </el-form-item>
        
        <el-form-item label="备注">
          <el-input type="textarea" v-model="wellForm.description" placeholder="请输入备注信息" :rows="2"></el-input>
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
import {
  getMonitorWellList,
  updateMonitorWell,
  getMonitorWellInfo,
  importMonitorWell,
  batchDeleteMonitorWells
} from '@/api/monitorWell'
import { regionData } from 'element-china-area-data'
import { downloadMonitorWellTemplate } from '@/utils/download'

export default {
  name: 'WellManagement',
  data() {
    return {
      loading: false,
      searchForm: {
        wellCode: '',
        regionCodes: [], // 省市县代码数组
        provinceCode: '',
        cityCode: '',
        countyCode: '',
        isAreaMonitoringPoint: '',
        isWaterSourceMonitoringPoint: '',
        isPollutionSourceMonitoringPoint: '',
        wellOwnershipUnit: ''
      },
      selectedRows: [],
      // 省市县联动数据
      regionOptions: regionData,
      regionProps: {
        value: 'value',
        label: 'label',
        children: 'children'
      },
      wellsData: [],
      total: 0,
      currentPage: 1,
      pageSize: 10,
      dialogVisible: false,
      dialogTitle: '新增监测井',
      wellForm: {
        wellCode: '',
        projectId: '',
        regionCodes: [], // 省市县代码数组
        provinceCode: '',
        cityCode: '',
        countyCode: '',
        longitude: '',
        latitude: '',
        wellDepth: '',
        wellOwnershipUnit: '',
        burialCondition: '',
        aquiferMedium: '',
        wellPipeMaterial: '',
        isAreaMonitoringPoint: false,
        isWaterSourceMonitoringPoint: false,
        isPollutionSourceMonitoringPoint: false,
        areaMonitoringPointType: '',
        waterSourceInfo: '',
        pollutionSourceInfo: '',
        wellheadElevation: '',
        wellheadInnerDiameter: '',
        isMultipleScreenPipe: false,
        screenPipeDepth: '',
        isSuitableForLongTermMonitoring: false,
        isConvertedToLongTermMonitoring: false,
        isMaintenanceManagementCarriedOut: false,
        actualMaintenanceManagementUnit: '',
        isSealedBackfilledForNonLongTerm: false,
        sealedBackfilledStatus: '',
        imageUrl: '',
        description: ''
      },
      rules: {
        wellCode: [
          { required: true, message: '请输入监测井编码', trigger: 'blur' }
        ],
        projectId: [
          { required: true, message: '请输入项目ID', trigger: 'blur' }
        ],
        regionCodes: [
          { required: true, message: '请选择地区', trigger: 'change' }
        ],
        longitude: [
          { required: true, message: '请输入经度', trigger: 'blur' }
        ],
        latitude: [
          { required: true, message: '请输入纬度', trigger: 'blur' }
        ],
        wellDepth: [
          { required: true, message: '请输入井深', trigger: 'blur' }
        ]
      },
    }
  },
  mounted() {
    this.loadWellsData()
  },
  methods: {
    getRowKey(row) {
      return row.id || row.wellCode
    },
    handleSelectionChange(selection) {
      this.selectedRows = selection
    },
    // 转换区划代码:将6位标准代码转换为element-china-area-data格式
    // 例如: '110000' -> '11', '110100' -> '1101', '110101' -> '110101'
    convertRegionCode(code) {
      if (!code) return code
      // 去掉末尾的0
      return code.replace(/0+$/, '')
    },
    // 转换区划代码:将element-china-area-data格式转换为6位标准代码
    // 例如: '11' -> '110000', '1101' -> '110100', '110101' -> '110101'
    convertToStandardCode(code) {
      if (!code) return code
      // 补齐到6位
      return code.padEnd(6, '0')
    },
    // 加载监测井数据
    async loadWellsData() {
      this.loading = true
      try {
        const params = {
          pageNum: this.currentPage,
          pageSize: this.pageSize,
          ...this.searchForm
        }
        // 移除 regionCodes 参数，只保留 provinceCode、cityCode、countyCode
        delete params.regionCodes
        delete params.provinceCode
        delete params.cityCode
        delete params.wellOwnershipUnit
        delete params.isAreaMonitoringPoint
        delete params.isWaterSourceMonitoringPoint
        delete params.isPollutionSourceMonitoringPoint
        const res = await getMonitorWellList(params)
        if (res.code === 200) {
          this.wellsData = res.rows || []
          this.total = res.total || 0
        }
      } catch (error) {
        console.error('获取监测井列表失败:', error)
        this.$message.error('获取监测井列表失败')
      } finally {
        this.loading = false
      }
    },
    // 查询
    handleQuery() {
      this.currentPage = 1
      this.loadWellsData()
    },
    // 重置
    handleReset() {
      this.searchForm = {
        wellCode: '',
        regionCodes: [],
        provinceCode: '',
        cityCode: '',
        countyCode: '',
        isAreaMonitoringPoint: '',
        isWaterSourceMonitoringPoint: '',
        isPollutionSourceMonitoringPoint: '',
        wellOwnershipUnit: ''
      }
      this.currentPage = 1
      this.loadWellsData()
    },
    // 搜索表单地区选择变化
    handleRegionChange(value) {
      if (value && value.length > 0) {
        // 将element-china-area-data格式转换回6位标准代码
        this.searchForm.provinceCode = this.convertToStandardCode(value[0]) || ''
        this.searchForm.cityCode = this.convertToStandardCode(value[1]) || ''
        this.searchForm.countyCode = this.convertToStandardCode(value[2]) || ''
      } else {
        this.searchForm.provinceCode = ''
        this.searchForm.cityCode = ''
        this.searchForm.countyCode = ''
      }
    },
    // 编辑表单地区选择变化
    handleWellFormRegionChange(value) {
      if (value && value.length > 0) {
        // 将element-china-area-data格式转换回6位标准代码
        this.wellForm.provinceCode = this.convertToStandardCode(value[0]) || ''
        this.wellForm.cityCode = this.convertToStandardCode(value[1]) || ''
        this.wellForm.countyCode = this.convertToStandardCode(value[2]) || ''
      } else {
        this.wellForm.provinceCode = ''
        this.wellForm.cityCode = ''
        this.wellForm.countyCode = ''
      }
      console.log('地区选择变化:', {
        选择的值: value,
        转换后: {
          provinceCode: this.wellForm.provinceCode,
          cityCode: this.wellForm.cityCode,
          countyCode: this.wellForm.countyCode
        }
      })
    },
    // 导出
    handleExport() {
      downloadMonitorWellTemplate()
      this.$message.success('模版下载成功')
    },
    // 导入
    handleImport() {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.xlsx,.xls'
      input.onchange = async (e) => {
        const file = e.target.files[0]
        if (file) {
          const formData = new FormData()
          formData.append('file', file)
          try {
            const res = await importMonitorWell(formData)
            if (res.code === 200) {
              this.$message.success('导入成功')
              this.loadWellsData()
            }
          } catch (error) {
            console.error('导入失败:', error)
            this.$message.error('导入失败')
          }
        }
      }
      input.click()
    },
    // 分页大小改变
    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
      this.loadWellsData()
    },
    // 当前页改变
    handleCurrentChange(val) {
      this.currentPage = val
      this.loadWellsData()
    },
    // 编辑监测井
    async editWell(row) {
      this.dialogTitle = '编辑监测井'
      try {
        const res = await getMonitorWellInfo(row.wellCode)
        if (res.code === 200) {
          // 先保存原始数据
          const data = res.data

          // 根据省市县代码构建regionCodes数组
          // 需要将6位标准代码转换为element-china-area-data格式
          const regionCodes = []
          if (data.provinceCode) {
            regionCodes.push(this.convertRegionCode(data.provinceCode))
            if (data.cityCode) {
              regionCodes.push(this.convertRegionCode(data.cityCode))
              if (data.countyCode) {
                regionCodes.push(this.convertRegionCode(data.countyCode))
              }
            }
          }

          // 设置表单数据
          this.wellForm = {
            ...data,
            regionCodes: regionCodes.length > 0 ? regionCodes : []
          }

          console.log('编辑数据回显(已转换):', {
            原始: { provinceCode: data.provinceCode, cityCode: data.cityCode, countyCode: data.countyCode },
            转换后: this.wellForm.regionCodes
          })
        }
      } catch (error) {
        console.error('获取监测井详情失败:', error)
        this.$message.error('获取监测井详情失败')
      }
      this.dialogVisible = true
    },
    // 查看详情
    async viewDetails(row) {
      try {
        const res = await getMonitorWellInfo(row.wellCode)
        if (res.code === 200) {
          this.$alert(JSON.stringify(res.data, null, 2), '监测井详情', {
            confirmButtonText: '确定'
          })
        }
      } catch (error) {
        console.error('获取监测井详情失败:', error)
        this.$message.error('获取监测井详情失败')
      }
    },
    // 保存监测井(仅编辑)
    saveWell() {
      this.$refs.wellForm.validate(async (valid) => {
        if (valid) {
          try {
            // 检查是否为编辑模式
            if (!this.wellForm.id) {
              this.$message.error('无法保存:缺少监测井ID')
              return
            }

            // 准备提交的数据
            const submitData = {
              ...this.wellForm,
              // 确保布尔值字段被正确传递
              isAreaMonitoringPoint: !!this.wellForm.isAreaMonitoringPoint,
              isWaterSourceMonitoringPoint: !!this.wellForm.isWaterSourceMonitoringPoint,
              isPollutionSourceMonitoringPoint: !!this.wellForm.isPollutionSourceMonitoringPoint,
              isMultipleScreenPipe: !!this.wellForm.isMultipleScreenPipe,
              isSuitableForLongTermMonitoring: !!this.wellForm.isSuitableForLongTermMonitoring,
              isConvertedToLongTermMonitoring: !!this.wellForm.isConvertedToLongTermMonitoring,
              isMaintenanceManagementCarriedOut: !!this.wellForm.isMaintenanceManagementCarriedOut,
              isSealedBackfilledForNonLongTerm: !!this.wellForm.isSealedBackfilledForNonLongTerm
            }

            // 调用更新接口
            const res = await updateMonitorWell(submitData)

            if (res.code === 200) {
              this.$message.success('更新成功')
              this.dialogVisible = false
              this.loadWellsData()
            } else {
              this.$message.error(res.msg || '更新失败')
            }
          } catch (error) {
            console.error('保存失败:', error)
            this.$message.error(error.response?.data?.msg || '保存失败')
          }
        }
      })
    },
    // 单条删除
    handleDelete(row) {
      if (!row || !row.wellCode) {
        this.$message.warning('缺少监测井ID，无法删除')
        return
      }
      this.confirmDelete([row.wellCode], `确定要删除监测井 "${row.wellCode}" 吗？`)
    },
    // 批量删除
    handleBatchDelete() {
      if (!this.selectedRows.length) {
        this.$message.warning('请先选择需要删除的记录')
        return
      }
      const ids = this.selectedRows.map(item => item.wellCode).filter(Boolean)
      if (!ids.length) {
        this.$message.warning('所选记录缺少ID，无法删除')
        return
      }
      this.confirmDelete(ids, `确定要删除选中的 ${ids.length} 条监测井数据吗？`)
    },
    // 删除确认
    confirmDelete(ids, message) {
      this.$confirm(message, '提示', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
        .then(async () => {
          try {
            const res = await batchDeleteMonitorWells(ids)
            if (res && (res.code === 200 || res.code === 0)) {
              this.$message.success('删除成功')
              this.loadWellsData()
            } else {
              this.$message.error(res && res.msg ? res.msg : '删除失败')
            }
          } catch (error) {
            console.error('删除监测井失败:', error)
            this.$message.error('删除失败，请稍后重试')
          }
        })
        .catch(() => {})
    },
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
  margin-bottom: 15px;
}

.search-form-inline {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.search-form-inline .el-form-item {
  margin-right: 15px;
  margin-bottom: 10px;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.table-card {
  flex: 1;
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

.dialog-footer {
  text-align: right;
}
</style>
