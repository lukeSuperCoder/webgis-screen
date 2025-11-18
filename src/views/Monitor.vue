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
        <!-- 加载遮罩 -->
        <div v-if="isLoadingSampleData" class="loading-overlay">
            <div class="loading-content">
                <i class="el-icon-loading"></i>
                <p>正在加载水质数据...</p>
            </div>
        </div>
        <MonitoringDataPanel v-if="showMonitoringPanel" @close="closeMonitoringPanel" />
    </div>
</template>

<script>
    import ScreenMap from '@/components/ScreenMap.vue'
    import WaterQualityMenu from '@/components/WaterQualityMenu.vue'
    import MonitoringDataPanel from '@/components/MonitoringDataPanel.vue'
    import { getMonitorWellSpatial, getMonitorWellInfo } from '@/api/monitorWell'
    import { getSampleList, getSampleData } from '@/api/monitorData'


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
                wellData: [],              // 监测井基础数据
                sampleData: {},            // 水质数据 { wellCode: data }
                isLoadingSampleData: false, // 加载状态
                queryDate: null,           // 查询日期（null = 最新数据）
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
            /**
             * 批量获取所有监测井的水质数据（使用列表接口）
             * @param {string} date - 查询日期 (可选，用于筛选时间范围)
             * @returns {Promise<Array>}
             */
            async batchGetSampleData(date = null) {
                try {
                    // 使用 getSampleList 接口批量获取所有监测井的数据
                    const params = {
                        pageNum: 1,
                        pageSize: 10000  // 设置一个较大的值以获取所有数据
                    }

                    // 如果指定了日期，设置时间范围（查询该日期当天的数据）
                    if (date) {
                        const queryDate = new Date(date)
                        const startDate = new Date(queryDate)
                        startDate.setHours(0, 0, 0, 0)
                        const endDate = new Date(queryDate)
                        endDate.setHours(23, 59, 59, 999)
                        
                        params.startTime = startDate.toISOString()
                        params.endTime = endDate.toISOString()
                    }

                    const response = await getSampleList(params)
                    
                    if (response.code === 200 && response.rows) {
                        // 按监测井分组，取每个监测井的最新一条数据
                        const dataByWell = {}
                        response.rows.forEach(row => {
                            const wellCode = row.monitoringWellCode
                            if (!dataByWell[wellCode]) {
                                dataByWell[wellCode] = row
                            } else {
                                // 如果有多条数据，取采样时间最新的
                                const currentTime = new Date(row.samplingTime || 0)
                                const existingTime = new Date(dataByWell[wellCode].samplingTime || 0)
                                if (currentTime > existingTime) {
                                    dataByWell[wellCode] = row
                                }
                            }
                        })
                        
                        // 转换为数组格式，每个元素包含监测井编码和完整数据
                        return Object.keys(dataByWell).map(wellCode => ({
                            code: 200,
                            data: {
                                monitoringWellCode: wellCode,
                                samplingTime: dataByWell[wellCode].samplingTime,
                                qualityLevel: dataByWell[wellCode].qualityLevel,
                                metrics: dataByWell[wellCode].metricValues || []
                            }
                        }))
                    }
                    return []
                } catch (error) {
                    console.error('批量获取水质数据失败:', error)
                    return []
                }
            },
            /**
             * 加载综合水质分布数据（使用与单项指标相同的上图逻辑，metricName 固定为 summary）
             */
            async loadComprehensiveWaterQuality() {
                try {
                    this.isLoadingSampleData = true

                    const indicator = {
                        metricName: 'summary',
                        value: 'summary',
                        label: '综合水质'
                    }

                    await this.loadSingleMetricData(indicator)
                } catch (error) {
                    console.error('加载综合水质数据失败:', error)
                    this.$message.error('加载水质数据失败，请重试')
                } finally {
                    this.isLoadingSampleData = false
                }
            },
            /**
             * 生成综合水质地图数据
             */
            generateComprehensiveMapData() {
                const mapData = []

                this.wellData.forEach(well => {
                    const sampleData = this.sampleData[well.wellCode]

                    // 只显示有水质数据的监测井
                    if (!sampleData) {
                        return  // 跳过没有水质数据的监测井
                    }

                    // 确定水质等级颜色
                    const color = this.getClassColor(sampleData.qualityLevel || '未知')

                    mapData.push({
                        coordinates: well.coordinates,
                        properties: {
                            popupType: 'comprehensive',
                            projectName: well.properties.projectId || '',
                            wellCode: well.wellCode,
                            measureTime: sampleData.samplingTime ? this.formatDateTime(sampleData.samplingTime) : '未知',
                            overallClass: sampleData.qualityLevel || '未知',
                            color: color,
                            metricValues: sampleData.metrics || []  // 直接传递 metricValues 数组
                        },
                        style: {
                            shapeType: 0,
                            radius: 7,
                            fillColor: color,
                            strokeColor: '#ffffff',
                            strokeWidth: 2
                        }
                    })
                })

                return mapData
            },
            /**
             * 将后端指标编码映射为前端字段名
             */
            getMetricKey(metricCode) {
                const mapping = {
                    'WATER_TEMP': 'waterTemp',
                    'TURBIDITY': 'turbidity',
                    'PH': 'ph',
                    'DO': 'dissolvedOxygen',
                    'CONDUCTIVITY': 'conductivity',
                    'CHLOROPHYLL_A': 'chlorophyllA',
                    'CYANOBACTERIA': 'cyanobacteria',
                    'COD_MN': 'permanganateIndex',
                    'TP': 'totalPhosphorus',
                    'NH3_N': 'ammoniaNitrogen',
                    'TN': 'totalNitrogen',
                    'TOTAL_IRON': 'totalIron'
                }
                return mapping[metricCode] || metricCode.toLowerCase()
            },
            /**
             * 渲染综合水质图层
             */
            renderComprehensiveLayer(mapData) {
                console.log('renderComprehensiveLayer - mapData length:', mapData ? mapData.length : 0)
                console.log('renderComprehensiveLayer - mapData sample:', mapData ? mapData[0] : null)
                
                // 清除现有标记
                if (this.mapInstance && this.mapInstance.markerLayer) {
                    this.mapInstance.markerLayer.clearMarkers()
                }

                // 添加新标记
                const layer = this.mapInstance.markerLayer
                console.log('renderComprehensiveLayer - before addMarkers, source features count:', layer.vectorSource ? layer.vectorSource.getFeatures().length : 'N/A')
                
                const features = layer.addMarkers(mapData)
                
                console.log('renderComprehensiveLayer - after addMarkers, features count:', features ? features.length : 0)
                console.log('renderComprehensiveLayer - after addMarkers, source features count:', layer.vectorSource ? layer.vectorSource.getFeatures().length : 'N/A')

                // 自适应视图
                if (features && features.length > 0) {
                    const extents = features
                        .map(f => f.getGeometry().getExtent())
                        .filter(e => Array.isArray(e))
                    let bbox = extents[0]
                    for (let i = 1; i < extents.length; i++) {
                        bbox = [
                            Math.min(bbox[0], extents[i][0]),
                            Math.min(bbox[1], extents[i][1]),
                            Math.max(bbox[2], extents[i][2]),
                            Math.max(bbox[3], extents[i][3])
                        ]
                    }
                    this.mapInstance.view.fitExtent(bbox, { duration: 500, padding: 100 })
                }
            },
            /**
             * 显示综合水质图例
             */
            showComprehensiveLegend() {
                this.legendTitle = '水质类别'
                this.legendUnit = ''
                this.legendItems = [
                    { label: 'I类', color: '#22a6f2', range: '' },
                    { label: 'II类', color: '#28d6f7', range: '' },
                    { label: 'III类', color: '#b7e532', range: '' },
                    { label: 'IV类', color: '#f3d231', range: '' },
                    { label: 'V类', color: '#ff8c31', range: '' },
                    { label: '劣V类', color: '#ff2a1a', range: '' },
                    { label: '无质量等级', color: '#999999', range: '' }
                ]
                this.showLegend = true
            },
            /**
             * 格式化日期时间
             */
            formatDateTime(dateTime) {
                if (!dateTime) return '未知'
                try {
                    const date = new Date(dateTime)
                    const year = date.getFullYear()
                    const month = String(date.getMonth() + 1).padStart(2, '0')
                    const day = String(date.getDate()).padStart(2, '0')
                    const hours = String(date.getHours()).padStart(2, '0')
                    const minutes = String(date.getMinutes()).padStart(2, '0')
                    return `${year}-${month}-${day} ${hours}:${minutes}`
                } catch (error) {
                    return dateTime
                }
            },
            // 加载监测井数据（通过空间查询接口）
            loadWellData() {
                if (!this.mapInstance || !this.mapInstance.view) {
                    console.warn('地图实例未就绪');
                    return Promise.reject(new Error('地图实例未就绪'));
                }
                return getMonitorWellSpatial()
                    .then((res) => {
                        const rawData = Array.isArray(res && res.data) ? res.data : res;
                        this.wellData = this.processWellData(rawData);
                        console.log('监测井数据加载完成，共', this.wellData.length, '个监测井');
                        return this.wellData;
                    })
                    .catch((error) => {
                        console.error('加载监测井数据失败:', error);
                        this.$message.error('加载监测井数据失败');
                        throw error;
                    });
            },
            // 处理监测井数据格式
            processWellData(rawData) {
                const wellTypes = ['国家级监测井', '国家级考察井', '省市级监测井', '防治区补充井', '背景值调查井'];
                
                return (rawData || []).reduce((acc, well) => {
                    const coordinates = this.getCoordinatesFromWell(well);
                    if (!coordinates) {
                        return acc;
                    }
                    
                    const wellType = wellTypes[acc.length % wellTypes.length];
                    const wellColor = this.getWellTypeColor(wellType);
                    const wellCode = well.wellCode || well.well_code;
                    
                    acc.push({
                        wellCode: wellCode,  // 保存wellCode用于后续查询
                        coordinates,
                        properties: {
                            well_code: wellCode,
                            wellCode: wellCode,  // 同时保存两个字段名以确保兼容
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
                    });
                    
                    return acc;
                }, []);
            },
            parsePointWKT(wkt) {
                if (!wkt || typeof wkt !== 'string') return null;
                const match = wkt.trim().match(/^POINT\s*\(\s*([+-]?\d*\.?\d+)\s+([+-]?\d*\.?\d+)\s*\)$/i);
                if (!match) return null;
                const lon = Number(match[1]);
                const lat = Number(match[2]);
                if (Number.isNaN(lon) || Number.isNaN(lat)) return null;
                return [lon, lat];
            },
            getCoordinatesFromWell(well) {
                if (!well) return null;
                const coordsFromWkt = this.parsePointWKT(well.geom || well.geometry);
                if (coordsFromWkt) return coordsFromWkt;
                
                if (Array.isArray(well.coordinates) && well.coordinates.length >= 2) {
                    const lon = Number(well.coordinates[0]);
                    const lat = Number(well.coordinates[1]);
                    if (!Number.isNaN(lon) && !Number.isNaN(lat)) {
                        return [lon, lat];
                    }
                }
                
                const lon = Number(well.longitude ?? well.lon ?? well.lng);
                const lat = Number(well.latitude ?? well.lat);
                if (!Number.isNaN(lon) && !Number.isNaN(lat)) {
                    return [lon, lat];
                }
                return null;
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
            handleParameterSelected(indicator) {
                if (!indicator) return;
                this.clearAllLayersAndLegend();
                // 清除监测井分布勾选状态
                if (this.$refs.waterQualityMenu) {
                    this.$refs.waterQualityMenu.clearWellsCheckbox();
                }
                this.wellsVisible = false;
                if (!this.mapInstance) return;
                this.loadSingleMetricData(indicator);
            },
            /**
             * 加载单项水质分布数据
             * @param {string} metricName - 指标名称 (pH, 总磷等)
             */
            async loadSingleMetricData(indicator) {
                try {
                    this.isLoadingSampleData = true

                    const metricName = (indicator && (indicator.metricName || indicator.label || indicator.value)) || ''
                    if (!metricName) {
                        this.$message.warning('未能识别所选指标')
                        return
                    }

                    const response = await getMonitorWellSpatial({ metricName })
                    let rawData = []
                    if (response) {
                        if (Array.isArray(response.data)) {
                            rawData = response.data
                        } else if (Array.isArray(response.rows)) {
                            rawData = response.rows
                        } else if (Array.isArray(response)) {
                            rawData = response
                        }
                    }

                    if (!rawData.length) {
                        this.$message.info('当前指标暂无监测井数据')
                        this.renderSingleMetricLayer([])
                        this.showSingleMetricLegend(indicator)
                        return
                    }

                    const metricData = this.buildMetricSpatialMapData(rawData, indicator, metricName)
                    if (!metricData.length) {
                        this.$message.info('当前指标暂无可展示的监测井')
                    }

                    this.renderSingleMetricLayer(metricData)
                    this.showSingleMetricLegend(indicator)
                } catch (error) {
                    const indicatorName = (indicator && (indicator.label || indicator.metricName)) || '单项指标'
                    console.error(`加载${indicatorName}数据失败:`, error)
                    this.$message.error(`加载${indicatorName}数据失败，请重试`)
                } finally {
                    this.isLoadingSampleData = false
                }
            },
            buildMetricSpatialMapData(rawData, indicator, metricName) {
                const indicatorDisplayName = indicator?.label || indicator?.metricName || metricName || ''
                const parameterKey = (indicator?.metricCode || indicator?.value || metricName || '').toString().toLowerCase()
                const indicatorUnit = indicator?.unit || ''
                const defaultSamplingTime = new Date().toISOString()

                return (rawData || []).reduce((acc, well) => {
                    const coordinates = this.getCoordinatesFromWell(well)
                    if (!coordinates) {
                        return acc
                    }

                    const wellCode = well.wellCode || well.well_code
                    const qualityLevel = this.normalizeQualityLevel(
                        well.waterQualityLevel || well.qualityLevel || well.level || well.className
                    )
                    const color = this.getClassColor(qualityLevel)
                    const metricValue = well.metricValue ?? well.value ?? (well.metric && well.metric.value) ?? ''
                    const metricUnit = well.metricUnit || well.unit || indicatorUnit

                    acc.push({
                        coordinates,
                        properties: {
                            popupType: 'singleItem',
                            parameter: parameterKey,
                            wellCode,
                            metricName: indicatorDisplayName,
                            value: metricValue,
                            unit: metricUnit,
                            qualityLevel,
                            samplingTime: well.samplingTime || well.measureTime || well.sampleTime || defaultSamplingTime,
                            color
                        },
                        style: {
                            shapeType: 0,
                            radius: 7,
                            fillColor: color,
                            strokeColor: '#ffffff',
                            strokeWidth: 2
                        }
                    })

                    return acc
                }, [])
            },
            normalizeQualityLevel(level) {
                const validLevels = ['I类', 'II类', 'III类', 'IV类', 'V类', '劣V类', '无质量等级']
                const normalized = (level || '').trim()
                if (validLevels.includes(normalized)) {
                    return normalized
                }
                return '无质量等级'
            },
            /**
             * 渲染单项指标图层
             */
            renderSingleMetricLayer(mapData) {
                // 清除现有标记
                if (this.mapInstance && this.mapInstance.markerLayer) {
                    this.mapInstance.markerLayer.clearMarkers()
                }

                // 添加新标记
                const layer = this.mapInstance.markerLayer
                const features = layer.addMarkers(mapData)

                // 自适应视图
                if (features && features.length > 0) {
                    const extents = features
                        .map(f => f.getGeometry().getExtent())
                        .filter(e => Array.isArray(e))
                    let bbox = extents[0]
                    for (let i = 1; i < extents.length; i++) {
                        bbox = [
                            Math.min(bbox[0], extents[i][0]),
                            Math.min(bbox[1], extents[i][1]),
                            Math.max(bbox[2], extents[i][2]),
                            Math.max(bbox[3], extents[i][3])
                        ]
                    }
                    this.mapInstance.view.fitExtent(bbox, { duration: 500, padding: 100 })
                }
            },
            /**
             * 显示单项指标图例
             */
            showSingleMetricLegend(indicator) {
                if (indicator && indicator.legend) {
                    this.legendTitle = indicator.legend.title || '单项指标'
                    this.legendUnit = indicator.legend.unit || ''
                    this.legendItems = indicator.legend.items || []
                } else {
                    // 通用水质等级图例
                    this.legendTitle = '水质类别'
                    this.legendUnit = ''
                    this.legendItems = [
                        { label: 'I类', color: '#22a6f2', range: '' },
                        { label: 'II类', color: '#28d6f7', range: '' },
                        { label: 'III类', color: '#b7e532', range: '' },
                        { label: 'IV类', color: '#f3d231', range: '' },
                        { label: 'V类', color: '#ff8c31', range: '' },
                        { label: '劣V类', color: '#ff2a1a', range: '' },
                        { label: '无质量等级', color: '#999999', range: '' }
                    ]
                }
                this.showLegend = true
            },
            handleMenuClicked(menuType) {
                console.log('菜单点击:', menuType)
                if (!['comprehensive','dashboard'].includes(menuType)) {
                    return;
                }
                // 切换前清空所有图层与图例
                this.clearAllLayersAndLegend();
                // 清除监测井分布勾选状态
                if (this.$refs.waterQualityMenu) {
                    this.$refs.waterQualityMenu.clearWellsCheckbox();
                }
                this.wellsVisible = false;

                if (menuType === 'comprehensive') {
                    // 加载综合水质分布实时数据
                    if (!this.mapInstance) return;
                    this.loadComprehensiveWaterQuality();
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
                    case '无质量等级': return '#999999';
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
                // 只有在勾选监测井分布时才清除其他按钮的高亮状态
                if (show) {
                    // 勾选切换前清空全部，并关闭图例
                    this.clearAllLayersAndLegend();
                    // 清除水质分布按钮的高亮状态
                    if (this.$refs.waterQualityMenu) {
                        this.$refs.waterQualityMenu.clearAllHighlights();
                    }
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
                } else {
                    // 取消勾选时清除监测井图层
                    this.hideWells();
                    // 关闭图例
                    this.showLegend = false;
                    this.legendItems = [];
                    this.legendTitle = '水质类别';
                    this.legendUnit = '';
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
    .loading-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }
    .loading-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #fff;
    }
    .loading-content .el-icon-loading {
        font-size: 40px;
        margin-bottom: 16px;
        animation: rotating 2s linear infinite;
    }
    .loading-content p {
        font-size: 16px;
        margin: 0;
    }
    @keyframes rotating {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
</style>