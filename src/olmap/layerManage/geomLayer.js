import { Feature } from 'ol';
import { LineString, Polygon, Circle as CircleGeom, Point } from 'ol/geom';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Style, Stroke, Fill, Circle } from 'ol/style';
import { fromLonLat, toLonLat } from 'ol/proj';
import { GeoJSON } from 'ol/format';

class GeomLayer {
  constructor(mapInstance, options) {
    this.map = mapInstance;
    this.options = {
      // 默认样式
      defaultStyle: {
        stroke: {
          color: '#FF0000',
          width: 2
        },
        fill: {
          color: 'rgba(255, 0, 0, 0.2)'
        }
      },
      // 是否可编辑
      editable: false
    };
    this.options = Object.assign(this.options, options);

    // 创建矢量图层
    this.vectorSource = new VectorSource();
    this.vectorLayer = new VectorLayer({
      source: this.vectorSource,
      style: this._createStyle.bind(this),
      zIndex: 5
    });

    // 将图层添加到地图
    this.map.addLayer(this.vectorLayer);
  }

  /**
   * 绘制线
   * @param {Array} coordinates 坐标数组 [[经度, 纬度], [经度, 纬度], ...]
   * @param {Object} style 自定义样式
   */
  drawLine(coordinates, style = {}) {
    const lineCoords = coordinates.map(coord => fromLonLat(coord));
    const feature = new Feature({
      geometry: new LineString(lineCoords),
      type: 'line',
      style: style
    });
    this.vectorSource.addFeature(feature);
    return feature;
  }

  /**
   * 绘制多边形
   * @param {Array} coordinates 坐标数组 [[经度, 纬度], [经度, 纬度], ...]
   * @param {Object} style 自定义样式
   */
  drawPolygon(coordinates, style = {}) {
    const polygonCoords = coordinates.map(coord => fromLonLat(coord));
    // 确保多边形闭合
    if (polygonCoords[0][0] !== polygonCoords[polygonCoords.length - 1][0] ||
        polygonCoords[0][1] !== polygonCoords[polygonCoords.length - 1][1]) {
      polygonCoords.push(polygonCoords[0]);
    }
    const feature = new Feature({
      geometry: new Polygon([polygonCoords]),
      type: 'polygon',
      style: style
    });
    this.vectorSource.addFeature(feature);
    return feature;
  }

  /**
   * 绘制圆
   * @param {Array} center 圆心坐标 [经度, 纬度]
   * @param {Number} radius 半径（米）
   * @param {Object} style 自定义样式
   */
  drawCircle(center, radius, style = {}) {
    const circleCenter = fromLonLat(center);
    const feature = new Feature({
      geometry: new CircleGeom(circleCenter, radius),
      type: 'circle',
      style: style
    });
    this.vectorSource.addFeature(feature);
    return feature;
  }

  /**
   * 创建样式
   * @private
   */
  _createStyle(feature) {
    const type = feature.get('type');
    const customStyle = feature.get('style') || {};
    const defaultStyle = this.options.defaultStyle;

    const styleConfig = {
      stroke: new Stroke({
        color: (customStyle.stroke && customStyle.stroke.color) || defaultStyle.stroke.color,
        width: (customStyle.stroke && customStyle.stroke.width) || defaultStyle.stroke.width
      })
    };

    // 添加填充样式（线和点不需要填充）
    if (type !== 'line' && type !== 'point') {
      styleConfig.fill = new Fill({
        color: (customStyle.fill && customStyle.fill.color) || defaultStyle.fill.color
      });
    }

    // 添加点样式
    if (type === 'point') {
      styleConfig.image = new Circle({
        radius: (customStyle.point && customStyle.point.radius) || 5,
        fill: new Fill({
          color: (customStyle.point && customStyle.point.fillColor) || defaultStyle.stroke.color
        }),
        stroke: new Stroke({
          color: (customStyle.point && customStyle.point.strokeColor) || '#FFFFFF',
          width: (customStyle.point && customStyle.point.strokeWidth) || 2
        })
      });
    }

    return new Style(styleConfig);
  }

  /**
   * 清除所有图形
   */
  clearGeoms() {
    this.vectorSource.clear();
  }

  /**
   * 移除指定图形
   * @param {Feature} feature 要移除的图形要素
   */
  removeGeom(feature) {
    this.vectorSource.removeFeature(feature);
  }

