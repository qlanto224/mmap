import {axios,service} from '@/utils/request';

//post
export function postAction(url,parameter,ACCESS_TOKEN) {
  return axios({
    url: url,
    method:'post' ,
    data: parameter,
    headers: {
      'X-Access-Token':ACCESS_TOKEN
    },
  })
}

//post method= {post | put}
export function httpAction(url,parameter,method) {
  return axios({
    url: url,
    method:method ,
    data: parameter
  })
}

//put
export function putAction(url,parameter) {
  return axios({
    url: url,
    method:'put',
    data: parameter
  })
}

//get
export function getAction(url,parameter,ACCESS_TOKEN) {
  return axios({
    url: url,
    method: 'get',
    params: parameter,
    headers: {
      'X-Access-Token':ACCESS_TOKEN
    },
  })
}

//deleteAction
export function deleteAction(url,parameter) {
  return axios({
    url: url,
    method: 'delete',
    params: parameter
  })
}

/**
 * 下载文件 用于excel导出
 * @param url
 * @param parameter
 * @returns {*}
 */
export function downFile(url,parameter){
  return axios({
    url: url,
    params: parameter,
    method:'get' ,
    responseType: 'blob'
  })
}


/**
 * 文件上传 用于富文本上传图片
 * @param url
 * @param parameter
 * @returns {*}
 */
export function uploadAction(url,parameter,ACCESS_TOKEN){
  return axios({
    url: url,
    data: parameter,
    method:'post' ,
    headers: {
      'Content-Type': 'multipart/form-data',  // 文件上传
      'X-Access-Token':ACCESS_TOKEN
    },
  })
}
