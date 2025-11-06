<template>
  <div class="monitoring-data-panel">
    <div class="panel-overlay" @click="closePanel"></div>
    <div class="panel-content">
      <!-- 头部 -->
      <div class="panel-header">
        <div class="filters">
          <el-form :inline="true" :model="filters" class="filter-form" size="small">
            <el-form-item label="所属项目:" label-width="80px">
              <el-select 
                v-model="filters.project" 
                placeholder="请选择项目"
                style="width: 160px;"
                clearable
                popper-append-to-body
                popper-class="monitoring-panel-select-dropdown"
              >
                <el-option 
                  v-for="project in projectList" 
                  :key="project.projectCode || project.id"
                  :label="project.projectCode || '未知'"
                  :value="project.projectCode || project.id"
                ></el-option>
              </el-select>
            </el-form-item>
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
          <el-table-column prop="stationName" label="站点名称" align="center" min-width="120"></el-table-column>
          <el-table-column prop="monitorTime" label="监测时间" align="center" min-width="160"></el-table-column>
          <el-table-column prop="waterTemp" label="水温(°C)" align="center" width="100">
            <template slot-scope="scope">
              {{ scope.row.waterTemp || '--' }}
            </template>
          </el-table-column>
          <el-table-column prop="turbidity" label="浊度(NTU)" align="center" width="100">
            <template slot-scope="scope">
              {{ scope.row.turbidity || '--' }}
            </template>
          </el-table-column>
          <el-table-column prop="ph" label="pH" align="center" width="80">
            <template slot-scope="scope">
              {{ scope.row.ph || '--' }}
            </template>
          </el-table-column>
          <el-table-column prop="dissolvedOxygen" label="溶解氧(mg/L)" align="center" width="120">
            <template slot-scope="scope">
              {{ scope.row.dissolvedOxygen || '--' }}
            </template>
          </el-table-column>
          <el-table-column prop="chlorophyll" label="叶绿素(µ/L)" align="center" width="120">
            <template slot-scope="scope">
              {{ scope.row.chlorophyll || '--' }}
            </template>
          </el-table-column>
          <el-table-column prop="permanganate" label="高猛酸盐(mg/L)" align="center" width="130">
            <template slot-scope="scope">
              {{ scope.row.permanganate || '--' }}
            </template>
          </el-table-column>
          <el-table-column prop="totalPhosphorus" label="总磷(mg/L)" align="center" width="100">
            <template slot-scope="scope">
              {{ scope.row.totalPhosphorus || '--' }}
            </template>
          </el-table-column>
          <el-table-column prop="totalNitrogen" label="总氮(mg/L)" align="center" width="100">
            <template slot-scope="scope">
              {{ scope.row.totalNitrogen || '--' }}
            </template>
          </el-table-column>
          <el-table-column prop="ammoniaNitrogen" label="氨氮(mg/L)" align="center" width="100">
            <template slot-scope="scope">
              {{ scope.row.ammoniaNitrogen || '--' }}
            </template>
          </el-table-column>
          <el-table-column prop="totalIron" label="总铁(mg/L)" align="center" width="100">
            <template slot-scope="scope">
              {{ scope.row.totalIron || '--' }}
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 分页 -->
        <el-pagination
          v-if="total > 0"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next"
          :total="total"
          size="small"
          style="margin-top: 20px; text-align: right;"
        ></el-pagination>
      </div>
    </div>
  </div>
</template>

<script>
import { getSampleList } from '@/api/monitorData'
import { getProjectList } from '@/api/project'
import { getMonitorWellCodes } from '@/api/monitorWell'

export default {
  name: 'MonitoringDataPanel',
  data() {
    return {
      filters: {
        project: '',
        well: '',
        startDate: '',
        endDate: ''
      },
      dateRange: [], // 日期范围选择器的值
      tableData: [],
      loading: false,
      // 下拉选项数据
      projectList: [],
      wellList: [],
      // 分页
      currentPage: 1,
      pageSize: 10,
      total: 0,
      // 指标编码映射表（用于从metricValues中提取指标值）
      metricCodeMap: {
        'G0001': 'waterTemp',      // 水温
        'G0002': 'turbidity',      // 浊度
        'G0005': 'ph',             // pH
        'G0003': 'dissolvedOxygen', // 溶解氧
        'G0006': 'chlorophyll',    // 叶绿素
        'G0017': 'permanganate',   // 高锰酸盐指数
        'G0012': 'totalPhosphorus', // 总磷
        'G0011': 'totalNitrogen',  // 总氮
        'G0018': 'ammoniaNitrogen', // 氨氮
        'G0019': 'totalIron'       // 总铁
      }
    }
  },
  mounted() {
    this.initFilters()
    this.loadProjectList()
    this.loadWellList()
    this.loadDataList()
  },
  watch: {
    'filters.project'() {
      this.currentPage = 1
      this.loadDataList()
    },
    'filters.well'() {
      this.currentPage = 1
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
      this.currentPage = 1
      this.loadDataList()
    },
    /**
     * 分页大小改变
     */
    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
      this.loadDataList()
    },
    /**
     * 当前页改变
     */
    handleCurrentChange(val) {
      this.currentPage = val
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
     * 加载项目列表
     */
    async loadProjectList() {
      try {
        const response = await getProjectList({
          pageNum: 1,
          pageSize: 1000
        })
        if (response.code === 0 && response.rows) {
          // 项目列表已经是数组格式，直接使用
          this.projectList = response.rows || []
        }
      } catch (error) {
        console.error('获取项目列表失败:', error)
        this.projectList = []
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
        const params = {
          pageNum: this.currentPage,
          pageSize: this.pageSize
        }
        
        // 项目筛选
        if (this.filters.project && this.filters.project !== 'all') {
          params.projectId = this.filters.project
        }
        
        // 监测井筛选
        if (this.filters.well && this.filters.well !== 'all') {
          params.monitoringWellCode = this.filters.well
        }
        
        // 时间范围筛选（格式：年月日时分秒）
        if (this.filters.startDate) {
          params.startTime = this.formatDateTimeForApi(this.filters.startDate)
        }
        if (this.filters.endDate) {
          // 结束时间设置为当天的23:59:59
          const endDate = new Date(this.filters.endDate + 'T23:59:59')
          params.endTime = this.formatDateTimeForApi(endDate)
        }
        
        const response = await getSampleList(params)
        
        if (response.code === 200) {
          const rows = response.rows || []
          this.total = response.total || 0
          
          // 转换数据格式
          this.tableData = rows.map(item => {
            const row = {
              stationName: item.monitoringWellCode || '未知',
              monitorTime: this.formatDateTime(item.samplingTime),
              waterTemp: '',
              turbidity: '',
              ph: '',
              dissolvedOxygen: '',
              chlorophyll: '',
              permanganate: '',
              totalPhosphorus: '',
              totalNitrogen: '',
              ammoniaNitrogen: '',
              totalIron: ''
            }
            
            // 从metricValues中提取指标值
            if (item.metricValues && Array.isArray(item.metricValues)) {
              item.metricValues.forEach(metric => {
                const metricCode = metric.metricCode
                const value = metric.value
                
                // 根据metricCode映射到对应的字段
                if (this.metricCodeMap[metricCode]) {
                  const fieldName = this.metricCodeMap[metricCode]
                  row[fieldName] = value !== undefined && value !== null ? value : ''
                }
              })
            }
            
            return row
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
