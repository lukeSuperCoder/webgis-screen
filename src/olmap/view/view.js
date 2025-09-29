import { fromLonLat, transformExtent } from 'ol/proj';
import { getCenter } from 'ol/extent';

class View {
  constructor(map) {
    this.map = map;
    this.view = map.getView();
  }

  /**
   * 设置地图缩放级别
   * @param {number} zoom 缩放级别
   * @param {Object} options 配置选项
   * @param {number} options.duration 动画持续时间（毫秒）
   */
  setZoom(zoom, options = {}) {
    const { duration = 500 } = options;
    this.view.animate({
      zoom: zoom,
      duration: duration
    });
  }

  /**
   * 放大一级
   */
  zoomIn(){
    this.setZoom(this.getZoom() + 1);
  }

  /**
   * 缩小一级
   */
  zoomOut(){
    this.setZoom(this.getZoom() - 1);
  }
  /**
   * 获取当前缩放级别
   * @returns {number} 当前缩放级别
   */
  getZoom() {
    return this.view.getZoom();
  }

  /**
   * 设置地图中心点
   * @param {Array} center 中心点坐标 [经度, 纬度]
   * @param {Object} options 配置选项
   * @param {number} options.duration 动画持续时间（毫秒）
   */
  setCenter(center, options = {}) {
    const { duration = 500 } = options;
    const coordinate = fromLonLat(center);
    this.view.animate({
      center: coordinate,
      duration: duration
    });
  }

  /**
   * 获取地图中心点
   * @returns {Array} 中心点坐标 [经度, 纬度]
   */
  getCenter() {
    const center = this.view.getCenter();
    return center ? [center[0], center[1]] : null;
  }

  /**
   * 设置地图旋转角度
   * @param {number} rotation 旋转角度（弧度）
   * @param {Object} options 配置选项
   * @param {number} options.duration 动画持续时间（毫秒）
   */
  setRotation(rotation, options = {}) {
    const { duration = 500 } = options;
    this.view.animate({
      rotation: rotation,
      duration: duration
    });
  }

  /**
   * 获取地图旋转角度
   * @returns {number} 旋转角度（弧度）
   */
  getRotation() {
    return this.view.getRotation();
  }

  /**
   * 设置地图可视范围
   * @param {Array} extent 范围 [minX, minY, maxX, maxY]
   * @param {Object} options 配置选项
   * @param {number} options.duration 动画持续时间（毫秒）
   * @param {number} options.padding 边距（像素）
   */
  fitExtent(extent, options = {}) {
    const { duration = 500, padding = 50 } = options;
    this.view.fit(extent, {
      duration: duration,
      padding: [padding, padding, padding, padding]
    });
  }

  /**
   * 获取地图可视范围
   * @returns {Array} 可视范围 [minX, minY, maxX, maxY]
   */
  getExtent() {
    return this.view.calculateExtent(this.map.getSize());
  }

  /**
   * 设置地图最大缩放级别
   * @param {number} zoom 最大缩放级别
   */
  setMaxZoom(zoom) {
    this.view.setMaxZoom(zoom);
  }

  /**
   * 设置地图最小缩放级别
   * @param {number} zoom 最小缩放级别
   */
  setMinZoom(zoom) {
    this.view.setMinZoom(zoom);
  }

  /**
   * 获取地图最大缩放级别
   * @returns {number} 最大缩放级别
   */
  getMaxZoom() {
    return this.view.getMaxZoom();
  }

  /**
   * 获取地图最小缩放级别
   * @returns {number} 最小缩放级别
   */
  getMinZoom() {
    return this.view.getMinZoom();
  }

  /**
   * 设置地图分辨率
   * @param {number} resolution 分辨率
   * @param {Object} options 配置选项
   * @param {number} options.duration 动画持续时间（毫秒）
   */
  setResolution(resolution, options = {}) {
    const { duration = 500 } = options;
    this.view.animate({
      resolution: resolution,
      duration: duration
    });
  }

  /**
   * 获取地图分辨率
   * @returns {number} 分辨率
   */
  getResolution() {
    return this.view.getResolution();
  }

  /**
   * 缩放到指定级别并居中
   * @param {number} zoom 缩放级别
   * @param {Array} center 中心点坐标 [经度, 纬度]
   * @param {Object} options 配置选项
   * @param {number} options.duration 动画持续时间（毫秒）
   */
  zoomTo(zoom, center, options = {}) {
    const { duration = 500 } = options;
    const coordinate = fromLonLat(center);
    this.view.animate({
      zoom: zoom,
      center: coordinate,
      duration: duration
    });
  }
}

export default View;