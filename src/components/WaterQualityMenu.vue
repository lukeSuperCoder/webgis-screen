<template>
  <div class="water-quality-menu">
    <!-- 主菜单 -->
    <div class="menu-container">
      <!-- 水质分布空间分布 -->
      <div class="menu-section" @mouseleave="hideSubMenu">
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
            @mouseenter="showSubMenu"
          >
            <div class="menu-item-content">
              <i class="el-icon-place"></i>
              <span class="menu-text">单项水质分布</span>
              <span class="arrow" :class="{ expanded: childrenMenuVisible }">›</span>
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
              type="checkbox" 
              id="boundary" 
              v-model="showBoundary"
              @change="handleBoundaryChange"
            >
            <label for="boundary">项目边界范围</label>
          </div>
          
          <div class="checkbox-option">
            <input 
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
    
    <!-- 子菜单 -->
    <div 
      class="submenu-container" 
      v-if="childrenMenuVisible"
      @click.stop
      @mouseenter="showSubMenu"
      @mouseleave="hideSubMenu"
    >
      <div class="submenu-item" 
           :class="{ active: selectedParameter === 'ph' }"
           @click="selectParameter('ph')">
        PH值
      </div>
      <div class="submenu-item" 
           :class="{ active: selectedParameter === 'phosphorus' }"
           @click="selectParameter('phosphorus')">
        总磷值
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WaterQualityMenu',
  data() {
    return {
      selectedWaterQuality: 'comprehensive',
      childrenMenuVisible: false,
      selectedParameter: null,
      showBoundary: false,
      showWells: false,
      activeMenuItem: null,
      hideTimer: null
    }
  },
  methods: {
    handleMenuClick(menuType) {
      if (this.activeMenuItem === menuType) {
        // 再次点击相同项，取消高亮
        this.activeMenuItem = null;
        if (menuType === 'singleItem') {
          this.selectedParameter = null;
        }
      } else {
        // 点击不同项，设置高亮
        if (menuType !== 'singleItem') {
          this.activeMenuItem = menuType; 
        }
        // 点击综合水质分布或监测数据看板时，取消子菜单高亮
        if (menuType === 'comprehensive' || menuType === 'dashboard') {
          this.selectedParameter = null;
        }
      }
      this.childrenMenuVisible = false; // 关闭子菜单
      this.$emit('menu-clicked', menuType);
    },
    
    showSubMenu() {
      if (this.hideTimer) {
        clearTimeout(this.hideTimer);
        this.hideTimer = null;
      }
      this.childrenMenuVisible = true;
    },
    
    hideSubMenu() {
      this.hideTimer = setTimeout(() => {
        this.childrenMenuVisible = false;
      }, 200); // 延迟200ms隐藏，给用户时间移入子菜单
    },
    
    selectParameter(parameter) {
      this.selectedParameter = parameter;
      this.childrenMenuVisible = false;
      this.activeMenuItem = 'singleItem'; // 单项水质分布按钮高亮
      this.$emit('parameter-selected', parameter);
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
      this.selectedParameter = null;
    },
    
    // 清除监测井分布勾选状态（不触发事件，避免清除其他按钮高亮）
    clearWellsCheckbox() {
      if (this.showWells) {
        this.showWells = false;
        // 不触发 wells-toggle 事件，避免在 handleWellsToggle 中调用 clearAllHighlights
        // 直接通过父组件设置 wellsVisible = false 即可
      }
    }
  },
  
  beforeDestroy() {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
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
  gap: 0;
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

.arrow {
  font-size: 16px;
  color: #6b7280;
  transition: transform 0.2s ease;
}

.arrow.expanded {
  transform: rotate(90deg);
  color: #1d4ed8;
}

.submenu-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(156, 163, 175, 0.3);
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 12px;
  min-width: 160px;
  z-index: 35;
  position: absolute;
  top: 100px;
  left: 100%;
  margin-left: 8px;
  height: auto;
  max-height: none;
  width: auto;
}

.submenu-item {
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 13px;
  color: #374151;
  user-select: none;
}

.submenu-item:hover {
  background-color: rgba(59, 130, 246, 0.1);
}

.submenu-item.active {
  background-color: rgba(59, 130, 246, 0.2);
  color: #1d4ed8;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .water-quality-menu {
    top: 10px;
    left: 10px;
  }
  
  .menu-container {
    min-width: 240px;
    padding: 12px;
  }
  
  .submenu-container {
    min-width: 140px;
    padding: 8px;
  }
}
</style>
