import * as path from 'path'
import * as webpack from 'webpack'

const usePlugins: webpack.Plugin[] = [
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      TARGET_URL: JSON.stringify(process.env.TARGET_URL),
      LOGIN_ID: JSON.stringify(process.env.LOGIN_ID),
      LOGIN_PW: JSON.stringify(process.env.LOGIN_PW)
    }
  }),
  new webpack.optimize.AggressiveMergingPlugin(),
  new webpack.optimize.OccurrenceOrderPlugin(true)
]

const config: webpack.Configuration[] = [
  {
    cache: true,
    context: path.join(__dirname, 'src'),
    devtool: false,
    name: 'ticket-crawler',
    target: 'node',

    resolve: {
      extensions: ['.ts', '.js', '.json'],
      alias: {
        '@src': path.resolve(__dirname, 'src')
      }
    },

    entry: './main',

    output: {
      // filename: `[name].[hash].js`,
      filename: 'app.js',
      path: path.join(__dirname, 'dist')
    },

    optimization: {
      splitChunks: {
        cacheGroups: {
          main: {
            test: /src/,
            name: 'main',
            chunks: 'initial',
            enforce: true
          },
          vendor: {
            test: /node_modules/,
            name: 'vendor',
            chunks: 'initial',
            enforce: true
          }
        }
      }
    },

    module: {
      rules: [
        {
          include: path.join(__dirname, 'src'),
          test: /\.ts$/,
          use: {
            loader: 'awesome-typescript-loader',
            options: {
              useCache: true,
              reportFiles: ['src/**/*.{ts}'],
              useBabel: true,
              babelOptions: {
                babelrc: false
              }
            }
          }
        },
        {
          enforce: 'pre',
          test: /\.js$/,
          use: {
            loader: 'source-map-loader'
          }
        },
        {
          include: path.join(__dirname, 'src'),
          test: /\.json?$/,
          use: {
            loader: 'json-loader'
          }
        },
        {
          test: /\.(yml|yaml)$/,
          use: [{ loader: 'json-loader' }, { loader: 'yaml-flat-loader' }]
        }
      ]
    },

    plugins: usePlugins
  }
]

export default config
