<template>
  <div class="basemap-switcher">
    <!-- 触发按钮 -->
    <button class="trigger-btn" @click="togglePanel" :class="{ active: isExpanded }" title="底图切换">
      <svg t="1759139825102" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
        p-id="8389" width="48" height="48">
        <path
          d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64z m0 224c-29.5 0-58.3-2.6-86.2-7.5C452 175.3 491.4 120 512 120c20.6 0 60 55.3 86.2 160.5-27.9 4.8-56.7 7.5-86.2 7.5z m140.7-20.4c-13.6-55.7-31.8-102.6-53.1-137.4 63.6 14.6 121.3 44.7 169 86.1-35.3 21.8-74.3 39.1-115.9 51.3z m-281.4 0c-41.6-12.2-80.5-29.6-115.8-51.3 47.7-41.4 105.3-71.4 168.9-86-21.3 34.7-39.4 81.6-53.1 137.3zM679.5 484c-1.3-57.5-6.7-111.9-15.4-161.4 52.5-15 101.3-37.3 144.8-65.8 53.4 62 87.5 140.7 93.7 227.2H679.5z m-558.1 0c6.2-86.4 40.2-165.1 93.5-227.1 43.5 28.5 92.4 50.6 145 65.6-8.7 49.6-14.1 104-15.4 161.5H121.4z m279.1 0c1.3-55.7 6.4-105.4 13.9-148.7 31.6 5.6 64.1 8.7 97.6 8.7 33.4 0 66-3 97.6-8.6 7.5 43.3 12.5 93 13.9 148.6h-223z m408.4 283.2c-43.5-28.5-92.3-50.8-144.8-65.8 8.7-49.6 14.1-104 15.4-161.4h223.1c-6.2 86.5-40.3 165.2-93.7 227.2z m-394.5-78.5c-7.5-43.3-12.5-93-13.9-148.7h222.9c-1.3 55.6-6.3 105.3-13.9 148.6C578 683 545.4 680 512 680c-33.4 0-66 3.1-97.6 8.7zM215 767.1c-53.3-62-87.4-140.7-93.5-227.1h223.1c1.3 57.5 6.7 111.9 15.4 161.5-52.6 15-101.5 37.1-145 65.6zM512 904c-20.6 0-60-55.3-86.2-160.5 27.9-4.8 56.7-7.5 86.2-7.5s58.3 2.7 86.2 7.5C572 848.7 532.6 904 512 904z m87.6-10.2c21.3-34.8 39.5-81.7 53.1-137.4 41.7 12.2 80.6 29.5 115.9 51.2-47.7 41.5-105.4 71.6-169 86.2z m-175.2 0c-63.6-14.6-121.2-44.6-168.9-86 35.2-21.8 74.1-39.1 115.8-51.3 13.7 55.6 31.8 102.5 53.1 137.3z"
          fill="#374151" p-id="8390"></path>
      </svg>
    </button>

    <!-- 弹框内容 -->
    <div v-if="isExpanded" class="popup-content" @click.stop>
      <div class="popup-header">
        <h3 class="popup-title">底图切换</h3>
        <button @click="closePanel" class="close-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="basemap-options">
        <button v-for="basemap in tiandituMaps" :key="basemap.id" @click="switchBasemap(basemap.id)"
          :class="['basemap-btn', { active: currentBasemap === basemap.id }]" :title="basemap.description">
          <div class="basemap-preview">
            <div class="preview-image" :style="{ backgroundColor: basemap.color }">
              <span class="preview-icon">{{ basemap.icon }}</span>
            </div>
          </div>
          <div class="basemap-label" :class="{ active: currentBasemap === basemap.id }">
            {{ basemap.name }}
          </div>
        </button>
      </div>
    </div>

  </div>
</template>

