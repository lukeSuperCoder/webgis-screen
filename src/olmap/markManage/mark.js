import { Feature } from 'ol';
import { Point, LineString, Polygon, Circle as CircleGeom } from 'ol/geom';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Style, Stroke, Fill, Circle } from 'ol/style';
import { fromLonLat, toLonLat } from 'ol/proj';
import { Draw, Modify, Snap } from 'ol/interaction';
import { Overlay } from 'ol';

class MapMark {
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
      // 是否显示测量信息
      showMeasure: true,
      // 测量信息样式
      measureStyle: {
        font: '14px Microsoft YaHei',
        fill: new Fill({
          color: '#000000'
        }),
        stroke: new Stroke({
          color: '#FFFFFF',
          width: 2
        })
      }
    };
    this.options = Object.assign(this.options, options);

    // 创建矢量图层
    this.vectorSource = new VectorSource();
    this.vectorLayer = new VectorLayer({
      source: this.vectorSource,
      style: this._createStyle.bind(this),
      zIndex: 5
    });

    // 创建测量信息覆盖层
    this.measureOverlay = new Overlay({
      element: document.createElement('div'),
      positioning: 'bottom-center',
      offset: [0, -10]
    });

    // 将图层和覆盖层添加到地图
    this.map.addLayer(this.vectorLayer);
    this.map.addOverlay(this.measureOverlay);

    // 初始化交互
    this._initInteractions();

    // 监听地图视图变化
    this._handleViewChange();
  }

  /**
   * 处理地图视图变化
   * @private
   */
  _handleViewChange() {
    // 监听地图视图变化
    this.map.getView().on('change:resolution', () => {
      // 更新地图大小
      this.map.updateSize();
    });
  }

  /**
   * 初始化交互
   * @private
   */
  _initInteractions() {
    // 创建修改交互
    this.modify = new Modify({
      source: this.vectorSource
    });
    this.map.addInteraction(this.modify);

    // 创建吸附交互
    this.snap = new Snap({
      source: this.vectorSource
    });
    this.map.addInteraction(this.snap);

    // 监听修改事件
    this.modify.on('modifyend', (evt) => {
      const feature = evt.features.getArray()[0];
      this._triggerCallback('modifyend', feature);
    });
  }

  /**
   * 开始绘制点
   * @param {Function} callback 绘制完成回调
   */
  startDrawPoint(callback) {
    this._startDraw('Point', callback);
  }

  /**
   * 开始绘制线
   * @param {Function} callback 绘制完成回调
   */
  startDrawLine(callback) {
    this._startDraw('LineString', callback);
  }

  /**
   * 开始绘制多边形
   * @param {Function} callback 绘制完成回调
   */
  startDrawPolygon(callback) {
    this._startDraw('Polygon', callback);
  }

  /**
   * 开始绘制圆
   * @param {Function} callback 绘制完成回调
   */
  startDrawCircle(callback) {
    this._startDraw('Circle', callback);
  }

  /**
   * 开始绘制
   * @private
   */
  _startDraw(type, callback) {
    // 移除之前的绘制交互
    if (this.draw) {
      this.map.removeInteraction(this.draw);
    }

    // 创建新的绘制交互
    this.draw = new Draw({
      source: this.vectorSource,
      type: type,
      style: this._createStyle()
    });

    // 添加绘制交互
    this.map.addInteraction(this.draw);

    // 监听绘制完成事件
    this.draw.on('drawend', (evt) => {
      const feature = evt.feature;
      feature.set('type', type.toLowerCase());
      this._triggerCallback('drawend', feature);
      if (callback) {
        callback(feature);
      }
    });
  }

  /**
   * 创建样式
   * @private
   */
  _createStyle(feature) {
    const defaultStyle = this.options.defaultStyle;
    return new Style({
      stroke: new Stroke({
        color: defaultStyle.stroke.color,
        width: defaultStyle.stroke.width
      }),
      fill: new Fill({
        color: defaultStyle.fill.color
      })
    });
  }

  /**
   * 触发回调
   * @private
   */
  _triggerCallback(event, feature) {
    if (this.options[event]) {
      this.options[event](feature);
    }
  }

  /**
   * 清除所有图形
   */
  clearMarks() {
    this.vectorSource.clear();
  }

  /**
   * 移除指定图形
   * @param {Feature} feature 要移除的图形要素
   */
  removeMark(feature) {
    this.vectorSource.removeFeature(feature);
  }

  /**
   * 获取所有图形
   * @returns {Array} 图形要素数组
   */
  getMarks() {
    return this.vectorSource.getFeatures();
  }

  /**
   * 销毁
   */
  destroy() {
    if (this.draw) {
      this.map.removeInteraction(this.draw);
    }
    this.map.removeInteraction(this.modify);
    this.map.removeInteraction(this.snap);
    this.map.removeLayer(this.vectorLayer);
    this.map.removeOverlay(this.measureOverlay);
  }
}


export default MapMark;
