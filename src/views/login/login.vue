<template>
  <div>
    <a-form
      id="components-form-demo-normal-login"
      class="user-layout-login"
      :form="form"
      @submit="handleSubmit"
      style="padding-top:10%"
    >
      <a-form-item>
        <a-input
          v-decorator="['mobile',validatorRules.mobile]"
          size="large"
          type="text"
          placeholder="手机号"
        >
          <a-icon slot="prefix" type="mobile" :style="{ color: 'rgba(0,0,0,.25)' }" />
        </a-input>
      </a-form-item>

      <a-row :gutter="16">
        <a-col class="gutter-row" :span="16">
          <a-form-item>
            <a-input
              v-decorator="['captcha',validatorRules.captcha]"
              size="large"
              type="text"
              placeholder="请输入验证码"
            >
              <a-icon slot="prefix" type="mail" :style="{ color: 'rgba(0,0,0,.25)' }" />
            </a-input>
          </a-form-item>
        </a-col>
        <a-col class="gutter-row" :span="8">
          <a-button
            class="getCaptcha"
            tabindex="-1"
            :disabled="state.smsSendBtn"
            @click.stop.prevent="getCaptcha"
            v-text="!state.smsSendBtn && '获取验证码' || (state.time+' s')"
          ></a-button>
        </a-col>
      </a-row>
      <a-form-item style="margin-top:24px;text-align: center;">
        <a-button
          block
          size="large"
          type="primary"
          htmlType="submit"
          class="login-button"
          :loading="loginBtn"
          @click.stop.prevent="handleSubmit"
          :disabled="loginBtn"
        >确定</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
import { postAction, getAction } from "@/api/manage";
import Vue from "vue";
export default {
  name: "login",
  data() {
    return {
      loginBtn: false,
      validatorRules: {
        mobile: { rule: [{ validator: this.validateMobile }] },
        captcha: { rule: [{ required: true, message: "请输入验证码!" }] },
      },
      state: {
        time: 120,
        smsSendBtn: false,
      },
      url: {
        phoneLogin: "/sys/phoneLogin",
      },
    };
  },
  beforeCreate() {
    this.form = this.$form.createForm(this, { name: "normal_login" });
  },
  created() {
    this.checkToken();
  },
  methods: {
    validateMobile(rule, value, callback) {
      if (
        !value ||
        new RegExp(
          /^1([38][0-9]|4[579]|5[0-3,5-9]|6[6]|7[0135678]|9[89])\d{8}$/
        ).test(value)
      ) {
        callback();
      } else {
        callback("您的手机号码格式不正确!");
      }
    },
    handleSubmit(e) {
      let that = this;
      let loginParams = {};
      that.loginBtn = true;
      that.form.validateFields(
        ["mobile", "captcha"],
        { force: true },
        (err, values) => {
          if (!err) {
            loginParams.mobile = values.mobile;
            loginParams.captcha = values.captcha;
            postAction(that.url.phoneLogin,loginParams)
              .then((res) => {
                console.log(res);
                if (res.success == true && res.result) {
                  Vue.ls.set(
                    "token",
                    res.result.token,
                    60 * 60 * 24 * 7 * 1000
                  );
                  Vue.ls.set(
                    "userInfo",
                    res.result.userInfo,
                    60 * 60 * 24 * 7 * 1000
                  );
                  that.$message.success("登陆成功");
                  that.$router.push({
                    path: "/GISMap",
                  });
                } else {
                  that.$message.error(res.message);
                }
                that.loginBtn = false;
              })
              .catch((err) => {
                that.$message.error(err);
                that.loginBtn = false;
              });
          } else {
            that.loginBtn = false;
          }
        }
      );
    },
    cmsFailed(err) {
      this.$notification["error"]({
        message: "登录失败",
        description: err,
        duration: 4,
      });
    },
    checkToken() {
      if (typeof this.$router.params == "undefined") {
        var ACCESS_TOKEN = Vue.ls.get("token");
        if (ACCESS_TOKEN) {
          this.$message.success("登陆成功");
          this.$router.push({
            path: "/GISMap",
          });
        }
      }
    },
    getCaptcha(e) {
      e.preventDefault();
      let that = this;
      this.form.validateFields(["mobile"], { force: true }, (err, values) => {
        if (!values.mobile) {
          that.cmsFailed("请输入手机号");
        } else if (!err) {
          this.state.smsSendBtn = true;
          let interval = window.setInterval(() => {
            if (that.state.time-- <= 0) {
              that.state.time = 60;
              that.state.smsSendBtn = false;
              window.clearInterval(interval);
            }
          }, 1000);

          const hide = this.$message.loading("验证码发送中..", 0);
          let smsParams = {};
          smsParams.mobile = values.mobile;
          smsParams.smsmode = "0";
          postAction("/sys/sms", smsParams)
            .then((res) => {
              if (!res.success) {
                setTimeout(hide, 0);
                this.cmsFailed(res.message);
              }
              console.log(res);
              setTimeout(hide, 500);
            })
            .catch((err) => {
              setTimeout(hide, 1);
              clearInterval(interval);
              that.state.time = 60;
              that.state.smsSendBtn = false;
              this.requestFailed(err);
            });
        }
      });
    },
    requestFailed(err) {
      this.$notification["error"]({
        message: "登录失败",
        description:
          ((err.response || {}).data || {}).message ||
          err.message ||
          "请求出现错误，请稍后再试",
        duration: 4,
      });
      this.loginBtn = false;
    },
  },
};
</script>
<style scoped>
label {
  font-size: 14px;
}

.getCaptcha {
  display: block;
  width: 100%;
  height: 40px;
}

.forge-password {
  font-size: 14px;
}

button.login-button {
  padding: 0 15px;
  font-size: 16px;
  height: 40px;
  width: 100%;
}

.user-login-other {
  text-align: left;
  margin-top: 24px;
  line-height: 22px;
}
.item-icon {
  font-size: 24px;
  color: rgba(0, 0, 0, 0.2);
  margin-left: 16px;
  vertical-align: middle;
  cursor: pointer;
  transition: color 0.3s;
}
:hover {
  color: #1890ff;
}

.register {
  float: right;
}
</style>
<style>
</style>