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
        </div>
      </div>

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

  export default {
    components: {
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
          baseMapName: 'AMAP_IMG',
          center: [-1.7370224109938552,54.91845581490148],
          minZoom: 3,
          zoom: 5.5
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
            const data = featureData.properties.properties;
            console.log('current click data',data);
            this.popupData = {
              name: 'Details',
              MaxLoss: data.MaxLoss ? `${data.MaxLoss.toFixed(1)}` : 'Unknown',
              Date: data['Date'].substr(0,7) || 'Unknown',
              UpstreamRegion: data.UpstreamRegion || 'Unknown',
              UpstreamSector: data.WorstSector ? `${data.WorstSector}` : 'Unknown',
              nuts2: data.nuts2 || 'Unknown',
            };
            this.showPopup = true;
            
            // 计算弹出框位置
            const mapElement = document.getElementById('olmap');
            const rect = mapElement.getBoundingClientRect();
            const x = event.pixel[0] - rect.left;
            const y = event.pixel[1] - rect.top - 10; // 向上偏移10px
            
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
    min-width: 300px;
    max-width: 400px;
  }

  .popup-content {
    background-color: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(156, 163, 175, 0.3);
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    color: #374151;
  }

  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    border-bottom: 1px solid rgba(156, 163, 175, 0.2);
  }

  .popup-header h3 {
    margin: 0;
    color: #1f2937;
    font-weight: 600;
  }

  .close-btn {
    padding: 4px;
    border-radius: 50%;
    transition: background-color 0.2s;
    color: #6b7280;
  }

  .close-btn:hover {
    background-color: rgba(239, 68, 68, 0.1);
    color: #ef4444;
  }

  .popup-body {
    padding: 12px;
  }

  .info-item {
    margin-bottom: 8px;
  }

  .info-item:last-child {
    margin-bottom: 0;
  }

  .info-item .label {
    color: #3b82f6;
    margin-right: 8px;
    font-weight: 500;
  }

  .info-item .value {
    color: #6b7280;
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