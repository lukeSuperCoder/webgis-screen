import { Feature } from 'ol';
import { LineString, Polygon } from 'ol/geom';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Style, Stroke, Fill, Text } from 'ol/style';
import { Draw, Modify, Snap } from 'ol/interaction';
import { Overlay } from 'ol';
import { getLength, getArea } from 'ol/sphere';
import { transform, fromLonLat, toLonLat } from 'ol/proj';

class MapMeasure {
  constructor(mapInstance, options) {
    this.map = mapInstance;
    this.options = {
      // 测量工具样式
      style: {
        stroke: {
          color: '#4CAF50',
          width: 2,
          lineDash: [5, 5]
        },
        fill: {
          color: 'rgba(76, 175, 80, 0.2)'
        },
        text: {
          font: '12px Microsoft YaHei',
          fill: new Fill({
            color: '#000000'
          }),
          stroke: new Stroke({
            color: '#FFFFFF',
            width: 2
          })
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
      },
      // 坐标系统配置
      projection: {
        from: 'EPSG:3857', // 源坐标系
        to: 'EPSG:4326'    // 目标坐标系（WGS84）
      }
    };
    this.options = Object.assign(this.options, options);

    // 创建测量图层
    this.measureSource = new VectorSource();
    this.measureLayer = new VectorLayer({
      source: this.measureSource,
      style: this._createStyle.bind(this),
      zIndex: 6
    });

    // 创建测量信息覆盖层
    this.measureOverlay = new Overlay({
      element: document.createElement('div'),
      positioning: 'bottom-center',
      offset: [0, -10]
    });

    // 将图层和覆盖层添加到地图
    this.map.addLayer(this.measureLayer);
    this.map.addOverlay(this.measureOverlay);

    // 初始化交互
    this._initInteractions();
  }

  /**
   * 坐标转换（3857转4326）
   * @private
   */
  _transformCoordinates(coordinates) {
    if (Array.isArray(coordinates[0])) {
      return coordinates.map(coord => this._transformCoordinates(coord));
    }
    return transform(coordinates, this.options.projection.from, this.options.projection.to);
  }

  /**
   * 坐标转换（4326转3857）
   * @private
   */
  _transformCoordinatesBack(coordinates) {
    if (Array.isArray(coordinates[0])) {
      return coordinates.map(coord => this._transformCoordinatesBack(coord));
    }
    return transform(coordinates, this.options.projection.to, this.options.projection.from);
  }

  /**
   * 初始化交互
   * @private
   */
  _initInteractions() {
    // 创建修改交互
    this.modify = new Modify({
      source: this.measureSource
    });
    this.map.addInteraction(this.modify);

    // 创建吸附交互
    this.snap = new Snap({
      source: this.measureSource
    });
    this.map.addInteraction(this.snap);

    // 监听修改事件
    this.modify.on('modifyend', (evt) => {
      const feature = evt.features.getArray()[0];
      this._updateMeasureInfo(feature);
      this._triggerCallback('modifyend', feature);
    });
  }

  /**
   * 开始距离测量
   * @param {Function} callback 测量完成回调
   */
  startMeasureLength(callback) {
    this._startMeasure('LineString', callback);
  }

  /**
   * 开始面积测量
   * @param {Function} callback 测量完成回调
   */
  startMeasureArea(callback) {
    this._startMeasure('Polygon', callback);
  }

  /**
   * 开始测量
   * @private
   */
  _startMeasure(type, callback) {
    // 移除之前的绘制交互
    if (this.draw) {
      this.map.removeInteraction(this.draw);
    }

    // 创建新的绘制交互
    this.draw = new Draw({
      source: this.measureSource,
      type: type,
      style: this._createStyle()
    });

    // 添加绘制交互
    this.map.addInteraction(this.draw);

    // 监听绘制完成事件
    this.draw.on('drawend', (evt) => {
      const feature = evt.feature;
      feature.set('type', type.toLowerCase());
      this._updateMeasureInfo(feature);
      this._triggerCallback('measureend', feature);
      if (callback) {
        callback(feature);
      }
    });
  }

  /**
   * 创建样式
   * @private
   */
  _createStyle() {
    const style = this.options.style;
    return new Style({
      stroke: new Stroke({
        color: style.stroke.color,
        width: style.stroke.width,
        lineDash: style.stroke.lineDash
      }),
      fill: new Fill({
        color: style.fill.color
      }),
      text: new Text({
        font: style.text.font,
        fill: style.text.fill,
        stroke: style.text.stroke,
        offsetY: -15
      })
    });
  }

  /**
   * 更新测量信息
   * @private
   */
  _updateMeasureInfo(feature) {
    if (!this.options.showMeasure) return;

    const geometry = feature.getGeometry();
    const type = feature.get('type');
    let measure = '';

    // 获取坐标并转换为WGS84
    const coordinates = geometry.getCoordinates();
    const wgs84Coordinates = this._transformCoordinates(coordinates);

    switch (type) {
      case 'linestring':
        const line = new LineString(wgs84Coordinates);
        measure = `距离: ${this._formatLength(line)}`;
        break;
      case 'polygon':
        const polygon = new Polygon([wgs84Coordinates]);
        measure = `面积: ${this._formatArea(polygon)}`;
        break;
    }

    const element = this.measureOverlay.getElement();
    element.innerHTML = measure;
    element.style.cssText = `
      background: rgba(255, 255, 255, 0.8);
      padding: 2px 5px;
      border-radius: 3px;
      font: ${this.options.measureStyle.font};
      color: ${this.options.measureStyle.fill.getColor()};
      text-shadow: ${this.options.measureStyle.stroke.getColor()} 1px 0 0,
                   ${this.options.measureStyle.stroke.getColor()} 0 1px 0,
                   ${this.options.measureStyle.stroke.getColor()} -1px 0 0,
                   ${this.options.measureStyle.stroke.getColor()} 0 -1px 0;
    `;

    this.measureOverlay.setPosition(geometry.getCenter() || geometry.getCoordinates()[0]);
  }

  /**
   * 格式化长度
   * @private
   */
  _formatLength(line) {
    const length = getLength(line);
    if (length > 1000) {
      return Math.round(length / 1000 * 100) / 100 + ' km';
    }
    return Math.round(length * 100) / 100 + ' m';
  }

  /**
   * 格式化面积
   * @private
   */
  _formatArea(polygon) {
    const area = getArea(polygon);
    if (area > 1000000) {
      return Math.round(area / 1000000 * 100) / 100 + ' km²';
    }
    return Math.round(area * 100) / 100 + ' m²';
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
   * 清除测量结果
   */
  clearMeasure() {
    this.measureSource.clear();
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
    this.map.removeLayer(this.measureLayer);
    this.map.removeOverlay(this.measureOverlay);
  }
}

export default MapMeasure;
