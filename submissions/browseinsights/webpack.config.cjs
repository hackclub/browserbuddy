const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    background: './src/background/background.ts',
    dashboard: './src/ui/dashboard/app.tsx',
    settings: './src/ui/settings/app.tsx',
    engagement: './src/content/engagement.ts',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js',
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/ui/dashboard/index.html',
      filename: 'dashboard.html',
      chunks: ['dashboard']
    }),
    new HtmlWebpackPlugin({
      template: './src/ui/settings/index.html',
      filename: 'settings.html',
      chunks: ['settings']
    }),
    new CopyPlugin({
      patterns: [
        { from: 'manifest.json' },
        { from: 'assets', to: 'assets' }
      ],
    }),
  ],
  optimization: {
    splitChunks: {
      chunks: (chunk) => chunk.name !== 'background',
    },
  },
  devtool: 'cheap-module-source-map',
  mode: 'development',
  // Ensure output is compatible with service workers
  // experiments: {
  //   outputModule: true,
// }
};