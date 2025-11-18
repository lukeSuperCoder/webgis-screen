<template>
  <div class="monitoring-data-panel">
    <div class="panel-overlay" @click="closePanel"></div>
    <div class="panel-content">
      <!-- 头部 -->
      <div class="panel-header">
        <div class="filters">
          <el-form :inline="true" :model="filters" class="filter-form" size="small">
            <el-form-item label="监测井选择:" label-width="90px">
              <el-select 
                v-model="filters.well" 
                placeholder="请选择监测井"
                style="width: 160px;"
                clearable
                filterable
                popper-append-to-body
                popper-class="monitoring-panel-select-dropdown"
              >
                <el-option 
                  v-for="well in wellList" 
                  :key="well"
                  :label="well"
                  :value="well"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="时间选择:" label-width="80px">
              <el-date-picker
                v-model="dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="yyyy-MM-dd"
                style="width: 220px;"
                size="small"
                @change="handleDateRangeChange"
              ></el-date-picker>
            </el-form-item>
          </el-form>
        </div>
        <el-button 
          type="text" 
          icon="el-icon-close" 
          @click="closePanel"
          class="close-btn"
        ></el-button>
      </div>

      <!-- 表格 -->
      <div class="table-container">
        <el-table 
          :data="tableData" 
          style="width: 100%"
          :loading="loading"
          stripe
          size="small"
          border
          height="600px"
        >
          <el-table-column type="index" label="序号" width="60" align="center"></el-table-column>
          <el-table-column prop="monitoringWellCode" label="监测井编号" align="center" min-width="140"></el-table-column>
          <el-table-column prop="samplingTime" label="监测时间" align="center" min-width="180">
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
              <span :style="{ color: getLevelColor(scope.row.metrics && scope.row.metrics[metric.key] ? scope.row.metrics[metric.key].level : '') }">
                {{ scope.row.metrics && scope.row.metrics[metric.key] ? scope.row.metrics[metric.key].value : '--' }}
              </span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
import { getSampleQualityLevels } from '@/api/monitorData'
import { getMonitorWellCodes } from '@/api/monitorWell'

