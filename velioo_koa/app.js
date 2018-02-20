const winston = require('winston');
const { combine, timestamp, label, printf } = winston.format;
const myFormat = printf(info => {
    return `${new Date(info.timestamp).toLocaleString()} ${info.level}: ${info.message}`
});

const logger = winston.createLogger({
    level: 'error',
    format: combine(
        winston.format.splat(),
        timestamp(),
        myFormat
    ),
    transports: [
        new winston.transports.File({ filename: './logs/server.log' })
    ],
    exceptionHandlers: [
        new winston.transports.File({ filename: './logs/exceptions.log' })
    ],
    exitOnError: false
});

//~ console.error=winston.error;
//~ console.log=winston.info;
//~ console.info=winston.info;
//~ console.debug=winston.debug;
//~ console.warn=winston.warn;

var koa = require('koa');
var Router = require('koa-router');
var app = module.exports = new koa();
var router = new Router();
const PORT = +process.argv[2] || 8883;

router.get('/hello', async (ctx, next) => {
    ctx.body = "Hello there from GET!\n";
});

router.post('/hello', async (ctx, next) => {
    ctx.body = "Hello there from POST!\n";
});

router.all('/all', async (ctx, next) => {
    ctx.body = "Hello there from ANY!\n";
});

router.get('/users/:id', async (ctx, next) => {
    logger.info('/users:id ctx = %o', ctx);
    ctx.body = 'The id you specified is ' + ctx.params.id;
});

router.get('/admins/:id([0-9]{5})', async (ctx, next) => {
    logger.info('Admin request obj = %o', ctx.request);
    ctx.body = 'Admin id = ' + ctx.params.id;
    logger.info('Admin response obj = %o', ctx.response);
});

router.get('/not_found', async (ctx, next) => {
    ctx.status = 404;
    ctx.body = "Sorry we do not have this resource\n";
});

app.use(async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        ctx.status = err.status || 500;
        logger.error(err.message);
        ctx.app.emit('error', err, ctx);
    }
});

app.use(router.routes());

app.use((ctx, next) => {
    if (404 != ctx.status) return;
    ctx.redirect('/not_found');
});

//~ function handle_not_found(ctx, next) {
    //~ return new Promise((resolve, reject) => {
        //~ if (404 != ctx.status) resolve("Response status code is not 404");
        //~ ctx.redirect('/not_found');
        //~ resolve("Redirecting to not found page");
    //~ });
//~ }

app.listen(PORT, function() {
    console.log('Server running on https://localhost:' + PORT);
});












