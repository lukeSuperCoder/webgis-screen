<template>
    <div class='screen-map' id="olmap">
      <!-- 地图控制按钮 -->
      <div class="map-controls">
        <button @click="handleZoomIn" class="w-8 h-8 bg-blue-950/70 backdrop-blur-sm border border-blue-900/50 rounded-md flex items-center justify-center text-white hover:bg-blue-900/50 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-zoom-in w-4 h-4">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" x2="16.65" y1="21" y2="16.65"></line>
            <line x1="11" x2="11" y1="8" y2="14"></line>
            <line x1="8" x2="14" y1="11" y2="11"></line>
          </svg>
        </button>
        <button @click="handleZoomOut" class="w-8 h-8 bg-blue-950/70 backdrop-blur-sm border border-blue-900/50 rounded-md flex items-center justify-center text-white hover:bg-blue-900/50 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-zoom-out w-4 h-4">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" x2="16.65" y1="21" y2="16.65"></line>
            <line x1="8" x2="14" y1="11" y2="11"></line>
          </svg>
        </button>
        <button @click="handleLocateMe" class="w-8 h-8 bg-blue-950/70 backdrop-blur-sm border border-blue-900/50 rounded-md flex items-center justify-center text-white hover:bg-blue-900/50 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-locate w-4 h-4">
            <line x1="2" x2="5" y1="12" y2="12"></line>
            <line x1="19" x2="22" y1="12" y2="12"></line>
            <line x1="12" x2="12" y1="2" y2="5"></line>
            <line x1="12" x2="12" y1="19" y2="22"></line>
            <circle cx="12" cy="12" r="7"></circle>
          </svg>
        </button>
      <button @click="handleFullScreen" class="w-8 h-8 bg-blue-950/70 backdrop-blur-sm border border-blue-900/50 rounded-md flex items-center justify-center text-white hover:bg-blue-900/50 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-maximize w-4 h-4">
          <path d="M8 3H5a2 2 0 0 0-2 2v3"></path>
          <path d="M21 8V5a2 2 0 0 0-2-2h-3"></path>
          <path d="M3 16v3a2 2 0 0 0 2 2h3"></path>
          <path d="M16 21h3a2 2 0 0 0 2-2v-3"></path>
        </svg>
      </button>
      </div>

      <!-- 右侧固定信息面板（单项分布使用） -->
      <div v-if="sidePanel.visible" class="side-panel">
        <div class="side-header">
          <div class="title">{{ sidePanel.title }}</div>
          <button class="close-btn" @click="closeSidePanel">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="side-body">
              <div class="filters">
            <div class="row">
              <span>时间:</span>
              <input type="date" v-model="sidePanel.startTime" @change="handleSidePanelTimeRangeChange"/>
              <span>至</span>
              <input type="date" v-model="sidePanel.endTime" @change="handleSidePanelTimeRangeChange"/>
            </div>
          </div>
          <div v-if="sidePanel.loading" class="loading-indicator">
            <span>正在加载历史数据...</span>
          </div>
          <div v-else>
            <div class="table">
              <div class="table-scroll">
                <div class="table-content">
                  <div class="thead">
                    <span class="header-cell fixed-col-code">井点编号</span>
                    <span class="header-cell fixed-col-sample">采样编号</span>
                    <span class="header-cell fixed-col-time">采样时间</span>
                    <span
                      v-for="metric in sidePanel.metrics"
                      :key="metric"
                      class="header-cell metric-header"
                    >
                      {{ metric }}
                    </span>
                  </div>
                  <div class="tbody">
                    <div class="tr" v-for="(row,idx) in sidePanel.table" :key="idx">
                      <span class="cell-content fixed-col-code" :title="row.code">{{ row.code }}</span>
                      <span class="cell-content fixed-col-sample" :title="row.sampleCode || '--'">
                        {{ row.sampleCode || '--' }}
                      </span>
                      <span class="cell-content fixed-col-time" :title="row.time">{{ row.time }}</span>
                      <span
                        class="cell-content metric-cell"
                        v-for="metric in sidePanel.metrics"
                        :key="metric"
                        :title="getMetricCellTitle(row, metric)"
                      >
                        {{ getMetricCellValue(row, metric) }}
                      </span>
                    </div>
                    <div v-if="sidePanel.table.length === 0" class="no-data">
                      暂无历史数据
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="chart">
              <div ref="sideChart" style="width:100%;height:220px;"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 监测井信息面板（右侧固定） -->
      <div v-if="wellInfoPanel.visible" class="well-info-panel">
        <div class="well-header">
          <div class="title">监测井信息展板</div>
          <button class="close-btn" @click="closeWellInfoPanel">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="well-body">
          <!-- 监测井基本信息表格 -->
          <div class="well-info-table">
            <div class="info-row">
              <div class="info-cell">
                <span class="label">井点编号</span>
                <span class="value">{{ wellInfoPanel.data?.wellCode || wellInfoPanel.data?.well_code || '130123J0202' }}</span>
              </div>
              <div class="info-cell">
                <span class="label">监测点类型</span>
                <span class="value">{{ wellInfoPanel.data?.wellType || '省级' }}</span>
              </div>
              <div class="info-cell">
                <span class="label">成井时间</span>
                <span class="value">{{ wellInfoPanel.data?.completionTime || '2023-05-20 19:25' }}</span>
              </div>
            </div>
            <div class="info-row">
              <div class="info-cell">
                <span class="label">埋藏条件</span>
                <span class="value">{{ wellInfoPanel.data?.burialCondition || '基岩' }}</span>
              </div>
              <div class="info-cell">
                <span class="label">监测位置</span>
                <span class="value">{{ wellInfoPanel.data?.monitoringLocation || '下游' }}</span>
              </div>
              <div class="info-cell">
                <span class="label">备注</span>
                <span class="value">{{ wellInfoPanel.data?.remarks || '/' }}</span>
              </div>
            </div>
          </div>
          
          <!-- 监测井结构图 -->
          <div class="well-structure">
            <img src="@/assets/well.png" alt="监测井结构图" class="well-image" />
          </div>
        </div>
      </div>

      <!-- 弹出框（综合水质与井点信息等） -->
      <div v-if="showPopup" class="popup-container" :style="popupStyle">
        <div class="popup-content">
          <div class="popup-header">
            <h3 v-if="popupData">综合水质详情</h3>
            <h3 v-else>{{ popupData.name }}</h3>
            <button @click="closePopup" class="close-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="popup-body">
            <!-- 综合水质历史表格弹框（综合水质标记点击） -->
            <div
              v-if="popupData"
              class="comprehensive-quality-table"
            >
              <div class="quality-table-wrapper">
                <table class="quality-table">
                  <thead>
                    <tr v-if="popupData.tableHeaders && popupData.tableHeaders.length">
                      <th v-for="header in popupData.tableHeaders" :key="header">{{ header }}</th>
                    </tr>
                    <tr v-else>
                      <th>监测时间</th>
                      <th>水质等级</th>
                    </tr>
                  </thead>
                  <tbody v-if="popupData.qualityTable && popupData.qualityTable.length">
                    <tr v-for="(row, idx) in popupData.qualityTable" :key="idx">
                      <template v-if="popupData.tableHeaders && popupData.tableHeaders.length">
                        <td>{{ row.wellCode || '--' }}</td>
                        <td>
                          <span :class="['quality-level', getQualityLevelClass(row.qualityLevel)]">
                            {{ row.qualityLevel || '未知' }}
                          </span>
                        </td>
                        <td>{{ row.metricsName || '--' }}</td>
                      </template>
                      <template v-else>
                        <td>{{ row.time }}</td>
                        <td>
                          <span :class="['quality-level', getQualityLevelClass(row.qualityLevel)]">
                            {{ row.qualityLevel || '未知' }}
                          </span>
                        </td>
                      </template>
                    </tr>
                  </tbody>
                  <tbody v-else>
                    <tr>
                      <td :colspan="(popupData.tableHeaders && popupData.tableHeaders.length) || 2">暂无数据</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>    

          </div>
        </div>
      </div>

      <!-- 图例 -->
      <div class="legend" v-if="showLegend && legendItems && legendItems.length">
        <div class="legend-title">{{ legendTitle }}</div>
        <div class="legend-unit" v-if="legendUnit">{{ legendUnit }}</div>
        <div class="legend-item" v-for="item in legendItems" :key="item.label">
          <span class="legend-color" :style="{ backgroundColor: item.color }"></span>
          <div class="legend-content">
            <span class="legend-label">{{ item.label }}</span>
            <span class="legend-range" v-if="item.range">{{ item.range }}</span>
          </div>
        </div>
      </div>

      <!-- 底图切换面板 -->
      <BasemapSwitcher 
        v-if="mapInstance"
        :mapInstance="mapInstance" 
        :currentBasemap="currentBasemap"
        @basemap-changed="handleBasemapChanged"
      />

      <!-- 播放条组件 -->
      <div class="timeline-container" v-if="false">
        <div class="timeline-controls">
          <button @click="togglePlay" class="play-btn">
            <svg style="margin-left: 3px;" v-if="!isPlaying" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5">
              <rect x="6" y="4" width="4" height="16"></rect>
              <rect x="14" y="4" width="4" height="16"></rect>
            </svg>
          </button>
          <el-slider
            v-model="currentDay"
            :min="0"
            :max="51"
            :marks="timeMarks"
            :format-tooltip="formatTimeTooltip"
            @input="handleTimeRangeChange"
            class="timeline-slider"
          />
        </div>
      </div>
    </div>
  </template>
  
  <script>
