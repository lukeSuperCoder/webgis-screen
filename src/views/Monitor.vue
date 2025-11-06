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
             * 加载综合水质分布数据
             */
            async loadComprehensiveWaterQuality() {
                try {
                    this.isLoadingSampleData = true

                    // 1. 先获取监测井列表
                    if (this.wellData.length === 0) {
                        await this.loadWellData()
                    }

                    if (this.wellData.length === 0) {
                        this.$message.warning('暂无监测井数据')
                        return
                    }

                    // 2. 批量查询所有监测井的水质数据（使用列表接口）
                    const results = await this.batchGetSampleData(this.queryDate)
                    
                    // 3. 将水质数据映射到 sampleData
                    this.sampleData = {}
                    results.forEach(result => {
                        if (result.data) {
                            this.sampleData[result.data.monitoringWellCode] = result.data
                        }
                    })

                    // 4. 生成地图标记数据
                    const mapData = this.generateComprehensiveMapData()

                    // 5. 渲染到地图
                    this.renderComprehensiveLayer(mapData)

                    // 6. 显示图例
                    this.showComprehensiveLegend()


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
                    { label: '未知', color: '#999999', range: '' }
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
                    const wellCode = well.wellCode || well.well_code;
                    
                    return {
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
                // 清除监测井分布勾选状态
                if (this.$refs.waterQualityMenu) {
                    this.$refs.waterQualityMenu.clearWellsCheckbox();
                }
                this.wellsVisible = false;
                if (!this.mapInstance) return;
                
                // 调用实时API加载单项水质分布
                if (parameter === 'ph') {
                    this.loadSingleMetricData('pH')
                } else if (parameter === 'phosphorus') {
                    this.loadSingleMetricData('总磷')
                }
            },
            /**
             * 加载单项水质分布数据
             * @param {string} metricName - 指标名称 (pH, 总磷等)
             */
            async loadSingleMetricData(metricName) {
                try {
                    this.isLoadingSampleData = true

                    // 1. 先获取监测井列表
                    if (this.wellData.length === 0) {
                        await this.loadWellData()
                    }

                    // 2. 提取监测井编码
                    const wellCodes = this.wellData.map(well => well.wellCode).filter(code => code)

                    if (wellCodes.length === 0) {
                        this.$message.warning('暂无监测井数据')
                        return
                    }

                    // 3. 批量查询所有监测井的水质数据（使用列表接口）
                    const results = await this.batchGetSampleData(this.queryDate)

                    // 4. 提取指标数据
                    const metricData = this.extractMetricData(results, metricName)

                    // 5. 渲染到地图
                    this.renderSingleMetricLayer(metricData, metricName)

                    // 6. 显示图例
                    this.showSingleMetricLegend(metricName)


                } catch (error) {
                    console.error(`加载${metricName}数据失败:`, error)
                    this.$message.error(`加载${metricName}数据失败，请重试`)
                } finally {
                    this.isLoadingSampleData = false
                }
            },
            /**
             * 提取指标数据
             */
            extractMetricData(results, metricName) {
                // 指标名称映射（用于匹配接口返回的metricName）
                const metricNameMap = {
                    'pH': 'pH',
                    '总磷': '总磷',
                }

                // 指标编码映射（用于匹配接口返回的metricCode）
                const metricCodeMap = {
                    'pH': 'G0005',  // pH的metricCode是G0005
                    '总磷': 'G0012',  // 总磷暂时用G0012（硼）来替代
                }

                const targetMetricName = metricNameMap[metricName] || metricName
                const targetMetricCode = metricCodeMap[metricName]
                const mapData = []

                // 将水质数据映射到 sampleData（类似综合水质分布）
                const sampleDataMap = {}
                results.forEach(result => {
                    if (result.data) {
                        sampleDataMap[result.data.monitoringWellCode] = result.data
                    }
                })

                // 遍历监测井数据，只显示有对应指标数据的监测井
                this.wellData.forEach(well => {
                    const sampleData = sampleDataMap[well.wellCode]
                    
                    // 只显示有水质数据的监测井
                    if (!sampleData) {
                        return
                    }

                    // 查找指标值：优先通过metricCode匹配，如果找不到则通过metricName匹配
                    let metric = null
                    if (targetMetricCode && sampleData.metrics) {
                        metric = sampleData.metrics.find(m => m.metricCode === targetMetricCode)
                    }
                    
                    // 如果通过metricCode没找到，尝试通过metricName匹配
                    if (!metric && sampleData.metrics) {
                        metric = sampleData.metrics.find(m => 
                            m.metricName && m.metricName.includes(targetMetricName)
                        )
                    }

                    if (!metric || !metric.value) {
                        // 没有该指标数据，跳过
                        return
                    }

                    // 根据指标值判断颜色等级
                    const qualityLevel = this.getQualityLevelByValue(metricName, metric.value)
                    const color = this.getClassColor(qualityLevel)

                    mapData.push({
                        coordinates: well.coordinates,
                        properties: {
                            popupType: 'singleItem',
                            parameter: metricName.toLowerCase(),
                            wellCode: well.wellCode,
                            metricName: metricName,
                            value: metric.value,
                            unit: metric.unit || '',
                            qualityLevel: qualityLevel,
                            samplingTime: sampleData.samplingTime,
                            color: color
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
             * 根据指标值判断水质等级
             * @param {string} metricName - 指标名称 (pH, 总磷等)
             * @param {string|number} value - 指标值
             * @returns {string} - 水质等级
             */
            getQualityLevelByValue(metricName, value) {
                // 处理值为字符串的情况（如 "ND" 表示未检出）
                if (typeof value === 'string' && (value.toUpperCase() === 'ND' || value.trim() === '')) {
                    return '未知'
                }

                const numValue = parseFloat(value)
                if (isNaN(numValue)) {
                    return '未知'
                }

                if (metricName === 'pH') {
                    // pH值判断：I类 (6 ≤ a ≤ 9), 劣V类 (a < 6 或 a > 9)
                    if (numValue >= 6 && numValue <= 9) {
                        return 'I类'
                    } else {
                        return '劣V类'
                    }
                } else if (metricName === '总磷') {
                    // 总磷值判断（单位：mg/L）
                    // I类 ≤ 0.02, II类 ≤ 0.10, III类 ≤ 0.20, IV类 ≤ 0.30, V类 ≤ 0.40, 劣V类 > 0.40
                    if (numValue <= 0.02) {
                        return 'I类'
                    } else if (numValue <= 0.10) {
                        return 'II类'
                    } else if (numValue <= 0.20) {
                        return 'III类'
                    } else if (numValue <= 0.30) {
                        return 'IV类'
                    } else if (numValue <= 0.40) {
                        return 'V类'
                    } else {
                        return '劣V类'
                    }
                }

                return '未知'
            },
            /**
             * 渲染单项指标图层
             */
            renderSingleMetricLayer(mapData, metricName) {
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
            showSingleMetricLegend(metricName) {
                // 根据指标类型设置图例
                if (metricName === 'pH') {
                    this.legendTitle = 'pH'
                    this.legendUnit = ''
                    this.legendItems = [
                        { label: 'I类', color: '#22a6f2', range: '(6 ≤ a ≤ 9)' },
                        { label: '劣V类', color: '#ff2a1a', range: '(a < 6 或 a > 9)' }
                    ]
                } else if (metricName === '总磷') {
                    this.legendTitle = '总磷'
                    this.legendUnit = '单位: mg/L'
                    this.legendItems = [
                        { label: 'I类', color: '#22a6f2', range: '≤ 0.02' },
                        { label: 'II类', color: '#28d6f7', range: '≤ 0.10' },
                        { label: 'III类', color: '#b7e532', range: '≤ 0.20' },
                        { label: 'IV类', color: '#f3d231', range: '≤ 0.30' },
                        { label: 'V类', color: '#ff8c31', range: '≤ 0.40' },
                        { label: '劣V类', color: '#ff2a1a', range: '> 0.40' }
                    ]
                } else {
                    // 通用水质等级图例
                    this.legendItems = [
                        { label: 'I类', color: '#22a6f2', range: '' },
                        { label: 'II类', color: '#28d6f7', range: '' },
                        { label: 'III类', color: '#b7e532', range: '' },
                        { label: 'IV类', color: '#f3d231', range: '' },
                        { label: 'V类', color: '#ff8c31', range: '' },
                        { label: '劣V类', color: '#ff2a1a', range: '' },
                        { label: '未知', color: '#999999', range: '' }
                    ]
                }
                this.showLegend = true
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
                // 清除监测井分布勾选状态
                if (this.$refs.waterQualityMenu) {
                    this.$refs.waterQualityMenu.clearWellsCheckbox();
                }
                this.wellsVisible = false;

                if (menuType === 'comprehensive') {
                    // 加载综合水质分布实时数据
                    if (!this.mapInstance) return;
                    this.loadComprehensiveWaterQuality();
                } else if (menuType === 'ph') {
                    // 加载pH值单项水质分布
                    if (!this.mapInstance) return;
                    this.loadSingleMetricData('pH');
                } else if (menuType === 'phosphorus') {
                    // 加载总磷值单项水质分布
                    if (!this.mapInstance) return;
                    this.loadSingleMetricData('总磷');
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
                // 只有在勾选监测井分布时才清除其他按钮的高亮状态
                if (show) {
                // 勾选切换前清空全部，并关闭图例
                this.clearAllLayersAndLegend();
                // 清除水质分布按钮的高亮状态
                if (this.$refs.waterQualityMenu) {
                    this.$refs.waterQualityMenu.clearAllHighlights();
                    }
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