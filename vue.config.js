module.exports = {
  devServer: {
    host: 'turnstile.gloriatrials.com',
    port: 8081,
    allowedHosts: 'all', // Or specify your domain(s)
    // 本地测试dev server ，生产线不需要添加 或者忽略即可 
    proxy: {
      '/api': {
        target: 'http://localhost:8787', // Express 后端端口
        changeOrigin: true,
      },
    },
  },
};