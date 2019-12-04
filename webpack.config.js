var PACKAGE = require('./package.json');
var version = PACKAGE.version;
module.exports = {
    entry: "./src/index.ts",
    output: {
      filename: "subao-sdk-" + version + ".min.js",
      path: __dirname + "/dist"
    },

    resolve: {
      extensions: [".ts", ".tsx", ".js", ".json"]
    },
  
    module: {
      rules: [
        { test: /\.ts?$/, loader: "ts-loader" },
      ]
    },

    plugins: []
};