import TileLayer from "ol/layer/Tile"
import XYZ from 'ol/source/XYZ'
import ImageWMS from 'ol/source/ImageWMS'
import Image from 'ol/layer/Image'
import TileWMS from "ol/source/TileWMS";
import WMTS from 'ol/source/WMTS';
import TileGridWMTS from 'ol/tilegrid/WMTS';
import VectorTileLayer from 'ol/layer/VectorTile';
import VectorTileSource from 'ol/source/VectorTile';
import MVT from 'ol/format/MVT';
import Projection from 'ol/proj/Projection'
import { Style, Stroke, Fill, Text } from 'ol/style'
import TileWMTS from 'ol/tilegrid/WMTS'

//离线地图瓦片
const BASE_URL_STREET = window._CONFIG['mapURL'];
//geoserver资源服务基础地址
const BASE_URL = window._CONFIG['dataMapURL']+'/geoserver/';

//WMS服务地址
let getWMSURL = function(workspace){
  return BASE_URL + workspace + '/wms';
}

//组装WMTS服务地址
let getWMTSURL = function(params){
  let baseParams = ['VERSION','LAYER','STYLE','TILEMATRIX','TILEMATRIXSET','SERVICE','FORMAT'];
  let url = BASE_URL + 'gwc/wmts?';
  for (let param in params) {
    if (baseParams.indexOf(param.toUpperCase()) < 0) {
      url = url + param + '=' + params[param] + '&';
    }
  }
  return url.slice(0, -1);
}
//组装TMS服务地址
let getTMSURL = function(layerName){
  let url = BASE_URL + 'gwc/tms/*.*.*/' + layerName + '@EPSG%3A*****@pbf/{z}/{x}/{-y}.pbf';
  return url
}
/**
 * 构造不同的图层数据源
 */
//构造WMS数据源
let constructWMSSource = function (workspace, layerName, format, tiled, opaque, style) {
  let url = getWMSURL(workspace);
  let source = null;
  if(tiled){//如果需要瓦片形式
    source = new TileWMS({
      url: url,
      serverType: 'geoserver',//mapserver，geoserver或qgis
      params: {
        'FORMAT': format,
        'VERSION': '****',
        tiled: true,
        "LAYERS": layerName,
        'STYLES': style,
        "exceptions": 'application/vnd.ogc.se_inimage'
      },
      opaque: opaque
    })
    console.log("构造了一个WMS源，以瓦片的形式")
  } else {//如果不需要瓦片,提供单幅图像的WMS服务器的源
    source = new ImageWMS({
      ratio: 1,
      url: url,
      serverType: 'geoserver',//mapserver，geoserver或qgis
      params: {
        'FORMAT': format,
        'VERSION': '***',
        "LAYERS": layerName,
        'STYLES': style,
        "exceptions": 'application/vnd.ogc.se_inimage',
      },
      opaque: opaque
    })
    console.log("构造了一个WMS源，以图片的形式")
  }
  return source;
}

