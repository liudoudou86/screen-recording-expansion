const path = require('path')
const fs = require('fs')
const process = require('process');

// Generate pages object
const pages = {}

function getEntryFile (entryPath) {
  let files = fs.readdirSync(entryPath)
  return files
}

const chromeName = getEntryFile(path.resolve(`src/entry`))

function getFileExtension (filename) {
  return /[.]/.exec(filename) ? /[^.]+$/.exec(filename)[0] : undefined
}
chromeName.forEach((name) => {
  const fileExtension = getFileExtension(name)
  const fileName = name.replace('.' + fileExtension, '')
  pages[fileName] = {
    entry: `src/entry/${name}`,
    template: 'public/index.html',
    filename: `html/${fileName}.html`
  }
})

const isDevMode = process.env.NODE_ENV === 'development'

// 按需求自动导入
const AutoImport = require("unplugin-auto-import/webpack");
const Components = require("unplugin-vue-components/webpack");
const { ElementPlusResolver } = require("unplugin-vue-components/resolvers");
const IconsResolver = require("unplugin-icons/resolver");
const Icons = require("unplugin-icons/webpack");
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')

module.exports = {
  pages,
  filenameHashing: false,
  chainWebpack: (config) => {
    config.plugin('copy').use(require('copy-webpack-plugin'), [
      {
        patterns: [
          {
            from: path.resolve(`src/manifest.${process.env.NODE_ENV}.json`),
            to: `${path.resolve('dist')}/manifest.json`
          },
          {
            from: path.resolve(`src/assets/`),
            to: `${path.resolve('dist')}/imgs/`
          }
        ]
      }
    ])
  },
  configureWebpack: {
    output: {
      filename: `js/[name].js`,
      chunkFilename: `js/[name].js`
    },
    devtool: isDevMode ? 'inline-source-map' : false,
    plugins: [
      AutoImport({
        // 自动导入 Element Plus 相关函数，如：ElMessage, ElMessageBox... (带样式)
        resolvers: [
          ElementPlusResolver(),
          // 自动导入图标组件
          IconsResolver({
            prefix: 'Icon',
          }),
        ],
      }),
      Components({
        resolvers: [
          // 自动导入 Element Plus 组件
          ElementPlusResolver(),
          // 自动注册图标组件
          IconsResolver({
            enabledCollections: ['ep'],
          }),
        ],
      }),
      Icons({
        autoInstall: true,
      }),
      new NodePolyfillPlugin(),
    ],
    //关闭 webpack 的性能提示
    performance: {
      hints:false
    },
    resolve: {
      fallback: {
        fs: false
      },
    }
  },
  css: {
    extract: false // Make sure the css is the same
  }
}
