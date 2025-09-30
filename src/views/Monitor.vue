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
                mapInstance: null,
                wellLayer: null,
                wellData: null,
                wellsVisible: false
            }
        },
        methods: {
            handleMapReady(mapInstance) {
                this.mapInstance = mapInstance;
                this.drawGeom();
                this.loadWellData();
            },
            // 加载监测井数据
            loadWellData() {
                try {
                    const wellDataRaw = require('@/assets/data/well_data.json');
                    this.wellData = this.processWellData(wellDataRaw.data);
                    console.log('监测井数据加载完成，共', this.wellData.length, '个监测井');
                } catch (error) {
                    console.error('加载监测井数据失败:', error);
                }
            },
            // 处理监测井数据格式
            processWellData(rawData) {
                return rawData.map((well) => {
                    return {
                        coordinates: [well.longitude, well.latitude],
                        properties: {
                            well_code: well.well_code,
                            province: well.province,
                            city: well.city,
                            county: well.county,
                            project_code: well.project_code,
                            water_level_depth: well.water_level_depth,
                            well_depth: well.well_depth,
                            well_head_elevation: well.well_head_elevation,
                            well_pipe_material: well.well_pipe_material,
                            well_ownership_unit: well.well_ownership_unit,
                            is_regional_monitoring_point: well.is_regional_monitoring_point,
                            is_water_source_monitoring_point: well.is_water_source_monitoring_point,
                            is_pollution_source_monitoring_point: well.is_pollution_source_monitoring_point,
                            meets_long_term_monitoring_requirements: well.meets_long_term_monitoring_requirements,
                            converted_to_long_term_monitoring: well.converted_to_long_term_monitoring,
                            has_maintenance_management: well.has_maintenance_management,
                            actual_maintenance_unit: well.actual_maintenance_unit,
                            non_long_term_well_sealed: well.non_long_term_well_sealed,
                            sealing_status: well.sealing_status
                        },
                        style: {
                            shapeType: 0, // 圆形
                            fill: {
                                color: '#3B82F6' // 蓝色
                            },
                            stroke: {
                                color: '#FFFFFF',
                                width: 2
                            },
                            radius: 6
                        }
                    };
                });
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
            handleDateChanged() {
                // console.log('时间轴变化')
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
                this.wellsVisible = show;
                
                if (show) {
                    this.showWells();
                } else {
                    this.hideWells();
                }
            },
            // 显示监测井
            showWells() {
                if (!this.mapInstance || !this.wellData) {
                    console.warn('地图实例或监测井数据未准备好');
                    return;
                }
                
                // 创建监测井图层
                if (!this.wellLayer) {
                    this.wellLayer = this.mapInstance.markerLayer;
                }
                
                // 添加监测井标记
                this.wellLayer.addMarkers(this.wellData);
                console.log('监测井标记已添加到地图');
            },
            // 隐藏监测井
            hideWells() {
                if (this.wellLayer) {
                    this.wellLayer.clearMarkers();
                    console.log('监测井标记已清除');
                }
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