import { OlMap } from '@/olmap/index'
import BasemapSwitcher from './BasemapSwitcher.vue'
import { getMonitorWellInfo } from '@/api/monitorWell'
import { getSampleQualityLevels } from '@/api/monitorData'

const TOTAL_PHOSPHORUS_METRICS = [
  '甲基对硫磷',
  '马拉硫磷',
  '五氟化磷',
  '三氯化磷',
  '三氟化磷',
  '丙胺氟磷',
  '三苯基磷',
  '三(2-甲基氮丙啶)氧化磷',
  '氧溴化磷',
  '三溴化磷',
  '五溴化磷',
  '甲基内吸磷',
  '定菌磷',
  '碘吸磷',
  '氯亚磷',
  '甲基硫环磷',
  '保米磷',
  '辛硫磷',
  '四丁基碘化磷',
  '嘧啶硫磷',
  '溴代毒鼠磷',
  '氯硫磷',
  '因毒磷',
  '脱叶亚磷',
  '异丙磷',
  '敌杀磷',
  '除线磷',
  '育畜磷',
  '杀螟硫磷',
  '三氯氧磷',
  '五氯化磷',
  '嘧啶氧磷',
  '糠硫磷',
  '二嗪磷',
  '甲基三硫磷',
  '双硫磷',
  '甲丙硫磷',
  '三唑磷',
  '甲基嘧啶磷',
  '皮蝇磷',
  '乙酰甲胺磷',
  '三氧化二磷',
  '五氧化二磷',
  '五硫化二磷',
  '三硫化四磷',
  '七硫化四磷',
  '三硫化二磷',
  '白磷',
  '田乐磷',
  '灭蚜磷',
  '四丁基氢氧化磷',
  '红磷',
  '溴硫磷',
  '伏杀磷',
  '丙硫磷',
  '速灭磷',
  '内吸磷',
  '地胺磷',
  '胺吸磷'
]
import * as echarts from 'echarts'

  export default {
    components: {
      BasemapSwitcher
    },
    data() {
      return {
        mapInstance:null,
        popupHtml:'<div class="popup-content"></div>',
        showPopup: false,
        popupData: null,
        popupStyle: {
          top: '0px',
          left: '0px'
        },
        isPlaying: false,
        currentDay: 0,
        startDate: new Date(),
        endDate: new Date(),
        playInterval: null,
        timeMarks: {
          0: '1',
          51: '52'
        },
        currentBasemap: 'TIANDITU_VEC', // 当前底图
        // 右侧面板
        sidePanel: {
          visible: false,
          title: '',
          metricLabel: 'pH',
          table: [],
          metrics: [],
          unitMap: {},
          chart: {
            times: [],
            series: []
          },
          chartPoints: '20,150 80,120 140,70 200,40 260,90 320,130',
          wellCode: '',  // 监测井编码
          metricName: '',  // 指标名称
          loading: false,  // 加载状态
          startTime: '',  // 开始时间
          endTime: ''  // 结束时间
        },
        sideChartInstance: null,
        // 监测井信息面板
        wellInfoPanel: {
          visible: false,
          data: null
        }
      };
    },
    props:{
      data:{
        type:Array,
        default:()=>[]
      },
      showLegend: {
        type: Boolean,
        default: false
      },
      legendItems: {
        type: Array,
        default: () => []
      },
      legendTitle: {
        type: String,
        default: '水质类别'
      },
      legendUnit: {
        type: String,
        default: ''
      }
    },
    computed: {},
    methods: {
      initMap(){
        let that = this;
        let options = {
          targetId: 'olmap',
          baseMapName: 'TIANDITU_VEC',
          center: [121.73,49.58],
          minZoom: 3,
          zoom: 7.5
        }
        this.mapInstance = new OlMap('olmap',options);
        this.mapInstance.view.setMinZoom(3);
        window.olMap = this.mapInstance;
        // 触发地图初始化完成事件
        this.$emit('map-ready', this.mapInstance);

        // 聚类点击事件
        this.mapInstance.clusterMakerLayer.setOnClick((featureData, event) => {
          if(featureData.length > 0){
            if(featureData[0].type === 'cluster'){
              this.mapInstance.view.setCenter(featureData[0].geometry);
              this.mapInstance.view.zoomIn();
              this.showPopup = false;
            }
          }
        });
        // 点标记点击事件
        this.mapInstance.markerLayer.setOnClick(async (featureData, event) => {
          console.log('Marker clicked, featureData:', featureData);
          const zoom = this.mapInstance.view.getZoom();
          if(featureData && featureData.type === 'marker' && featureData.properties) {
            const data = featureData.properties;
            console.log('current click data:', data);
            
            // 单项水质分布（除综合水质外）：在右侧面板显示
            if (data.popupType === 'singleItem' && data.metricName !== '综合水质') {
              this.sidePanel.visible = true;
              const label = data.metricName || (data.parameter === 'ph' ? 'pH' : (data.parameter === 'phosphorus' ? '总磷值' : '指标'));
              this.sidePanel.title = `单项水质分布数据展板`;
              this.sidePanel.metricLabel = label;
              this.sidePanel.wellCode = data.wellCode;
              this.sidePanel.metricName = data.metricName || label;
              
              // 设置默认时间范围（2020年到2025年）
              const startTime = new Date('2020-01-01');
              const endTime = new Date('2025-12-31');
              this.sidePanel.startTime = this.formatDateForInput(startTime);
              this.sidePanel.endTime = this.formatDateForInput(endTime);
              
              // 加载历史数据
              this.loadSidePanelHistoryData();
              
              return; // 不再展示中心弹窗
            }

            // 综合水质分布（单项模式）：调用历史接口并使用弹框展示综合水质等级表格
            if (data.popupType === 'singleItem' && data.metricName === '综合水质') {
              await this.loadComprehensiveHistoryForPopup(data, event);
              return;
            }

            // 检查是否为监测井数据
            if (data.well_code || data.wellCode) {
              try {
                const wellCode = data.well_code || data.wellCode;
                
                // 1. 调用监测井详细信息接口
                const wellInfoResponse = await getMonitorWellInfo(wellCode);
                const wellData = wellInfoResponse.data || wellInfoResponse;
                
                // 2. 显示监测井信息面板
                this.wellInfoPanel.visible = true;
                this.wellInfoPanel.data = {
                  wellCode: wellData.wellCode || wellCode || '130123J0202',
                  wellType: data.wellType || '省级',
                  completionTime: wellData.completionTime || '2023-05-20 19:25',
                  burialCondition: wellData.burialCondition || '基岩',
                  monitoringLocation: wellData.monitoringLocation || '下游',
                  remarks: wellData.remarks || '/',
                  // 保留其他详细信息以备后用
                  projectId: wellData.projectId || '未知',
                  provinceName: wellData.provinceName || '未知',
                  cityName: wellData.cityName || '未知',
                  countyName: wellData.countyName || '未知',
                  longitude: wellData.longitude || '未知',
                  latitude: wellData.latitude || '未知',
                  wellDepth: wellData.wellDepth ? `${wellData.wellDepth}m` : '未知',
                  waterLevelDepth: wellData.waterLevelDepth ? `${wellData.waterLevelDepth}m` : '未知',
                  wellheadElevation: wellData.wellheadElevation ? `${wellData.wellheadElevation}m` : '未知',
                  wellPipeMaterial: wellData.wellPipeMaterial || '未知',
                  wellOwnershipUnit: wellData.wellOwnershipUnit || '未知',
                  aquiferMedium: wellData.aquiferMedium || '未知',
                  isAreaMonitoringPoint: wellData.isAreaMonitoringPoint ? '是' : '否',
                  isWaterSourceMonitoringPoint: wellData.isWaterSourceMonitoringPoint ? '是' : '否',
                  isPollutionSourceMonitoringPoint: wellData.isPollutionSourceMonitoringPoint ? '是' : '否',
                  pollutionSourceInfo: wellData.pollutionSourceInfo || '无',
                  isSuitableForLongTermMonitoring: wellData.isSuitableForLongTermMonitoring ? '是' : '否',
                  isMaintenanceManagementCarriedOut: wellData.isMaintenanceManagementCarriedOut ? '是' : '否',
                  actualMaintenanceManagementUnit: wellData.actualMaintenanceManagementUnit || '未知'
                };
                return; // 不显示中心弹框
              } catch (error) {
                console.error('获取监测井详细信息失败:', error);
                // 如果接口调用失败，使用基础信息显示面板
                this.wellInfoPanel.visible = true;
                this.wellInfoPanel.data = {
                  wellCode: data.well_code || data.wellCode || '130123J0202',
                  wellType: data.wellType || '省级',
                  completionTime: '2023-05-20 19:25',
                  burialCondition: '基岩',
                  monitoringLocation: '下游',
                  remarks: '/',
                  error: '获取详细信息失败'
                };
                return; // 不显示中心弹框
              }
            } else {
              
            }
            
            this.showPopup = true;
            
            // 计算弹出框位置
            const mapElement = document.getElementById('olmap');
            // 计算弹框位置，确保不超出屏幕范围
            this.$nextTick(() => {
              this.popupStyle = this.calculatePopupPosition(event.pixel);
            });
          } else {
            this.showPopup = false;
          }
        });

        // 热力图点击事件
        this.mapInstance.heatMapLayer.setOnClick((featureData, event) => {
          if (featureData.type === 'heatmap' && featureData.properties) {
            const data = featureData.properties;
            this.popupData = {
              name: 'Power Outage Details',
              ecoLoss: data.Eco_loss ? `${data.Eco_loss}` : 'Unknown',
              incidentTime: data['Incident Time'] || 'Unknown',
              month: data.Month || 'Unknown',
              totalDailyPeriod: data.Total_Daily_Period ? `${data.Total_Daily_Period}` : 'Unknown',
              nuts218cd: data.nuts218cd || 'Unknown'
            };
            this.showPopup = true;
            
            // 计算弹出框位置
            const mapElement = document.getElementById('olmap');
            // 计算弹框位置，确保不超出屏幕范围
            this.$nextTick(() => {
              this.popupStyle = this.calculatePopupPosition(event.pixel);
            });
          }
        });
      },
      closeSidePanel() {
        this.sidePanel.visible = false;
        if (this.sideChartInstance) {
          this.sideChartInstance.dispose();
          this.sideChartInstance = null;
        }
      },
      closeWellInfoPanel() {
        this.wellInfoPanel.visible = false;
        this.wellInfoPanel.data = null;
      },
      /**
       * 格式化日期时间（年月日时分秒）
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
       * 获取水质等级的CSS类名
       */
      getQualityLevelClass(qualityLevel) {
        if (!qualityLevel || qualityLevel === '未知') return 'quality-unknown'
        const levelMap = {
          'I类': 'quality-i',
          'II类': 'quality-ii',
          'III类': 'quality-iii',
          'IV类': 'quality-iv',
          'V类': 'quality-v',
          '劣V类': 'quality-v-'
        }
        return levelMap[qualityLevel] || 'quality-unknown'
      },
      /**
       * 获取指标值（支持字符串和对象格式）
       */
      getMetricValue(metric) {
        if (!metric) return '暂无数据'
        if (typeof metric === 'string') return metric
        if (typeof metric === 'object' && metric.value !== undefined) return metric.value
        return '暂无数据'
      },
      /**
       * 获取指标等级（支持对象格式）
       */
      getMetricClass(metric) {
        if (!metric || typeof metric !== 'object') return ''
        return metric.class || ''
      },
      /**
       * 加载监测数据展板历史数据（基于质量等级接口 /monitor/sample/quality-levels）
       */
      async loadSidePanelHistoryData() {
        if (!this.sidePanel.wellCode || !this.sidePanel.metricName) {
          return;
        }

        try {
          this.sidePanel.loading = true;
          
          // 计算时间范围
          const startTime = this.sidePanel.startTime ? new Date(this.sidePanel.startTime + 'T00:00:00') : new Date();
          const endTime = this.sidePanel.endTime ? new Date(this.sidePanel.endTime + 'T23:59:59') : new Date();
          
          if (!this.sidePanel.startTime || !this.sidePanel.endTime) {
            // 如果没有设置时间，使用默认的2020年到2025年
            startTime.setFullYear(2020, 0, 1);  // 2020-01-01
            startTime.setHours(0, 0, 0, 0);
            endTime.setFullYear(2025, 11, 31);  // 2025-12-31
            endTime.setHours(23, 59, 59, 999);
          }
          
          // 调用质量等级接口，按监测井和时间范围获取所有指标数据
          const response = await getSampleQualityLevels({
            monitoringWellCode: this.sidePanel.wellCode, // 后端参数名为 monitoringWellCode
            startTime: this.formatDateTimeForApi(startTime),
            endTime: this.formatDateTimeForApi(endTime)
          });

          const dataArray = this.normalizeHistoryData(response);

          const tableRows = [];
          const uniqueTimeMap = new Map();
          const metricSeriesData = {};
          const unitMap = {};
          const metricsSet = new Set();

          const targetMetricName = this.sidePanel.metricName;

          dataArray.forEach(item => {
            const samplingTime = item.samplingTime || item.sampleTime;
            const metricValues = Array.isArray(item.metricValues) ? item.metricValues : [];

            if (!samplingTime || !metricValues.length) {
              return;
            }

            // 在返回的 metricValues 中找到与当前点位对应的指标
            const matchedMetric = metricValues.find(m => {
              const name = m.metricName || m.metricCode || '';
              return name === targetMetricName;
            });

            if (!matchedMetric || matchedMetric.value === undefined || matchedMetric.value === null || matchedMetric.value === '') {
              return;
            }

            const time = this.formatDateTime(samplingTime);
            const value = matchedMetric.value;
            const numericValue = parseFloat(value);
            const unit = matchedMetric.unit || '';

            metricsSet.add(targetMetricName);

            const sampleCode = item.sampleCode || item.sample_code || item.sampleId || '';
            const rawTimestamp = samplingTime ? new Date(samplingTime).getTime() : Date.now();
            const timestamp = Number.isNaN(rawTimestamp) ? Date.now() : rawTimestamp;

            const row = {
              code: this.sidePanel.wellCode,
              sampleCode,
              time,
              timestamp,
              values: {}
            };
            row.values[targetMetricName] = {
              value,
              unit
            };
            tableRows.push(row);

            if (!uniqueTimeMap.has(time)) {
              uniqueTimeMap.set(time, timestamp);
            }

            if (!metricSeriesData[targetMetricName]) {
              metricSeriesData[targetMetricName] = {};
            }
            metricSeriesData[targetMetricName][time] = isNaN(numericValue) ? null : numericValue;

            if (unitMap[targetMetricName] === undefined) {
              unitMap[targetMetricName] = unit;
            }
          });
          
          const allTimesDesc = Array.from(uniqueTimeMap.keys()).sort(
            (a, b) => uniqueTimeMap.get(b) - uniqueTimeMap.get(a)
          );
          const allTimesAsc = [...allTimesDesc].reverse();
          const metrics = Array.from(metricsSet);

          const sortedTableRows = tableRows
            .sort((a, b) => b.timestamp - a.timestamp)
            .map(row => {
              const { timestamp, ...rest } = row;
              return rest;
            });
          
          this.sidePanel.table = sortedTableRows;
          this.sidePanel.metrics = metrics;
          this.sidePanel.unitMap = unitMap;
          this.sidePanel.chart = {
            times: allTimesAsc,
            series: metrics.map(metricName => ({
              name: metricName,
              type: 'line',
              showSymbol: false,
              connectNulls: true,
              data: allTimesAsc.map(time => metricSeriesData[metricName]?.[time] ?? null)
            }))
          };
          
          if (allTimesAsc.length && this.sidePanel.chart.series.some(series => series.data.some(val => val !== null && val !== undefined))) {
            this.$nextTick(() => {
              this.renderSideChart(
                this.sidePanel.chart.times,
                this.sidePanel.chart.series,
                this.sidePanel.unitMap
              );
            });
          } else {
            this.$nextTick(() => {
              this.renderSideChart([], [], {});
            });
          }
        } catch (error) {
          console.error('加载监测数据展板历史数据失败:', error);
          this.sidePanel.table = [];
          this.sidePanel.metrics = [];
          this.sidePanel.unitMap = {};
          this.sidePanel.chart = { times: [], series: [] };
          this.$nextTick(() => {
            this.renderSideChart([], [], {});
          });
        } finally {
          this.sidePanel.loading = false;
        }
      },
      /**
       * 展示综合水质标记信息弹框（直接使用 marker 数据）
       */
      async loadComprehensiveHistoryForPopup(data, event) {
        if (!data || !data.wellCode) {
          return;
        }

        try {
          const wellCode = data.wellCode;
          const qualityLevel = data.qualityLevel;
          const metricsName = data.metricsName || data.highestMetricName || data.maxMetricName || '';

          this.popupData = {
            name: `${data.projectName || ''}`,
            wellCode,
            tableHeaders: ['井点编号', '水质等级', '最高等级指标'],
            qualityTable: [
              {
                wellCode,
                qualityLevel,
                metricsName: metricsName=='综合水质'?'--':metricsName || '--'
              }
            ]
          };

          this.showPopup = true;

          // 计算弹框位置，确保不超出屏幕范围
          this.$nextTick(() => {
            this.popupStyle = this.calculatePopupPosition(event.pixel);
          });

          // 不显示右侧监测井信息面板
          this.wellInfoPanel.visible = false;
        } catch (error) {
          console.error('展示综合水质弹框失败:', error);
          this.popupData = {
            name: `${data?.projectName || '综合水质'}  ${data?.wellCode || ''}`,
            wellCode: data?.wellCode || '',
            tableHeaders: ['井点编号', '水质等级', '最高等级指标'],
            qualityTable: [
              {
                wellCode: data?.wellCode || '--',
                qualityLevel: '无质量等级',
                metricsName: '--'
              }
            ]
          };
          this.showPopup = true;
          this.$nextTick(() => {
            this.popupStyle = this.calculatePopupPosition(event?.pixel || [0, 0]);
          });
        }
      },
      normalizeHistoryData(response) {
        if (!response || response.code !== 200 || !response.data) {
          return [];
        }
        const data = response.data;
        if (Array.isArray(data)) {
          return data;
        }
        if (Array.isArray(data?.data)) {
          return data.data;
        }
        if (Array.isArray(data?.rows)) {
          return data.rows;
        }
        return [];
      },
      getMetricCellValue(row, metricName) {
        if (!row || !row.values || !row.values[metricName]) {
          return '-';
        }
        const record = row.values[metricName];
        const unit = record.unit && record.unit !== '/' ? record.unit : '';
        if (record.value === undefined || record.value === null || record.value === '') {
          return '-';
        }
        return `${record.value}${unit}`;
      },
      getMetricCellTitle(row, metricName) {
        if (!row || !row.values || !row.values[metricName]) {
          return `${metricName}: 暂无数据`;
        }
        const record = row.values[metricName];
        const unit = record.unit && record.unit !== '/' ? record.unit : '';
        const value = record.value === undefined || record.value === null || record.value === '' ? '-' : record.value;
        return `${metricName}: ${value}${unit}`;
      },
      /**
       * 监测数据展板时间范围改变处理
       */
      handleSidePanelTimeRangeChange() {
        if (this.sidePanel.startTime && this.sidePanel.endTime) {
          // 验证时间范围
          const start = new Date(this.sidePanel.startTime);
          const end = new Date(this.sidePanel.endTime);
          if (start > end) {
            this.$message.warning('开始时间不能大于结束时间');
            return;
          }
          // 重新加载数据
          this.loadSidePanelHistoryData();
        }
      },
      /**
       * 格式化日期为input[type="date"]格式
       */
      formatDateForInput(date) {
        if (!date) return '';
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      },
      /**
       * 格式化日期时间为年月日时分秒格式（用于API传参）
       */
      formatDateTimeForApi(date) {
        if (!date) return '';
        try {
          const d = new Date(date);
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          const hours = String(d.getHours()).padStart(2, '0');
          const minutes = String(d.getMinutes()).padStart(2, '0');
          const seconds = String(d.getSeconds()).padStart(2, '0');
          return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        } catch (error) {
          return '';
        }
      },
      /**
       * 渲染监测数据展板图表（支持多指标多折线）
       */
      renderSideChart(times = null, series = null, unitMap = null) {
        this.$nextTick(() => {
          const el = this.$refs.sideChart;
          if (!el) {
            console.warn('图表容器元素未找到');
            return;
          }
          
          const fallbackChart = this.sidePanel.chart || { times: [], series: [] };
          const resolvedTimes = Array.isArray(times) ? times : (fallbackChart.times || []);
          const resolvedSeries = Array.isArray(series) ? series : (fallbackChart.series || []);
          const resolvedUnitMap = unitMap || this.sidePanel.unitMap || {};
          
          const hasData =
            resolvedTimes.length > 0 &&
            resolvedSeries.some(item => Array.isArray(item.data) && item.data.some(val => val !== null && val !== undefined));
          
          if (this.sideChartInstance) {
            this.sideChartInstance.dispose();
            this.sideChartInstance = null;
          }
          
          if (!hasData) {
            return;
          }
          
          this.sideChartInstance = echarts.init(el);
          
          const normalizedSeries = resolvedSeries.map(seriesItem => ({
            ...seriesItem,
            smooth: true,
            showSymbol: false,
            connectNulls: true,
            emphasis: { focus: 'series' },
            data: seriesItem.data.map(val => (val === undefined ? null : val))
          }));
          
          const option = {
            color: ['#4B9CFF', '#F7B500', '#34C38F', '#E56997', '#7A6FF0', '#FF8A65', '#2EC7C9'],
            grid: { left: 48, right: 24, top: 70, bottom: 36 },
            legend: {
              data: normalizedSeries.map(item => item.name),
              top: 12,
              icon: 'circle'
            },
            tooltip: {
              trigger: 'axis',
              axisPointer: { type: 'line' },
              formatter: params => {
                if (!params?.length) {
                  return '';
                }
                const header = params[0].name;
                const lines = params
                  .filter(p => p.value !== null && p.value !== undefined)
                  .map(p => {
                    const unit = resolvedUnitMap[p.seriesName] && resolvedUnitMap[p.seriesName] !== '/' ? ` ${resolvedUnitMap[p.seriesName]}` : '';
                    return `${p.marker}${p.seriesName}: ${p.value}${unit}`;
                  });
                return [header, ...lines].join('<br/>');
              }
            },
            xAxis: {
              type: 'category',
              data: resolvedTimes,
              axisLabel: {
                color: '#64748b',
                rotate: resolvedTimes.length > 8 ? 30 : 0,
                fontSize: 10,
                formatter: value => value.split(' ')[0]
              },
              boundaryGap: false
            },
            yAxis: {
              type: 'value',
              axisLabel: { color: '#64748b' },
              name: '指标值',
              nameLocation: 'end',
              splitLine: { lineStyle: { color: 'rgba(0,0,0,0.08)' } },
              scale: true
            },
            series: normalizedSeries
          };
          
          this.sideChartInstance.setOption(option);
          
          setTimeout(() => {
            if (this.sideChartInstance) {
              this.sideChartInstance.resize();
            }
          }, 100);
        });
      },
      async getListById(id){
        // TODO: 实现API调用逻辑
        // const res = await currentGETById('getListById',id);
        // if(res.code===200 && res.data){
        //   return res.data
        // }else{
        //   return null
        // }
        return null
      },
      // 新增地图控制方法
      handleZoomIn() {
        if (this.mapInstance && this.mapInstance.view) {
          this.mapInstance.view.zoomIn();
        }
      },
      handleZoomOut() {
        if (this.mapInstance && this.mapInstance.view) {
          this.mapInstance.view.zoomOut();
        }
      },
      handleLocateMe() {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { longitude, latitude } = position.coords;
              if (this.mapInstance && this.mapInstance.view) {
                this.mapInstance.view.setCenter([longitude, latitude]);
                this.mapInstance.view.setZoom(12); // 设置合适的缩放级别
              }
            },
            (error) => {
              console.error('获取位置失败:', error);
            }
          );
        }
      },
      // 处理全屏功能
      handleFullScreen() {
        const mapElement = document.getElementById('olmap');
        if (!mapElement) return;

        if (!document.fullscreenElement) {
          // 进入全屏
          if (mapElement.requestFullscreen) {
            mapElement.requestFullscreen();
          } else if (mapElement.webkitRequestFullscreen) { // Safari
            mapElement.webkitRequestFullscreen();
          } else if (mapElement.msRequestFullscreen) { // IE11
            mapElement.msRequestFullscreen();
          }
        } else {
          // 退出全屏
          if (document.exitFullscreen) {
            document.exitFullscreen();
          } else if (document.webkitExitFullscreen) { // Safari
            document.webkitExitFullscreen();
          } else if (document.msExitFullscreen) { // IE11
            document.msExitFullscreen();
          }
        }
      },
      closePopup() {
        this.showPopup = false;
        this.popupData = null;
      },
      /**
       * 计算弹框位置，确保不超出屏幕范围
       * @param {Array} pixel - 点击位置的像素坐标 [x, y]
       * @returns {Object} - 包含 top 和 left 的样式对象
       */
      calculatePopupPosition(pixel) {
        const mapElement = document.getElementById('olmap');
        if (!mapElement) {
          return { top: '0px', left: '0px' };
        }
        
        // 获取地图容器的可视区域（viewport）尺寸，而不是整个容器尺寸
        const rect = mapElement.getBoundingClientRect();
        const viewportWidth = rect.width;  // 可视区域宽度
        const viewportHeight = rect.height; // 可视区域高度
        
        // 点击位置相对于地图容器可视区域的坐标
        const clickX = pixel[0] - rect.left;
        const clickY = pixel[1] - rect.top;
        
        // 获取弹框元素（需要等待 DOM 更新）
        const popupElement = this.$el.querySelector('.popup-container');
        
        // 根据弹框类型设置默认尺寸
        const isComprehensive = popupElement && popupElement.querySelector('.comprehensive-info');
        const defaultWidth = isComprehensive ? 700 : 350;
        const defaultHeight = isComprehensive ? 400 : 250;
        
        // 获取弹框的实际尺寸，如果还没渲染则使用默认值
        let popupWidth = defaultWidth;
        let popupHeight = defaultHeight;
        
        if (popupElement) {
          const popupRect = popupElement.getBoundingClientRect();
          if (popupRect.width > 0) popupWidth = popupRect.width;
          if (popupRect.height > 0) popupHeight = popupRect.height;
        }
        
        // 屏幕边界（基于可视区域，而不是整个容器）
        const padding = 10; // 边距
        const minX = padding;
        const maxX = viewportWidth - popupWidth - padding;
        const minY = padding;
        const maxY = viewportHeight - popupHeight - padding;
        
        // 计算初始位置（弹框中心对齐点击位置，向上偏移）
        let left = clickX - popupWidth / 2;
        let top = clickY - popupHeight - 10; // 默认显示在点击位置上方
        
        // 如果上方空间不够，显示在下方
        if (top < minY) {
          top = clickY + 20; // 显示在点击位置下方
        }
        
        // 限制在水平范围内（基于可视区域）
        if (left < minX) {
          left = minX;
        } else if (left > maxX) {
          left = maxX;
        }
        
        // 限制在垂直范围内（基于可视区域）
        if (top < minY) {
          top = minY;
        } else if (top > maxY) {
          top = maxY;
        }
        
        return {
          top: `${Math.max(0, top+300)}px`,
          left: `${Math.max(0, left)}px`
        };
      },
      // 对外提供：定位到指定图层
      // layerName: 'marker' | 'geom'
      fitToLayer(layerName) {
        if (!this.mapInstance || !this.mapInstance.view) return;
        let extent;
        if (layerName === 'marker' && this.mapInstance.markerLayer) {
          extent = this.mapInstance.markerLayer.getExtent && this.mapInstance.markerLayer.getExtent();
        } else if (layerName === 'geom' && this.mapInstance.geomLayer) {
          extent = this.mapInstance.geomLayer.getExtent && this.mapInstance.geomLayer.getExtent();
        }
        if (extent && extent[0] !== Infinity && extent[2] !== -Infinity) {
          this.mapInstance.view.fitExtent(extent, { duration: 500, padding: 50 });
        }
      },
      // 应用值样式
      applyValueStyles() {
        const valueElements = document.querySelectorAll('.popup-body .value');
        valueElements.forEach(element => {
          const text = element.textContent.trim();
          element.classList.remove('value-yes', 'value-no', 'value-unknown');
          
          if (text === '是') {
            element.classList.add('value-yes');
          } else if (text === '否') {
            element.classList.add('value-no');
          } else if (text === '未知') {
            element.classList.add('value-unknown');
          }
        });
      },
      togglePlay() {
        this.isPlaying = !this.isPlaying;
        if (this.isPlaying) {
          this.playInterval = setInterval(() => {
            if (this.currentDay >= 47) {
              this.currentDay = 0;
            } else {
              this.currentDay++;
            }
            this.updateMapData();
          }, 1000); // 每秒更新一次
        } else {
          clearInterval(this.playInterval);
        }
      },
      handleSliderChange() {
        if (this.isPlaying) {
          this.togglePlay(); // 如果正在播放，则暂停
        }
        this.updateMapData();
      },
      formatTimeTooltip(val) {
        return val+1;
      },
      handleTimeRangeChange(val) {
        this.currentDay = val;
        this.updateMapData();
      },
      updateMapData() {
        // 这里添加更新地图数据的逻辑
        const currentDate = new Date(this.startDate);
        currentDate.setDate(currentDate.getDate() + this.currentDay);
        this.endDate = new Date(currentDate);
        // 触发数据更新事件
        this.$emit('date-changed', this.currentDay+1);
      },
      // 底图切换处理方法
      handleBasemapChanged(basemapId) {
        this.currentBasemap = basemapId;
        console.log('底图已切换到:', basemapId);
        // 可以在这里添加其他逻辑，比如保存用户偏好等
      },
    },
    created() {
      // 设置初始日期范围
      this.startDate = new Date();
      this.endDate = new Date();
      this.endDate.setDate(this.endDate.getDate() + 47);
      // 注意：legendItems 应该由父组件通过 props 传入，不要在这里直接修改 prop
    },
    mounted() {
      this.initMap();
    },
    beforeDestroy() {
      if (this.playInterval) {
        clearInterval(this.playInterval);
      }
    },
  }
  </script>
  
  <style scoped>
  .screen-map {
    width: 100%;
    height: 100%;
    position: relative;
    background-color: #FFF;
    overflow: hidden;
  }

  .map-controls {
    position: absolute;
    top: 20px;
    right: 16px;
    z-index: 20;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .map-controls button {
    width: 32px;
    height: 32px;
    background-color: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(4px);
    border: 1px solid rgba(156, 163, 175, 0.3);
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #374151;
    transition: all 0.2s;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .map-controls button:hover {
    background-color: rgba(255, 255, 255, 1);
    border-color: rgba(59, 130, 246, 0.5);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-1px);
  }

  .map-controls button svg {
    width: 16px;
    height: 16px;
  }

  /* 图例样式 */
  .legend {
    position: absolute;
    bottom: 16px;
    left: 16px;
    z-index: 3000;
    background: rgba(255,255,255,0.95);
    border: 1px solid rgba(0,0,0,0.1);
    border-radius: 8px;
    padding: 10px 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    min-width: 120px;
  }
  .legend-title {
    font-size: 13px;
    color: #333;
    margin-bottom: 4px;
    font-weight: 600;
  }
  .legend-unit {
    font-size: 11px;
    color: #666;
    margin-bottom: 8px;
  }
  .legend-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin: 4px 0;
  }
  .legend-color {
    width: 18px;
    height: 10px;
    border-radius: 4px;
    border: 1px solid rgba(0,0,0,0.15);
    display: inline-block;
    flex-shrink: 0;
    margin-top: 2px;
  }
  .legend-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .legend-label { 
    font-size: 12px; 
    color: #333; 
    line-height: 1.2;
  }
  .legend-range {
    font-size: 11px;
    color: #666;
    line-height: 1.2;
  }

  /* 弹出框样式 */
  .popup-container {
    position: absolute;
    z-index: 50;
    transform: translateY(-100%);
    min-width: 320px;
    max-width: 420px;
    animation: popupSlideIn 0.3s ease-out;
  }
  
  /* 综合水质详情弹框加宽 */
  .popup-container:has(.comprehensive-info) {
    min-width: 600px;
    max-width: 900px;
  }

  @keyframes popupSlideIn {
    from {
      opacity: 0;
      transform: translateY(-100%) scale(0.9);
    }
    to {
      opacity: 1;
      transform: translateY(-100%) scale(1);
    }
  }

  .popup-content {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(59, 130, 246, 0.2);
    border-radius: 16px;
    box-shadow: 
      0 20px 40px rgba(0, 0, 0, 0.1),
      0 8px 16px rgba(0, 0, 0, 0.06),
      inset 0 1px 0 rgba(255, 255, 255, 0.8);
    color: #1e293b;
    overflow: hidden;
    position: relative;
  }

  .popup-content::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    border-radius: 16px 16px 0 0;
  }

  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid rgba(59, 130, 246, 0.1);
    background: rgba(59, 130, 246, 0.02);
  }

  .popup-header h3 {
    margin: 0;
    color: #1e293b;
    font-weight: 700;
    font-size: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .popup-header h3::before {
    content: '🔍';
    font-size: 14px;
  }

  .close-btn {
    padding: 6px;
    border-radius: 8px;
    transition: all 0.2s ease;
    color: #64748b;
    background: rgba(100, 116, 139, 0.1);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .close-btn:hover {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    transform: scale(1.05);
  }

  .popup-body {
    padding: 20px;
    max-height: 200px;
    overflow-y: auto;
  }

  .comprehensive-quality-table {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .quality-table-wrapper {
    border: 1px solid rgba(15, 23, 42, 0.08);
    border-radius: 10px;
    overflow: hidden;
    background: #fff;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
  }

  .quality-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }

  .quality-table th {
    background: rgba(59, 130, 246, 0.08);
    color: #0f172a;
    font-size: 13px;
    font-weight: 600;
    padding: 10px 12px;
    border-bottom: 1px solid rgba(15, 23, 42, 0.08);
  }

  .quality-table td {
    padding: 10px 12px;
    font-size: 13px;
    color: #1e293b;
    border-bottom: 1px solid rgba(15, 23, 42, 0.06);
  }

  .quality-table th + th,
  .quality-table td + td {
    border-left: 1px solid rgba(15, 23, 42, 0.06);
  }

  .quality-table tbody tr:nth-child(even) td {
    background: rgba(248, 250, 252, 0.8);
  }

  .quality-table tbody tr:hover td {
    background: rgba(59, 130, 246, 0.08);
  }

  .quality-table tbody tr:last-child td {
    border-bottom: none;
  }

  /* 右侧固定面板 */
  .side-panel {
    position: absolute;
    top: 16px;
    right: 16px;
    bottom: 16px;
    width: 360px;
    background: rgba(255,255,255,0.98);
    border: 1px solid rgba(0,0,0,0.1);
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    z-index: 3000;
    display: flex;
    flex-direction: column;
  }
  .side-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 14px;
    border-bottom: 1px solid rgba(0,0,0,0.06);
  }
  .side-header .title { font-weight: 700; color:#1f2937; }
  .side-body { padding: 12px 14px; overflow: auto; }
  
  /* 监测数据展板加载状态和无数据提示 */
  .side-panel .loading-indicator {
    text-align: center;
    padding: 40px 20px;
    color: #666;
    font-size: 13px;
  }
  
  .side-panel .no-data {
    text-align: center;
    padding: 20px;
    color: #999;
    font-size: 12px;
  }
  .filters .row { display:flex; align-items:center; gap:8px; margin-bottom: 10px; }
  .table { 
    border:1px solid rgba(0,0,0,0.06); 
    border-radius:8px; 
    font-size: 12px; 
    display: flex;
    flex-direction: column;
    height: 280px;
    min-height: 280px;
  }
  .table-scroll {
    flex: 1;
    overflow-x: auto;
    overflow-y: hidden;
  }
  .table-content {
    min-width: max-content;
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  .table-scroll::-webkit-scrollbar {
    height: 6px;
  }
  .table-scroll::-webkit-scrollbar-thumb {
    background: rgba(59, 130, 246, 0.3);
    border-radius: 3px;
  }
  .table-scroll::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
  }
  .thead,
  .tr {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: minmax(120px, auto);
    align-items: stretch;
  }
  .thead { 
    background:#f9fafb; 
    font-weight:600; 
    color:#374151; 
    font-size: 12px; 
    flex-shrink: 0;
    position: sticky;
    top: 0;
    z-index: 1;
  }
  .tbody {
    flex: 1;
    overflow-y: auto;
    min-width: max-content;
    display: flex;
    flex-direction: column;
  }
  .thead span, .tr span { padding:6px 8px; border-bottom:1px solid rgba(0,0,0,0.06); }
  .thead span { font-size: 12px; }
  .tr span { font-size: 12px; }
  .header-cell {
    white-space: nowrap;
  }
  .fixed-col-code {
    min-width: 120px;
  }
  .fixed-col-sample {
    min-width: 130px;
  }
  .fixed-col-time {
    min-width: 150px;
  }
  .metric-header,
  .metric-cell {
    min-width: 130px;
  }
  .cell-content {
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.4;
  }
  .chart { margin-top: 12px; background:#fff; border:1px solid rgba(0,0,0,0.06); border-radius:8px; }

  /* 综合水质分布样式 */
  .comprehensive-info {
    width: 100%;
  }
  
  .comprehensive-info .info-row {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(59, 130, 246, 0.1);
  }
  
  .comprehensive-info .info-row .label {
    font-weight: 500;
    color: #64748b;
    font-size: 13px;
  }
  
  .comprehensive-info .info-row .value {
    font-weight: 600;
    color: #1e293b;
    font-size: 14px;
  }
  
  .comprehensive-info .grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    background: rgba(59, 130, 246, 0.02);
    padding: 12px;
    border-radius: 8px;
  }
  
  .comprehensive-info .cell {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fff;
    border: 1px solid rgba(59, 130, 246, 0.15);
    padding: 10px 12px;
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    transition: all 0.2s ease;
  }
  
  .comprehensive-info .cell:hover {
    border-color: rgba(59, 130, 246, 0.3);
    box-shadow: 0 2px 6px rgba(59, 130, 246, 0.15);
    transform: translateY(-1px);
  }
  
  .comprehensive-info .cell .label {
    font-size: 13px;
    color: #64748b;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-right: 8px;
    flex-shrink: 0;
  }
  
  .comprehensive-info .cell .value {
    font-size: 14px;
    color: #1e293b;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-shrink: 0;
  }

  .popup-body::-webkit-scrollbar {
    width: 4px;
  }

  .popup-body::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 2px;
  }

  .popup-body::-webkit-scrollbar-thumb {
    background: rgba(59, 130, 246, 0.3);
    border-radius: 2px;
  }

  .popup-body::-webkit-scrollbar-thumb:hover {
    background: rgba(59, 130, 246, 0.5);
  }

  .well-info, .other-info {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 8px 12px;
    background: rgba(59, 130, 246, 0.03);
    border-radius: 8px;
    border-left: 3px solid rgba(59, 130, 246, 0.2);
    transition: all 0.2s ease;
  }

  .info-item:hover {
    background: rgba(59, 130, 246, 0.06);
    border-left-color: rgba(59, 130, 246, 0.4);
    transform: translateX(2px);
  }

  .info-item .label {
    color: #475569;
    font-weight: 600;
    font-size: 13px;
    min-width: 100px;
    flex-shrink: 0;
  }

  .info-item .value {
    color: #1e293b;
    font-weight: 500;
    font-size: 13px;
    text-align: right;
    word-break: break-word;
    max-width: 200px;
  }

  /* 特殊值样式 */
  .info-item .value.value-yes {
    color: #059669;
    font-weight: 600;
    position: relative;
  }

  .info-item .value.value-yes::before {
    content: '✓';
    margin-right: 4px;
    font-weight: bold;
  }

  .info-item .value.value-no {
    color: #dc2626;
    font-weight: 600;
    position: relative;
  }

  .info-item .value.value-no::before {
    content: '✗';
    margin-right: 4px;
    font-weight: bold;
  }

  .info-item .value.value-unknown {
    color: #6b7280;
    font-style: italic;
    position: relative;
  }

  .info-item .value.value-unknown::before {
    content: '?';
    margin-right: 4px;
    font-weight: bold;
  }

  /* 监测井信息面板样式 */
  .well-info-panel {
    position: fixed;
    top: 0;
    right: 0;
    width: 500px;
    height: 100vh;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%);
    backdrop-filter: blur(20px);
    border-left: 1px solid rgba(59, 130, 246, 0.2);
    box-shadow: 
      -20px 0 40px rgba(0, 0, 0, 0.1),
      -8px 0 16px rgba(0, 0, 0, 0.06),
      inset 1px 0 0 rgba(255, 255, 255, 0.8);
    z-index: 1000;
    display: flex;
    flex-direction: column;
    animation: slideInRight 0.3s ease-out;
  }

  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  .well-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid rgba(59, 130, 246, 0.1);
    background: rgba(59, 130, 246, 0.02);
    flex-shrink: 0;
  }

  .well-header .title {
    color: #1e293b;
    font-weight: 700;
    font-size: 18px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .well-header .title::before {
    content: '🏗️';
    font-size: 16px;
  }

  .well-body {
    flex: 1;
    padding: 24px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .well-info-table {
    background: rgba(59, 130, 246, 0.03);
    border-radius: 12px;
    padding: 16px;
    border: 1px solid rgba(59, 130, 246, 0.1);
  }

  .well-info-table .info-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 20px;
  }

  .well-info-table .info-row:last-child {
    margin-bottom: 0;
  }

  .well-info-table .info-cell {
    display: flex;
    flex-direction: column;
    gap: 6px;
    background: #fff;
    border: 1px solid rgba(59, 130, 246, 0.12);
    padding: 16px;
    border-radius: 8px;
    transition: all 0.2s ease;
    min-height: 80px;
  }

  .well-info-table .info-cell:hover {
    background: rgba(59, 130, 246, 0.05);
    border-color: rgba(59, 130, 246, 0.2);
    transform: translateY(-1px);
  }

  .well-info-table .label {
    color: #475569;
    font-weight: 600;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .well-info-table .value {
    color: #1e293b;
    font-weight: 500;
    font-size: 15px;
    word-break: break-word;
    line-height: 1.4;
    flex: 1;
    display: flex;
    align-items: center;
  }

  .well-structure {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #FFF;
    border-radius: 12px;
    padding: 20px;
    border: 1px solid rgba(59, 130, 246, 0.1);
    min-height: 300px;
  }

  .well-image {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  /* 水质数据样式 */
  .sample-data-section {
    background: rgba(59, 130, 246, 0.03);
    border-radius: 12px;
    padding: 16px;
    border: 1px solid rgba(59, 130, 246, 0.1);
  }

  .section-title {
    color: #1e293b;
    font-weight: 700;
    font-size: 16px;
    margin: 0 0 16px 0;
    padding-bottom: 12px;
    border-bottom: 2px solid rgba(59, 130, 246, 0.2);
  }

  .sample-info {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 16px;
  }

  .sample-info .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: #fff;
    border-radius: 6px;
    border: 1px solid rgba(59, 130, 246, 0.1);
  }

  .sample-info .info-item .label {
    color: #475569;
    font-weight: 600;
    font-size: 13px;
  }

  .sample-info .info-item .value {
    color: #1e293b;
    font-weight: 500;
    font-size: 14px;
  }

  .quality-level {
    padding: 4px 12px;
    border-radius: 4px;
    font-weight: 600;
    font-size: 13px;
  }

  .quality-i {
    background: #e0f2fe;
    color: #0369a1;
  }

  .quality-ii {
    background: #e0f7fa;
    color: #0e7490;
  }

  .quality-iii {
    background: #f0fdf4;
    color: #15803d;
  }

  .quality-iv {
    background: #fefce8;
    color: #a16207;
  }

  .quality-v {
    background: #fff7ed;
    color: #ea580c;
  }

  .quality-v- {
    background: #fef2f2;
    color: #dc2626;
  }

  .quality-unknown {
    background: #f1f5f9;
    color: #64748b;
  }

  .metrics-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 400px;
    overflow-y: auto;
  }

  .metric-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    background: #fff;
    border-radius: 6px;
    border: 1px solid rgba(59, 130, 246, 0.1);
    transition: all 0.2s ease;
  }

  .metric-row:hover {
    background: rgba(59, 130, 246, 0.05);
    border-color: rgba(59, 130, 246, 0.2);
    transform: translateX(2px);
  }

  .metric-name {
    color: #475569;
    font-weight: 600;
    font-size: 13px;
    flex: 1;
  }

  .metric-value {
    color: #1e293b;
    font-weight: 500;
    font-size: 14px;
    margin: 0 12px;
    flex: 1;
    text-align: right;
  }

  .metric-level {
    padding: 4px 10px;
    border-radius: 4px;
    font-weight: 600;
    font-size: 12px;
    min-width: 50px;
    text-align: center;
  }

  .no-data {
    text-align: center;
    color: #94a3b8;
    font-size: 14px;
    padding: 20px;
    margin: 0;
  }

  .well-body::-webkit-scrollbar {
    width: 6px;
  }

  .well-body::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 3px;
  }

  .well-body::-webkit-scrollbar-thumb {
    background: rgba(59, 130, 246, 0.3);
    border-radius: 3px;
  }

  .well-body::-webkit-scrollbar-thumb:hover {
    background: rgba(59, 130, 246, 0.5);
  }

  /* 响应式设计 */
  @media (max-width: 768px) {
    .popup-container {
      min-width: 280px;
      max-width: 90vw;
    }
    
    .popup-body {
      padding: 16px;
    }
    
    .info-item {
      flex-direction: column;
      gap: 4px;
    }
    
    .info-item .label {
      min-width: auto;
    }
    
    .info-item .value {
      text-align: left;
      max-width: none;
    }

    .well-info-panel {
      width: 100vw;
    }

    .well-info-table .info-row {
      grid-template-columns: 1fr;
      gap: 12px;
    }

    .well-info-table .info-cell {
      min-height: 60px;
      padding: 12px;
    }
  }

  .timeline-container {
    position: absolute;
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 20;
    background-color: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(156, 163, 175, 0.3);
    border-radius: 50px;
    padding: 16px 32px;
    width: 600px;
    max-width: 90%;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }

  .timeline-controls {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .play-btn {
    width: 40px;
    height: 36px;
    background-color: rgba(59, 130, 246, 0.1);
    backdrop-filter: blur(4px);
    border: 1px solid rgba(59, 130, 246, 0.3);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #3b82f6;
    transition: all 0.2s;
  }

  .play-btn:hover {
    background-color: rgba(59, 130, 246, 0.2);
    border-color: rgba(59, 130, 246, 0.5);
    transform: scale(1.05);
  }
  :deep(.el-slider) {
    width: 100%;
    margin: 0 16px;
  }

  :deep(.el-slider__runway) {
    height: 8px;
    background-color: rgba(209, 213, 219, 0.6);
    margin: 0 20px;
  }

  :deep(.el-slider__bar) {
    background-color: #3b82f6;
  }

  :deep(.el-slider__button) {
    width: 16px;
    height: 16px;
    border: 2px solid #3b82f6;
    background-color: #ffffff;
  }

  :deep(.el-slider__button:hover) {
    border-color: #2563eb;
    background-color: #ffffff;
  }

  :deep(.el-slider__marks-text) {
    font-size: 12px;
    color: #6b7280;
    font-weight: 500;
  }

/* 隐藏标记点 */
:deep(.el-slider__stop),
:deep(.el-slider__marks-stop) {
  display: none;
}

/* 优化标记文本位置 */
:deep(.el-slider__marks) {
  margin-top: 8px;
}

:deep(.el-slider__marks-text) {
  transform: translateX(-50%);
}
  </style>
  <style>
  .details-popover {
    background: rgba(255, 255, 255, 0.98) !important;
    color: #374151 !important;
    border-radius: 10px !important;
    box-shadow: 0 4px 24px 0 rgba(0, 0, 0, 0.1) !important;
    border: 1px solid rgba(156, 163, 175, 0.3) !important;
    padding: 16px 18px !important;
    font-size: 14px;
    line-height: 1.7;
  }
  </style>