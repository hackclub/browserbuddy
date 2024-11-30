"use strict";

const { merge } = require("webpack-merge");

const common = require("./webpack.common.js");
const PATHS = require("./paths");

// Merge webpack configuration files
const config = merge(common, {
    entry: {
        popup: PATHS.src + "/js/popup.js",
        contentScript: PATHS.src + "/js/contentScript.js",
        background: PATHS.src + "/js/background.js",
    },
});

module.exports = config;
