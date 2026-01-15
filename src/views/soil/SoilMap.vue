<template>
  <div class="soil-map">
    <div class="map-container">
      <div id="map" style="width: 100%; height: 100%;">
      </div>
      <!-- 工具栏 -->
      <div class="map-toolbar">
        <el-card class="toolbar-card">
          <el-tabs type="border-card">
            <el-tab-pane label="图层管理">
              <div class="layer-control">
                <div class="layer-title">专题图层</div>
                <div class="layer-btns">
                  <el-button 
                    :type="activeLayer === 'phos' ? 'primary' : 'default'"
                    @click="switchLayer('phos')"
                  >有效磷</el-button>
                  <el-button 
                    :type="activeLayer === 'org' ? 'primary' : 'default'"
                    @click="switchLayer('org')"
                  >有机质</el-button>
                </div>
                <div class="layer-title" style="margin-top: 16px;">底图切换</div>
                <div class="layer-btns">
                  <el-button 
                    :type="activeBaseMap === 'vec' ? 'primary' : 'default'"
                    @click="switchBaseMap('vec')"
                  >矢量</el-button>
                  <el-button 
                    :type="activeBaseMap === 'img' ? 'primary' : 'default'"
                    @click="switchBaseMap('img')"
                  >影像</el-button>
                  <el-button 
                    :type="activeBaseMap === 'ter' ? 'primary' : 'default'"
                    @click="switchBaseMap('ter')"
                  >地形</el-button>
                </div>
              </div>
            </el-tab-pane>
            <el-tab-pane label="绘图工具">
              <div class="layer-control">
                <div class="layer-title">绘制形状</div>
                <div class="layer-btns">
                  <el-button 
                    :type="activeDrawType === 'Circle' ? 'primary' : 'default'"
                    @click="activateDrawing('Circle')"
                  >圆形</el-button>
                  <el-button 
                    :type="activeDrawType === 'Polygon' ? 'primary' : 'default'"
                    @click="activateDrawing('Polygon')"
                  >多边形</el-button>
                </div>
                <div v-if="areaText" class="area-info">
                  {{ areaText }}
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </div>

      <!-- 查询结果弹窗 -->
      <el-dialog
        title="空间查询结果"
        :visible.sync="dialogVisible"
        width="90%"
        :before-close="handleClose">
        <!-- 过滤器区域 -->
        <div class="filter-section">
          <el-form :inline="true" size="small">
            <el-form-item label="pH值过滤">
              <el-input-number 
                v-model="phFilter.min" 
                :precision="2" 
                :step="0.1" 
                placeholder="最小值"
                :min="0"
                :controls="false"
                style="width: 120px;"
              />
              <span class="range-separator">-</span>
              <el-input-number 
                v-model="phFilter.max" 
                :precision="2" 
                :step="0.1" 
                placeholder="最大值"
                :min="0"
                :controls="false"
                style="width: 120px;"
              />
              <el-button type="primary" size="small" @click="handleFilter" style="margin-left: 10px;">过滤</el-button>
              <el-button size="small" @click="resetFilter">重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <el-table
          v-loading="tableLoading"
          :data="filteredResults"
          style="width: 100%"
          max-height="600">
          <!-- 基本信息 -->
          <el-table-column label="基本信息" align="center">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="provinceName" label="省份" width="120" />
            <el-table-column prop="cityName" label="城市" width="120" />
            <el-table-column prop="countyName" label="县区" width="120" />
            <el-table-column prop="townName" label="乡镇" width="120" />
          </el-table-column>

          <!-- 土壤分类信息 -->
          <el-table-column label="土壤分类" align="center">
            <el-table-column prop="provinceSoilCode" label="省级土壤编码" width="120" />
            <el-table-column prop="provinceSoilName" label="省级土壤名称" width="120" />
            <el-table-column prop="provinceSoilTypeName" label="省级土壤类型" width="120" />
            <el-table-column prop="provinceSubSoilName" label="省级亚类土壤" width="120" />
            <el-table-column prop="provinceSoilAttrName" label="土壤属性名称" width="120" />
            <el-table-column prop="provinceSoilBreedName" label="土壤种类名称" width="120" />
            <el-table-column prop="countySoilCode" label="县级土壤编码" width="120" />
          </el-table-column>

          <!-- pH值相关 -->
          <el-table-column label="pH值相关" align="center">
            <el-table-column prop="ph16" label="pH值" width="120" />
            <el-table-column prop="change8208" label="pH变化(1982-2008)" width="150" />
            <el-table-column prop="change0816" label="pH变化(2008-2016)" width="150" />
            <el-table-column prop="phChange8216" label="pH变化(1982-2016)" width="150" />
          </el-table-column>

          <!-- 土壤养分 -->
          <el-table-column label="土壤养分" align="center">
            <el-table-column prop="organicMatter" label="有机质含量" width="120" />
            <el-table-column prop="totalNitrogen" label="全氮" width="120" />
            <el-table-column prop="alkalineNitrogen" label="碱解氮" width="120" />
            <el-table-column prop="availablePhosphorus" label="有效磷" width="120" />
            <el-table-column prop="availablePotassium" label="有效钾" width="120" />
            <el-table-column prop="totalPhosphorus" label="全磷" width="120" />
            <el-table-column prop="slowReleasePotassium" label="缓效钾" width="120" />
          </el-table-column>

          <!-- 土壤物理性质 -->
          <el-table-column label="土壤物理性质" align="center">
            <el-table-column prop="ploughLayerThickness" label="耕层厚度" width="120" />
            <el-table-column prop="barrierLayerThickness" label="障碍层厚度" width="120" />
            <el-table-column prop="siltContent" label="粉粒含量" width="120" />
            <el-table-column prop="clayContent" label="粘粒含量" width="120" />
            <el-table-column prop="sandContent" label="砂粒含量" width="120" />
            <el-table-column prop="bulkDensity" label="容重" width="120" />
            <el-table-column prop="density" label="密度" width="120" />
          </el-table-column>

          <!-- 地形信息 -->
          <el-table-column label="地形信息" align="center">
            <el-table-column prop="slope" label="坡度" width="120" />
            <el-table-column prop="aspect" label="坡向" width="120" />
            <el-table-column prop="elevation" label="海拔" width="120" />
            <el-table-column prop="landform" label="地貌" width="120" />
            <el-table-column prop="elevationZone" label="海拔分区" width="120" />
          </el-table-column>

          <!-- 气候信息 -->
          <el-table-column label="气候信息" align="center">
            <el-table-column prop="annualTemperature" label="年均温" width="120" />
            <el-table-column prop="annualPrecipitation" label="年降水量" width="120" />
            <el-table-column prop="extremeLowTemp" label="极端低温" width="120" />
            <el-table-column prop="climateZone" label="气候区" width="120" />
            <el-table-column prop="rainPh" label="降雨pH" width="120" />
          </el-table-column>

          <!-- 其他属性 -->
          <el-table-column label="其他属性" align="center">
            <el-table-column prop="cec" label="阳离子交换量" width="150" />
            <el-table-column prop="exchangeableCalcium" label="交换性钙" width="120" />
            <el-table-column prop="exchangeableMagnesium" label="交换性镁" width="120" />
            <el-table-column prop="internationalTexture" label="国际质地" width="120" />
            <el-table-column prop="ploughLayerSalt" label="耕层含盐量" width="120" />
            <el-table-column prop="irrigationCondition" label="灌溉条件" width="120" />
            <el-table-column prop="drainageCapacity" label="排水能力" width="120" />
            <el-table-column prop="maturity" label="成熟度" width="120" />
            <el-table-column prop="unitArea" label="单位面积" width="120" />
            <el-table-column prop="farea" label="面积" width="120" />
          </el-table-column>
        </el-table>
        <div class="statistics-info" style="margin-top: 16px; padding: 16px; background-color: #f5f7fa; border-radius: 4px;">
          <span>总面积: {{ totalArea }} 平方公里</span>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import 'ol/ol.css'
