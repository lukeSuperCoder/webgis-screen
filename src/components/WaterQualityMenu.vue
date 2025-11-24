<template>
  <div class="water-quality-menu">
    <!-- 主菜单 -->
    <div class="menu-container">
      <!-- 水质分布空间分布 -->
      <div class="menu-section">
        <h3 class="section-title">水质分布空间分布</h3>
        <div class="menu-options">
          <div 
            class="menu-item" 
            :class="{ active: activeMenuItem === 'comprehensive' }"
            @click="handleMenuClick('comprehensive')"
          >
            <div class="menu-item-content">
              <i class="el-icon-data-analysis"></i>
              <span class="menu-text">综合水质分布</span>
            </div>
          </div>
          <div 
            class="menu-item" 
            :class="{ active: activeMenuItem === 'singleItem' }"
            @click="handleMenuClick('singleItem')"
          >
            <div class="menu-item-content">
              <i class="el-icon-place"></i>
              <span class="menu-text">单项水质分布</span>
            </div>
            <div 
              class="menu-subtext" 
              v-if="selectedIndicatorLabel"
            >
              <span class="menu-subtext-label">当前指标：</span>
              <span class="menu-subtext-value">{{ selectedIndicatorLabel }}</span>
            </div>
          </div>
          
          <div 
            class="menu-item" 
            :class="{ active: activeMenuItem === 'dashboard' }"
            @click="handleMenuClick('dashboard')"
          >
            <div class="menu-item-content">
              <i class="el-icon-data-analysis"></i>
              <span class="menu-text">监测数据看板</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 监测井点概览 -->
      <div class="menu-section">
        <h3 class="section-title">监测井点概览</h3>
        <div class="menu-options">
          <div class="checkbox-option">
            <input
              disabled 
              type="checkbox" 
              id="boundary" 
              v-model="showBoundary"
              @change="handleBoundaryChange"
            >
            <label for="boundary">项目边界范围</label>
          </div>
          
          <div class="checkbox-option">
            <input 
              disabled 
              type="checkbox" 
              id="wells" 
              v-model="showWells"
              @change="handleWellsChange"
            >
            <label for="wells">监测井分布</label>
          </div>
        </div>
      </div>
    </div>
    <!-- 指标选择卡片 -->
    <div 
      class="indicator-card"
      v-if="showIndicatorCard"
      @click.stop
    >
      <div class="indicator-card-header">
        <div class="indicator-card-title">指标选择</div>
        <div class="indicator-card-subtitle">单项水质分布</div>
      </div>
      <div class="indicator-select-wrapper">
        <label class="indicator-select-label" for="indicator-select">指标</label>
        <el-select
          id="indicator-select"
          class="indicator-el-select"
          v-model="pendingParameter"
          filterable
          remote
          reserve-keyword
          default-first-option
          :popper-append-to-body="false"
          placeholder="请选择水质指标"
          :disabled="isLoadingIndicators || !indicatorOptions.length"
          no-data-text="暂无可用指标"
        >
          <el-option
            v-for="option in indicatorOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          >
            <div class="indicator-option-content">
              <span class="indicator-option-label">{{ option.label }}</span>
              <span class="indicator-option-meta" v-if="option.metricCode">({{ option.metricCode }})</span>
              <span class="indicator-option-unit" v-if="option.unit">{{ option.unit }}</span>
            </div>
          </el-option>
        </el-select>
      </div>
      <div class="indicator-actions">
        <el-button
          type="primary"
          size="mini"
          :disabled="!pendingParameter"
          @click="handleIndicatorConfirm"
        >
          确认
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { getSampleMetrics } from '@/api/monitorData'

