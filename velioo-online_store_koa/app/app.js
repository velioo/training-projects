const PORT = +process.argv[2] || 8883;
module.exports = { port () { return PORT;} }

const koa =  require('koa'),
      app = new koa(),
      logger = require('./helpers/logger'),
      err = require('./helpers/error'),
      pug = require('./helpers/pug'),
      { routes, allowedMethods } = require('./routes'),
      serve = require('koa-static'),
      session = require('koa-session'),
      staticCache = require('koa-static-cache'),
      path = require('path'),
      mysql = require('./db/mysql');
      
var mysqlConfig = {
    host: 'localhost',
    user: 'root',
    password: '12345678',
    database: 'test'
}

app.use(err);
app.use(staticCache(path.join(__dirname, 'uploads'), {
    maxAge: 365 * 24 * 60 * 60
}));
app.use(serve('./uploads'));
app.use(serve('./assets'));
pug.use(app);
app.keys = ['Shh, its a secret!'];
app.use(session(app));
app.use(mysql);
app.use(routes());
app.use(allowedMethods());
app.use((ctx, next) => {
    logger.info("Checking if 404");
    if (404 != ctx.status) return;
    if(ctx.request.url.startsWith('/imgs')) {
        logger.info("Request starts with /imgs");
        ctx.redirect('http://localhost:8883/imgs/no_image.png');
    } else {
        ctx.redirect('/not_found');
    }
});
logger.info('Server started');
app.listen(PORT, () => {
    console.log('Server running on https://localhost:' + PORT);
});