import { Map, View } from 'ol'
import TileLayer from 'ol/layer/Tile'
import XYZ from 'ol/source/XYZ'
import TileWMS from 'ol/source/TileWMS'
import { fromLonLat } from 'ol/proj'
import Draw from 'ol/interaction/Draw'
import VectorSource from 'ol/source/Vector'
import VectorLayer from 'ol/layer/Vector'
import { getArea } from 'ol/sphere'
import { Circle, Polygon } from 'ol/geom'
import { Style, Fill, Stroke } from 'ol/style'
import WKT from 'ol/format/WKT'
import { getSoilPartByGeometry } from '@/api/soilPart'

export default {
  name: 'SoilMap',
  data() {
    return {
      map: null,
      activeLayer: 'phos',
      activeBaseMap: 'vec',
      currentBaseLayers: [],
      wmsLayerPhos: null,
      wmsLayerOrg: null,
      tdtKey: '9254b8157f0ff0a6331196e4afc27cb6',
      draw: null,
      vectorSource: null,
      vectorLayer: null,
      activeDrawType: '',
      areaText: '',
      dialogVisible: false,
      queryResults: [],
      tableLoading: false,
      wktFormat: new WKT(),
      phFilter: {
        min: undefined,
        max: undefined
      }
    }
  },
  computed: {
    // 过滤后的结果
    filteredResults() {
      let results = [...this.queryResults]
      
      // 应用pH值过滤
      if (this.phFilter.min !== undefined && this.phFilter.min !== null) {
        results = results.filter(item => item.ph16 >= this.phFilter.min)
      }
      if (this.phFilter.max !== undefined && this.phFilter.max !== null) {
        results = results.filter(item => item.ph16 <= this.phFilter.max)
      }
      
      return results
    },
    // 计算总面积
    totalArea() {
      return this.filteredResults.reduce((sum, item) => {
        return sum + (item.farea || 0)
      }, 0).toFixed(2)
    }
  },
  mounted() {
    this.initMap()
  },
  methods: {
    initMap() {
      // 创建矢量图层用于绘图
      this.vectorSource = new VectorSource()
      this.vectorLayer = new VectorLayer({
        source: this.vectorSource,
        style: new Style({
          fill: new Fill({
            color: 'rgba(255, 255, 255, 0.2)'
          }),
          stroke: new Stroke({
            color: '#ffcc33',
            width: 2
          })
        })
      })

      // 创建底图图层
      const tdtVecLayer = new TileLayer({
        title: '天地图矢量图层',
        source: new XYZ({
          url: `http://t0.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=${this.tdtKey}`,
          wrapX: false
        })
      })
      const tdtCvaLayer = new TileLayer({
        title: '天地图矢量注记',
        source: new XYZ({
          url: `http://t0.tianditu.com/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=${this.tdtKey}`,
          wrapX: false
        })
      })

       // 创建WMS图层 - trsh_part（土壤数据）
      this.wmsLayerPhos = new TileLayer({
        source: new TileWMS({
          url: 'http://localhost:8080/geoserver/soil_data/wms',
          params: {
            'LAYERS': 'soil_data:trsh_part',  // 添加工作空间前缀
            'TILED': true,
            'VERSION': '1.1.1',  // 指定WMS版本
            'FORMAT': 'image/png',  // 明确指定输出格式
            'TRANSPARENT': true  // 支持透明背景
          },
          serverType: 'geoserver',
          // 添加过渡效果，提升用户体验
          transition: 0
        }),
        opacity: 0.8,  // 可调整透明度 0-1
        visible: true,  // 控制初始可见性
        zIndex: 10  // 控制图层叠加顺序
      })

      // 创建WMS图层 - xianqu（行政区数据）
      this.wmsLayerOrg = new TileLayer({
        source: new TileWMS({
          url: 'http://localhost:8080/geoserver/soil_data/wms',
          params: {
            'LAYERS': 'soil_data:xianqu',  // 添加工作空间前缀
            'TILED': true,
            'VERSION': '1.1.1',
            'FORMAT': 'image/png',
            'TRANSPARENT': true
          },
          serverType: 'geoserver',
          transition: 0
        }),
        opacity: 0.6,
        visible: true,
        zIndex: 11  // 行政区图层在上层
      })


      // 初始化地图
      this.map = new Map({
        target: 'map',
        layers: [tdtVecLayer, tdtCvaLayer, this.wmsLayerPhos, this.vectorLayer],
        view: new View({
          center: fromLonLat([118.306239, 26.075302]),
          zoom: 7
        })
      })

      this.currentBaseLayers = [tdtVecLayer, tdtCvaLayer]
    },

    // 切换专题图层
    switchLayer(type) {
      this.activeLayer = type
      if (type === 'phos') {
        this.map.getLayers().setAt(2, this.wmsLayerPhos)
      } else {
        this.map.getLayers().setAt(2, this.wmsLayerOrg)
      }
    },

    // 切换底图
    switchBaseMap(type) {
      this.activeBaseMap = type
      // 移除当前底图和注记
      this.map.removeLayer(this.currentBaseLayers[0])
      this.map.removeLayer(this.currentBaseLayers[1])

      let newBaseLayers = []
      if (type === 'vec') {
        newBaseLayers = [
          new TileLayer({
            source: new XYZ({
              url: `http://t0.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=${this.tdtKey}`,
              wrapX: false
            })
          }),
          new TileLayer({
            source: new XYZ({
              url: `http://t0.tianditu.com/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=${this.tdtKey}`,
              wrapX: false
            })
          })
        ]
      } else if (type === 'img') {
        newBaseLayers = [
          new TileLayer({
            source: new XYZ({
              url: `http://t0.tianditu.com/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=${this.tdtKey}`,
              wrapX: false
            })
          }),
          new TileLayer({
            source: new XYZ({
              url: `http://t0.tianditu.com/DataServer?T=cia_w&x={x}&y={y}&l={z}&tk=${this.tdtKey}`,
              wrapX: false
            })
          })
        ]
      } else if (type === 'ter') {
        newBaseLayers = [
          new TileLayer({
            source: new XYZ({
              url: `http://t0.tianditu.com/DataServer?T=ter_w&x={x}&y={y}&l={z}&tk=${this.tdtKey}`,
              wrapX: false
            })
          }),
          new TileLayer({
            source: new XYZ({
              url: `http://t0.tianditu.com/DataServer?T=cta_w&x={x}&y={y}&l={z}&tk=${this.tdtKey}`,
              wrapX: false
            })
          })
        ]
      }

      // 添加新底图
      this.map.getLayers().insertAt(0, newBaseLayers[0])
      this.map.getLayers().insertAt(1, newBaseLayers[1])
      this.currentBaseLayers = newBaseLayers
    },


    // 激活绘图工具
    activateDrawing(type) {
      // 如果已经有绘图工具，先移除
      if (this.draw) {
        this.map.removeInteraction(this.draw)
      }
      
      // 清除之前绘制的图形
      this.vectorSource.clear()
      this.areaText = ''
      
      // 如果点击的是当前激活的工具，则取消激活
      if (this.activeDrawType === type) {
        this.activeDrawType = ''
        return
      }
      
      this.activeDrawType = type
      
      // 创建绘图工具
      this.draw = new Draw({
        source: this.vectorSource,
        type: type
      })
      
      // 添加绘图开始事件监听，清除之前的图形
      this.draw.on('drawstart', () => {
        this.vectorSource.clear()
        this.areaText = ''
      })
      
      // 添加绘图完成事件监听
      this.draw.on('drawend', async (event) => {
        const feature = event.feature
        const geometry = feature.getGeometry()
        let area = 0
        
        if (type === 'Circle') {
          area = Math.PI * Math.pow(geometry.getRadius(), 2)
        } else {
          area = getArea(geometry)
        }
        
        // 转换为平方公里并保留两位小数
        const areaInKm2 = (area / 1000000).toFixed(2)
        this.areaText = `面积: ${areaInKm2} 平方公里`

        // 转换为WKT格式并查询
        try {
          let wktGeometry
          if (type === 'Circle') {
            // 将圆形转换为32边形
            const polygon = this.circleToPolygon(geometry, 32)
            wktGeometry = this.wktFormat.writeGeometry(polygon)
          } else {
            wktGeometry = this.wktFormat.writeGeometry(geometry)
          }
          await this.querySoilByGeometry(wktGeometry)
        } catch (error) {
          console.error('空间查询失败:', error)
          this.$message.error('空间查询失败，请重试')
        }
      })
      
      this.map.addInteraction(this.draw)
    },

    // 将圆形转换为多边形
    circleToPolygon(circle, sides) {
      const center = circle.getCenter()
      const radius = circle.getRadius()
      const coordinates = []

      for (let i = 0; i < sides; i++) {
        const angle = (2 * Math.PI * i) / sides
        const x = center[0] + radius * Math.cos(angle)
        const y = center[1] + radius * Math.sin(angle)
        coordinates.push([x, y])
      }
      // 闭合多边形
      coordinates.push(coordinates[0])

      return new Polygon([coordinates])
    },

    // 空间范围查询
    async querySoilByGeometry(wkt) {
      this.tableLoading = true
      this.dialogVisible = true
      try {
        const response = await getSoilPartByGeometry(wkt)
        if (response.success) {
          this.queryResults = response.data || []
        } else {
          this.$message.error(response.message || '查询失败')
        }
      } catch (error) {
        console.error('查询失败:', error)
        this.$message.error('查询失败，请重试')
      } finally {
        this.tableLoading = false
      }
    },

    // 处理过滤
    handleFilter() {
      // 验证输入值
      if (this.phFilter.min !== undefined && this.phFilter.max !== undefined && this.phFilter.min > this.phFilter.max) {
        this.$message.warning('最小值不能大于最大值')
        return
      }
    },

    // 重置过滤
    resetFilter() {
      this.phFilter.min = undefined
      this.phFilter.max = undefined
    },

    // 关闭弹窗时重置过滤条件
    handleClose(done) {
      this.resetFilter()
      done()
    }
  }
}
</script>

<style scoped>
.soil-map {
  width: 100%;
  height: 100%;
  position: relative;
}

.map-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.map-toolbar {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1000;
  width: 400px;
}

.toolbar-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 4px;
}

.layer-control {
  padding: 10px;
}

.layer-title {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 10px;
}

.layer-btns {
  display: flex;
  gap: 10px;
}


:deep(.el-tabs--border-card) {
  background: transparent;
  border: none;
}

:deep(.el-tabs__header) {
  background-color: transparent;
  border-bottom: none;
}

:deep(.el-tabs__nav) {
  border: none;
}

:deep(.el-tab-pane) {
  background: white;
  border-radius: 0 0 4px 4px;
}

.area-info {
  margin-top: 16px;
  padding: 8px;
  background-color: #f5f7fa;
  border-radius: 4px;
  font-size: 14px;
  color: #606266;
}

.filter-section {
  margin-bottom: 16px;
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.range-separator {
  margin: 0 8px;
}

:deep(.el-form-item) {
  margin-bottom: 0;
}

:deep(.el-dialog__body) {
  padding: 10px 20px;
}

:deep(.el-table) {
  margin-top: 10px;
}

.statistics-info {
  font-size: 14px;
  color: #606266;
  font-weight: bold;
}
</style> 