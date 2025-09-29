import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import LineString from 'ol/geom/LineString';
import { Style, Stroke } from 'ol/style';

class FlowLinesLayer {
    constructor(mapInstance, options = {}) {
        this.mapInstance = mapInstance;
        this.options = {
            // 默认配置
            style: {
                color: 'rgba(0, 255, 255, 0.8)', // 线条颜色
                width: 5, // 线条宽度
                flowSpeed: 1.0, // 流动速度
                dashLength: 10, // 虚线长度
                gapLength: 10, // 间隔长度
            },
            ...options
        };

        // 创建图层
        this.source = new VectorSource();
        this.layer = new VectorLayer({
            source: this.source,
            style: this._createStyle.bind(this),
            zIndex: 1000
        });

        // 添加到地图
        this.mapInstance.addLayer(this.layer);

        // 动画相关
        this.animationId = null;
        this.flowOffsets = new Map(); // 存储每条线的偏移量
        this.startAnimation();
    }

    /**
     * 创建样式
     * @private
     */
    _createStyle(feature) {
        const style = feature.get('style') || this.options.style;
        const offset = this.flowOffsets.get(feature) || 0;
        
        return new Style({
            stroke: new Stroke({
                color: style.color,
                width: style.width,
                lineDash: [style.dashLength, style.gapLength],
                lineDashOffset: -offset
            })
        });
    }

    /**
     * 开始动画
     * @private
     */
    startAnimation() {
        const animate = () => {
            // 更新每条线的偏移量
            this.source.getFeatures().forEach(feature => {
                const style = feature.get('style') || this.options.style;
                const currentOffset = this.flowOffsets.get(feature) || 0;
                const newOffset = currentOffset + style.flowSpeed;
                
                if (newOffset >= style.dashLength + style.gapLength) {
                    this.flowOffsets.set(feature, 0);
                } else {
                    this.flowOffsets.set(feature, newOffset);
                }
            });
            
            this.layer.changed();
            this.animationId = requestAnimationFrame(animate);
        };
        this.animationId = requestAnimationFrame(animate);
    }

    /**
     * 停止动画
     * @private
     */
    stopAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    /**
     * 添加流动线
     * @param {Object} options 配置项
     * @param {Array} options.coordinates 坐标点数组 [[lng1, lat1], [lng2, lat2], ...]
     * @param {Object} options.style 样式配置（可选）
     * @returns {Feature} 返回创建的要素，用于后续管理
     */
    addFlowLine(options) {
        const { coordinates, style } = options;
        const feature = new Feature({
            geometry: new LineString(coordinates).transform('EPSG:4326', 'EPSG:3857')
        });

        // 设置样式
        if (style) {
            feature.set('style', {
                ...this.options.style,
                ...style
            });
        }

        this.source.addFeature(feature);
        return feature;
    }

    /**
     * 添加多条流动线
     * @param {Array} lines 流动线数组
     * @returns {Array} 返回创建的要素数组
     */
    addFlowLines(lines) {
        return lines.map(line => this.addFlowLine(line));
    }

    /**
     * 更新流动线样式
     * @param {Feature} feature 要更新的要素
     * @param {Object} style 新的样式配置
     */
    updateFlowLineStyle(feature, style) {
        if (feature) {
            const currentStyle = feature.get('style') || this.options.style;
            feature.set('style', {
                ...currentStyle,
                ...style
            });
            this.layer.changed();
        }
    }

    /**
     * 更新流动线速度
     * @param {Feature} feature 要更新的要素
     * @param {number} speed 新的速度值
     */
    updateFlowLineSpeed(feature, speed) {
        if (feature) {
            const style = feature.get('style') || this.options.style;
            feature.set('style', {
                ...style,
                flowSpeed: speed
            });
        }
    }

    /**
     * 清除所有流动线
     */
    clearFlowLines() {
        this.source.clear();
        this.flowOffsets.clear();
    }

    /**
     * 移除指定流动线
     * @param {Feature} feature 要移除的要素
     */
    removeFlowLine(feature) {
        if (feature) {
            this.source.removeFeature(feature);
            this.flowOffsets.delete(feature);
        }
    }

    /**
     * 设置全局样式
     * @param {Object} style 样式配置
     */
    setStyle(style) {
        this.options.style = {
            ...this.options.style,
            ...style
        };
        this.layer.changed();
    }

    /**
     * 设置全局流动速度
     * @param {number} speed 速度值
     */
    setFlowSpeed(speed) {
        this.options.style.flowSpeed = speed;
    }

    /**
     * 显示图层
     */
    show() {
        this.layer.setVisible(true);
    }

    /**
     * 隐藏图层
     */
    hide() {
        this.layer.setVisible(false);
    }

    /**
     * 销毁图层
     */
    destroy() {
        this.stopAnimation();
        this.mapInstance.removeLayer(this.layer);
        this.source.clear();
        this.flowOffsets.clear();
    }

    /**
     * 定位到指定线条
     * @param {Feature} feature 要定位的线条要素
     * @param {Object} options 定位选项
     * @param {number} options.padding 边距（像素）
     * @param {number} options.duration 动画时长（毫秒）
     */
    zoomToFlowLine(feature, options = {}) {
        if (!feature) return;

        const defaultOptions = {
            padding: 50,
            duration: 1000
        };

        const finalOptions = {
            ...defaultOptions,
            ...options
        };

        const geometry = feature.getGeometry();
        const extent = geometry.getExtent();
        
        this.mapInstance.getView().fit(extent, {
            padding: [finalOptions.padding, finalOptions.padding, finalOptions.padding, finalOptions.padding],
            duration: finalOptions.duration,
            maxZoom: 18
        });
    }

    /**
     * 定位到多条线条
     * @param {Array<Feature>} features 要定位的线条要素数组
     * @param {Object} options 定位选项
     */
    zoomToFlowLines(features, options = {}) {
        if (!features || features.length === 0) return;

        const defaultOptions = {
            padding: 50,
            duration: 1000
        };

        const finalOptions = {
            ...defaultOptions,
            ...options
        };

        // 计算所有线条的范围
        const extents = features.map(feature => feature.getGeometry().getExtent());
        const minX = Math.min(...extents.map(extent => extent[0]));
        const minY = Math.min(...extents.map(extent => extent[1]));
        const maxX = Math.max(...extents.map(extent => extent[2]));
        const maxY = Math.max(...extents.map(extent => extent[3]));

        this.mapInstance.getView().fit([minX, minY, maxX, maxY], {
            padding: [finalOptions.padding, finalOptions.padding, finalOptions.padding, finalOptions.padding],
            duration: finalOptions.duration,
            maxZoom: 18
        });
    }
}

export default FlowLinesLayer;
