'use strict';

const webpack = require('webpack');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const makeBabelConfig = require('@dhis2/cli-app-scripts/config/makeBabelConfig.js');

const defaultBaseUrl =
    process.env.NODE_ENV === 'production' ? '..' : 'http://localhost:8080';
if (!process.env.DHIS2_BASE_URL) {
    console.warn(
        `WARNING: environment variable DHIS2_BASE_URL has not been set, using ${defaultBaseUrl}`
    );
}

const env = Object.keys(process.env)
    .filter(key => key.startsWith('DHIS2_'))
    .reduce(
        (out, key) => {
            out[key] = process.env[key];
            return out;
        },
        {
            PUBLIC_URL: process.env.PUBLIC_URL || 'auto',
            NODE_ENV: process.env.NODE_ENV || 'development',
            DHIS2_BASE_URL: process.env.DHIS2_BASE_URL || defaultBaseUrl,
        }
    );

console.log('Building with environment:', env);

const isProduction = env.NODE_ENV === 'production';

const webpackConfig = {
    mode: env.NODE_ENV,
    entry: {
        app: ['babel-polyfill', './src/app.js'],
        map: ['babel-regenerator-runtime', './src/map.js'],
    },
    devtool: 'source-map',
    output: {
        path: __dirname + '/build',
        filename: '[name].js',
        chunkFilename: '[name].bundle.js',
        publicPath: 'auto',
    },
    optimization: {
        minimize: isProduction,
    },
    module: {
        rules: [
            {
                test: /\.[jt]sx?$/,
                use: {
                    loader: 'babel-loader',
                    options: makeBabelConfig('es', env.NODE_ENV),
                },
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 1,
                            modules: true,
                        },
                    },
                ],
                include: /\.module\.css$/,
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
                exclude: /\.module\.css$/,
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name]-[hash].[ext]',
                            hashType: 'md5',
                        },
                    },
                    {
                        loader: 'image-webpack-loader',
                        options: {
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
    plugins: [
        new HTMLWebpackPlugin({
            template: 'public/index.html',
            chunks: ['app'],
        }),
        new webpack.DefinePlugin({
            ...Object.keys(env).reduce((replacements, key) => {
                replacements[`process.env.${key}`] = JSON.stringify(env[key]);
                return replacements;
            }, {}),
            'process.env': JSON.stringify(env),
        }),
    ],
    devServer: {
        contentBase: './public',
        port: 8082,
        inline: true,
        compress: true,
    },
};

module.exports = webpackConfig;
