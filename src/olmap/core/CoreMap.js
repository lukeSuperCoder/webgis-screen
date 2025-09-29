import 'ol/ol.css';
import './coreMap.css';
import Map from 'ol/Map';
import View from 'ol/View';
import {fromLonLat} from 'ol/proj';
import Zoom from 'ol/control/Zoom';
import ZoomSlider from 'ol/control/ZoomSlider';
import ZoomToExtent from 'ol/control/ZoomToExtent';
import FullScreen from 'ol/control/FullScreen';
import MousePosition from 'ol/control/MousePosition';
import OverviewMap from 'ol/control/OverviewMap';
import ScaleLine from 'ol/control/ScaleLine';
import Rotate from 'ol/control/Rotate';
import Attribution from 'ol/control/Attribution';

class CoreMap {
    constructor(targetId, options) {
        this.targetId = targetId;
        this.options = {
            // 默认配置
            center: [116.4, 39.9],
            zoom: 4,
            projection: 'EPSG:3857',
            // 控件配置
            controls: {
                zoom: false, // 缩放按钮
                zoomSlider: false, // 缩放滑块
                zoomToExtent: false, // 缩放至范围
                fullScreen: false, // 全屏
                mousePosition: false, // 鼠标位置
                overviewMap: false, // 鹰眼图
                scaleLine: true, // 比例尺
                rotate: false, // 旋转
                attribution: false, // 属性
            },
            // 合并用户配置
            ...options
        };
        this.initializeMap();
    }

    initializeMap() {
        let that = this;
        this.map = new Map({
            target: this.targetId,
            logo: false,
            loadTilesWhileAnimating: true,
            pixelRatio: 1,
            view: new View({
                center: fromLonLat(that.options.center, that.options.projection),
                zoom: that.options.zoom,
            }),
            controls: this._getControls()
        });
        return this.map;
    }

    /**
     * 获取所有控件
     * @private
     */
    _getControls() {
        const controlList = [];
        const { controls } = this.options;

        // 缩放按钮
        if (controls.zoom) {
            controlList.push(new Zoom({
                position: 'right'
            }));
        }

        // 缩放滑块
        if (controls.zoomSlider) {
            controlList.push(new ZoomSlider({
                position: 'right'
            }));
        }

        // 缩放至范围
        if (controls.zoomToExtent) {
            controlList.push(new ZoomToExtent({
                extent: [73.44696044921875, 18.15811538696289, 135.08583068847656, 53.55873107910156], // 中国范围
                position: 'right'
            }));
        }

        // 全屏
        if (controls.fullScreen) {
            controlList.push(new FullScreen({
                position: 'right'
            }));
        }

        // 鼠标位置
        if (controls.mousePosition) {
            controlList.push(new MousePosition({
                coordinateFormat: function(coordinate) {
                    return coordinate;
                },
                projection: 'EPSG:4326',
                className: 'custom-mouse-position',
                target: document.getElementById('mouse-position'),
                undefinedHTML: '&nbsp;',
                position: 'right'
            }));
        }

        // 鹰眼图
        if (controls.overviewMap) {
            controlList.push(new OverviewMap({
                collapsed: false,
                layers: this.options.overviewMapLayers || [],
                position: 'right'
            }));
        }

        // 比例尺
        if (controls.scaleLine) {
            controlList.push(new ScaleLine({
                units: 'metric',
                position: 'right'
            }));
        }

        // 旋转
        if (controls.rotate) {
            controlList.push(new Rotate({
                position: 'right'
            }));
        }

        // 属性
        if (controls.attribution) {
            controlList.push(new Attribution({
                collapsible: true,
                position: 'right'
            }));
        }

        return controlList;
    }

    getMapInstance() {
        return this.map;
    }

    // 你可以在此类中添加更多的方法来扩展地图功能...
}

export default CoreMap;