  /**
   * 更新图形样式
   * @param {Feature} feature 要更新的图形要素
   * @param {Object} style 新的样式
   */
  updateStyle(feature, style) {
    feature.set('style', style);
    feature.changed();
  }

  /**
   * 获取所有图形
   * @returns {Array} 图形要素数组
   */
  getGeoms() {
    return this.vectorSource.getFeatures();
  }

  /**
   * 绘制GeoJSON数据
   * @param {Object|String} geojsonData GeoJSON对象或JSON字符串
   * @param {Object} options 配置选项
   * @param {Object} options.style 全局样式配置
   * @param {Function} options.styleFunction 自定义样式函数
   * @param {Boolean} options.fit 是否定位到图层，默认false
   * @returns {Array} 添加的要素数组
   */
  drawGeoJSON(geojsonData, options = {}) {
    const {
      style = {},
      styleFunction = null,
      fit = false, // 新增参数，是否定位到图层
    } = options;

    // 解析GeoJSON数据
    let geojson;
    if (typeof geojsonData === 'string') {
      try {
        geojson = JSON.parse(geojsonData);
      } catch (error) {
        console.error('GeoJSON解析失败:', error);
        return [];
      }
    } else {
      geojson = geojsonData;
    }

    // 验证GeoJSON格式
    if (!geojson || !geojson.type || !geojson.features) {
      console.error('无效的GeoJSON格式');
      return [];
    }

    // 创建GeoJSON格式解析器
    const geoJSONFormat = new GeoJSON();
    
    // 解析要素
    const features = geoJSONFormat.readFeatures(geojson, {
      dataProjection: 'EPSG:4326',    // GeoJSON数据源坐标系（WGS84）
      featureProjection: 'EPSG:3857'   // 目标坐标系（Web墨卡托）
    });

    // 添加样式和属性
    const addedFeatures = [];
    features.forEach(feature => {
      // 设置默认类型
      const geometry = feature.getGeometry();
      let geomType = 'unknown';
      if (geometry instanceof Point) {
        geomType = 'point';
      } else if (geometry instanceof LineString) {
        geomType = 'line';
      } else if (geometry instanceof Polygon) {
        geomType = 'polygon';
      } else if (geometry instanceof CircleGeom) {
        geomType = 'circle';
      }
      
      feature.set('type', geomType);
      feature.set('style', style);
      
      // 如果有自定义样式函数，应用它
      if (styleFunction && typeof styleFunction === 'function') {
        const customStyle = styleFunction(feature);
        if (customStyle) {
          feature.set('style', customStyle);
        }
      }

      this.vectorSource.addFeature(feature);
      addedFeatures.push(feature);
    });

    // 新增：根据fit参数决定是否定位到图层
    if (fit && addedFeatures.length > 0 && this.map) {
      // 计算所有要素的范围
      const extent = this.vectorSource.getExtent();
      if (extent && extent[0] !== Infinity && extent[2] !== -Infinity) {
        this.map.getView().fit(extent, { padding: [50, 50, 50, 50], duration: 500, maxZoom: 18 });
      }
    }

    return addedFeatures;
  }

  /**
   * 导出当前图层为GeoJSON格式
   * @param {Object} options 导出选项
   * @param {String} options.projection 投影坐标系，默认'EPSG:4326'
   * @param {Array} options.properties 要包含的属性字段
   * @returns {Object} GeoJSON对象
   */
  exportToGeoJSON(options = {}) {
    const {
      projection = 'EPSG:4326',
      properties = []
    } = options;

    const geoJSONFormat = new GeoJSON();
    const features = this.vectorSource.getFeatures();
    
    // 过滤属性
    const filteredFeatures = features.map(feature => {
      const clonedFeature = feature.clone();
      
      if (properties.length > 0) {
        const originalProperties = clonedFeature.getProperties();
        const filteredProperties = {};
        
        properties.forEach(prop => {
          if (originalProperties.hasOwnProperty(prop)) {
            filteredProperties[prop] = originalProperties[prop];
          }
        });
        
        clonedFeature.setProperties(filteredProperties);
      }
      
      return clonedFeature;
    });

    return geoJSONFormat.writeFeaturesObject(filteredFeatures, {
      featureProjection: 'EPSG:3857',
      dataProjection: projection
    });
  }

  /**
   * 销毁图层
   */
  destroy() {
    // 移除图层
    this.map.removeLayer(this.vectorLayer);
    // 清除数据源
    this.vectorSource.clear();
  }
}

export default GeomLayer;
