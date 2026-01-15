import 'ol/ol.css';
import CoreMap from './core/CoreMap';
import BaseMapManager from './mapManage/BaseMapManager';
import { transformExtent } from 'ol/proj'
import MarkerLayer from './layerManage/markerLayer';
import GeomLayer from './layerManage/geomLayer';    
import ClusterMakerLayer from './layerManage/clusterMakerLayer';
import MapMeasure from './markManage/measure';
import MapMark from './markManage/mark';
import View from './view/view';
import Popup from './popup/popup';
import HeatMapLayer from './layerManage/heatMapLayer';
import FlowLinesLayer from './layerManage/flowLinesLayer';

export class OlMap {
    constructor(targetId, options) {
        let that = this;
        that.options = {
            targetId: targetId,
            baseMapName: 'OSM',
            center: [101.397428, 39.90923],
            extent: transformExtent([-360, -90, 360, 90], "EPSG:4326", "EPSG:3857"),
            zoom: 4,
            minZoom:1,
            maxZoom: 18,
            projection: 'EPSG:3857'
        }
        that.options = Object.assign(that.options, options);
        // 创建CoreMap的实例
        this.coreMap = new CoreMap(targetId, that.options);
        if(this.coreMap.map) {
            // 初始化地图底图管理器
            this.mapInstance = this.coreMap.getMapInstance();
            this.baseMapManager = new BaseMapManager(this.coreMap.map, this.options);
            this.markerLayer = new MarkerLayer(this.coreMap.map, this.options);
            this.geomLayer = new GeomLayer(this.coreMap.map, this.options);
            this.clusterMakerLayer = new ClusterMakerLayer(this.coreMap.map, this.options);
            this.heatMapLayer = new HeatMapLayer(this.coreMap.map, this.options);
            this.flowLinesLayer = new FlowLinesLayer(this.coreMap.map, this.options);
            this.mark = new MapMark(this.coreMap.map, this.options);
            this.measure = new MapMeasure(this.coreMap.map, this.options);
            this.view = new View(this.coreMap.map, this.options);
            this.popup = new Popup(this.coreMap.map, this.options);
        }
    }
}