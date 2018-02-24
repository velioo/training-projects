const winston = require('winston');
const { combine, timestamp, label, printf } = winston.format;
const myFormat = printf(info => {
    return `${new Date(info.timestamp).toLocaleString()} ${info.level}: ${info.message}`
});

const logger = winston.createLogger({
    level: 'info',
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

const koa =  require('koa');
const app = module.exports = new koa();
const Router = require('koa-router');
const router = new Router();
const Pug = require('koa-pug');
const bodyParser = require('koa-body');
const serve = require('koa-static');
const session = require('koa-session');
const staticCache = require('koa-static-cache');
const mysql = require('koa2-mysql-wrapper');
const path = require('path');
const PORT = +process.argv[2] || 8883;

app.use(async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        ctx.status = err.status || 500;
        if (err.status == 401) {
            //ctx.set('WWW-Authenticate', 'Basic');
            ctx.body = 'You have no access here';
        } else {
            logger.error("Error while executing code: " + err.message);
            ctx.app.emit('error', err, ctx);
        }
    }
});

app.use(mysql({
    host: 'localhost', user: 'root', password: '12345678', database: 'online_store'
}));

var pug = new Pug({
    viewPath: './views',
    basedir: './views',
    app: app
});

app.keys = ['Shh, its a secret!'];
app.use(session(app));

app.use(bodyParser({
    formidable: {uploadDir: './uploads'},
    multipart: true,
    urlencoded: true
}));

app.use(router.routes());

app.use(staticCache(path.join(__dirname, 'uploads'), {
    maxAge: 365 * 24 * 60 * 60
}));

app.use(serve('./uploads'));
app.use(serve('./assets'));

router.get('/not_found', async (ctx, next) => {
    ctx.status = 404;
    ctx.render('not_found', {message: "Resource Not Found"});
});

router.get('/', async (ctx, next) => {
    logger.info("Getting home page data...");
    //await next();
    let query = await ctx.myPool().query('SELECT products.* FROM products JOIN categories ON \
                                          categories.id = products.category_id ORDER BY created_at DESC LIMIT ? OFFSET ?',
                                          [50, 0]);
    console.log('nope');
    ctx.render('index.pug', {products: query});
});

app.use(async (ctx, next) => {
    logger.info("Querying db...");
    let query = await ctx.myPool().query('SELECT * FROM products JOIN categories ON \
                                          categories.id = products.category_id ORDER BY created_at DESC LIMIT ? OFFSET ?',
                                          [50, 0]);
    ctx.query = query;
});

app.use((ctx, next) => {
    if (404 != ctx.status) return;
    ctx.redirect('/not_found');
});

app.listen(PORT, () => {
    console.log('Server running on https://localhost:' + PORT);
});
