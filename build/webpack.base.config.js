
var config = {
  entry: ['./src/main.js'],
  output: {
    path: './dist',
    publicPath: 'dist/',
    filename: 'build.js'
  },
  // resolve: {
  //   root: [
  //     path.resolve('/Users/lipten/www/wesee/src/')
  //   ],
  // },
  module: {
    loaders: [
      {
        test: /\.vue$/,
        loader: 'vue'
      },
      {
        test: /\.js$/,
        loader: 'babel',
        // make sure to exclude 3rd party code in node_modules
        exclude: /node_modules/
      },
    ]
  },
  // vue-loader config:
  // lint all JavaScript inside *.vue files with ESLint
  // make sure to adjust your .eslintrc
  vue: {
    loaders: {
      js: 'babel'
    }
  }
}


module.exports = config