export default {
  name: 'MonitoringDataPanel',
  data() {
    return {
      filters: {
        well: '',
        startDate: '',
        endDate: ''
      },
      dateRange: [], // 日期范围选择器的值
      tableData: [],
      loading: false,
      // 下拉选项数据
      wellList: [],
      // 动态指标列定义
      metricColumns: [],
      // 指标名到列 key 的映射
      metricNameKeyMap: {}
    }
  },
  mounted() {
    this.initFilters()
    this.loadWellList()
    this.loadDataList()
  },
  watch: {
    'filters.well'() {
      this.loadDataList()
    }
  },
  methods: {
    /**
     * 初始化筛选条件（默认最近2000天）
     */
    initFilters() {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 2000)
      
      this.filters.startDate = this.formatDateForInput(startDate)
      this.filters.endDate = this.formatDateForInput(endDate)
      
      // 设置日期范围选择器的值
      this.dateRange = [this.filters.startDate, this.filters.endDate]
    },
    /**
     * 处理日期范围变化
     */
    handleDateRangeChange(value) {
      if (value && value.length === 2) {
        this.filters.startDate = value[0]
        this.filters.endDate = value[1]
      } else {
        this.filters.startDate = ''
        this.filters.endDate = ''
      }
      this.loadDataList()
    },
    /**
     * 格式化日期为input[type="date"]格式
     */
    formatDateForInput(date) {
      if (!date) return ''
      const d = new Date(date)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    /**
     * 格式化日期时间为年月日时分秒
     */
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
    /**
     * 格式化日期时间为年月日时分秒（用于API传参）
     */
    formatDateTimeForApi(date) {
      if (!date) return ''
      try {
        // 如果date是字符串（YYYY-MM-DD格式），需要转换为Date对象
        const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : new Date(date)
        const year = d.getFullYear()
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        const hours = String(d.getHours()).padStart(2, '0')
        const minutes = String(d.getMinutes()).padStart(2, '0')
        const seconds = String(d.getSeconds()).padStart(2, '0')
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
      } catch (error) {
        return ''
      }
    },
    /**
     * 加载监测井列表
     */
    async loadWellList() {
      try {
        const response = await getMonitorWellCodes()
        if (response.code === 200) {
          // 监测井返回的wellCodes数据格式data是个一维数组，里面是wellcode
          if (response.data && Array.isArray(response.data)) {
            // 如果data是数组，直接使用
            this.wellList = response.data
          } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
            // 如果data.data是数组，使用data.data
            this.wellList = response.data.data
          } else {
            this.wellList = []
          }
        } else {
          this.wellList = []
        }
      } catch (error) {
        console.error('获取监测井列表失败:', error)
        this.wellList = []
      }
    },
    /**
     * 加载数据列表
     */
    async loadDataList() {
      this.loading = true
      try {
        const params = {}
        
        // 监测井筛选（始终传递参数，默认空字符串）
        params.monitoringWellCode = this.filters.well || ''
        
        // 时间范围筛选（格式：年月日时分秒）
        if (this.filters.startDate) {
          params.startTime = this.formatDateTimeForApi(this.filters.startDate)
        }
        if (this.filters.endDate) {
          // 结束时间设置为当天的23:59:59
          const endDate = new Date(this.filters.endDate + 'T23:59:59')
          params.endTime = this.formatDateTimeForApi(endDate)
        }
        
        const response = await getSampleQualityLevels(params)

        if (response.code === 200 && Array.isArray(response.data)) {
          const records = response.data || []

          // 生成动态指标列（根据第一条记录的 metricValues）
          this.buildMetricColumns(records)

          // 转换数据为表格行
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
          this.total = 0
        }
      } catch (error) {
        console.error('获取监测数据列表失败:', error)
        this.$message.error('获取监测数据列表失败')
        this.tableData = []
        this.total = 0
      } finally {
        this.loading = false
      }
    },
    /**
     * 根据返回数据构建动态指标列
     */
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
                // 将指标名转换成字段 key（去除空格和特殊字符）
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
    /**
     * 根据指标名获取列 key
     */
    getMetricKeyByName(metricName) {
      if (!metricName) return ''
      if (this.metricNameKeyMap[metricName]) {
        return this.metricNameKeyMap[metricName]
      }
      const key = 'm_' + metricName.replace(/\s+/g, '').replace(/[()（）/%]/g, '_')
      this.$set(this.metricNameKeyMap, metricName, key)
      return key
    },
    /**
     * 根据质量等级获取颜色（复用水质类别图例的颜色规则）
     */
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
    },
    closePanel() {
      this.$emit('close');
    }
  }
}
</script>

<style scoped>
.monitoring-data-panel {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.panel-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.panel-content {
  position: relative;
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 1400px;
  max-height: 90vh;
  min-height: 500px;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #e5e5e5;
}

.filters {
  flex: 1;
}

.filter-form {
  margin: 0;
}

.filter-form .el-form-item {
  margin-bottom: 0;
  margin-right: 15px;
}

.close-btn {
  font-size: 20px;
  color: #666;
  padding: 0;
  border: none;
}

.close-btn:hover {
  color: #333;
}

.table-container {
  flex: 1;
  padding: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
}


/* 响应式 */
@media (max-width: 1200px) {
  .panel-content {
    width: 95%;
  }
  
  .filter-row {
    flex-wrap: wrap;
    gap: 15px;
  }
  
  .data-table {
    font-size: 12px;
  }
  
  .data-table th,
  .data-table td {
    padding: 8px 6px;
  }
}
</style>

<style>
/* 全局样式：确保下拉框在最上层 */
.monitoring-panel-select-dropdown {
  z-index: 10000 !important;
}
</style>