//构造WMTS瓦片数据源
let constructWMTSSource = function (layerName, format, opaque, style, resolutions, projection) {
  if(undefined == style){
    style = '';
  }
  let gridsetName = 'EPSG:***';
  let gridNames = ['EPSG:*****:0', 'EPSG:*****:1', 'EPSG:*****:2', 'EPSG:*****:3', 'EPSG:*****:4', 'EPSG:*****:5', 'EPSG:*****:6', 'EPSG:*****:7', 'EPSG:*****:8', 'EPSG:*****:9', 'EPSG:*****:10', 'EPSG:*****:11', 'EPSG:*****:12', 'EPSG:*****:13', 'EPSG:*****:14', 'EPSG:*****:15', 'EPSG:*****:16', 'EPSG:*****:17', 'EPSG:*****:18', 'EPSG:*****:19', 'EPSG:*****:20', 'EPSG:*****:21', 'EPSG:*****:22', 'EPSG:*****:23', 'EPSG:*****:24', 'EPSG:*****:25', 'EPSG:*****:26', 'EPSG:*****:27', 'EPSG:*****:28', 'EPSG:*****:29', 'EPSG:*****:30'];
  let params = {
    'VERSION': '*.*.*',
    'LAYER': layerName,
    'STYLES': style,
    'TILEMATRIX': gridNames,
    'TILEMATRIXSET': gridsetName,
    'SERVICE': 'WMTS',
    'FORMAT': format
  };
  let source = new WMTS({
    url: getWMTSURL(params),
    layer: params['LAYER'],
    matrixSet: params['TILEMATRIXSET'],
    format: params['FORMAT'],
    projection: projection,
    opaque: opaque,
    tileGrid: new TileGridWMTS({
      tileSize: [256,256],
      extent: [-180.0,-90.0,180.0,90.0],
      origin: [-180.0, 90.0],
      resolutions: resolutions,
      matrixIds: params['TILEMATRIX']
    }),
    style: params['STYLE'],
    wrapX: true
  });
  console.log("构造了一个WMTS源，以瓦片的形式")
  return source;
}
//构造矢量瓦片数据源
let constructVectorTileSource = function(layerName, format, resolutions, projection){
  let baseUrl = BASE_URL +'gwc/wmts'
  var gridsetName = 'EPSG:*****';
  let params = {
    'REQUEST': 'GetTile',
    'SERVICE': 'WMTS',
    'VERSION': '*.*.*',
    'LAYER': layerName,
    'STYLE': '',
    'TILEMATRIX': gridsetName + ':{z}',
    'TILEMATRIXSET': gridsetName,
    'FORMAT': format,
    'TILECOL': '{x}',
    'TILEROW': '{y}'
  };
  var url = baseUrl+'?'
  for (var param in params) {
    url = url + param + '=' + params[param] + '&';
  }
  url = url.slice(0, -1);
  let source = new VectorTileSource({
    format: new MVT({}),
    projection:  projection,
    tileGrid: new TileWMTS({
      tileSize: [256,256],
      origin: [-180.0, 90.0],
      resolutions:  resolutions
    }),
    wrapX: false,
    url: url
  })
  console.log("构造了一个WMTS源，以矢量瓦片的形式")
  return source
}
function constructVectorTileLayer(layerName, format, style, zIndex, resolutions, projection) {
  let _stroke = null
  let _fill = null
  let _text = null
  if(style){
    if(style.stroke){
      _stroke = new Stroke({
        color: style.stroke.color,
        width: style.stroke.width
      })
    }
    if(style.fill){
      _fill = new Fill({
        color: style.fill.color,
      })
    }
    if(style.text){
      _text = new Text({
        font: '12px Calibri,sans-serif',
        fill: new Fill({
          color: style.text.fill.color,
        })
      })
    }
  }
  let _style = new Style({
    stroke: _stroke,
    fill: _fill,
    text: _text
  });

  let vectorTileLayer = new VectorTileLayer({
    name: layerName,
    declutter: true,
    zIndex: zIndex,
    style: function (feature){
      if(_style.getText()){
        _style.getText().setText(feature.getProperties()[style.text.property]);
      }
      return _style
    },
    source: constructVectorTileSource(layerName, format, resolutions, projection)
  })
  return vectorTileLayer
}
//构建图片图层
function constructImageLayer (workspace, layerName, format, isTiled, opaque, style, showLegend) {
  let image = new Image({
    name: layerName,
    source: constructWMSSource(workspace, layerName, format, isTiled, opaque, style, showLegend)
  })
  console.log("构造了一个图片图层");
  if(showLegend){
    image.getSource().getLegendUrl()
  }
  return image;
}
/**
 * 构建瓦片图层
 * @param workspace 工作区
 * @param layerName 图层名称
 * @param format 图片格式'image/png' 'image/jpg'
 * @param isWMTS 是否WMTS数据源
 * @param isTiled 是否瓦片
 * @returns {*}
 */
function constructTileLayer(workspace, layerName, format, isWMTS, isTiled, opaque, style, zIndex, showLegend, resolutions, projection) {
  let source = null;
  if(isWMTS){
    source = constructWMTSSource(layerName, format, opaque, style, resolutions, projection);
  } else {
    source = constructWMSSource(workspace, layerName, format, isTiled, opaque, style, showLegend);
  }
  let tileLayer = new TileLayer({
    name: layerName,
    zIndex: zIndex,
    source: source
  });
  console.log("构造了一个瓦片图层")
  return tileLayer;
}

/**
 * 构建离线瓦片地图图层
 */
function constructStreetLayer() {
  let url = BASE_URL_STREET + '/{z}/{x}/{y}.jpg';
  // console.log("构建数据源：" + url)
  let tileLayer = new TileLayer({
    source: new XYZ({
      url: url
    })
  })
  return tileLayer;
}
export { constructImageLayer, constructTileLayer, constructVectorTileLayer, constructStreetLayer}
