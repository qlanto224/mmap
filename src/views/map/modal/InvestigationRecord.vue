<template>
  <div>
    <a-button @click="$router.back(-1)" class="form" type="primary">返回</a-button>
    <van-form :scroll-to-error="true" :v-show="visible" @submit="onSubmit">
      <van-field
        :readonly="!look"
        clickable
        name="datetimePicker"
        v-model="datetimePicker"
        label="巡查日期"
        placeholder="点击选择巡查日期"
        @focus="forbid"
        @click="datetimeSta"
        :rules="[{ required: true, message: '请填写选择巡查日期' }]"
      />
      <van-popup position="bottom" round v-model="datetimeShow">
        <van-datetime-picker
          v-model="createTime"
          type="datetime"
          title="巡查日期"
          :min-date="mindate"
          :max-date="maxdate"
          @confirm="onConfirm"
          @cancel="datetimeShow = false"
          :formatter="formatter"
        />
      </van-popup>
      <van-field
        :readonly="!look"
        v-model="inspectors"
        name="inspectors"
        label="巡查人员"
        placeholder="巡查人员"
        :rules="[{ required: true, message: '请填写巡查人员' }]"
      />
      <van-field name="region" label="巡查区域">
        <template #input>
          <van-radio-group v-model="region" direction="horizontal">
            <van-radio :disabled="!look" name="gaotiexincheng">高铁新城</van-radio>
            <van-radio :disabled="!look" name="zhongxinqu">中心区</van-radio>
          </van-radio-group>
        </template>
      </van-field>
      <van-field
        :readonly="!look"
        name="route"
        v-model="route"
        rows="2"
        autosize
        label="路线"
        type="textarea"
        maxlength="255"
        placeholder="请输入路线"
        show-word-limit
      />
      <van-field
      :readonly="!look"
        v-model="witness"
        name="witness"
        label="见证人"
        placeholder="见证人"
        :rules="[{ required: true, message: '请填写见证人' }]"
      />
      <van-field
      :readonly="!look"
        v-model="fieldInspection"
        name="fieldInspection"
        label="外业巡查"
        placeholder="外业巡查"
        :rules="[{ required: true, message: '请填写外业巡查' }]"
      />
      <van-field
      :readonly="!look"
        v-model="illegalSubjectAndProejctName"
        name="illegalSubjectAndProejctName"
        label="违法主体及项目名称"
        placeholder="违法主体及项目名称"
      />
      <van-field
      :readonly="!look"
        v-model="party"
        name="party"
        label="当事人"
        placeholder="当事人"
        :rules="[{ required: true, message: '请填写当事人' }]"
      />
      <van-field
      :readonly="!look"
        v-model="contact"
        name="contact"
        label="联系方式"
        placeholder="联系方式"
        :rules="[{ required: true, message: '请填写联系方式' }]"
      />
      <van-field :readonly="!look" v-model="illegalFacts" name="illegalFacts" label="违法事实" placeholder="违法事实" />
      <van-field
      :readonly="!look"
        v-model="preventiveMeasuresAndEffect"
        name="preventiveMeasuresAndEffect"
        label="制止措施及效果"
        placeholder="制止措施及效果"
      />
      <van-field
      :readonly="!look"
        v-model="auditOpinion"
        name="auditOpinion"
        label="负责人审核意见"
        placeholder="负责人审核意见"
        :rules="[{ required: true, message: '请填写负责人审核意见' }]"
      />
      <van-field
      :readonly="!look"
        v-model="generalEvents"
        name="generalEvents"
        label="一般事件"
        placeholder="一般事件"
        :rules="[{ required: true, message: '请填写一般事件' }]"
      />
      <van-field
      :readonly="!look"
        v-model="majorIssues"
        name="majorIssues"
        label="重大事项"
        placeholder="重大事项"
        :rules="[{ required: true, message: '请填写重大事项' }]"
      />
      <van-field
      :readonly="!look"
        v-model="remark"
        name="remark"
        rows="2"
        autosize
        label="备注"
        type="textarea"
        maxlength="255"
        placeholder="请输入备注"
        show-word-limit
      />
      <van-field name="status" label="状态">
        <template #input>
          <van-radio-group v-model="status" direction="horizontal">
            <van-radio :disabled="!look" name="0">进行中</van-radio>
            <van-radio :disabled="!look" name="1">已完成</van-radio>
          </van-radio-group>
        </template>
      </van-field>
      <van-field name="photosFiles" label="巡查照片">
        <template #input>
          <van-uploader
            v-show="look"
            v-model="photosFiles"
            capture="camera"
            :after-read="uploadPhoto"
          />
        </template>
      </van-field>
      <van-grid v-show="!look">
        <van-grid-item v-for="(item,index) in pthotoUrls" :key="index">
          <van-image :src="item" />
        </van-grid-item>
      </van-grid>
      <div style="margin: 16px;" v-if="look">
        <van-button round block type="info" native-type="submit">提交</van-button>
      </div>
    </van-form>
  </div>
