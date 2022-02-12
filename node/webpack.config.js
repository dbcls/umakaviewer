const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const webpack = require('webpack')

const SOURCE_DIR = path.resolve('./src/')
const DEST_DIR = path.resolve('./public/')
const INDEX_FILE = 'html/index.html'


module.exports = (env, args) => {
  let FIREBASE_CONFIG
  switch (args.mode) {
  case 'development':
    FIREBASE_CONFIG = {
      apiKey: "AIzaSyB3GMmRd9JWGVvDlEtgpemtYZPo-WRkNpc",
      authDomain: "fabled-alchemy-246207.firebaseapp.com",
      databaseURL: "https://fabled-alchemy-246207.firebaseio.com",
      projectId: "fabled-alchemy-246207",
      storageBucket: "",
      messagingSenderId: "873301119866",
      appId: "1:873301119866:web:ac99be26e7597ff1"
    }
    break
  case 'production':
    FIREBASE_CONFIG = {
      apiKey: "AIzaSyBNTb8DHaHbx32oifMkM_zKTGL4oI1QUNY",
      authDomain: "dbcls-ead06.firebaseapp.com",
      databaseURL: "https://dbcls-ead06.firebaseio.com",
      projectId: "dbcls-ead06",
      storageBucket: "",
      messagingSenderId: "592822553818",
      appId: "1:592822553818:web:347aeda42e719e4d"
    }
    break
  default:
    FIREBASE_CONFIG = {
      apiKey: "",
      authDomain: "",
      databaseURL: "",
      projectId: "",
      storageBucket: "",
      messagingSenderId: "",
      appId: ""
    }
  }

  let devtool
  switch (args.mode) {
  case 'development':
    devtool = 'source-map'
    break
  case 'production':
    devtool = false
    break
  default:
    devtool = 'source-map'
  }

  return {
    entry: "./src/ts/index.tsx",
    output: {
      filename: "static/js/bundle.js",
      path: __dirname + "/public"
    },

    // Enable sourcemaps for debugging webpack's output.
    devtool,

    resolve: {
      // Add '.ts' and '.tsx' as resolvable extensions.
      extensions: [".ts", ".tsx", ".js", ".json"]
    },

    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: [
            {loader: "babel-loader"},
            {loader: "ts-loader"},
          ]
        },
        {
          test: /\.s?css$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                hmr: false
              }
            },
            {
              loader: "css-loader",
              options: {
                url: false,
                importLoaders: 2
              }
            },
            {
              loader: "postcss-loader"
            },
            {
              loader: "sass-loader"
            }
          ]
        },
      ]
    },

    plugins: [
      new HtmlWebpackPlugin({
        inject: false,
        minify: false,
        template: path.join(SOURCE_DIR, 'html', 'index.html'),
        filename: path.join(DEST_DIR, 'index.html'),
        timestamp: (new Date()).getTime(),
      }),
      new CopyPlugin([
        { from: 'src/images', to: 'static/images' },
        { from: 'src/blacklists', to: 'static/blacklists' },
        { from: 'src/html/yasgui.html', to: 'yasgui.html'}
      ]),
      new MiniCssExtractPlugin({
        filename: 'static/css/[name].css',
        chunkFilename: '[id].css',
        ignoreOrder: false,
      }),
      new webpack.DefinePlugin({
        FIREBASE_CONFIG: JSON.stringify(FIREBASE_CONFIG),
      }),
    ],
  }
}
