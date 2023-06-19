const path = require('path');

module.exports = {
  entry: './src/index.ts',
  mode: "production",
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
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'index.psjs',
    path: path.resolve(__dirname, 'dist'),
    library: {
      type: 'commonjs-module',
    },
  },
  externals: {
    photoshop: 'photoshop',
    uxp: 'uxp',
  },
  experiments: {
    topLevelAwait: true,
    
    outputModule: true,
  },
};