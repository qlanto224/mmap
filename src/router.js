import Vue from 'vue'
import Router from 'vue-router'
import GISMap from "./views/map/GISMap";
import login from "./views/login/login";
import investigationRecord from './views/map/modal/InvestigationRecord.vue'

Vue.use(Router)

export default new Router({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: [
        {
            path: '/login',
            name: 'login',
            component: login,
            // meta:{keepAlive:false}
        },
        {
            path: '/GISMap',
            name: 'GISMap',
            component: GISMap,
            // meta:{keepAlive:true}
        },
        {
            path: '/investigationRecord',
            name: 'investigationRecord',
            component: investigationRecord ,
            // meta:{keepAlive:false}
        }
    ]
})
