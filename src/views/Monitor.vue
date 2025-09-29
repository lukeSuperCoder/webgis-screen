<template> 
    <div class="monitor-page">
        <ScreenMap @map-ready="handleMapReady" @date-changed="handleDateChanged" />
    </div>
</template>

<script>
import ScreenMap from '@/components/ScreenMap.vue'

export default {
    components: {
        ScreenMap
    },
    methods: {
        handleMapReady(mapInstance) {
            console.log('地图初始化完成:', mapInstance)
        },
        handleDateChanged(day) {
            console.log('时间轴变化:', day)
        }
    }
}
</script>

<style scoped>
.monitor-page {
    width: 100%;
    height: 100%;
    position: relative;
    background-color: #FFF;
    overflow: hidden;
}
</style>