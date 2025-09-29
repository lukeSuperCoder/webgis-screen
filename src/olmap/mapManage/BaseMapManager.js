import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';

class BaseMapManager {
  constructor(mapInstance, options) {
    this.map = mapInstance;
    this.options = {
      baseMapName: 'AMAP_IMG'
    }
    this.options = Object.assign(this.options, options);
    this.baseMaps = {
      'OSM': new TileLayer({
        source: new OSM(),
        visible: true,
      }),
      'Satellite': new TileLayer({
        source: new XYZ({
          url: 'https://{a-c}.tile.opentopomap.org/{z}/{x}/{y}.png',
          visible: false
        })
      }),
      // 高德矢量图
      'AMAP_VEC': new TileLayer({
        source: new XYZ({
          url: 'https://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}',
          projection: 'EPSG:3857'
        }),
        visible: true,
      }),
      // 高德影像图
      'AMAP_IMG': new TileLayer({
        source: new XYZ({
          url: 'https://webst0{1-4}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
          projection: 'EPSG:3857'
        }),
        visible: false,
      }),
      // osm深色地图
      'OSM_DARK': new TileLayer({
        source: new XYZ({
          url: "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
          crossOrigin: 'anonymous',
          visible: false
        })
      })
    }

    // 创建注记图层
    this.labelLayers = {
      // 矢量图注记
      'AMAP_VEC_LABEL': new TileLayer({
        source: new XYZ({
          url: 'https://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=8&x={x}&y={y}&z={z}',
          projection: 'EPSG:3857'
        }),
        visible: true,
        zIndex: 1
      }),
      // 影像图注记
      'AMAP_IMG_LABEL': new TileLayer({
        source: new XYZ({
          url: 'https://webst0{1-4}.is.autonavi.com/appmaptile?style=8&x={x}&y={y}&z={z}',
          projection: 'EPSG:3857'
        }),
        visible: false,
        zIndex: 1
      })
    };

    this.addEveryBaseMap();
    this.addEveryLabelLayer();
    // 默认添加矢量图到地图中
    this.switchBaseMap(this.options.baseMapName);
  }

  /**
   * 将缓存的底图图层添加到地图中
   */
  addEveryBaseMap() {
    Object.keys(this.baseMaps).forEach((baseMapName) => {
      this.map.addLayer(this.baseMaps[baseMapName]);
    });
  }

  /**
   * 将注记图层添加到地图中
   */
  addEveryLabelLayer() {
    Object.keys(this.labelLayers).forEach((labelName) => {
      this.map.addLayer(this.labelLayers[labelName]);
    });
  }

  /**
   * 切换地图底图的显隐
   * @param {string} showBaseMapName 要展示的图层名称
   *
   */
  switchBaseMap(showBaseMapName) {
    // 切换底图
    Object.keys(this.baseMaps).forEach((baseMapName) => {
      const baseMapLayer = this.baseMaps[baseMapName];
      baseMapLayer.setVisible(baseMapName === showBaseMapName);
    });

    // 切换对应的注记图层
    Object.keys(this.labelLayers).forEach((labelName) => {
      const labelLayer = this.labelLayers[labelName];
      const isVisible = labelName === `${showBaseMapName}_LABEL`;
      labelLayer.setVisible(isVisible);
    });
  }
}
export default BaseMapManager;