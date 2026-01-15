// 天地图地形底图测试示例
import GeomLayer from '../layerManage/geomLayer.js';

// 测试地形底图功能
export function testTiandituTerrainMap(mapInstance) {
  console.log('开始测试天地图地形底图...');
  
  // 切换到地形底图
  if (mapInstance && mapInstance.baseMapManager) {
    mapInstance.baseMapManager.switchBaseMap('TIANDITU_TER');
    console.log('已切换到天地图地形底图');
    
    // 测试地形底图的特点
    console.log('地形底图特点:');
    console.log('- 显示地形起伏');
    console.log('- 包含等高线信息');
    console.log('- 适合地理分析');
    console.log('- 支持地形注记');
  }
  
  return {
    success: true,
    message: '天地图地形底图测试完成'
  };
}

// 地形底图使用场景示例
export function createTerrainAnalysisExample(mapInstance) {
  const geomLayer = new GeomLayer(mapInstance);
  
  // 创建一些测试点来展示地形底图的效果
  const testPoints = [
    {
      name: '山峰',
      coordinates: [116.3974, 39.9093], // 北京
      elevation: 1000,
      type: 'mountain'
    },
    {
      name: '河流',
      coordinates: [116.405, 39.905],
      elevation: 50,
      type: 'river'
    },
    {
      name: '平原',
      coordinates: [116.39, 39.90],
      elevation: 100,
      type: 'plain'
    }
  ];
  
  // 绘制测试点
  const features = testPoints.map(point => {
    return geomLayer.drawGeoJSON({
      type: 'Feature',
      properties: {
        name: point.name,
        elevation: point.elevation,
        type: point.type
      },
      geometry: {
        type: 'Point',
        coordinates: point.coordinates
      }
    }, {
      fit: true,
      styleFunction: (feature) => {
        const props = feature.getProperties();
        let color = '#FF0000';
        
        if (props.type === 'mountain') color = '#8B4513'; // 棕色 - 山峰
        else if (props.type === 'river') color = '#0000FF'; // 蓝色 - 河流
        else if (props.type === 'plain') color = '#228B22'; // 绿色 - 平原
        
        return {
          point: {
            radius: 8,
            fillColor: color,
            strokeColor: '#FFFFFF',
            strokeWidth: 2
          }
        };
      }
    });
  });
  
  console.log('地形分析示例创建完成');
  console.log('建议切换到地形底图查看效果');
  
  return {
    geomLayer,
    features,
    testPoints
  };
}

// 地形底图与其他底图的对比
export function compareBasemapTypes(mapInstance) {
  const basemapTypes = [
    {
      id: 'TIANDITU_VEC',
      name: '矢量图',
      description: '适合显示道路、建筑等矢量信息',
      useCase: '城市导航、地址查询'
    },
    {
      id: 'TIANDITU_IMG',
      name: '影像图',
      description: '真实的地表影像，直观显示地表特征',
      useCase: '环境监测、土地利用分析'
    },
    {
      id: 'TIANDITU_TER',
      name: '地形图',
      description: '显示地形起伏、等高线、高程信息',
      useCase: '地理分析、地形研究、水文分析'
    }
  ];
  
  console.log('天地图底图类型对比:');
  basemapTypes.forEach(basemap => {
    console.log(`\n${basemap.name} (${basemap.id}):`);
    console.log(`  描述: ${basemap.description}`);
    console.log(`  适用场景: ${basemap.useCase}`);
  });
  
  return basemapTypes;
}

// 地形底图API说明
export function getTiandituTerrainAPIInfo() {
  return {
    service: '天地图地形底图服务',
    layer: 'ter',
    labelLayer: 'cta',
    projection: 'EPSG:3857',
    format: 'WMTS',
    url: 'http://t0.tianditu.gov.cn/ter_w/wmts',
    labelUrl: 'http://t0.tianditu.gov.cn/cta_w/wmts',
    parameters: {
      SERVICE: 'WMTS',
      REQUEST: 'GetTile',
      VERSION: '1.0.0',
      LAYER: 'ter', // 地形图层
      STYLE: 'default',
      TILEMATRIXSET: 'w',
      FORMAT: 'tiles',
      TILEMATRIX: '{z}',
      TILEROW: '{y}',
      TILECOL: '{x}',
      tk: '9254b8157f0ff0a6331196e4afc27cb6' // API密钥
    },
    features: [
      '地形起伏显示',
      '等高线信息',
      '高程数据',
      '地形注记',
      '适合地理分析'
    ]
  };
}
