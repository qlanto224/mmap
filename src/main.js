import Vue from 'vue'
import App from './App.vue'
import router from './router'
import 'ant-design-vue/dist/antd.css';
import Antd from 'ant-design-vue'
import Vant from 'vant';
import 'vant/lib/index.css';
import Storage from 'vue-ls';


Vue.use(Storage);
Vue.use(Vant);
Vue.use(Antd)
Vue.config.productionTip = false

new Vue({
    router,
    render: h => h(App)
}).$mount('#app')
