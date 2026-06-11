export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/search/index',
    'pages/mine/index',
    'pages/detail/index',
    'pages/creator/index',
    'pages/order/index',
    'pages/feedback/index',
    'pages/update/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#FFFFFF',
    navigationBarTitleText: '主题市场',
    navigationBarTextStyle: 'black',
    backgroundColor: '#F8F7FF'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#7C3AED',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页'
      },
      {
        pagePath: 'pages/search/index',
        text: '搜索'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
