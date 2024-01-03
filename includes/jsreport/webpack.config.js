var path = require("path");
var webpack = require("webpack");

const productName = (process.env.PRODUCT_NAME || 'ditto').toLowerCase();
console.log(`Webpack using product name: ${productName}`);

module.exports = {
    entry: {
        'core': ['./babel-output/index-core.js'],
        'designer': ['./babel-output/index-designer.js'],
        'all': './babel-output/index-all.js'
    },
    externals: {
        'fs': 'fs',
        'window': 'window'
    },
    output: {
        path: path.join(__dirname, "webpack-out"),
        filename: `${productName}-[name]-bundle.js`,
        library: productName,
        libraryTarget: 'umd'
    },
    resolve: {
        modulesDirectories: ["./src", "node_modules"],
        alias: {
            "jquery": path.resolve(__dirname, 'lib', 'jquery-2.0.0.js')
        }
    },
    module: {
        loaders: [{ 
            test: /\.json$/, loader: 'json-loader' 
        },{ 
            test: /\.css$/, loader: "style-loader!css-loader" 
        },{ 
            test: /\.jpg|\.png|\.gif$/, loader: "url-loader" 
        }]
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            "window.jQuery": "jquery"
        })
    ]
};