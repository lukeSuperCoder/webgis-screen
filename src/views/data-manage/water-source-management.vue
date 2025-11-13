<template>
  <div class="water-source-management">
    <!-- 搜索筛选 -->
    <div class="search-section">
      <div class="search-form">
        <el-form :inline="true" :model="searchForm" class="search-form-inline">
          <el-form-item label="水源名称:">
            <el-input
              v-model="searchForm.sourceName"
              placeholder="请输入水源名称"
              style="width: 220px;"
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
          </el-form-item>
        </el-form>
        <div class="action-buttons">
          <el-button type="success" @click="handleImportExcel">导入</el-button>
          <el-button type="warning" @click="handleImportShp">上传水源边界</el-button>
        </div>
      </div>
    </div>

    <!-- 列表 -->
    <el-card class="table-card">
      <el-table
        :data="tableData"
        style="width:100%"
        :loading="loading"
        stripe
        border
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="sourceName" label="水源名称" min-width="160" />
        <el-table-column prop="sourceLevel" label="水源级别" width="120" align="center" />
        <el-table-column prop="provinceName" label="省份" width="120" align="center" />
        <el-table-column prop="cityName" label="城市" width="120" align="center" />
        <el-table-column prop="countyName" label="区县" width="120" align="center" />
        <el-table-column prop="centerLongitude" label="中心经度" width="120" align="center" />
        <el-table-column prop="centerLatitude" label="中心纬度" width="120" align="center" />
        <el-table-column prop="waterSupplyScale" label="供水规模(吨/日)" width="140" align="center" />
        <el-table-column prop="servicePopulation" label="服务人口(人)" width="140" align="center" />
        <el-table-column label="是否划定保护区" width="140" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.isProtectionZoneDelineated ? 'success' : 'info'" size="mini">
              {{ scope.row.isProtectionZoneDelineated ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" @click="editSource(scope.row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next"
        :total="total"
        style="margin-top: 20px; text-align: right;"
      />
    </el-card>

    <!-- 编辑对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="1000px">
      <el-form :model="form" :rules="rules" ref="form" label-width="160px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="水源名称" prop="sourceName">
              <el-input v-model="form.sourceName" placeholder="请输入水源名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="项目ID" prop="projectId">
              <el-input v-model="form.projectId" placeholder="请输入项目ID" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="地区" prop="regionCodes">
              <el-cascader
                v-model="form.regionCodes"
                :options="regionOptions"
                :props="regionProps"
                placeholder="请选择省市区"
                style="width: 100%;"
                clearable
                @change="handleFormRegionChange"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="中心经度" prop="centerLongitude">
              <el-input v-model="form.centerLongitude" placeholder="请输入中心经度" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="中心纬度" prop="centerLatitude">
              <el-input v-model="form.centerLatitude" placeholder="请输入中心纬度" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="水源级别" prop="sourceLevel">
              <el-input v-model="form.sourceLevel" placeholder="请输入水源级别" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="供水规模(吨/日)" prop="waterSupplyScale">
              <el-input v-model="form.waterSupplyScale" placeholder="请输入供水规模" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="服务人口(人)" prop="servicePopulation">
              <el-input v-model="form.servicePopulation" placeholder="请输入服务人口" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="含水介质">
              <el-input v-model="form.aquiferMediumType" placeholder="请输入含水介质" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="是否划定保护区">
              <el-switch v-model="form.isProtectionZoneDelineated" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="是否为优先管控">
              <el-switch v-model="form.isPriorityControlled" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="是否达标供水">
              <el-switch v-model="form.isWaterSupplyUpToStandard" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="当前水质状况">
          <el-input type="textarea" v-model="form.currentWaterQualityStatus" :rows="2" placeholder="请输入当前水质状况" />
        </el-form-item>
        <el-form-item label="超标原因">
          <el-input type="textarea" v-model="form.exceedingStandardReason" :rows="2" placeholder="请输入超标原因" />
        </el-form-item>
        <el-form-item label="已实施管控措施">
          <el-input type="textarea" v-model="form.implementedControlMeasures" :rows="2" placeholder="请输入已实施管控措施" />
        </el-form-item>
        <el-form-item label="拟实施管控措施">
          <el-input type="textarea" v-model="form.plannedControlMeasures" :rows="2" placeholder="请输入拟实施管控措施" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  getWaterSourceList,
  getWaterSourceInfoById,
  updateWaterSourceInfo,
  importWaterSourceExcel,
  importWaterSourceShp
} from '@/api/waterSource'
import { regionData } from 'element-china-area-data'

export default {
  name: 'WaterSourceManagement',
  data() {
    return {
      loading: false,
      searchForm: {
        sourceName: '',
        regionCodes: [],
        provinceCode: '',
        cityCode: '',
        countyCode: ''
      },
      regionOptions: regionData,
      regionProps: {
        value: 'value',
        label: 'label',
        children: 'children'
      },
      tableData: [],
      total: 0,
      currentPage: 1,
      pageSize: 10,
      dialogVisible: false,
      dialogTitle: '编辑水源地',
      form: {
        sourceId: undefined,
        sourceName: '',
        projectId: '',
        regionCodes: [],
        provinceCode: '',
        cityCode: '',
        countyCode: '',
        centerLongitude: '',
        centerLatitude: '',
        sourceLevel: '',
        waterSupplyScale: '',
        servicePopulation: '',
        aquiferMediumType: '',
        isProtectionZoneDelineated: false,
        isPriorityControlled: false,
        isWaterSupplyUpToStandard: false,
        currentWaterQualityStatus: '',
        exceedingStandardReason: '',
        implementedControlMeasures: '',
        plannedControlMeasures: ''
      },
      rules: {
        sourceName: [{ required: true, message: '请输入水源名称', trigger: 'blur' }],
        projectId: [{ required: true, message: '请输入项目ID', trigger: 'blur' }],
        regionCodes: [{ required: true, message: '请选择地区', trigger: 'change' }],
        centerLongitude: [{ required: true, message: '请输入中心经度', trigger: 'blur' }],
        centerLatitude: [{ required: true, message: '请输入中心纬度', trigger: 'blur' }]
      }
    }
  },
  mounted() {
    this.loadList()
  },
  methods: {
    convertRegionCode(code) {
      if (!code) return code
      return code.replace(/0+$/, '')
    },
    convertToStandardCode(code) {
      if (!code) return code
      return code.padEnd(6, '0')
    },
    async loadList() {
      this.loading = true
      try {
        const params = {
          pageNum: this.currentPage,
          pageSize: this.pageSize,
          sourceName: this.searchForm.sourceName,
          provinceCode: this.searchForm.provinceCode,
          cityCode: this.searchForm.cityCode,
          countyCode: this.searchForm.countyCode
        }
        const res = await getWaterSourceList(params)
        if (res.code === 0) {
          this.tableData = res.rows || []
          this.total = res.total || 0
        }
      } catch (e) {
        console.error('获取水源地列表失败:', e)
        this.$message.error('获取水源地列表失败')
      } finally {
        this.loading = false
      }
    },
    handleQuery() {
      this.currentPage = 1
      this.loadList()
    },
    handleReset() {
      this.searchForm = {
        sourceName: '',
        regionCodes: [],
        provinceCode: '',
        cityCode: '',
        countyCode: ''
      }
      this.currentPage = 1
      this.loadList()
    },
    handleRegionChange(value) {
      if (value && value.length > 0) {
        this.searchForm.provinceCode = this.convertToStandardCode(value[0]) || ''
        this.searchForm.cityCode = this.convertToStandardCode(value[1]) || ''
        this.searchForm.countyCode = this.convertToStandardCode(value[2]) || ''
      } else {
        this.searchForm.provinceCode = ''
        this.searchForm.cityCode = ''
        this.searchForm.countyCode = ''
      }
    },
    handleFormRegionChange(value) {
      if (value && value.length > 0) {
        this.form.provinceCode = this.convertToStandardCode(value[0]) || ''
        this.form.cityCode = this.convertToStandardCode(value[1]) || ''
        this.form.countyCode = this.convertToStandardCode(value[2]) || ''
      } else {
        this.form.provinceCode = ''
        this.form.cityCode = ''
        this.form.countyCode = ''
      }
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
      this.loadList()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.loadList()
    },
    async editSource(row) {
      this.dialogTitle = '编辑水源地'
      try {
        const res = await getWaterSourceInfoById(row.sourceId)
        if (res.code === 200) {
          const data = res.data || {}
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
          this.form = {
            ...data,
            regionCodes: regionCodes.length > 0 ? regionCodes : []
          }
        }
      } catch (e) {
        console.error('获取水源地详情失败:', e)
        this.$message.error('获取水源地详情失败')
      }
      this.dialogVisible = true
    },
    save() {
      this.$refs.form.validate(async (valid) => {
        if (!valid) return
        try {
          if (!this.form.sourceId) {
            this.$message.error('无法保存：缺少水源ID')
            return
          }
          const submitData = {
            ...this.form,
            isProtectionZoneDelineated: !!this.form.isProtectionZoneDelineated,
            isPriorityControlled: !!this.form.isPriorityControlled,
            isWaterSupplyUpToStandard: !!this.form.isWaterSupplyUpToStandard
          }
          delete submitData.regionCodes
          const res = await updateWaterSourceInfo(submitData)
          if (res.code === 200) {
            this.$message.success('更新成功')
            this.dialogVisible = false
            this.loadList()
          } else {
            this.$message.error(res.msg || '更新失败')
          }
        } catch (e) {
          console.error('保存失败:', e)
          this.$message.error(e.response?.data?.msg || '保存失败')
        }
      })
    },
    handleImportExcel() {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.xlsx,.xls'
      input.onchange = async (e) => {
        const file = e.target.files[0]
        if (file) {
          const formData = new FormData()
          formData.append('file', file)
          try {
            const res = await importWaterSourceExcel(formData)
            if (res.code === 200) {
              this.$message.success('Excel 导入成功')
              this.loadList()
            }
          } catch (error) {
            console.error('Excel 导入失败:', error)
            this.$message.error('Excel 导入失败')
          }
        }
      }
      input.click()
    },
    handleImportShp() {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.zip,.rar,.7z,.shp'
      input.onchange = async (e) => {
        const file = e.target.files[0]
        if (file) {
          const formData = new FormData()
          formData.append('file', file)
          try {
            const res = await importWaterSourceShp(formData)
            if (res.code === 200) {
              this.$message.success('边界文件上传成功')
              this.loadList()
            }
          } catch (error) {
            console.error('边界上传失败:', error)
            this.$message.error('边界上传失败')
          }
        }
      }
      input.click()
    }
  }
}
</script>

<style scoped>
.water-source-management {
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

.table-card {
  flex: 1;
}

.dialog-footer {
  text-align: right;
}
</style>


