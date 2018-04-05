const Pug = require('koa-pug');
module.exports = {
  fileRenderer: new Pug({
    viewPath: './app/views',
    basedir: './app/views',
    helperPath: [
      './app/helpers/pug_helpers'
    ]
  }),
  baseRenderer: new Pug()
};
