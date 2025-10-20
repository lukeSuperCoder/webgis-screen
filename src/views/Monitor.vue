<template>
    <div class="monitor-page">
        <WaterQualityMenu @parameter-selected="handleParameterSelected" @menu-clicked="handleMenuClicked"
            @boundary-toggle="handleBoundaryToggle" @wells-toggle="handleWellsToggle" />
        <ScreenMap 
            @map-ready="handleMapReady" 
            @date-changed="handleDateChanged" 
            :show-legend="showLegend" 
            :legend-items="legendItems"
        />
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
                wellsVisible: false,
                showLegend: false,
                legendItems: []
            }
        },
        methods: {
            handleMapReady(mapInstance) {
                this.mapInstance = mapInstance;
                this.drawGeom();
                this.loadWellData();
            },
            // 生成单项分布（ph、phosphorus）的模拟点位
            generateSingleParameterMock(parameter) {
                var src = require('@/assets/data/well_data.json');
                if (parameter === 'ph') {
                    src = src.slice(0, 20);
                } else if (parameter === 'phosphorus') {
                    src = src.slice(20, 50);
                }
                const colorMap = {
                    ph: '#3b82f6',
                    phosphorus: '#8b5cf6'
                };
                const toVal = (m) => {
                    if (parameter === 'ph') return m.ph;
                    if (parameter === 'phosphorus') return (m.totalPhosphorus && m.totalPhosphorus.value) || '';
                    return '';
                };
                return (src || []).map((item) => {
                    const value = toVal(item.properties.metrics || {});
                    return {
                        coordinates: item.coordinates,
                        properties: {
                            popupType: 'singleItem',
                            parameter,
                            projectName: item.properties.projectName,
                            wellCode: item.properties.wellCode,
                            measureTime: item.properties.measureTime,
                            value
                        },
                        style: {
                            shapeType: 0,
                            radius: 7,
                            fillColor: colorMap[parameter] || '#3b82f6',
                            strokeColor: '#ffffff',
                            strokeWidth: 2
                        }
                    };
                });
            },
            // 清除所有业务图层与图例
            clearAllLayersAndLegend() {
                if (this.mapInstance) {
                    if (this.mapInstance.markerLayer) {
                        this.mapInstance.markerLayer.clearMarkers();
                    }
                    // 注意：面数据（项目范围）初始化加载后不再清除
                }
                this.showLegend = false;
                this.legendItems = [];
            },
            // 生成“综合水质分布”模拟数据
            generateComprehensiveMock() {
                var markers = require('@/assets/data/well_data.json')
                return markers;
            },
            // 加载监测井数据（通过空间查询接口）
            loadWellData() {
                if (!this.mapInstance || !this.mapInstance.view) {
                    console.warn('地图实例未就绪');
                    return;
                }
                getMonitorWellSpatial()
                    .then((res) => {
                        const rawData = Array.isArray(res && res.data) ? res.data : res;
                        this.wellData = this.processWellData(rawData);
                        console.log('监测井数据加载完成，共', this.wellData.length, '个监测井');
                    })
                    .catch((error) => {
                        console.error('加载监测井数据失败:', error);
                    });
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
                // 仅在子菜单选择具体参数时切换对应图层
                if (!['ph','phosphorus'].includes(parameter)) return;
                this.clearAllLayersAndLegend();
                if (!this.mapInstance) return;
                const points = this.generateSingleParameterMock(parameter);
                const layer = this.mapInstance.markerLayer;
                const features = layer.addMarkers(points);
                if (features && features.length > 0) {
                    const extents = features
                        .map(f => f.getGeometry().getExtent())
                        .filter(e => Array.isArray(e));
                    let bbox = extents[0];
                    for (let i = 1; i < extents.length; i++) {
                        bbox = [
                            Math.min(bbox[0], extents[i][0]),
                            Math.min(bbox[1], extents[i][1]),
                            Math.max(bbox[2], extents[i][2]),
                            Math.max(bbox[3], extents[i][3])
                        ];
                    }
                    this.mapInstance.view.fitExtent(bbox, { duration: 500, padding: 100 });
                }
            },
            handleMenuClicked(menuType) {
                console.log('菜单点击:', menuType)
                // 仅三类切换：综合水质分布、PH值、总磷值;
                // 单项水质分布按钮本身不触发任何切换
                if (!['comprehensive','ph','phosphorus'].includes(menuType)) {
                    return;
                }
                // 切换前清空所有图层与图例
                this.clearAllLayersAndLegend();

                if (menuType === 'comprehensive') {
                    // 展示一批综合水质分布的 marker（模拟数据）
                    if (!this.mapInstance) return;
                    const points = this.generateComprehensiveMock().map(p => {
                        const cls = p.properties && p.properties.overallClass;
                        const color = this.getClassColor(cls);
                        return Object.assign({}, p, {
                            style: {
                                shapeType: 0,
                                radius: 7,
                                fillColor: color,
                                strokeColor: '#ffffff',
                                strokeWidth: 2
                            }
                        });
                    });
                    const layer = this.mapInstance.markerLayer;
                    layer.clearMarkers();
                    // 打开图例
                    this.legendItems = [
                        { label: 'I类', color: this.getClassColor('I类') },
                        { label: 'II类', color: this.getClassColor('II类') },
                        { label: 'III类', color: this.getClassColor('III类') },
                        { label: 'IV类', color: this.getClassColor('IV类') },
                        { label: 'V类', color: this.getClassColor('V类') },
                        { label: '劣V类', color: this.getClassColor('劣V类') },
                    ];
                    this.showLegend = true;
                    const features = layer.addMarkers(points);
                    if (features && features.length > 0) {
                        // 视图定位到这些点
                        const extents = features
                            .map(f => f.getGeometry().getExtent())
                            .filter(e => Array.isArray(e));
                        let bbox = extents[0];
                        for (let i = 1; i < extents.length; i++) {
                            bbox = [
                                Math.min(bbox[0], extents[i][0]),
                                Math.min(bbox[1], extents[i][1]),
                                Math.max(bbox[2], extents[i][2]),
                                Math.max(bbox[3], extents[i][3])
                            ];
                        }
                        this.mapInstance.view.fitExtent(bbox, { duration: 500, padding: 100 });
                    }
                }
            },
            // 水质类别 -> 颜色映射（与图例一致）
            getClassColor(className) {
                switch (className) {
                    case 'I类': return '#22a6f2';      // 蓝
                    case 'II类': return '#28d6f7';     // 青
                    case 'III类': return '#b7e532';    // 黄绿色
                    case 'IV类': return '#f3d231';     // 黄
                    case 'V类': return '#ff8c31';      // 橙
                    case '劣V类': return '#ff2a1a';    // 红
                    default: return '#999999';
                }
            },
            handleBoundaryToggle(show) {
                // 面数据独立于切换逻辑，初始化即加载，不再清除；此勾选暂不影响显示
                console.log('项目边界范围切换(已忽略清除/重绘):', show)
            },
            handleWellsToggle(show) {
                console.log('监测井分布切换:', show)
                this.wellsVisible = show;
                // 勾选切换前清空全部，并关闭图例
                this.clearAllLayersAndLegend();
                if (show) this.showWells();
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