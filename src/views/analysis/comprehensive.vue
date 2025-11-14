<template>
  <div class="comprehensive-analysis">
    <!-- 查询条件 -->
    <el-card class="query-card">
      <el-form
        ref="queryFormRef"
        :model="queryForm"
        :inline="true"
        class="query-form"
      >
        <el-form-item label="监测井选择">
          <el-select
            v-model="queryForm.wellCode"
            placeholder="请选择监测井"
            clearable
            filterable
          >
            <el-option
              v-for="code in wellCodeOptions"
              :key="code"
              :label="code"
              :value="code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="queryForm.timeRange"
            type="datetimerange"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            range-separator="至"
            value-format="yyyy-MM-dd HH:mm:ss"
            :default-time="['00:00:00', '23:59:59']"
            align="right"
            clearable
          ></el-date-picker>
        </el-form-item>
        <el-form-item class="query-actions">
          <el-button type="primary" @click="queryData">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 子标签页 -->
    <el-tabs v-model="activeTab" class="analysis-tabs">
      <el-tab-pane name="evaluation">
        <span slot="label" class="tab-label">
          <i class="el-icon-star-on"></i>
          <span>评价结果</span>
        </span>
      </el-tab-pane>
      <el-tab-pane name="chart">
        <span slot="label" class="tab-label">
          <i class="el-icon-data-line"></i>
          <span>报图</span>
        </span>
      </el-tab-pane>
    </el-tabs>

    <!-- 数据表格 -->
    <el-card v-show="activeTab === 'evaluation'" class="table-card">
      <div class="table-content">
        <el-table
          v-if="tableVisible"
          :data="monitoringData"
          style="width: 100%"
          :loading="loading"
          border
          stripe
          @selection-change="handleSelectionChange"
        >
          <el-table-column
            type="selection"
            width="55"
            align="center"
          ></el-table-column>
          <el-table-column
            type="index"
            label="序号"
            width="60"
            align="center"
          ></el-table-column>
          <el-table-column
            prop="monitoringWellCode"
            label="监测井编号"
            width="140"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            prop="samplingTime"
            label="采样时间"
            width="170"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            v-for="metricName in dynamicMetricColumns"
            :key="metricName"
            :prop="metricName"
            :label="metricName"
            min-width="120"
            align="center"
            show-overflow-tooltip
          >
            <template slot-scope="{ row }">
              <span>{{ row[metricName] || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="qualityLevel"
            label="水质类别"
            width="120"
            align="center"
            fixed="right"
          ></el-table-column>
        </el-table>
        <div v-else class="table-placeholder">
          <el-empty description="请先选择条件并查询评价结果"></el-empty>
        </div>
        <transition name="fade">
          <div
            v-if="showEvaluationLoading"
            class="evaluation-loading-overlay"
          >
            <div class="evaluation-loading">
              <el-progress
                :percentage="evaluationProgress"
                :stroke-width="18"
                :text-inside="true"
              ></el-progress>
              <p class="loading-text">评价结果计算中，请稍后…</p>
            </div>
          </div>
        </transition>
      </div>
    </el-card>

    <!-- 报图 -->
    <el-card v-show="activeTab === 'chart'" class="chart-card">
      <div class="chart-controls">
        <div class="control-label">指标选择</div>
        <el-select
          v-model="selectedMetric"
          placeholder="请选择指标"
          size="small"
          @change="handleMetricChange"
        >
          <el-option
            v-for="option in chartMetricOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          ></el-option>
        </el-select>
      </div>
      <div class="chart-body">
        <div ref="reportChart" class="report-chart"></div>
        <div v-if="!hasChartData && !showEvaluationLoading" class="chart-empty">
          <el-empty description="暂无可展示的数据"></el-empty>
        </div>
        <transition name="fade">
          <div
            v-if="showEvaluationLoading"
            class="evaluation-loading-overlay"
          >
            <div class="evaluation-loading">
              <el-progress
                :percentage="evaluationProgress"
                :stroke-width="18"
                :text-inside="true"
              ></el-progress>
              <p class="loading-text">评价结果计算中，请稍后…</p>
            </div>
          </div>
        </transition>
      </div>
    </el-card>
  </div>
</template>

<script>
import { getMonitorWellCodes } from '@/api/monitorWell'
import { getSampleQualityLevels } from '@/api/monitorData'

export default {
  name: 'ComprehensiveAnalysis',
  created() {
    this.loadWellCodes()
  },
  mounted() {
    window.addEventListener('resize', this.handleChartResize)
  },
  beforeDestroy() {
    this.clearEvaluationTimers()
    window.removeEventListener('resize', this.handleChartResize)
    this.disposeChart()
  },
  data() {
    return {
      loading: false,
      activeTab: 'evaluation',
      queryForm: {
        wellCode: '',
        timeRange: []
      },
      lastQueryParams: null,
      wellCodeOptions: [],
      monitoringData: [],
      dynamicMetricColumns: [],
      selectedRows: [],
      tableVisible: false,
      showEvaluationLoading: false,
      evaluationProgress: 0,
      pendingTableData: [],
      pendingMetricColumns: [],
      dataReady: false,
      evaluationDelayDone: false,
      progressTimer: null,
      displayTimer: null,
      chartMetricOptions: [
        { label: '水质类别', value: 'qualityLevel' }
      ],
      selectedMetric: 'qualityLevel',
      rawQualityRecords: [],
      chartInstance: null,
      hasChartData: false
    }
  },
  watch: {
    activeTab(newValue) {
      if (newValue === 'chart') {
        this.refreshChart(true)
      }
    }
  },
  methods: {
    async loadWellCodes() {
      try {
        const response = await getMonitorWellCodes()
        if (response && response.code === 200) {
          const data = response.data
          if (Array.isArray(data)) {
            this.wellCodeOptions = data
          } else if (data && Array.isArray(data.data)) {
            this.wellCodeOptions = data.data
          } else {
            this.wellCodeOptions = []
          }
        } else {
          this.wellCodeOptions = []
        }
      } catch (error) {
        console.error('获取监测井编号失败', error)
        this.wellCodeOptions = []
        this.$message.error('监测井编号获取失败')
      }
    },
    async queryData() {
      if (!this.queryForm.wellCode) {
        this.$message.warning('请选择监测井')
        return
      }
      this.activeTab = 'evaluation'
      this.loading = true
      this.prepareEvaluationPhase()
      const [startTime, endTime] = this.queryForm.timeRange || []
      this.lastQueryParams = {
        wellCode: this.queryForm.wellCode || '',
        startTime: startTime || '',
        endTime: endTime || ''
      }
      const params = {
        monitoringWellCode: this.queryForm.wellCode,
        startTime: startTime || undefined,
        endTime: endTime || undefined
      }
      try {
        const res = await getSampleQualityLevels(params)
        if (res && res.code === 200) {
          const records = Array.isArray(res.data) ? res.data : []
          const { rows, metricNames } = this.processQualityLevelData(records)
          this.pendingTableData = rows
          this.pendingMetricColumns = metricNames
          this.rawQualityRecords = records
          this.chartMetricOptions = this.buildMetricOptions(metricNames)
          this.selectedMetric = 'qualityLevel'
          this.hasChartData = false
          this.dataReady = true
          this.tryShowEvaluationResult()
        } else {
          this.handleQueryFailure(res?.msg || '查询失败')
        }
      } catch (error) {
        console.error('查询评价结果失败', error)
        this.handleQueryFailure('查询失败，请稍后重试')
      } finally {
        this.loading = false
      }
    },
    resetQuery() {
      if (this.$refs.queryFormRef) {
        this.$refs.queryFormRef.resetFields()
      } else {
        this.queryForm = {
          wellCode: '',
          timeRange: []
        }
      }
      this.clearEvaluationTimers()
      this.monitoringData = []
      this.dynamicMetricColumns = []
      this.pendingTableData = []
      this.pendingMetricColumns = []
      this.showEvaluationLoading = false
      this.tableVisible = false
      this.evaluationProgress = 0
      this.dataReady = false
      this.evaluationDelayDone = false
      this.lastQueryParams = null
      this.resetChartState()
    },
    processQualityLevelData(records = []) {
      const rows = []
      const metricNameSet = new Set()
      records.forEach(item => {
        const {
          monitoringWellCode = '',
          samplingTime = '',
          qualityLevel = '',
          metricValues = []
        } = item || {}
        const row = {
          monitoringWellCode,
          samplingTime,
          qualityLevel
        }
        if (Array.isArray(metricValues)) {
          metricValues.forEach(metric => {
            const metricName = metric.metricName || metric.metricCode || ''
            if (metricName) {
              metricNameSet.add(metricName)
              row[metricName] = metric.level || '-'
            }
          })
        }
        rows.push(row)
      })
      return {
        rows,
        metricNames: Array.from(metricNameSet)
      }
    },
    handleSelectionChange(selection) {
      this.selectedRows = selection
    },
    prepareEvaluationPhase() {
      this.clearEvaluationTimers()
      this.tableVisible = false
      this.showEvaluationLoading = true
      this.evaluationProgress = 5
      this.pendingTableData = []
      this.pendingMetricColumns = []
      this.dataReady = false
      this.evaluationDelayDone = false
      const delayMs = this.getRandomDelay()
      this.startEvaluationProgress(delayMs)
    },
    getRandomDelay() {
      const seconds = Math.floor(Math.random() * 8) + 3
      return seconds * 1000
    },
    startEvaluationProgress(delayMs) {
      const start = Date.now()
      this.progressTimer = setInterval(() => {
        const elapsed = Date.now() - start
        const percent = Math.min(95, Math.floor((elapsed / delayMs) * 100))
        if (!this.showEvaluationLoading) {
          clearInterval(this.progressTimer)
          this.progressTimer = null
          return
        }
        this.evaluationProgress = percent
      }, 300)
      this.displayTimer = setTimeout(() => {
        this.evaluationDelayDone = true
        this.evaluationProgress = Math.max(this.evaluationProgress, 98)
        this.tryShowEvaluationResult()
      }, delayMs)
    },
    tryShowEvaluationResult() {
      if (this.dataReady && this.evaluationDelayDone) {
        this.monitoringData = this.pendingTableData
        this.dynamicMetricColumns = this.pendingMetricColumns
        this.chartMetricOptions = this.buildMetricOptions(
          this.dynamicMetricColumns
        )
        this.selectedMetric = 'qualityLevel'
        this.hasChartData = false
        this.tableVisible = true
        this.showEvaluationLoading = false
        this.evaluationProgress = 100
        this.$nextTick(() => {
          if (this.activeTab === 'chart') {
            this.refreshChart(true)
          }
          this.$message.success('查询完成')
        })
        this.clearEvaluationTimers()
      }
    },
    handleQueryFailure(message) {
      this.pendingTableData = []
      this.pendingMetricColumns = []
      this.monitoringData = []
      this.dynamicMetricColumns = []
      this.showEvaluationLoading = false
      this.tableVisible = false
      this.evaluationProgress = 0
      this.dataReady = false
      this.evaluationDelayDone = false
      this.resetChartState()
      this.clearEvaluationTimers()
      if (message) {
        this.$message.error(message)
      }
    },
    clearEvaluationTimers() {
      if (this.progressTimer) {
        clearInterval(this.progressTimer)
        this.progressTimer = null
      }
      if (this.displayTimer) {
        clearTimeout(this.displayTimer)
        this.displayTimer = null
      }
    },
    buildMetricOptions(metricNames = []) {
      const options = []
      if (this.hasValidQualityLevel()) {
        options.push({ label: '水质类别', value: 'qualityLevel' })
      }
      if (Array.isArray(metricNames)) {
        metricNames.forEach(name => {
          if (!name) return
          if (this.hasValidMetricLevel(name)) {
            options.push({
              label: name,
              value: name
            })
          }
        })
      }
      return options
    },
    hasValidQualityLevel() {
      if (!Array.isArray(this.rawQualityRecords)) {
        return false
      }
      return this.rawQualityRecords.some(record =>
        this.isValidLevel(record?.qualityLevel)
      )
    },
    hasValidMetricLevel(metricName) {
      if (!metricName || !Array.isArray(this.rawQualityRecords)) {
        return false
      }
      return this.rawQualityRecords.some(record => {
        const metrics = Array.isArray(record?.metricValues)
          ? record.metricValues
          : []
        const targetMetric = metrics.find(metric => {
          const name = metric.metricName || metric.metricCode
          return name === metricName
        })
        return targetMetric && this.isValidLevel(targetMetric.level)
      })
    },
    handleMetricChange() {
      this.refreshChart(true)
    },
    refreshChart(force = false) {
      if (!force && this.activeTab !== 'chart') {
        return
      }
      this.$nextTick(() => {
        if (!this.$refs.reportChart) {
          return
        }
        if (!this.chartInstance) {
          this.chartInstance = this.$echarts.init(this.$refs.reportChart)
        }
        const segments = this.getChartSegments(this.selectedMetric)
        if (!segments.length) {
          this.hasChartData = false
          if (this.chartInstance) {
            this.chartInstance.clear()
          }
          return
        }
        this.hasChartData = true
        const option = this.buildChartOption(segments)
        this.chartInstance.setOption(option)
      })
    },
    getChartSegments(metricKey) {
      if (!this.rawQualityRecords.length) {
        return []
      }
      const counter = {}
      this.rawQualityRecords.forEach(record => {
        if (!record) return
        if (metricKey === 'qualityLevel') {
          const level = record.qualityLevel
          if (this.isValidLevel(level)) {
            counter[level] = (counter[level] || 0) + 1
          }
          return
        }
        const metrics = Array.isArray(record.metricValues)
          ? record.metricValues
          : []
        const targetMetric = metrics.find(metric => {
          const metricName = metric.metricName || metric.metricCode
          return metricName === metricKey
        })
        if (targetMetric && this.isValidLevel(targetMetric.level)) {
          const level = targetMetric.level
          counter[level] = (counter[level] || 0) + 1
        }
      })
      return Object.keys(counter).map(level => ({
        name: level,
        value: counter[level]
      }))
    },
    isValidLevel(level) {
      if (!level) return false
      return level !== '无质量等级' && level !== '-'
    },
    buildChartOption(data) {
      const total = data.reduce((sum, item) => sum + item.value, 0)
      return {
        tooltip: {
          trigger: 'item',
          formatter: params => {
            const percent = total
              ? ((params.value / total) * 100).toFixed(1)
              : 0
            return `${params.name}：${params.value} (${percent}%)`
          }
        },
        legend: {
          orient: 'vertical',
          right: 100,
          top: 'center',
          icon: 'circle'
        },
        series: [
          {
            name: '质量等级',
            type: 'pie',
            radius: ['35%', '65%'],
            center: ['35%', '50%'],
            avoidLabelOverlap: true,
            itemStyle: {
              borderRadius: 6,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              formatter: '{b}\n{d}%',
              fontSize: 12
            },
            labelLine: {
              length: 15,
              length2: 8
            },
            data
          }
        ]
      }
    },
    handleChartResize() {
      if (this.chartInstance) {
        this.chartInstance.resize()
      }
    },
    disposeChart() {
      if (this.chartInstance) {
        this.chartInstance.dispose()
        this.chartInstance = null
      }
    },
    resetChartState() {
      this.rawQualityRecords = []
      this.chartMetricOptions = [{ label: '水质类别', value: 'qualityLevel' }]
      this.selectedMetric = 'qualityLevel'
      this.hasChartData = false
      if (this.chartInstance) {
        this.chartInstance.clear()
      }
    }
  }
}
</script>

<style scoped>
.comprehensive-analysis {
  height: 100%;
}

.query-card {
  margin-bottom: 20px;
}

.query-form {
  margin-bottom: 0;
}

.export-buttons {
  margin-bottom: 20px;
}

.export-buttons .el-button {
  margin-right: 10px;
}

.analysis-tabs {
  margin-bottom: 20px;
}

.tab-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}

.tab-label i {
  font-size: 16px;
}

.query-actions .el-button + .el-button {
  margin-left: 10px;
}

.table-card {
  flex: 1;
}

.chart-card {
  margin-top: 20px;
}

.table-content {
  position: relative;
  min-height: 260px;
}

.evaluation-loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 24px;
  box-sizing: border-box;
  z-index: 5;
}

.evaluation-loading {
  width: 100%;
  max-width: 640px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.evaluation-loading .el-progress {
  width: 100%;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.loading-text {
  color: #606266;
  font-size: 14px;
}

.table-placeholder {
  padding: 60px 0;
}

.chart-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.control-label {
  font-size: 14px;
  color: #606266;
}

.chart-body {
  position: relative;
  width: 100%;
  min-height: 320px;
}

.report-chart {
  width: 60%;
  height: 360px;
}

.chart-empty {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
}
</style>
