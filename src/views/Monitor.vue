<template>
    <div class="monitor-page">
        <WaterQualityMenu @parameter-selected="handleParameterSelected" @menu-clicked="handleMenuClicked"
            @boundary-toggle="handleBoundaryToggle" @wells-toggle="handleWellsToggle" />
        <ScreenMap @map-ready="handleMapReady" @date-changed="handleDateChanged" />
    </div>
</template>

<script>
    import ScreenMap from '@/components/ScreenMap.vue'
    import WaterQualityMenu from '@/components/WaterQualityMenu.vue'


    export default {
        components: {
            ScreenMap,
            WaterQualityMenu
        },
        data() {
            return {
                mapInstance: null
            }
        },
        methods: {
            handleMapReady(mapInstance) {
                this.mapInstance = mapInstance;
                this.drawGeom();
            },
            drawGeom() {
                const data = require('@/assets/data/156150700.json');
                this.mapInstance.geomLayer.drawGeoJSON(data, {
                    style: {
                        stroke: {
                            color: '#744cd3',
                            width: 1
                        },
                        fill: {
                            color: 'rgb(116, 76, 211, 0.2)'
                        }
                    },
                    fit: true
                });
            },
            handleDateChanged(day) {
                // console.log('时间轴变化:', day)
            },
            handleParameterSelected(parameter) {
                console.log('选择的水质参数:', parameter)
                // 这里可以添加处理水质参数选择的逻辑
            },
            handleMenuClicked(menuType) {
                console.log('菜单点击:', menuType)
                // 这里可以添加处理菜单点击的逻辑
            },
            handleBoundaryToggle(show) {
                console.log('项目边界范围切换:', show)
                // 这里可以添加显示/隐藏项目边界的逻辑
            },
            handleWellsToggle(show) {
                console.log('监测井分布切换:', show)
                // 这里可以添加显示/隐藏监测井的逻辑
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