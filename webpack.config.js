var webpack = require('webpack');

var plugins = [];


module.exports = {
    devtool: 'source-map',
    plugins: plugins,
    module: {
        loaders: [
            { test: /\.css$/,loader: 'style-loader!css-loader'},
            {test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel',
                query: {
                    presets: ['es2015', 'react', 'stage-2']
                }
            }
        ]
    }
};
