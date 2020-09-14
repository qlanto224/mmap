<template>
  <div>
    <div v-if="isShowMap" class="total-container">
      <map-container
        ref="mapContainer"
        :showMousePosition="false"
        :singleclick="true"
        :center="center"
        @onMapLoaded="getMap"
        @onMapSwitched="changeMap"
      ></map-container>
      <div id="marker" class="point_animation"></div>
    </div>
  </div>
</template>

<script>
import MapContainer from "./MapContainer";
import Vue from "vue";
import Overlay from "ol/Overlay";
export default {
  name: "GISMap",
  components: {
    MapContainer,
  },
  data() {
    return {
      isShowMap: true,
      map: null, //地图对象
      maptype: null, //离线经纬度瓦片地图 2geoserver图层
      vectorLayer: null, //矢量图层
      searchFlag: true,
      projectData: [],
      featureMarker: [],
      showFlagOfOne: false,
      showFlagOfTwo: false,
      showFlagOfThree: false,
      showFlagOfFour: false,
      type: undefined,
      ACCESS_TOKEN: "",
      mapObj: null,
      center: [],
      timer: null, // 定时器名称
      positionMarker:null,
      watchPositionId:null,
    };
  },
  beforeCreate() {
    
  },
  created() {
    this.ACCESS_TOKEN = Vue.ls.get("token");
    if (!this.ACCESS_TOKEN) {
      this.$message.error("登陆过期,请重新登陆");
      this.$router.push({
        path: "/login",
        params: {
          type: 0,
        },
      });
    }
    this.getGDM();
  },
  mounted() {
    console.log("执行mounted");
  },
  beforeDestroy() {
    console.log("组件被销毁");
    navigator.geolocation.clearWatch(this.watchPositionId);
  },
  destroyed() {
    console.log("销毁完毕");
  },
  activated() {
    console.log("显示地图");
    this.isShowMapFnc();
  },
  methods: {
    isShowMapFnc() {
      this.isShowMap = true;
    },
    getMap(map, maptype) {
      console.log("地图渲染完毕");
      this.map = map;
      this.maptype = maptype;
    },
    getGDM() {
      let that = this;
      // 获取地理位置信息
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // 获取Coordinates对象，该对象里包含了详细的地理位置信息
          var coords = position.coords;
          // 输出地理位置信息
          that.setMarker(coords.longitude, coords.latitude);
        },
        (error) => {
          // 为不同错误代码定义错误提示
          var errMsg = {
            1: "用户拒绝了位置服务",
            2: "无法获取地址位置信息",
            3: "获取地理位置信息超时",
          };
          // 弹出错误提示
          alert(errMsg[error.code]);
        },
        {
          enableHighAccuracy: true, //开启高精度
          maximumAge: 500, //浏览器重新计算位置的时间间隔
        }
      );
      this.watchPositionId = navigator.geolocation.watchPosition(
        (position) => {
          // 获取Coordinates对象，该对象里包含了详细的地理位置信息
          var coords = position.coords;
          // 输出地理位置信息
          that.setMarker(coords.longitude, coords.latitude);
        },
        (error) => {
          // 为不同错误代码定义错误提示
          var errMsg = {
            1: "用户拒绝了位置服务",
            2: "无法获取地址位置信息",
            3: "获取地理位置信息超时",
          };
          // 弹出错误提示
          alert(errMsg[error.code]);
        },
        {
          enableHighAccuracy: true, //开启高精度
          maximumAge: 500, //浏览器重新计算位置的时间间隔
        })
    },
    setMarker(x, y) {
      if (x && y && this.positionMarker==null) {
        let positionMarker = new Overlay({
          element: document.getElementById("marker"),
          positioning: "center-center",
          id:1
        });
        positionMarker.setPosition([x, y]); //设置overlay的位置
        this.map.addOverlay(positionMarker);
        this.map.getView().animate({
          center: [x, y],
          duration: 10,
        });
        this.positionMarker = positionMarker;
      }else{
        this.map.getOverlayById("1").setPosition([x, y])
      }
    },
    changeMap(maptype) {
      this.maptype = maptype;
      //切换了地图 做什么事情
    },
  },
};
</script>

<style scoped>
.total-container {
  position: absolute;
  left: 0px;
  top: 0px;
  width: 100%;
  height: 100%;
  padding: 0px;
  z-index: 0;
}
.point_animation {
  background: #85ff4d7a;
  width: 10px;
  height: 10px;
  border: 10px #ff4d4f solid;
  border-radius: 50%;
  position: absolute;
}
.point_animation p,
.point_animation span {
  position: absolute;
  width: 4px;
  height: 4px;
  animation: point_animation 1.5s infinite;
  box-shadow: 0px 0px 1px #ff4d4f;
  margin: 0px;
  border-radius: 50%;
}
.point_animation span {
  animation-delay: 1s;
}
@keyframes point_animation {
  10% {
    transform: scale(1);
  }
  100% {
    transform: scale(8);
  }
}
</style>