<script>
  export default {
    name: 'BasemapSwitcher',
    props: {
      mapInstance: {
        type: Object,
        required: true
      },
      currentBasemap: {
        type: String,
        default: 'TIANDITU_VEC'
      }
    },
    data() {
      return {
        isExpanded: false,
        tiandituMaps: [{
            id: 'TIANDITU_VEC',
            name: '矢量图',
            icon: '🗺️',
            color: '#4CAF50',
            description: '天地图矢量底图，包含道路、建筑等矢量信息'
          },
          {
            id: 'TIANDITU_IMG',
            name: '影像图',
            icon: '🛰️',
            color: '#2196F3',
            description: '天地图影像底图，卫星影像数据'
          },
          {
            id: 'TIANDITU_TER',
            name: '地形图',
            icon: '🏔️',
            color: '#FF5722',
            description: '天地图地形底图，显示地形起伏和等高线'
          }
        ]
      }
    },
    methods: {
      togglePanel() {
        this.isExpanded = !this.isExpanded;
      },
      closePanel() {
        this.isExpanded = false;
      },
      switchBasemap(basemapId) {
        if (this.mapInstance && this.mapInstance.baseMapManager) {
          this.mapInstance.baseMapManager.switchBaseMap(basemapId);
          this.$emit('basemap-changed', basemapId);
          // 切换底图后关闭弹框
          this.closePanel();
        }
      }
    }
  }
</script>

<style scoped>
  .basemap-switcher {
    position: absolute;
    bottom: 50px;
    right: 20px;
    z-index: 1000;
  }

  /* 触发按钮 */
  .trigger-btn {
    width: 48px;
    height: 48px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(156, 163, 175, 0.3);
    border-radius: 50%;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    color: #6b7280;
  }

  .trigger-btn:hover {
    background: rgba(255, 255, 255, 1);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
    color: #3b82f6;
  }

  .trigger-btn.active {
    background: rgba(59, 130, 246, 0.1);
    border-color: #3b82f6;
    color: #3b82f6;
  }

  /* 弹框内容 */
  .popup-content {
    position: absolute;
    bottom: 60px;
    right: 0;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(156, 163, 175, 0.3);
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
    padding: 20px;
    min-width: 230px;
    z-index: 1001;
    animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .popup-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(156, 163, 175, 0.2);
  }

  .popup-title {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
  }

  .close-btn {
    width: 28px;
    height: 28px;
    background: rgba(156, 163, 175, 0.1);
    border: none;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    color: #6b7280;
  }

  .close-btn:hover {
    background: rgba(156, 163, 175, 0.2);
    color: #374151;
  }

  .basemap-options {
    display: flex;
    gap: 16px;
    align-items: center;
  }

  .basemap-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: transparent;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    padding: 0;
    position: relative;
  }

  .basemap-btn:hover {
    transform: translateY(-2px);
  }

  .basemap-preview {
    width: 60px;
    height: 40px;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    margin-bottom: 8px;
    position: relative;
  }

  .preview-image {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%);
    position: relative;
  }

  .preview-image::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background:
      radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(0, 0, 0, 0.1) 0%, transparent 50%);
  }

  .preview-icon {
    font-size: 20px;
    z-index: 1;
    position: relative;
  }

  .basemap-label {
    font-size: 12px;
    font-weight: 500;
    color: #666;
    text-align: center;
    padding: 4px 8px;
    border-radius: 4px;
    background: rgba(0, 0, 0, 0.05);
    transition: all 0.2s ease;
    min-width: 50px;
  }

  .basemap-label.active {
    background: #3b82f6;
    color: white;
    font-weight: 600;
  }

  .basemap-btn.active .basemap-preview {
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    border: 2px solid #3b82f6;
  }

  .basemap-btn.active .preview-image {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  }

  .basemap-btn.active .preview-icon {
    color: white;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  }

  /* 动画效果 */
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* 响应式设计 */
  @media (max-width: 768px) {
    .basemap-switcher {
      bottom: 10px;
      right: 10px;
    }

    .trigger-btn {
      width: 44px;
      height: 44px;
    }

    .popup-content {
      bottom: 56px;
      right: -10px;
      min-width: 260px;
      padding: 16px;
    }

    .basemap-options {
      gap: 12px;
    }

    .basemap-preview {
      width: 50px;
      height: 35px;
    }

    .preview-icon {
      font-size: 16px;
    }

    .basemap-label {
      font-size: 11px;
      padding: 3px 6px;
      min-width: 45px;
    }
  }
</style>