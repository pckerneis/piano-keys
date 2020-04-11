var webpackConfig = require('./webpack.config.js');

module.exports = function (config) {
  config.set({
      basePath: '',
      frameworks: ['jasmine'],
      files: ['src/ts/test/test.ts'],
      preprocessors: {
        'src/ts/test/test.ts': ['webpack', 'sourcemap'],
      },
      webpack: webpackConfig,
      reporters: ['spec'],
      port: 9876,
      colors: true,
      logLevel: config.LOG_INFO,
      autoWatch: true,
      browsers: ['Chrome'],
      singleRun: false,
      concurrency: Infinity
  })
}