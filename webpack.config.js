//@ts-check
const UserScriptPlugin = require("./webpack-user-script-plugin");
const TypedCssModulePlugin = require("./webpack-typed-css-module-plugin");
const { name: packageName } = require("./package.json");
const webpack = require("webpack");

const entry = `./source/${packageName}.user.ts`;

/** @type {import("webpack").Configuration} */
const config = {
    mode: "production",
    entry,
    plugins: [
        new webpack.DefinePlugin({
            "process.browser": true,
        }),
        UserScriptPlugin,
        new TypedCssModulePlugin(),
    ],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
            {
                test: /\.svg$/,
                type: "asset/source",
            },
        ],
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
    },
    target: ["web", "es2020"],
    optimization: {
        minimize: false,
    },
    devtool: "nosources-source-map",
    output: {
        path: __dirname,
        filename: `${packageName}.user.js`,
    },
    stats: {
        children: true,
    },
};
module.exports = config;
