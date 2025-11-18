<template>
  <div class="comprehensive-analysis">
    <!-- 搜索条件 -->
    <el-card class="search-card">
      <el-form
        :inline="true"
        :model="filters"
        class="search-form"
        label-width="90px"
      >
        <el-form-item label="监测井选择:">
          <el-select
            v-model="filters.well"
            placeholder="请选择监测井"
            clearable
            filterable
            style="width: 220px;"
            popper-append-to-body
          >
            <el-option
              v-for="well in wellList"
              :key="well"
              :label="well"
              :value="well"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围:">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
            style="width: 280px;"
            @change="handleDateRangeChange"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <div class="table-header">
        <div>
          <h3>监测井监测数据</h3>
          
        </div>
        <span class="table-desc">共 {{ tableData.length }} 条</span>
      </div>

      <el-table
        :data="tableData"
        style="width: 100%"
        :loading="loading"
        stripe
        border
        height="calc(100vh - 320px)"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column
          prop="monitoringWellCode"
          label="监测井编号"
          align="center"
          min-width="140"
        />
        <el-table-column
          prop="samplingTime"
          label="监测时间"
          align="center"
          min-width="180"
        >
          <template slot-scope="scope">
            {{ formatDateTime(scope.row.samplingTime) }}
          </template>
        </el-table-column>
        <el-table-column
          v-for="metric in metricColumns"
          :key="metric.key"
          :prop="metric.key"
          :label="metric.label"
          align="center"
          min-width="120"
        >
          <template slot-scope="scope">
            <span
              :style="{
                color: getLevelColor(
                  scope.row.metrics &&
                  scope.row.metrics[metric.key]
                    ? scope.row.metrics[metric.key].level
                    : ''
                )
              }"
            >
              {{
                scope.row.metrics && scope.row.metrics[metric.key]
                  ? scope.row.metrics[metric.key].value
                  : '--'
              }}
            </span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { getSampleQualityLevels } from '@/api/monitorData'
import { getMonitorWellCodes } from '@/api/monitorWell'