</template>
<script>
import { formatDate } from "@/utils/dateUtil";
import { getAction, postAction, uploadAction } from "@/api/manage";
import Vue from "vue";
import { Toast } from "vant";
export default {
  name: "investigationRecord",
  data() {
    return {
      visible: false,
      datetimeShow: false,
      createTime: null,
      datetimePicker: null,
      mindate: null,
      maxdate: null,
      showPicker: false,
      djh: null, //地块
      region: "gaotiexincheng",
      status: "0",
      inspectors: null,
      route: null,
      witness: null,
      fieldInspection: null,
      illegalSubjectAndProejctName: null,
      party: null,
      contact: null,
      illegalFacts: "",
      preventiveMeasuresAndEffect: null,
      auditOpinion: "",
      generalEvents: "",
      majorIssues: null,
      remark: "",
      inspectionPhotos: [],
      photosFiles: [],
      standingBook: [],
      files: [],
      pthotoUrls: [], //图片url数组
      look: true,
      url: {
        //获取巡查记录
        list: "/investigation/investigationRecord/list",
        add: "/investigation/investigationRecord/add",
        upload: "/sys/common/upload",
      },
      ACCESS_TOKEN: "",
    };
  },
  created() {
    this.visible = true;
    this.ACCESS_TOKEN = Vue.ls.get("token");
    this.djh = this.$route.query.djh;
    if (this.$route.query.type === "0") {
      //上传
      this.mindate = new Date(2020, 0, 1);
      this.maxdate = new Date(2025, 10, 1);
    } else {
      //查看
      this.getData(this.djh);
      this.look = false;
    }
  },
  methods: {
    forbid() {
      document.activeElement.blur();
    },
    datetimeSta() {
      if (this.look) {
        this.datetimeShow = true;
      }
    },

    formatter(type, val) {
      if (type === "year") {
        return val + "年";
      }
      if (type === "month") {
        return val + "月";
      }
      if (type === "day") {
        return val + "日";
      }
      if (type === "hour") {
        return val + "时";
      }
      if (type === "minute") {
        return val + "分";
      }
      if (type === "second") {
        return val + "秒";
      }
      return val;
    },
    onSubmit(e) {
      var that = this;
      e.inspectionPhotos = that.inspectionPhotos.join(",");
      e.standingBook = that.files.join(",");
      e.djh = this.djh;
      postAction(that.url.add, e, this.ACCESS_TOKEN)
        .then((res) => {
          if (res.success) {
            Toast.success({
              forbidClick: true,
              duration: 1500,
              message: "提交成功",
              onClose: function () {
                that.$router.push({
                  path: "/GISMap",
                });
              },
            });
          }
        })
        .catch((err) => {});
    },
    onConfirm(time) {
      this.datetimePicker = formatDate(time);
      this.datetimeShow = false;
    },
    uploadPhoto(file, detial) {
      var that = this;
      let params = new FormData();
      params.append("file", file.file);
      params.append("biz", "temp");
      uploadAction(that.url.upload, params, that.ACCESS_TOKEN)
        .then((res) => {
          that.inspectionPhotos.push("D:/sxby-wechat/jingkai/" + res.message);
        })
        .catch((err) => {});
    },
    upfile(file, detial) {
      var that = this;
      let params = new FormData();
      params.append("file", file.file);
      params.append("biz", "temp");
      uploadAction(that.url.upload, params, that.ACCESS_TOKEN)
        .then((res) => {
          that.files.push("D:/sxby-wechat/jingkai/" + res.message);
        })
        .catch((err) => {});
    },
    getData(djh) {
      var _that = this;
      getAction(_that.url.list, { djh: djh }, _that.ACCESS_TOKEN)
        .then(function (res) {
          _that.dataEcho(res.result.records[0]);
        })
        .catch(function (error) {});
    },
    //数据回显
    dataEcho(datasource) {
      let photos = [];
      this.datetimePicker = datasource.createTime;
      this.region = datasource.region;
      this.status = datasource.status;
      this.inspectors = datasource.inspectors;
      this.route = datasource.route;
      this.witness = datasource.witness;
      this.fieldInspection = datasource.fieldInspection;
      this.illegalSubjectAndProejctName =
        datasource.illegalSubjectAndProejctName;
      this.party = datasource.party;
      this.contact = datasource.contact;
      this.illegalFacts = datasource.illegalFacts;
      this.preventiveMeasuresAndEffect = datasource.preventiveMeasuresAndEffect;
      this.auditOpinion = datasource.auditOpinion;
      this.generalEvents = datasource.generalEvents;
      this.majorIssues = datasource.majorIssues;
      this.remark = datasource.remark;
      photos = datasource.inspectionPhotos.split(",");
      for(var index of photos){
        var photo = window._CONFIG['staticPhotoUrl']+index.substring(index.indexOf("temp"));
        this.pthotoUrls.push(photo);
      }
    },
  },
  mounted() {},
  watch: {},
};
</script>

<style scoped>
.form {
  margin: 5% 3% 3%;
}
</style>