export default {
  name: 'WaterQualityMenu',
  data() {
    return {
      indicatorOptions: [],
      selectedParameter: null,
      pendingParameter: null,
      isLoadingIndicators: false,
      indicatorFilterParams: {
        filter: ''
      },
      indicatorSearchTimer: null,
      showBoundary: false,
      showWells: false,
      activeMenuItem: null,
      indicatorCardVisible: false
    }
  },
  computed: {
    showIndicatorCard() {
      return this.activeMenuItem === 'singleItem' && this.indicatorCardVisible
    },
    selectedIndicatorLabel() {
      const indicator = this.indicatorOptions.find(item => item.value === this.selectedParameter)
      return indicator ? indicator.label : ''
    }
  },
  created() {
    this.loadIndicatorOptions()
  },
  beforeDestroy() {
    if (this.indicatorSearchTimer) {
      clearTimeout(this.indicatorSearchTimer)
      this.indicatorSearchTimer = null
    }
  },
  methods: {
    async loadIndicatorOptions(extraFilters = {}) {
      this.isLoadingIndicators = true
      try {
        const mergedFilters = {
          ...this.indicatorFilterParams,
          ...extraFilters
        }
        const sanitizedFilters = Object.keys(mergedFilters).reduce((acc, key) => {
          const value = mergedFilters[key]
          if (value !== undefined && value !== null && value !== '') {
            acc[key] = value
          }
          return acc
        }, {})
        const response = await getSampleMetrics(sanitizedFilters)
        if (response && (response.code === 200 || response.code === 0)) {
          const metrics = response.data || []
          this.indicatorOptions = metrics.map(item => ({
            label: item.metricName || item.name || item.metricCode || item.code || '未命名指标',
            value: item.metricCode || item.code || item.metricName,
            metricName: item.metricName || item.name || '',
            metricCode: item.metricCode || item.code || '',
            unit: item.unit || item.metricUnit || ''
          }))
          if (this.indicatorOptions.length && !this.selectedParameter) {
            this.selectedParameter = this.indicatorOptions[0].value
          }
          if (!this.pendingParameter && this.indicatorOptions.length) {
            this.pendingParameter = this.selectedParameter || this.indicatorOptions[0].value
          }
        } else {
          this.$message.warning('未能获取指标列表，请稍后重试')
        }
      } catch (error) {
        console.error('加载水质指标失败:', error)
        this.$message.error('加载水质指标失败，请稍后重试')
      } finally {
        this.isLoadingIndicators = false
      }
    },
    handleMenuClick(menuType) {
      if (menuType === 'singleItem') {
        if (this.isLoadingIndicators) {
          this.$message.info('正在加载指标列表，请稍候')
          return
        }
        if (!this.indicatorOptions.length) {
          this.$message.warning('暂无可用指标')
          return
        }
        if (this.activeMenuItem !== 'singleItem') {
          this.activeMenuItem = 'singleItem'
        }
        if (!this.indicatorCardVisible) {
          this.indicatorCardVisible = true
          this.pendingParameter = this.selectedParameter || (this.indicatorOptions[0] && this.indicatorOptions[0].value) || null
        } else {
          this.indicatorCardVisible = false
        }
        return
      }

      this.indicatorCardVisible = false
      if (this.activeMenuItem === menuType) {
        this.activeMenuItem = null;
      } else {
        this.activeMenuItem = menuType;
      }
      this.$emit('menu-clicked', menuType);
    },

    handleIndicatorConfirm() {
      if (!this.pendingParameter) {
        this.$message.warning('请选择水质指标')
        return
      }
      const indicator = this.indicatorOptions.find(item => item.value === this.pendingParameter)
      if (!indicator) {
        this.$message.warning('所选指标已失效，请重新选择')
        return
      }
      this.selectedParameter = indicator.value
      this.pendingParameter = indicator.value
      this.indicatorCardVisible = false
      this.$emit('parameter-selected', indicator)
    },
    
    handleBoundaryChange() {
      this.$emit('boundary-toggle', this.showBoundary);
    },
    
    handleWellsChange() {
      this.$emit('wells-toggle', this.showWells);
    },
    
    // 清除所有高亮状态
    clearAllHighlights() {
      this.activeMenuItem = null;
      this.indicatorCardVisible = false;
      this.indicatorFilterParams.filter = '';
      this.selectedParameter = this.indicatorOptions.length ? this.indicatorOptions[0].value : null;
      this.pendingParameter = this.selectedParameter;
    },
    
    // 清除监测井分布勾选状态（不触发事件，避免清除其他按钮高亮）
    clearWellsCheckbox() {
      if (this.showWells) {
        this.showWells = false;
        // 不触发 wells-toggle 事件，避免在 handleWellsToggle 中调用 clearAllHighlights
        // 直接通过父组件设置 wellsVisible = false 即可
      }
    }
  }
}
</script>

<style scoped>
.water-quality-menu {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 30;
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.menu-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(156, 163, 175, 0.3);
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 16px;
  min-width: 160px;
}

.menu-section {
  margin-bottom: 20px;
}

.menu-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(156, 163, 175, 0.2);
}

.menu-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.radio-option, .checkbox-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
}

.radio-option input[type="radio"], 
.checkbox-option input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #3b82f6;
}

.radio-option label, 
.checkbox-option label {
  font-size: 13px;
  color: #374151;
  cursor: pointer;
  user-select: none;
}

.menu-item {
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.menu-item:hover {
  background-color: rgba(59, 130, 246, 0.1);
}

.menu-item.active {
  background-color: rgba(59, 130, 246, 0.15);
  color: #1d4ed8;
}

.menu-item-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.menu-subtext {
  margin-top: 4px;
  font-size: 12px;
  color: #6b7280;
  line-height: 1.4;
}

.menu-subtext-label {
  margin-right: 4px;
}

.menu-subtext-value {
  color: #1d4ed8;
  font-weight: 500;
}

.menu-icon {
  font-size: 14px;
  width: 16px;
  text-align: center;
}

.menu-text {
  font-size: 13px;
  color: #374151;
  flex: 1;
}

.menu-item.active .menu-text {
  color: #1d4ed8;
  font-weight: 500;
}

.indicator-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(156, 163, 175, 0.3);
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 16px;
  min-width: 220px;
}

.indicator-card-header {
  margin-bottom: 12px;
}

.indicator-card-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.indicator-card-subtitle {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
}

.indicator-select-wrapper {
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
}

.indicator-select-label {
  font-size: 12px;
  color: #4b5563;
}
.indicator-el-select {
  width: 100%;
}

.indicator-el-select :deep(.el-input__inner) {
  font-size: 13px;
  border-radius: 6px;
  border-color: rgba(156, 163, 175, 0.4);
  background-color: rgba(249, 250, 251, 0.8);
  color: #1f2937;
}

.indicator-el-select :deep(.el-input__inner:focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.2);
}

.indicator-option-content {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #1f2937;
}

.indicator-option-label {
  font-weight: 500;
}

.indicator-option-meta {
  color: #6b7280;
}

.indicator-option-unit {
  color: #3b82f6;
  font-size: 12px;
}

.indicator-select-wrapper :deep(.el-select-dropdown) {
  width: 100% !important;
  min-width: 100% !important;
  box-sizing: border-box;
}

.indicator-actions {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .water-quality-menu {
    top: 10px;
    left: 10px;
    flex-direction: column;
  }
  
  .menu-container {
    min-width: 240px;
    padding: 12px;
  }
  
  .indicator-card {
    width: 100%;
  }
}
</style>
