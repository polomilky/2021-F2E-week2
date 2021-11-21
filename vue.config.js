module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/2021-F2E-week2/'
    : '/',
  transpileDependencies: [
    'vuetify'
  ]
}
