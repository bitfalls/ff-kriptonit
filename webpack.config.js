var Encore = require('@symfony/webpack-encore');

Encore
    // the project directory where all compiled assets will be stored
    .setOutputPath('assets/build/')

    // the public path used by the web server to access the previous directory
    .setPublicPath('/assets/build')

    // will create public/build/app.js and public/build/app.css
    .addEntry('app', './assets/js/main.js')

    // allow legacy applications to use $/jQuery as a global variable
    .autoProvidejQuery()

    // enable source maps during development
    .enableSourceMaps(!Encore.isProduction())

    // empty the outputPath dir before each build
    .cleanupOutputBeforeBuild()
;

// export the final configuration
module.exports = Encore.getWebpackConfig();