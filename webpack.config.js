'use strict';

const webpack = require('webpack');
const path = require('path');
const colors = require('colors');

const isDevBuild = process.argv[1].indexOf('webpack-dev-server') !== -1;
const dhisConfigPath =
    process.env.DHIS2_HOME && `${process.env.DHIS2_HOME}/config`;
let dhisConfig;

try {
    dhisConfig = require(dhisConfigPath);
} catch (e) {
    // Failed to load config file - use default config
    console.warn(`\nWARNING! Failed to load DHIS config:`, e.message);
    dhisConfig = {
        baseUrl: 'http://localhost:8080',
        authorization: 'Basic YWRtaW46ZGlzdHJpY3Q=', // admin:district
    };
}

const HTMLWebpackPlugin = require('html-webpack-plugin');

// Replacement for UglifyJsPlugin not working with d2-ui-anlaytics and ui-core
const TerserPlugin = require('terser-webpack-plugin-legacy');

const scriptPrefix = isDevBuild ? dhisConfig.baseUrl : '..';

function log(req, res, opt) {
    req.headers.Authorization = dhisConfig.authorization;
    console.log(
        '[PROXY]'.cyan.bold,
        req.method.green.bold,
        req.url.magenta,
        '=>'.dim,
        opt.target.dim
    );
}

const webpackConfig = {
    context: __dirname,
    entry: {
        app: ['babel-polyfill', './src/app.js'],
        map: ['babel-regenerator-runtime', './src/map.js'],
    },
    devtool: 'source-map',
    output: {
        path: __dirname + '/build',
        filename: '[name].js',
        chunkFilename: '[name].bundle.js',
        publicPath: isDevBuild ? 'http://localhost:8082/' : './',
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                include: [
                    path.resolve(__dirname, 'src/'),
                    /@dhis2\/prop-types/,
                ],
                loader: 'babel-loader',
                query: {
                    cacheDirectory: true,
                    presets: ['es2015', 'stage-2'],
                },
            },
            {
                test: /\.css$/,
                loader: 'style-loader!css-loader',
            },
            {
                test: /\.scss$/,
                loader: 'style-loader!css-loader!sass-loader',
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                loaders: [
                    'file-loader?hash=sha512&digest=hex&name=[hash].[ext]',
                    {
                        loader: 'image-webpack-loader',
                        query: {
                            mozjpeg: {
                                progressive: true,
                            },
                            gifsicle: {
                                interlaced: false,
                            },
                            optipng: {
                                optimizationLevel: 4,
                            },
                            pngquant: {
                                quality: '75-90',
                                speed: 3,
                            },
                        },
                    },
                ],
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                use: ['file-loader'],
            },
        ],
    },
    resolve: {
        alias: {
            redux: path.resolve('./node_modules/redux'),
            'react-redux': path.resolve('./node_modules/react-redux'),
            'redux-thunk': path.resolve('./node_modules/redux-thunk'),
            'redux-logger': path.resolve('./node_modules/redux-logger'),
            'd2-ui': path.resolve('./node_modules/d2-ui'),
            d2: path.resolve('./node_modules/d2'),
        },
    },
    plugins: [
        new HTMLWebpackPlugin({
            template: 'public/index.html',
            chunks: ['app'],
        }),
    ],
    devServer: {
        contentBase: './public',
        port: 8082,
        inline: true,
        compress: true,
    },
};

if (!isDevBuild) {
    webpackConfig.plugins.push(
        // Replace any occurance of process.env.NODE_ENV with the string 'production'
        new webpack.DefinePlugin({
            'process.env': { NODE_ENV: JSON.stringify('production') },
            DHIS_CONFIG: JSON.stringify({}),
        })
    );
    webpackConfig.plugins.push(new webpack.optimize.OccurrenceOrderPlugin());
    /* Currently not working with d2-ui-anlaytics and ui-core
    webpackConfig.plugins.push(
        new webpack.optimize.UglifyJsPlugin({
            comments: false,
            sourceMap: true,
        })
    );
    */
    webpackConfig.plugins.push(new TerserPlugin());
} else {
    webpackConfig.plugins.push(
        new webpack.DefinePlugin({
            'process.env': { NODE_ENV: JSON.stringify('development') },
            DHIS_CONFIG: JSON.stringify(dhisConfig),
        })
    );
}

module.exports = webpackConfig;
