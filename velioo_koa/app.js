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

console.error=winston.error;
//~ console.log=winston.info;
//~ console.info=winston.info;
//~ console.debug=winston.debug;
//~ console.warn=winston.warn;

const koa = require('koa');
const fs = require('fs');
const Router = require('koa-router');
const Pug = require('koa-pug');
const bodyParser = require('koa-body');
const serve = require('koa-static');
const session = require('koa-session');
const app = module.exports = new koa();
const router = new Router();
const PORT = +process.argv[2] || 8883;

router.get('/hello', async (ctx, next) => {
    ctx.render('first_view');
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

router.get('/hello_dynamic', async (ctx, next) => {
    ctx.render('dynamic_hello', {
        name: "Velioo",
        url: 'http://vanime.cf'
    });
});

router.get('/sign_login', (ctx, next) => {
    ctx.render('sign_login.pug', {user:
        {name: "Velioo", age: 20}
    });
});

router.get('/components', (ctx, next) => {
    ctx.render('content.pug');
});

router.get('/user', (ctx, next) => {
    ctx.render('user_form');
});

router.post('/user', (ctx, next) => {
    logger.info(ctx.request.body);
    ctx.body = ctx.request.body;
});

router.get('/files', (ctx, next) => {
    ctx.render('file_upload');
});

router.post('/upload', (ctx, next) => {
    logger.info("Files: %o", ctx.request.body.files);
    logger.info("Fields: %o", ctx.request.body.fields);
    let newFilePath = './uploads/' + ctx.request.body.files.image.name;
    fs.renameSync(ctx.request.body.files.image.path , newFilePath);
    ctx.body = "Received your data";
});

router.get('/setcookie', (ctx, next) => {
    logger.info("Cookie name: " + ctx.cookies.get('foo'));
    if (!ctx.cookies.get('foo')) {
        logger.info('Cookie expired. Reseting...');
        let d = new Date();
        ctx.cookies.set('foo', 'bar', {httpOnly: false, expires: new Date(d.getTime() + 5000)});
    }
    ctx.body = ctx.cookies.get('foo');
});

router.get('/counter', (ctx, next) => {
    console.log(ctx.cookies);
    var n = ctx.session.views || 0;
    ctx.session.views = ++n;
    if (n === 1) {
        ctx.body = 'Welcome here for the first time!';
    } else {
        ctx.body = "You've visited this page " + n + " times!";
    }
});

app.use(async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        ctx.status = err.status || 500;
        logger.error("Error while executing code: " + err.message);
        ctx.app.emit('error', err, ctx);
    }
});

var pug = new Pug({
    viewPath: './views',
    basedir: './views',
    app: app // Same as app.use(pug)
});

app.keys = ['Shh, its a secret!'];
app.use(session(app));

app.use(bodyParser({
    formidable: {uploadDir: './uploads'},
    multipart: true,
    urlencoded: true
}));

app.use(router.routes());
app.use(serve('./public'));
app.use(serve('./uploads'));

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












