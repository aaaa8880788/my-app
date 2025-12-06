const config = {
  plugins: {
    'postcss-px-to-viewport': {
      viewportWidth: 768, // 平板设备宽度
      viewportHeight: 1024, // 平板设备高度
      unitPrecision: 3, // 转换后保留的小数位数
      viewportUnit: 'vw', // 转换的单位
      selectorBlackList: [], // 不需要转换的选择器
      minPixelValue: 1, // 小于或等于1px不转换
      mediaQuery: false, // 媒体查询中的单位是否转换
      exclude: /node_modules/ // 排除node_modules目录
    }
  },
};

export default config;
