var webpack = require('webpack');
 
module.exports = {
  entry: './scripts/index.tsx',
  output: {
    filename: './app-bundle.js'
  },
  // Turn on sourcemaps
  devtool: 'source-map',
  resolve: {
    extensions: ['', '.webpack.js', '.web.js', '.ts', '.js', '.tsx'],
  },
  // Add minification
  plugins: [
  //   new webpack.DefinePlugin({
  //     'process.env.NODE_ENV': JSON.stringify(/*process.env.NODE_ENV ||*/ 'development')
  // }),
//   new webpack.DefinePlugin({
//       'process.env': {
//         'NODE_ENV': '"development"'
//       }
//     }),
    // new webpack.optimize.UglifyJsPlugin()
  ],
  module: {
    loaders: [
      { test: /\.tsx?$/, loader: 'ts-loader' }
    ]
  },
  externals: {
        fs: '{}',
        tls: '{}',
        net: '{}',
        console: '{}'
      } 
}