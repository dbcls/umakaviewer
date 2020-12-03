module.exports = ({file, options, env}) => ({
  parser: file.extname === '.sss' ? 'sugarss' : false,
  plugins: {
    'postcss-import': { root: file.dirname},
    'postcss-preset-env': options['postcss-preset-env'] ? options['postcss-preset-env'] : false,
    // TODO: 余裕があればpostcss-nestedからpostcss-nestingを使用するように変更(postcssまわりを新しくする)
    // 'postcss-preset-env': {
    //   stage: 3,
    //   features: {
    //     'nesting-rules': true
    //   }
    // },
    'precss': {},
    'postcss-nested': {},
    'cssnano': env === 'production' ? options.cssnano : false
  }
})
