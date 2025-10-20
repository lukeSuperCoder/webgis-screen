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
    import { getMonitorWellSpatial } from '@/api'


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
            // 加载监测井数据（通过空间查询接口）
            async loadWellData() {
                if (!this.mapInstance || !this.mapInstance.view) {
                    console.warn('地图实例未就绪');
                    return;
                }
                try {
                    const res = await getMonitorWellSpatial();
                    // 根据 request.js 的响应拦截器，这里 res 是后端响应体
                    const rawData = Array.isArray(res.data) ? res.data : res; // 兼容两种结构
                    this.wellData = this.processWellData(rawData);
                    console.log('监测井数据加载完成，共', this.wellData.length, '个监测井');
                } catch (error) {
                    console.error('加载监测井数据失败:', error);
                }
            },
            // 处理监测井数据格式
            processWellData(rawData) {
                const parsePointWKT = (wkt) => {
                    // 支持格式: POINT(112.016666 43.54075)
                    if (!wkt || typeof wkt !== 'string') return null;
                    const match = wkt.trim().match(/^POINT\s*\(\s*([+-]?\d*\.?\d+)\s+([+-]?\d*\.?\d+)\s*\)$/i);
                    if (!match) return null;
                    const lon = Number(match[1]);
                    const lat = Number(match[2]);
                    if (Number.isNaN(lon) || Number.isNaN(lat)) return null;
                    return [lon, lat];
                };

                return (rawData || []).map((well) => {
                    const coordsFromWkt = parsePointWKT(well.geom);
                    const coordinates = coordsFromWkt || [well.longitude, well.latitude];
                    return {
                        coordinates,
                        properties: {
                            well_code: well.wellCode || well.well_code,
                            longitude: coordinates && coordinates[0],
                            latitude: coordinates && coordinates[1]
                        },
                        style: {
                            iconUrl: require('@/assets/well-icon.svg'),
                            iconAnchor: [0.5, 0.5]
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
                // addMarkers返回的是feature数组，获取这些feature的范围然后地图定位
                const features = this.wellLayer.addMarkers(this.wellData);

                if (features && features.length > 0) {
                    // 提取所有feature的geometry，计算范围
                    const extents = features
                        .map(f => f.getGeometry().getExtent())
                        .filter(e => Array.isArray(e));
                    // 合并所有范围
                    let bbox = extents[0];
                    for (let i = 1; i < extents.length; i++) {
                        bbox = [
                          Math.min(bbox[0], extents[i][0]),
                          Math.min(bbox[1], extents[i][1]),
                          Math.max(bbox[2], extents[i][2]),
                          Math.max(bbox[3], extents[i][3]),
                        ];
                    }
                    // 用fit使地图定位到所有监测井
                    this.mapInstance.view.fitExtent(bbox, { duration: 500, padding: 100 });
                }
                
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