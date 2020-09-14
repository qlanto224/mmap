module.exports = {
  // 打包app时放开该配置
  publicPath: process.env.VUE_APP_ROOT_URL,
  /* configureWebpack: config => {
    // 生产环境取消 console.log
    if (process.env.NODE_ENV === 'production') {
      config.optimization.minimizer[0].options.terserOptions.compress.drop_console = true
    }
  }, */
  outputDir: 'mmap',
  productionSourceMap: false,
  devServer: {
    port: 8088,
    proxy: {
      '/*****': {
        target: 'http://********',
        ws: false,
        changeOrigin: true
      }
    }
  }
}
