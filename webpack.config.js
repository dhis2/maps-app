'use strict';

const webpack = require('webpack');
const path = require('path');
const colors = require('colors');

const isDevBuild = process.argv[1].indexOf('webpack-dev-server') !== -1;

const dhisConfigPath = process.env.DHIS2_HOME && `${process.env.DHIS2_HOME}/config`;
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

const scriptPrefix = (isDevBuild ? dhisConfig.baseUrl : '..');

function log(req, res, opt) {
    req.headers.Authorization = dhisConfig.authorization;
    console.log('[PROXY]'.cyan.bold, req.method.green.bold, req.url.magenta, '=>'.dim, opt.target.dim);
}

const webpackConfig = {
    context: __dirname,
    entry: {
        'app': './src/app.js',
        'map': './src/map.js',
    },
    devtool: 'source-map',
    output: {
        path: __dirname + '/build',
        filename: '[name].js',
        chunkFilename: '[name].bundle.js',
        publicPath: isDevBuild ? 'http://localhost:8082/' : './',
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                include: [
                    path.resolve(__dirname, 'src/'),
                    path.resolve(__dirname, '../gis-api/src/'),
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
        ],
    },
    resolve: {
        alias: {
            react: path.resolve('./node_modules/react'),
            'material-ui': path.resolve('./node_modules/material-ui'),
            'material-ui-icons': path.resolve('./node_modules/material-ui-icons'),
            'redux': path.resolve('./node_modules/redux'),
            'react-redux': path.resolve('./node_modules/react-redux'),
            'redux-thunk': path.resolve('./node_modules/redux-thunk'),
            'redux-logger':path.resolve('./node_modules/redux-logger'),
            'd2-ui': path.resolve('./node_modules/d2-ui'),
            'd2': path.resolve('./node_modules/d2'),
        },
    },
    externals: [
        {
            'react': 'React',
            'react-dom': 'ReactDOM',
            'rx': 'Rx',
            'react-addons-transition-group': 'React.addons.TransitionGroup',
            'react-addons-create-fragment': 'React.addons.createFragment',
            'react-addons-update': 'React.addons.update',
            'react-addons-pure-render-mixin': 'React.addons.PureRenderMixin',
            'react-addons-shallow-compare': 'React.addons.ShallowCompare',
            'lodash/fp': 'fp',
        },
        /^react-addons/,
        /^react-dom$/,
        /^rx$/,
        /^lodash\/fp$/,
    ],
    plugins: [
        new HTMLWebpackPlugin({
            template: 'index.html',
            chunks: ['app'],
            vendorScripts: [
                `${scriptPrefix}/dhis-web-core-resource/babel-polyfill/6.20.0/dist/polyfill${isDevBuild ? '' : '.min'}.js`,
                `${scriptPrefix}/dhis-web-core-resource/react/16.1.1/umd/react.${isDevBuild ? 'development' : 'production.min'}.js`,
                `${scriptPrefix}/dhis-web-core-resource/react-dom/16.1.1/umd/react-dom.${isDevBuild ? 'development' : 'production.min'}.js`,
                `${scriptPrefix}/dhis-web-core-resource/rxjs/4.1.0/rx.all${isDevBuild ? '' : '.min'}.js`,
                `${scriptPrefix}/dhis-web-core-resource/lodash/4.15.0/lodash${isDevBuild ? '' : '.min'}.js`,
            ]
                .map(script => {
                    if (Array.isArray(script)) {
                        return (`<script ${script[1]} src="${script[0]}"></script>`);
                    }
                    return (`<script src="${script}"></script>`);
                })
                .join("\n"),
        })
    ],
    devServer: {
        contentBase: './',
        port: 8082,
        inline: true,
        compress: true,
        proxy: [
            { path: '/polyfill.min.js', target: 'http://localhost:8082/node_modules/babel-polyfill/dist', bypass: log },
            { path: '/api/*', target: dhisConfig.baseUrl, bypass: log },
            { path: '/dhis-web-commons/**', target: dhisConfig.baseUrl, bypass: log },
            { path: '/icons/*', target: dhisConfig.baseUrl, bypass: log },
        ],
    },
};

if (!isDevBuild) {
    webpackConfig.plugins.push(
        // Replace any occurance of process.env.NODE_ENV with the string 'production'
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': '"production"',
            DHIS_CONFIG: JSON.stringify({}),
        })
    );
    webpackConfig.plugins.push(
        new webpack.optimize.OccurrenceOrderPlugin()
    );
    webpackConfig.plugins.push(
        new webpack.optimize.UglifyJsPlugin({
            comments: false,
            sourceMap: true,
        })
    );
} else {
    webpackConfig.plugins.push(
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': '"development"',
            DHIS_CONFIG: JSON.stringify(dhisConfig)
        })
    );
}

module.exports = webpackConfig;
