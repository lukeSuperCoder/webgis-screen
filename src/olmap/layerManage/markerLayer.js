// shapeType 码表：
// 0: circle（圆形）
// 1: rect（矩形）
// 2: triangle（三角形）
// 3: star（五角星）
// 4: pentagon（五边形）
// 5: hexagon（六边形）
// 6: heptagon（七边形）
// 7: octagon（八边形）
// 8: nonagon（九边形）
// 9: decagon（十边形）
// 10: cross（十字）
// 11: x（叉形）
// 12: diamond（菱形）
// 13: plus（加号）
// 14: star6（六角星）
// 15: star7（七角星）
// 16: star8（八角星）
// 17: star9（九角星）
// 18: star10（十角星）
// 19: ellipse（椭圆）
// 20: custom（自定义，预留）

import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Style, Icon, Stroke, Fill, Circle, RegularShape } from 'ol/style';
import { fromLonLat,toLonLat } from 'ol/proj';

class MarkerLayer {
  constructor(mapInstance, options) {
    this.map = mapInstance;
    this.options = {
      // 默认配置
      defaultStyle: new Style({
        image: new Circle({
          radius: 6,
          fill: new Fill({
            color: '#FF0000'
          }),
          stroke: new Stroke({
            color: '#FFFFFF',
            width: 2
          })
        })
      }),
      // 自定义图标配置
      iconStyle: null,
      // 是否显示标签
      showLabel: false,
      // 标签样式
      labelStyle: {
        text: '',
        font: '14px Microsoft YaHei',
        fill: new Fill({
          color: '#000000'
        }),
        stroke: new Stroke({
          color: '#FFFFFF',
          width: 2
        }),
        offsetY: -20
      },
      // 点击回调函数
      onClick: null
    };
    this.options = Object.assign(this.options, options);

    // 创建矢量图层
    this.vectorSource = new VectorSource();
    this.vectorLayer = new VectorLayer({
      source: this.vectorSource,
      zIndex: 10
    });

    // 将图层添加到地图
    this.map.addLayer(this.vectorLayer);

    // 绑定点击事件
    this.map.on('click', this._handleClick.bind(this));
  }

  /**
   * 处理点击事件
   * @private
   */
  _handleClick(event) {
    const feature = this.map.forEachFeatureAtPixel(event.pixel, (feature) => {
      return feature;
    });

    if (feature) {
      const featureData = {
        type: 'marker',
        properties: feature.getProperties(),
        geometry: toLonLat(feature.getGeometry().getCoordinates())
      };
      
      // 调用回调函数
      if (typeof this.options.onClick === 'function') {
        this.options.onClick(featureData, event);
      }
    }
  }

  /**
   * 设置点击回调函数
   * @param {Function} callback 回调函数
   */
  setOnClick(callback) {
    this.options.onClick = callback;
  }

  /**
   * 销毁图层
   */
  destroy() {
    // 移除点击事件
    this.map.un('click', this._handleClick.bind(this));
    // 移除图层
    this.map.removeLayer(this.vectorLayer);
    // 清除数据源
    this.vectorSource.clear();
  }

  /**
   * 添加单个点位
   * @param {Object} point 点位信息
   * @param {Array} point.coordinates 坐标 [经度, 纬度]
   * @param {Object} point.properties 点位属性
   * @param {Object} point.style 自定义样式
   */
  addMarker(point) {
    const feature = this._createFeature(point);
    this.vectorSource.addFeature(feature);
    return feature;
  }

  /**
   * 添加多个点位
   * @param {Array} points 点位数组
   */
  addMarkers(points) {
    const features = points.map(point => this._createFeature(point));
    this.vectorSource.addFeatures(features);
    return features;
  }

  /**
   * 创建要素
   * @private
   */
  _createFeature(point) {
    const { coordinates, properties = {}, style } = point;
    const feature = new Feature({
      geometry: new Point(fromLonLat(coordinates)),
      ...properties
    });

    // 设置样式
    if (style && style.iconUrl) {
      // 如果有iconUrl，优先用图标
      feature.setStyle(new Style({
        image: new Icon({
          src: style.iconUrl,
          scale: style.iconScale || 1,
          anchor: style.iconAnchor || [0.5, 1],
          anchorXUnits: 'fraction',
          anchorYUnits: 'fraction'
        })
      }));
    } else if (style) {
      feature.setStyle(this._createStyle(style));
    } else if (this.options.iconStyle) {
      feature.setStyle(this._createIconStyle(this.options.iconStyle));
    } else {
      feature.setStyle(this.options.defaultStyle);
    }

    return feature;
  }

  /**
   * 创建自定义图标样式
   * @private
   */
  _createIconStyle(iconConfig) {
    return new Style({
      image: new Icon({
        src: iconConfig.src,
        scale: iconConfig.scale || 1,
        anchor: iconConfig.anchor || [0.5, 1],
        anchorXUnits: 'fraction',
        anchorYUnits: 'fraction'
      })
    });
  }

