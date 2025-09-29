import { Feature } from 'ol';
import { LineString, Polygon, Circle as CircleGeom } from 'ol/geom';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Style, Stroke, Fill, Circle } from 'ol/style';
import { fromLonLat, toLonLat } from 'ol/proj';

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

    const style = new Style({
      stroke: new Stroke({
        color: (customStyle.stroke && customStyle.stroke.color) || defaultStyle.stroke.color,
        width: (customStyle.stroke && customStyle.stroke.width) || defaultStyle.stroke.width
      }),
      fill: type !== 'line' ? new Fill({
        color: (customStyle.fill && customStyle.fill.color) || defaultStyle.fill.color
      }) : undefined
    });

    return style;
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
