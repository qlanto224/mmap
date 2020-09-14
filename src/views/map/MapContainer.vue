<template>
  <keep-alive>
    <div>
    <div id="map" ref="rootmap"></div>
    <div
      style="text-align: center;line-height:35px;bottom: 0px"
      id="my-mouse-position"
      v-if="showMousePosition"
    >{{position}}</div>
    <information ref="information"></information>
  </div>
  </keep-alive>
</template>

<script>
import "ol/ol.css";
import { Map, View } from "ol";
import VectorTileLayer from 'ol/layer/VectorTile'
import {
  defaults as defaultInteractions,
  DragRotateAndZoom,
} from "ol/interaction";
import mapconfig from "@/config/mapconfig";
import MousePosition from "ol/control/MousePosition";
import { Style, Fill } from "ol/style";
import information from "./information";
//---绘图

export default {
  components: { information },
  props: {
    singleclick: {
      type: Boolean,
      default: true,
    },
    center:{
      type:Array,
      default:[108.905067,34.3575096],
    },
    showMousePosition: {
      type: Boolean,
      default: true,
    },
    // mapSwitch:  ["street", "mapping"],
  },
  data() {
    return {
      position: "",
      isDraw: false, //是否绘制
      isClear: false,
      map: null, //地图对象
      maptype: "mapping", //离线经纬度瓦片地图 2geoserver图层
      mousePositionControl: null,
      highlightLayer: null, // 存储高亮图层
      YShighlightLayer: null,
      WShighlightLayer: null,
      highlightStyle: new Style({
        // 高亮样式
        fill: new Fill({
          color: 'rgba(255,96,0,1)',
        }),
      }),
      highlightStyleBatch: new Style({
        // 高亮样式
        fill: new Fill({
          color: 'rgba(52,255,109,1)',
        }),
      }),
      vectorLayer: null, //矢量图层
      isShow: false,
    };
  },
  created() {},
  mounted() {
    //延时执行，确保元素被渲染，防止出现配置鼠标坐标信息无法渲染问题
    this.$nextTick(() => {
      this.createMap();
      if (this.showMousePosition) {
        document
          .getElementById("my-mouse-position")
          .removeChild(document.getElementById("my-mouse-position").lastChild);
      }
      this.$emit("onMapLoaded", this.map, this.maptype);
    });
  },
  methods: {
    createMap() {
      console.log("初始化地图");
      let _that = this;
      // 设置地图层
      let mapcontainer = _that.$refs.rootmap;
      if (_that.showMousePosition) {
        _that.mousePositionControl = new MousePosition({
          projection: mapconfig[_that.maptype].projection, //地图投影坐标系（若未设置则输出为默认投影坐标系下的坐标）
          target: "my-mouse-position", //显示鼠标位置信息的目标容器
          undefinedHTML: "&nbsp;", //未定义坐标的标记
        });
      }
      let layers = null;

      if (_that.maptype == "street") {
        layers = [mapconfig.street.mapLayers];
      } else if (_that.maptype == "mapping") {
        layers = [...mapconfig.mapping.mapLayers.values()];
      }

      _that.map = new Map({
        target: mapcontainer,
        interactions: defaultInteractions().extend([new DragRotateAndZoom()]),
        layers: layers,
        view: new View({
          center: mapconfig[_that.maptype].center, //中心点经度和纬度
          maxZoom: mapconfig[_that.maptype].maxZoom,
          minZoom: mapconfig[_that.maptype].minZoom,
          zoom: mapconfig[_that.maptype].zoom,
          projection: mapconfig[_that.maptype].projection,
          resolutions: mapconfig[_that.maptype].resolutions,
        }),
      });
      window.map = _that.map;
      window.mapconfig = mapconfig;
      //初始化事件
      if (_that.singleclick) {
        _that.initSingleClickEventLister();
      }
    },
    removeHighLightLayer() {
      // 移除高亮矢量图层
      if (this.highlightLayer) {
        this.map.removeLayer(this.highlightLayer)
      }
      if (this.WShighlightLayer) {
        this.map.removeLayer(this.WShighlightLayer)
      }
      if (this.YShighlightLayer) {
        this.map.removeLayer(this.YShighlightLayer)
      }
    },
    initSingleClickEventLister() {
      const that = this
      //为图层增加点击事件，查看图层属性字段,不希望点击到的图层，可以在geoserver中将图层queryable去掉勾选
      this.map.on('singleclick', (evt) => {
        if (this.isDraw) {
          return
        }
        // 移除高亮矢量图层
        this.removeHighLightLayer()
        // 定义状态值，只取一个图层上的feature，即如果取到了房屋图层的要素，就不显示宅基地的要素信息
        let hasSelected = 0
        this.map.forEachFeatureAtPixel(
          evt.pixel,
          (feature, layer) => {
            if (hasSelected > 0) {
              return false
            }
            let record = feature.getProperties();
            let selection = {}
            selection[feature.getId()] = feature
            let featureOverlay = new VectorTileLayer({
              name: 'Overlay',
              declutter: true,
              zIndex: 3,
              renderMode: 'vector',
              style: (feature) => {
                if (feature.getId() in selection) {
                  return this.highlightStyle
                }
              },
              source: layer.getSource(),
            })
            this.map.addLayer(featureOverlay)
            this.highlightLayer = featureOverlay
            if (feature.getProperties().zddm != undefined) {
              that.$refs.houseHolderInfo.getHouseHolderInfo(feature.getProperties().zddm)
            } else if (feature.getProperties().fwjg != undefined) {
              that.$refs.houseInfo.getHouseInfo(feature.getProperties())
            }
            //弹出详情框
            this.$refs.information.showInit(record);
            hasSelected++
          },
          {
            hitTolerance: 0, // 点击面不需要缓冲区，点或线等不容易被点中的可以加缓冲区帮助点中
            layerFilter: function f(obj) {
              //必须是有意义图层, 即mapping中定义的图层，避免其他绘制的临时图层
              return new Set(mapconfig.mapping.mapLayers.keys()).has(obj.get('name'))
            },
          }
        )
      })
    },
  },
};
</script>

<style scoped>
#map {
  position: absolute;
  left: 0px;
  /*top: 0px;*/
  width: 100%;
  height: 100%;
  z-index: 2;
}
#my-mouse-position {
  position: absolute;
  left: 0px;
  bottom: 75px;
  width: 180px;
  height: 32px;
  text-align: left;
  background-color: #ffffff;
  z-index: 7;
}

/* 图标闪烁 */
#css_animation {
  /* 图标高 */
  height: 30px;
  /* 图标宽 */
  width: 30px;
  /* 圆形 */
  border-radius: 25px;
  /* 颜色 可以为rgba()透明度 */
  background: rgb(255, 0, 0);
  /* 变换初始大小 */
  transform: scale(0.2);
  /* 变换速度 */
  animation: myfirst 2s;
  /* 重复闪烁 */
  animation-iteration-count: infinite;
  z-index: 200;
}

@keyframes myfirst {
  to {
    /* 变换结束大小 */
    transform: scale(0.8);
    /* 结束时颜色 */
    background: rgba(255, 0, 0, 0);
  }
}
</style>