  /**
   * 创建自定义样式
   * @private
   */
  _createStyle(styleConfig) {
    const shapeType = styleConfig.shapeType || 0; // 默认为圆形
    let imageStyle;
    const radius = styleConfig.radius || 6;
    const fillColor = styleConfig.fillColor || '#FF0000';
    const stroke = styleConfig.showStroke !== false ? new Stroke({
      color: styleConfig.strokeColor || '#FFFFFF',
      width: styleConfig.strokeWidth || 2
    }) : undefined;
    switch (shapeType) {
      case 0: // circle
        imageStyle = new Circle({ radius, fill: new Fill({ color: fillColor }), stroke });
        break;
      case 1: // rect
        imageStyle = new RegularShape({ points: 4, radius, angle: Math.PI / 4, fill: new Fill({ color: fillColor }), stroke });
        break;
      case 2: // triangle
        imageStyle = new RegularShape({ points: 3, radius, rotation: 0, fill: new Fill({ color: fillColor }), stroke });
        break;
      case 3: // star5
        imageStyle = new RegularShape({ points: 5, radius, radius2: radius / 2, angle: 0, fill: new Fill({ color: fillColor }), stroke });
        break;
      case 4: // pentagon
        imageStyle = new RegularShape({ points: 5, radius, angle: 0, fill: new Fill({ color: fillColor }), stroke });
        break;
      case 5: // hexagon
        imageStyle = new RegularShape({ points: 6, radius, angle: 0, fill: new Fill({ color: fillColor }), stroke });
        break;
      case 6: // heptagon
        imageStyle = new RegularShape({ points: 7, radius, angle: 0, fill: new Fill({ color: fillColor }), stroke });
        break;
      case 7: // octagon
        imageStyle = new RegularShape({ points: 8, radius, angle: 0, fill: new Fill({ color: fillColor }), stroke });
        break;
      case 8: // nonagon
        imageStyle = new RegularShape({ points: 9, radius, angle: 0, fill: new Fill({ color: fillColor }), stroke });
        break;
      case 9: // decagon
        imageStyle = new RegularShape({ points: 10, radius, angle: 0, fill: new Fill({ color: fillColor }), stroke });
        break;
      case 10: // cross
        imageStyle = new RegularShape({ points: 4, radius, radius2: 0, angle: 0, fill: new Fill({ color: fillColor }), stroke });
        break;
      case 11: // x
        imageStyle = new RegularShape({ points: 4, radius, radius2: 0, angle: Math.PI / 4, fill: new Fill({ color: fillColor }), stroke });
        break;
      case 12: // diamond
        imageStyle = new RegularShape({ points: 4, radius, angle: 0, fill: new Fill({ color: fillColor }), stroke });
        break;
      case 13: // plus
        imageStyle = new RegularShape({ points: 4, radius, radius2: radius / 2.5, angle: 0, fill: new Fill({ color: fillColor }), stroke });
        break;
      case 14: // star6
        imageStyle = new RegularShape({ points: 6, radius, radius2: radius / 2, angle: 0, fill: new Fill({ color: fillColor }), stroke });
        break;
      case 15: // star7
        imageStyle = new RegularShape({ points: 7, radius, radius2: radius / 2, angle: 0, fill: new Fill({ color: fillColor }), stroke });
        break;
      case 16: // star8
        imageStyle = new RegularShape({ points: 8, radius, radius2: radius / 2, angle: 0, fill: new Fill({ color: fillColor }), stroke });
        break;
      case 17: // star9
        imageStyle = new RegularShape({ points: 9, radius, radius2: radius / 2, angle: 0, fill: new Fill({ color: fillColor }), stroke });
        break;
      case 18: // star10
        imageStyle = new RegularShape({ points: 10, radius, radius2: radius / 2, angle: 0, fill: new Fill({ color: fillColor }), stroke });
        break;
      case 19: // ellipse（用RegularShape近似椭圆）
        imageStyle = new RegularShape({ points: 100, radius, radius2: radius / 2, angle: 0, fill: new Fill({ color: fillColor }), stroke });
        break;
      case 20: // custom（预留）
        imageStyle = new Circle({ radius, fill: new Fill({ color: fillColor }), stroke });
        break;
      default:
        imageStyle = new Circle({ radius, fill: new Fill({ color: fillColor }), stroke });
    }
    return new Style({
      image: imageStyle
    });
  }

  /**
   * 清除所有点位
   */
  clearMarkers() {
    this.vectorSource.clear();
  }

  /**
   * 移除指定点位
   * @param {Feature} feature 要移除的点位要素
   */
  removeMarker(feature) {
    this.vectorSource.removeFeature(feature);
  }
  /**
   * 设置最小缩放级别
   * @param {number} minZoom 最小缩放级别
   */
    setMinZoom(minZoom) {
      this.vectorLayer.setMinZoom(minZoom);
    }
  /**
   * 设置最大缩放级别
   * @param {number} maxZoom 最大缩放级别
   */
  setMaxZoom(maxZoom) {
    this.vectorLayer.setMaxZoom(maxZoom);
  }
}
export default MarkerLayer;
