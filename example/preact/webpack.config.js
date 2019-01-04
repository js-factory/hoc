const webpack = require('webpack');
const path = require('path');

const config = [
    {
        devtool: 'source-map',
        entry: './browser.js',
        module: {
            rules: [
                {
                    test: /\.js$/,
                    use: "babel-loader"
                }
            ]
        },
        devServer: {
            contentBase: path.join(__dirname, 'dist'),
            compress: true,
            port: 9000
        }
    }
];

module.exports = config;
