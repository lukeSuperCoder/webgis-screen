import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Style, Icon, Stroke, Fill, Circle, Text } from 'ol/style';
import { fromLonLat, toLonLat } from 'ol/proj';
import Cluster from 'ol/source/Cluster';

class ClusterMakerLayer {
  constructor(mapInstance, options) {
    this.map = mapInstance;
    this.options = {
      //展示层级
      minZoom: 1,
      maxZoom: 6,
      // 聚合距离（像素）
      distance: 40,
      // 点击回调函数
      onClick: null,
      // 默认样式
      defaultStyle: new Style({
        image: new Circle({
          radius: 10,
          fill: new Fill({
            color: 'rgba(255, 0, 0, 0.8)'
          }),
          stroke: new Stroke({
            color: '#FFFFFF',
            width: 2
          })
        }),
        text: new Text({
          font: 'bold 12px Microsoft YaHei',
          fill: new Fill({
            color: '#FFFFFF'
          }),
          stroke: new Stroke({
            color: '#000000',
            width: 2
          }),
          offsetY: 0,
          textAlign: 'center',
          textBaseline: 'middle'
        })
      }),
      // 聚合样式配置
      clusterStyles: [
        {
          min: 2,
          max: 10,
          style: new Style({
            image: new Circle({
              radius: 15,
              fill: new Fill({
                color: 'rgba(255, 153, 0, 0.8)'
              }),
              stroke: new Stroke({
                color: '#FFFFFF',
                width: 2
              })
            }),
            text: new Text({
              font: 'bold 12px Microsoft YaHei',
              fill: new Fill({
                color: '#FFFFFF'
              }),
              stroke: new Stroke({
                color: '#000000',
                width: 2
              }),
              offsetY: 0,
              textAlign: 'center',
              textBaseline: 'middle'
            })
          })
        },
        {
          min: 10,
          max: 100,
          style: new Style({
            image: new Circle({
              radius: 20,
              fill: new Fill({
                color: 'rgba(255, 0, 0, 0.8)'
              }),
              stroke: new Stroke({
                color: '#FFFFFF',
                width: 2
              })
            }),
            text: new Text({
              font: 'bold 14px Microsoft YaHei',
              fill: new Fill({
                color: '#FFFFFF'
              }),
              stroke: new Stroke({
                color: '#000000',
                width: 2
              }),
              offsetY: 0,
              textAlign: 'center',
              textBaseline: 'middle'
            })
          })
        },
        {
          min: 100,
          max: Infinity,
          style: new Style({
            image: new Circle({
              radius: 25,
              fill: new Fill({
                color: 'rgba(153, 0, 0, 0.8)'
              }),
              stroke: new Stroke({
                color: '#FFFFFF',
                width: 2
              })
            }),
            text: new Text({
              font: 'bold 16px Microsoft YaHei',
              fill: new Fill({
                color: '#FFFFFF'
              }),
              stroke: new Stroke({
                color: '#000000',
                width: 2
              }),
              offsetY: 0,
              textAlign: 'center',
              textBaseline: 'middle'
            })
          })
        }
      ]
    };
    this.options = Object.assign(this.options, options);

    // 创建矢量数据源
    this.source = new VectorSource();
    
    // 创建聚合数据源
    this.clusterSource = new Cluster({
      source: this.source,
      distance: this.options.distance
    });

    // 创建矢量图层
    this.vectorLayer = new VectorLayer({
      source: this.clusterSource,
      style: this._clusterStyle.bind(this),
      zIndex: 10,
      maxZoom: this.options.maxZoom,
      minZoom: this.options.minZoom
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
      const features = feature.get('features');
      if (features && features.length > 0) {
        // 如果是聚合点，返回所有聚合的要素
        const featureData = features.map(f => ({
          type: 'cluster',
          properties: f.getProperties(),
          geometry: toLonLat(f.getGeometry().getCoordinates())
        }));
        
        // 调用回调函数
        if (typeof this.options.onClick === 'function') {
          this.options.onClick(featureData, event);
        }
      } else {
        // 如果是单个点，返回单个要素
        const featureData = {
          type: 'point',
          properties: feature.getProperties(),
          geometry: feature.getGeometry().getCoordinates()
        };
        
        // 调用回调函数
        if (typeof this.options.onClick === 'function') {
          this.options.onClick(featureData, event);
        }
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
    this.source.clear();
  }

  /**
   * 添加单个点位
   * @param {Object} point 点位信息
   * @param {Array} point.coordinates 坐标 [经度, 纬度]
   * @param {Object} point.properties 点位属性
   */
  addMarker(point) {
    const feature = this._createFeature(point);
    this.source.addFeature(feature);
    return feature;
  }

  /**
   * 添加多个点位
   * @param {Array} points 点位数组
   */
  addMarkers(points) {
    const features = points.map(point => this._createFeature(point));
    this.source.addFeatures(features);
    return features;
  }

  /**
   * 创建要素
   * @private
   */
  _createFeature(point) {
    const { coordinates, properties = {} } = point;
    return new Feature({
      geometry: new Point(fromLonLat(coordinates)),
      ...properties
    });
  }

  /**
   * 聚合样式
   * @private
   */
  _clusterStyle(feature) {
    const size = feature.get('features').length;
    let style = this.options.defaultStyle;

    // 根据聚合数量选择样式
    if (size > 1) {
      for (let i = 0; i < this.options.clusterStyles.length; i++) {
        const clusterStyle = this.options.clusterStyles[i];
        if (size >= clusterStyle.min && size < clusterStyle.max) {
          style = clusterStyle.style;
          break;
        }
      }
    }

    // 设置文本
    const text = style.getText();
    if (text && size > 1) {
      text.setText(size.toString());
    }

    return style;
  }

  /**
   * 清除所有点位
   */
  clearMarkers() {
    this.source.clear();
  }

  /**
   * 移除指定点位
   * @param {Feature} feature 要移除的点位要素
   */
  removeMarker(feature) {
    this.source.removeFeature(feature);
  }

  /**
   * 设置聚合距离
   * @param {number} distance 聚合距离（像素）
   */
  setDistance(distance) {
    this.clusterSource.setDistance(distance);
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

export default ClusterMakerLayer;