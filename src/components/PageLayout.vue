<template>
  <div class="page-layout">
    <div class="sidebar">
      <div class="sidebar-header">
        <h3>{{ title }}</h3>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        @select="handleMenuSelect"
      >
        <el-menu-item
          v-for="item in menuItems"
          :key="item.key"
          :index="item.key"
        >
          <i :class="item.icon"></i>
          <span slot="title">{{ item.title }}</span>
        </el-menu-item>
      </el-menu>
    </div>
    
    <div class="content">
      <div class="content-header">
        <h2>{{ currentPageTitle }}</h2>
        <p>{{ currentPageDesc }}</p>
      </div>
      <div class="content-body">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PageLayout',
  props: {
    title: {
      type: String,
      required: true
    },
    menuItems: {
      type: Array,
      required: true
    },
    currentPageTitle: {
      type: String,
      default: ''
    },
    currentPageDesc: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      activeMenu: ''
    }
  },
  watch: {
    '$route'(to) {
      this.updateActiveMenu()
    }
  },
  mounted() {
    this.updateActiveMenu()
  },
  methods: {
    handleMenuSelect(key) {
      this.$router.push(key)
    },
    updateActiveMenu() {
      const path = this.$route.path
      this.activeMenu = path
    }
  }
}
</script>

<style scoped>
.page-layout {
  display: flex;
  height: 100vh;
  background-color: #f5f5f5;
}

.sidebar {
  width: 250px;
  background-color: #fff;
  border-right: 1px solid #e6e6e6;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #e6e6e6;
  background-color: #fafafa;
}

.sidebar-header h3 {
  margin: 0;
  color: #333;
  font-size: 16px;
  font-weight: 600;
}

.sidebar-menu {
  flex: 1;
  border: none;
}

.sidebar-menu .el-menu-item {
  height: 50px;
  line-height: 50px;
  padding-left: 20px;
}

.sidebar-menu .el-menu-item i {
  margin-right: 8px;
  color: #666;
}

.sidebar-menu .el-menu-item:hover {
  background-color: #f0f9ff;
  color: #409eff;
}

.sidebar-menu .el-menu-item.is-active {
  background-color: #e6f7ff;
  color: #409eff;
  border-right: 3px solid #409eff;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content-header {
  padding: 20px 30px;
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
}

.content-header h2 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 20px;
  font-weight: 600;
}

.content-header p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.content-body {
  flex: 1;
  padding: 20px 30px;
  overflow-y: auto;
  background-color: #f5f5f5;
}
</style>
