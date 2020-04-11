const path = require('path');

module.exports = {
  entry: './src/ts/piano-keys.ts',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js', '.html' ],
  },
  output: {
    filename: 'piano-keys.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/dist/'
  }
};
