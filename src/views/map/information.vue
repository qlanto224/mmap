<template>
  <div>
    <a-drawer title="地籍信息" placement="bottom" :closable="false" :visible="visible" @close="onClose">
      <a-descriptions bordered :column="{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }">
        <a-descriptions-item label="单位名称">{{datasource.dwmc}}</a-descriptions-item>
        <a-descriptions-item label="地籍号">{{datasource.djh}}</a-descriptions-item>
        <a-descriptions-item label="面积">{{datasource.mj}}</a-descriptions-item>
        <a-descriptions-item label="用途">{{datasource.yt}}</a-descriptions-item>
        <a-descriptions-item label="证号">{{datasource.zh}}</a-descriptions-item>
        <a-descriptions-item label="面积成果编号">{{datasource.mjcgbh}}</a-descriptions-item>
        <a-descriptions-item label="资料编号">{{datasource.zlbh}}</a-descriptions-item>
        <a-descriptions-item label="资料来源">{{datasource.zlly}}</a-descriptions-item>
        <a-descriptions-item label="出证时间">{{datasource.czsj}}</a-descriptions-item>
        <a-descriptions-item label="测量时间">{{datasource.clsj}}</a-descriptions-item>
        <a-descriptions-item label="备注1">{{datasource.bz1}}</a-descriptions-item>
        <a-descriptions-item label="备注2">{{datasource.bz2}}</a-descriptions-item>
      </a-descriptions>
      <br />
      <a-button type="primary" :disabled="datasource.djh==''" @click="uploadInvestigationRecord">
        <a-icon type="upload" />上传巡查记录
      </a-button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <a-button :disabled="datasource.djh==''" type="primary" @click="lookInvestigationRecord"> <a-icon type="control" />查看巡查记录</a-button>
    </a-drawer>
    <!-- <investigation-record ref="modalForm"></investigation-record> -->
    <!-- <document-model ref="documentModel"></document-model> -->
  </div>
</template>
<script>

export default {
  name: "information",
  data() {
    return {
      visible: false,
      datasource: {
        dwmc:'',
        djh:'',
        yt:'',
        zh:'',
        mjcgbh:'',
        zlbh:'',
        zlly:'',
        czsj:'',
        clsj:'',
        bz1:'',
        bz2:''
      },
    };
  },
  created() {
  },
  beforeRouteLeave(to, from, next) {
    to.meta.keepAlive = true;
    next();
  },
  methods: {
    onClose() {
      this.visible = false;
      this.datasource = {
        dwmc:'',
        djh:'',
        yt:'',
        zh:'',
        mjcgbh:'',
        zlbh:'',
        zlly:'',
        czsj:'',
        clsj:'',
        bz1:'',
        bz2:''
      }
    },
    showInit(record) {
      if (record != null) {
        this.visible = true;
        Object.keys(record).forEach(key=>{
          if(key in this.datasource){
            this.datasource[key] = record[key]
          }
        })
      }
    },
    //上传巡查记录
    uploadInvestigationRecord() {
      this.visible = false;
      this.$router.push({
        path: "/investigationRecord",
        query: {
          type:0,
          djh:this.datasource.djh
        },
      });
    },
    //查看巡查记录
    lookInvestigationRecord(){
      this.visible = false;
      this.$router.push({
        path: "/investigationRecord",
        query: {
          djh:this.datasource.djh,
          type:1
        },
      });
    },
  },
  mounted() {},
  watch: {},
};
</script>

<style scoped>
</style>