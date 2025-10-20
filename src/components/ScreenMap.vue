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

      <!-- 弹出框 -->
      <div v-if="showPopup" class="popup-container" :style="popupStyle">
        <div class="popup-content">
          <div class="popup-header">
            <h3>{{ popupData.name }}</h3>
            <button @click="closePopup" class="close-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="popup-body">
            <!-- 监测井信息 -->
            <div v-if="popupData.wellCode || popupData.well_code" class="well-info">
              <div class="info-item">
                <span class="label">监测井编码:</span>
                <span class="value">{{ popupData.wellCode || popupData.well_code }}</span>
              </div>
              <div class="info-item">
                <span class="label">项目编码:</span>
                <span class="value">{{ popupData.projectId || popupData.project_code }}</span>
              </div>
              <div class="info-item">
                <span class="label">地理位置:</span>
                <span class="value">{{ popupData.provinceName }} {{ popupData.cityName }} {{ popupData.countyName }}</span>
              </div>
              <div class="info-item">
                <span class="label">经纬度:</span>
                <span class="value">{{ popupData.longitude }}, {{ popupData.latitude }}</span>
              </div>
              <div class="info-item">
                <span class="label">成井深度:</span>
                <span class="value">{{ popupData.wellDepth || popupData.well_depth }}</span>
              </div>
              <div class="info-item">
                <span class="label">水位埋深:</span>
                <span class="value">{{ popupData.waterLevelDepth || popupData.water_level_depth }}</span>
              </div>
              <div class="info-item">
                <span class="label">井口高程:</span>
                <span class="value">{{ popupData.wellheadElevation || popupData.well_head_elevation }}</span>
              </div>
              <div class="info-item">
                <span class="label">井管材质:</span>
                <span class="value">{{ popupData.wellPipeMaterial || popupData.well_pipe_material }}</span>
              </div>
              <div class="info-item">
                <span class="label">权属单位:</span>
                <span class="value">{{ popupData.wellOwnershipUnit || popupData.well_ownership_unit }}</span>
              </div>
              <div class="info-item">
                <span class="label">埋藏条件:</span>
                <span class="value">{{ popupData.burialCondition }}</span>
              </div>
              <div class="info-item">
                <span class="label">含水层介质:</span>
                <span class="value">{{ popupData.aquiferMedium }}</span>
              </div>
              <div class="info-item">
                <span class="label">区域监测点:</span>
                <span class="value">{{ popupData.isAreaMonitoringPoint || popupData.is_regional_monitoring_point }}</span>
              </div>
              <div class="info-item">
                <span class="label">水源监测点:</span>
                <span class="value">{{ popupData.isWaterSourceMonitoringPoint || popupData.is_water_source_monitoring_point }}</span>
              </div>
              <div class="info-item">
                <span class="label">污染源监测点:</span>
                <span class="value">{{ popupData.isPollutionSourceMonitoringPoint || popupData.is_pollution_source_monitoring_point }}</span>
              </div>
              <div v-if="popupData.pollutionSourceInfo && popupData.pollutionSourceInfo !== '无'" class="info-item">
                <span class="label">污染源信息:</span>
                <span class="value">{{ popupData.pollutionSourceInfo }}</span>
              </div>
              <div class="info-item">
                <span class="label">符合长期监测要求:</span>
                <span class="value">{{ popupData.isSuitableForLongTermMonitoring || popupData.meets_long_term_monitoring_requirements }}</span>
              </div>
              <div class="info-item">
                <span class="label">开展维护管理:</span>
                <span class="value">{{ popupData.isMaintenanceManagementCarriedOut || popupData.has_maintenance_management }}</span>
              </div>
              <div class="info-item">
                <span class="label">实际维护单位:</span>
                <span class="value">{{ popupData.actualMaintenanceManagementUnit || popupData.actual_maintenance_unit }}</span>
              </div>
              <div v-if="popupData.error" class="info-item error">
                <span class="label">错误信息:</span>
                <span class="value">{{ popupData.error }}</span>
              </div>
            </div>
            
            <!-- 其他类型信息 -->
            <div v-else class="other-info">
              <div class="info-item">
                <span class="label">MaxLoss:</span>
                <span class="value">{{ popupData.MaxLoss }}</span>
              </div>
              <div class="info-item">
                <span class="label">Date:</span>
                <span class="value">{{ popupData.Date }}</span>
              </div>
              <div class="info-item">
                <span class="label">UpstreamRegion:</span>
                <span class="value">{{ popupData.UpstreamRegion }}</span>
              </div>
              <div class="info-item">
                <span class="label">UpstreamSector:</span>
                <span class="value">{{ popupData.UpstreamSector }}</span>
              </div>
              <div class="info-item">
                <span class="label">nuts2:</span>
                <span class="value">{{ popupData.nuts2 }}</span>
              </div>
            </div>
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
import { getMonitorWellInfo } from '@/api'

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
      };
    },
    props:{
      data:{
        type:Array,
        default:()=>[]
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
          const zoom = this.mapInstance.view.getZoom();
          if(featureData.type === 'marker' && featureData.properties){
            const data = featureData.properties;
            console.log('current click data', data);
            
            // 检查是否为监测井数据
            if (data.well_code) {
              try {
                // 调用监测井详细信息接口
                const response = await getMonitorWellInfo(data.well_code);
                const wellData = response.data || response;
                
                // 根据接口返回的字段展示关键信息
                this.popupData = {
                  name: '监测井详细信息',
                  wellCode: wellData.wellCode || '未知',
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
                  burialCondition: wellData.burialCondition || '未知',
                  aquiferMedium: wellData.aquiferMedium || '未知',
                  isAreaMonitoringPoint: wellData.isAreaMonitoringPoint ? '是' : '否',
                  isWaterSourceMonitoringPoint: wellData.isWaterSourceMonitoringPoint ? '是' : '否',
                  isPollutionSourceMonitoringPoint: wellData.isPollutionSourceMonitoringPoint ? '是' : '否',
                  pollutionSourceInfo: wellData.pollutionSourceInfo || '无',
                  isSuitableForLongTermMonitoring: wellData.isSuitableForLongTermMonitoring ? '是' : '否',
                  isMaintenanceManagementCarriedOut: wellData.isMaintenanceManagementCarriedOut ? '是' : '否',
                  actualMaintenanceManagementUnit: wellData.actualMaintenanceManagementUnit || '未知'
                };
                
                // 设置弹窗显示后应用样式
                this.$nextTick(() => {
                  this.applyValueStyles();
                });
              } catch (error) {
                console.error('获取监测井详细信息失败:', error);
                // 如果接口调用失败，使用基础信息
                this.popupData = {
                  name: '监测井信息',
                  wellCode: data.well_code || '未知',
                  longitude: data.longitude || '未知',
                  latitude: data.latitude || '未知',
                  error: '获取详细信息失败'
                };
              }
            } else {
              
            }
            
            this.showPopup = true;
            
            // 计算弹出框位置
            const mapElement = document.getElementById('olmap');
            const rect = mapElement.getBoundingClientRect();
            const x = event.pixel[0] - rect.left;
            const y = event.pixel[1] - rect.top - 5; // 向上偏移10px
            
            this.popupStyle = {
              top: `${y}px`,
              left: `${x}px`
            };
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
            const rect = mapElement.getBoundingClientRect();
            const x = event.pixel[0] - rect.left;
            const y = event.pixel[1] - rect.top - 10;
            
            this.popupStyle = {
              top: `${y}px`,
              left: `${x}px`
            };
          }
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

  /* 弹出框样式 */
  .popup-container {
    position: absolute;
    z-index: 50;
    transform: translateX(-50%) translateY(-100%);
    min-width: 320px;
    max-width: 420px;
    animation: popupSlideIn 0.3s ease-out;
  }

  @keyframes popupSlideIn {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(-100%) scale(0.9);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(-100%) scale(1);
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