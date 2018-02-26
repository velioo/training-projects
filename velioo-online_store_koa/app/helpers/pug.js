const Pug = require('koa-pug');
const pug = module.exports = new Pug({
    viewPath: './app/views',
    basedir: './app/views',
    helperPath: [
        './app/helpers/pug_helpers'
    ]
});
