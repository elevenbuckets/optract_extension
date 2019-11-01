const path = require('path');
module.exports = {
  entry: './scripts/background.js',
  output: {
    path: path.join(__dirname, 'dist/chrome/'),
    filename: 'background_bundle.js'
  },
  module: {
    rules: [{
      loader: 'babel-loader',
      test: /\.js$/,
      exclude: /node_modules/
    }, {
      test: /\.css$/,
      use: [
        'style-loader',
        'css-loader'
      ]
    }]
  }, 
  // devtool: 'eval',
  devServer: {
    contentBase: path.join(__dirname, 'public'),
    historyApiFallback : true
  }
};
