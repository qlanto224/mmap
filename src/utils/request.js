import Vue from 'vue'
import axios from 'axios'
import {Modal} from 'ant-design-vue'

//自动设置后台服务 baseURL (也可以手工指定写死项目名字)
let baseDomain = window._CONFIG['domianURL'];
let baseProject = baseDomain.substring(baseDomain.lastIndexOf("/"));
console.log("baseDomain= ", baseDomain)
console.log("baseProject= ", baseProject)

// 创建 axios 实例
const service = axios.create({
  //baseURL: '/jeecg-boot',
  baseURL: baseProject, // api base_url
  timeout: 9000 // 请求超时时间
})

const err = (error) => {
  console.log(error.response)
  if (error.response) {
    let data = error.response.data
    const token =  Vue.ls.get("token");
    console.log("------异常响应------", token)
    console.log("------异常响应------", data.status)
    switch (data.status) {
      case 500:
        if (token && data.message == "Token失效，请重新登录") {
          Modal.error({
            title: '登录已过期',
            content: '很抱歉，登录已过期，请重新登录',
            okText: '重新登录',
            mask: false,
            onOk: () => {
              axios({
                url: baseDomain+'/sys/logout',
                headers: {
                  'X-Access-Token':token
                },
              }).then(()=>{
                Vue.ls.remove("token")
                window.location.replace("login")
              })
            }
          })
        }else{
          Modal.error({
            title: '登录失效',
            content: '很抱歉，登录失效，请重新登录',
            okText: '重新登录',
            mask: false,
            onOk: () => {
              Vue.ls.remove("token")
              window.location.replace("login")
            }
          })
        }
        break
    }
  }
  return Promise.reject(error)
};

service.interceptors.response.use((response) => {
  return response.data
}, err)

export {
  service as axios
}