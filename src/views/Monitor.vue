<template>
    <div class="monitor-page">
        <WaterQualityMenu ref="waterQualityMenu" @parameter-selected="handleParameterSelected" @menu-clicked="handleMenuClicked"
            @boundary-toggle="handleBoundaryToggle" @wells-toggle="handleWellsToggle" />
        <ScreenMap 
            @map-ready="handleMapReady" 
            @date-changed="handleDateChanged" 
            :show-legend="showLegend" 
            :legend-items="legendItems"
            :legend-title="legendTitle"
            :legend-unit="legendUnit"
        />
        <MonitoringDataPanel v-if="showMonitoringPanel" @close="closeMonitoringPanel" />
    </div>
</template>

<script>
    import ScreenMap from '@/components/ScreenMap.vue'
    import WaterQualityMenu from '@/components/WaterQualityMenu.vue'
    import MonitoringDataPanel from '@/components/MonitoringDataPanel.vue'
    import { getMonitorWellSpatial } from '@/api'


    export default {
        components: {
            ScreenMap,
            WaterQualityMenu,
            MonitoringDataPanel
        },
        data() {
            return {
                mapInstance: null,
                wellLayer: null,
                wellData: null,
                wellsVisible: false,
                boundaryVisible: false,
                showLegend: false,
                legendItems: [],
                legendTitle: '水质类别',
                legendUnit: '',
                showMonitoringPanel: false
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
                    ph: 'rgb(34, 166, 242)',
                    phosphorus: 'rgb(183, 229, 50)'
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
                this.legendTitle = '水质类别';
                this.legendUnit = '';
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

                return (rawData || []).map((well, index) => {
                    const coordsFromWkt = parsePointWKT(well.geom);
                    const coordinates = coordsFromWkt || [well.longitude, well.latitude];
                    
                    // 根据索引或其他逻辑分配监测井类别（这里使用模拟逻辑）
                    const wellTypes = ['国家级监测井', '国家级考察井', '省市级监测井', '防治区补充井', '背景值调查井'];
                    const wellType = wellTypes[index % wellTypes.length];
                    const wellColor = this.getWellTypeColor(wellType);
                    
                    return {
                        coordinates,
                        properties: {
                            well_code: well.wellCode || well.well_code,
                            longitude: coordinates && coordinates[0],
                            latitude: coordinates && coordinates[1],
                            wellType: wellType
                        },
                        style: {
                            shapeType: 21,
                            radius: 10,
                            fillColor: wellColor,
                            strokeWidth: 1
                        }
                    };
                });
            },
            drawGeom() {
                const data = require('@/assets/data/156150700.json');
                
                // 为初始化数据添加标识
                const dataWithId = {
                    ...data,
                    features: data.features.map(feature => ({
                        ...feature,
                        properties: {
                            ...feature.properties,
                            dataType: 'initial'
                        }
                    }))
                };
                
                this.mapInstance.geomLayer.drawGeoJSON(dataWithId, {
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
                
                // 设置对应的图例
                if (parameter === 'ph') {
                    this.legendTitle = 'pH';
                    this.legendUnit = '';
                    this.legendItems = [
                        { label: 'I类', color: '#22a6f2', range: '(6 ≤ a ≤ 9)' },
                        { label: '劣V类', color: '#ff2a1a', range: '(a < 6 或 a > 9)' }
                    ];
                } else if (parameter === 'phosphorus') {
                    this.legendTitle = '总磷';
                    this.legendUnit = '单位: mg/L';
                    this.legendItems = [
                        { label: 'I类', color: '#22a6f2', range: '≤ 0.02' },
                        { label: 'II类', color: '#28d6f7', range: '≤ 0.10' },
                        { label: 'III类', color: '#b7e532', range: '≤ 0.20' },
                        { label: 'IV类', color: '#f3d231', range: '≤ 0.30' },
                        { label: 'V类', color: '#ff8c31', range: '≤ 0.40' },
                        { label: '劣V类', color: '#ff2a1a', range: '> 0.40' }
                    ];
                }
                this.showLegend = true;
                
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
                // 仅四类切换：综合水质分布、PH值、总磷值、监测数据看板;
                // 单项水质分布按钮本身不触发任何切换
                if (!['comprehensive','ph','phosphorus','dashboard'].includes(menuType)) {
                    return;
                }
                // 切换前清空所有图层与图例
                this.clearAllLayersAndLegend();

                if (menuType === 'comprehensive') {
                    // 展示一批综合水质分布的 marker（模拟数据）
                    if (!this.mapInstance) return;
                    
                    const mockData = this.generateComprehensiveMock();
                    const points = [];
                    
                    for (let i = 0; i < mockData.length; i++) {
                        const p = mockData[i];
                        const cls = p.properties && p.properties.overallClass;
                        const color = this.getClassColor(cls);
                        
                        points.push({
                            coordinates: p.coordinates,
                            properties: p.properties,
                            style: {
                                shapeType: 0,
                                radius: 7,
                                fillColor: color,
                                strokeColor: '#ffffff',
                                strokeWidth: 2
                            }
                        });
                    }
                    
                    const layer = this.mapInstance.markerLayer;
                    layer.clearMarkers();
                    
                    // 打开图例
                    this.legendTitle = '水质类别';
                    this.legendUnit = '';
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
                } else if (menuType === 'dashboard') {
                    // 显示监测数据看板
                    this.showMonitoringPanel = true;
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
            // 监测井类别 -> 颜色映射（与图例一致）
            getWellTypeColor(wellType) {
                switch (wellType) {
                    case '国家级监测井': return '#ff8c31';      // 橙色
                    case '国家级考察井': return '#22a6f2';      // 蓝色
                    case '省市级监测井': return '#f3d231';      // 黄色
                    case '防治区补充井': return '#b7e532';      // 绿色
                    case '背景值调查井': return '#999999';      // 灰色
                    default: return '#999999';
                }
            },
            handleBoundaryToggle(show) {
                console.log('项目边界范围切换:', show)
                this.boundaryVisible = show;
                if (show) {
                    this.showBoundary();
                } else {
                    this.hideBoundary();
                }
            },
            // 显示项目边界
            showBoundary() {
                if (!this.mapInstance) {
                    console.warn('地图实例未就绪');
                    return;
                }
                
                try {
                    const boundaryData = require('@/assets/data/bianjie.json');
                    
                    // 为边界数据添加标识
                    const boundaryDataWithId = {
                        ...boundaryData,
                        features: boundaryData.features.map(feature => ({
                            ...feature,
                            properties: {
                                ...feature.properties,
                                dataType: 'boundary'
                            }
                        }))
                    };
                    
                    // 绘制边界数据（不清除现有数据，直接添加）
                    this.mapInstance.geomLayer.drawGeoJSON(boundaryDataWithId, {
                        style: {
                            stroke: {
                                color: '#ff6b6b',
                                width: 2
                            },
                            fill: {
                                color: 'rgba(255, 107, 107, 0.1)'
                            }
                        },
                        fit: false // 不自动调整视图
                    });
                    console.log('项目边界已显示');
                } catch (error) {
                    console.error('加载项目边界数据失败:', error);
                }
            },
            // 隐藏项目边界
            hideBoundary() {
                if (this.mapInstance && this.mapInstance.geomLayer) {
                    // 获取所有要素
                    const features = this.mapInstance.geomLayer.getGeoms();
                    
                    // 只移除边界数据
                    features.forEach(feature => {
                        const properties = feature.getProperties();
                        if (properties.dataType === 'boundary') {
                            this.mapInstance.geomLayer.removeGeom(feature);
                        }
                    });
                    
                    console.log('项目边界已隐藏');
                }
            },
            handleWellsToggle(show) {
                console.log('监测井分布切换:', show)
                this.wellsVisible = show;
                // 勾选切换前清空全部，并关闭图例
                this.clearAllLayersAndLegend();
                // 清除水质分布按钮的高亮状态
                if (this.$refs.waterQualityMenu) {
                    this.$refs.waterQualityMenu.clearAllHighlights();
                }
                if (show) {
                    // 设置监测井图例
                    this.legendTitle = '监测井类别';
                    this.legendUnit = '';
                    this.legendItems = [
                        { label: '国家级监测井', color: '#ff8c31' },      // 橙色
                        { label: '国家级考察井', color: '#22a6f2' },      // 蓝色
                        { label: '省市级监测井', color: '#f3d231' },      // 黄色
                        { label: '防治区补充井', color: '#b7e532' },      // 绿色
                        { label: '背景值调查井', color: '#999999' }       // 灰色
                    ];
                    this.showLegend = true;
                    this.showWells();
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
            },
            closeMonitoringPanel() {
                this.showMonitoringPanel = false;
                // 清除按钮高亮状态
                if (this.$refs.waterQualityMenu) {
                    this.$refs.waterQualityMenu.clearAllHighlights();
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