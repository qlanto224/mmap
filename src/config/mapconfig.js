import {Projection} from "ol/proj";
import {constructImageLayer, constructTileLayer, constructVectorTileLayer, constructStreetLayer} from '@/utils/layersource';
const layerData = [
  {name:'影像',workspace:'****',layerName:'***',format:'image/jpeg',isWMTS:true,isTiled:true,opaque:false},                                                                                                                    //rgba(26,53,149,0.3)                  
  {name:'宅基地',workspace:'****',layerName:'*****',format:'application/vnd.mapbox-vector-tile',isVector:true,isWMTS:true,isTiled:true,opaque:true,zIndex:1,style:{stroke:{color:'rgba(255,255,255,1)',width:1},fill:{color:'rgba(64 ,224 ,208, 0.2)'}}},
];
const resolutions = [*******];
const projection = new Projection({
  code: '*****',
  units: 'degrees',
  axisOrientation: 'neu'
})
//构建所有自定义图层
let constructMapLayers = function(){
  let mapLayers = new Map();
  let tempDate;
  for (let layerIndex = 0; layerIndex < layerData.length; layerIndex++){
    tempDate = layerData[layerIndex];
    if(tempDate.isTiled){ // 瓦片
      if(tempDate.isVector) { // 矢量瓦片
        mapLayers.set(tempDate.layerName, constructVectorTileLayer(tempDate.layerName, tempDate.format, tempDate.style, tempDate.zIndex, resolutions, projection))
      } else {
        mapLayers.set(tempDate.layerName, constructTileLayer(tempDate.workspace, tempDate.layerName, tempDate.format, tempDate.isWMTS, tempDate.isTiled, tempDate.opaque, tempDate.style, tempDate.zIndex, tempDate.showLegend, resolutions, projection))
      }
    } else {
      mapLayers.set(tempDate.layerName, constructImageLayer(tempDate.workspace, tempDate.layerName, tempDate.format, tempDate.tiled, tempDate.opaque, tempDate.style, tempDate.showLegend))
    }
  }
  return mapLayers;
}
let mapconfig = {
  street:{
    center: [***,***],   //中心点经度和纬度
    maxZoom: 17,
    minZoom: 10,
    zoom: 12,//地图缩放级别
    projection: '****',
    mapLayers: constructStreetLayer() // 返回的是TileLayer
  },
  mapping:{
    center:[***,***],
    maxZoom: 24,
    minZoom: 11,
    zoom: 12.5,//地图缩放级别
    projection: projection,
    resolutions: [*******],
    layerData: layerData,
    mapLayers: constructMapLayers() // 返回的是Map格式的数据
  }
};


export default mapconfig