export default {
  name: 'ComprehensiveAnalysis',
  data() {
    return {
      filters: {
        well: '',
        startDate: '',
        endDate: ''
      },
      dateRange: [],
      wellList: [],
      loading: false,
      tableData: [],
      metricColumns: [],
      metricNameKeyMap: {}
    }
  },
  mounted() {
    this.initFilters()
    this.loadWellList()
    this.loadDataList()
  },
  methods: {
    initFilters() {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 2000)

      this.filters.startDate = this.formatDateForInput(startDate)
      this.filters.endDate = this.formatDateForInput(endDate)
      this.dateRange = [this.filters.startDate, this.filters.endDate]
    },
    handleQuery() {
      this.loadDataList()
    },
    handleReset() {
      this.filters = {
        well: '',
        startDate: '',
        endDate: ''
      }
      this.dateRange = []
      this.initFilters()
      this.loadDataList()
    },
    handleDateRangeChange(value) {
      if (value && value.length === 2) {
        this.filters.startDate = value[0]
        this.filters.endDate = value[1]
      } else {
        this.filters.startDate = ''
        this.filters.endDate = ''
      }
    },
    formatDateForInput(date) {
      if (!date) return ''
      const d = new Date(date)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    formatDateTime(dateTime) {
      if (!dateTime) return '未知'
      try {
        const date = new Date(dateTime)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        const seconds = String(date.getSeconds()).padStart(2, '0')
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
      } catch (error) {
        return dateTime
      }
    },
    formatDateTimeForApi(date) {
      if (!date) return ''
      const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : new Date(date)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      const hours = String(d.getHours()).padStart(2, '0')
      const minutes = String(d.getMinutes()).padStart(2, '0')
      const seconds = String(d.getSeconds()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    },
    async loadWellList() {
      try {
        const response = await getMonitorWellCodes()
        if (response.code === 200) {
          if (Array.isArray(response.data)) {
            this.wellList = response.data
          } else if (response.data && Array.isArray(response.data.data)) {
            this.wellList = response.data.data
          } else {
            this.wellList = []
          }
        }
      } catch (error) {
        console.error('获取监测井列表失败:', error)
        this.wellList = []
      }
    },
    async loadDataList() {
      this.loading = true
      try {
        const params = {
          monitoringWellCode: this.filters.well || ''
        }

        if (this.filters.startDate) {
          params.startTime = this.formatDateTimeForApi(this.filters.startDate)
        }
        if (this.filters.endDate) {
          const endDate = new Date(this.filters.endDate + 'T23:59:59')
          params.endTime = this.formatDateTimeForApi(endDate)
        }

        const response = await getSampleQualityLevels(params)

        if (response.code === 200 && Array.isArray(response.data)) {
          const records = response.data || []
          this.buildMetricColumns(records)
          this.tableData = records.map(item => {
            const metricsMap = {}
            if (item.metricValues && Array.isArray(item.metricValues)) {
              item.metricValues.forEach(metric => {
                const key = this.getMetricKeyByName(metric.metricName)
                metricsMap[key] = {
                  value: metric.value,
                  level: metric.level || metric.qualityLevel || ''
                }
              })
            }
            return {
              monitoringWellCode: item.monitoringWellCode || '未知',
              samplingTime: item.samplingTime,
              metrics: metricsMap
            }
          })
        } else {
          this.tableData = []
        }
      } catch (error) {
        console.error('获取监测数据列表失败:', error)
        this.$message.error('获取监测数据列表失败')
        this.tableData = []
      } finally {
        this.loading = false
      }
    },
    buildMetricColumns(records) {
      const metricNameSet = new Set()
      const nameKeyMap = {}
      const nameLabelMap = {}

      records.forEach(item => {
        if (item.metricValues && Array.isArray(item.metricValues)) {
          item.metricValues.forEach(metric => {
            if (metric.metricName) {
              const name = metric.metricName
              const unit = metric.unit
              const label = unit && unit !== '/' ? `${name}(${unit})` : name
              metricNameSet.add(name)
              if (!nameKeyMap[name]) {
                const key = 'm_' + name.replace(/\s+/g, '').replace(/[()（）/%]/g, '_')
                nameKeyMap[name] = key
                nameLabelMap[name] = label
              }
            }
          })
        }
      })

      this.metricColumns = Array.from(metricNameSet).map(name => ({
        key: nameKeyMap[name],
        label: nameLabelMap[name] || name
      }))
      this.metricNameKeyMap = nameKeyMap
    },
    getMetricKeyByName(metricName) {
      if (!metricName) return ''
      if (this.metricNameKeyMap[metricName]) {
        return this.metricNameKeyMap[metricName]
      }
      const key = 'm_' + metricName.replace(/\s+/g, '').replace(/[()（）/%]/g, '_')
      this.$set(this.metricNameKeyMap, metricName, key)
      return key
    },
    getLevelColor(level) {
      if (!level) return ''
      const text = String(level)
      if (text.includes('Ⅰ类')) return '#00E400'
      if (text.includes('Ⅱ类')) return '#00B0F0'
      if (text.includes('Ⅲ类')) return '#FFFF00'
      if (text.includes('Ⅳ类')) return '#FFC000'
      if (text.includes('Ⅴ类')) return '#FF0000'
      if (text.includes('劣Ⅴ类')) return '#800080'
      return ''
    }
  }
}
</script>

<style scoped>
.comprehensive-analysis {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.search-card {
  padding-bottom: 0;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.search-form .el-form-item {
  margin-right: 16px;
  margin-bottom: 12px;
}

.table-card {
  flex: 1;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.table-header h3 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}


.table-desc {
  color: #909399;
  font-size: 13px;
}

</style>
