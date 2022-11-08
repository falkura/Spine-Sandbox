/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

const common = {
    entry: "./src/index.ts",

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                include: [path.resolve(__dirname, "src")],
            },
            {
                test: /\.(png|jpg|ttf)$/,
                loader: "url-loader",
            },
        ],
    },

    resolve: {
        extensions: [".ts", ".js"],
    },

    externals: {
        "pixi.js": "PIXI",
    },
};

const local = {
    ...common,

    name: "local",

    mode: "development",

    output: {
        path: path.join(__dirname, "/dist"),
        filename: "app.js",
        publicPath: "/",
    },

    devtool: "eval-cheap-module-source-map",

    devServer: {
        static: {
            directory: path.join(__dirname, "./dist"),
        },
        client: {
            overlay: {
                errors: true,
                warnings: false,
            },
        },
        compress: true,
        port: 8899,
        open: {
            app: {
                name: process.platform == "linux" ? "google-chrome" : "Chrome",
            },
        },
    },

    plugins: [
        new CopyPlugin({
            patterns: [{ from: "./index.html", to: "./index.html" }],
        }),
    ],
};

const dev = {
    ...common,

    name: "dev",

    mode: "development",

    output: {
        path: path.join(__dirname, "/dist"),
        filename: "app.js",
        publicPath: "/",
    },

    devtool: "eval-cheap-module-source-map",

    plugins: [
        new CleanWebpackPlugin(),
        new CopyPlugin({
            patterns: [{ from: "./index.html", to: "./index.html" }],
        }),
    ],
};

module.exports = [local, dev];
