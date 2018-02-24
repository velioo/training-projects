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

//console.error=winston.error;
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
const auth = require('koa-basic-auth');
const mount = require('koa-mount');
const compress = require('koa-compress');
const staticCache = require('koa-static-cache');
const path = require('path');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');
const app = module.exports = new koa();
const router = new Router();
const PORT = +process.argv[2] || 8883;

var personSchema = mongoose.Schema({
   name: String,
   age: Number,
   nationality: String
});

var Person = mongoose.model("Person", personSchema);

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

router.get('/sign_login', async (ctx, next) => {
    ctx.render('sign_login.pug', {user:
        {name: "Velioo", age: 20}
    });
});

router.get('/components', async (ctx, next) => {
    ctx.render('content.pug');
});

router.get('/user', async (ctx, next) => {
    ctx.render('user_form');
});

router.post('/user', async (ctx, next) => {
    logger.info(ctx.request.body);
    ctx.body = ctx.request.body;
});

router.get('/files', async (ctx, next) => {
    ctx.render('file_upload');
});

router.post('/upload', async (ctx, next) => {
    logger.info("Files: %o", ctx.request.body.files);
    logger.info("Fields: %o", ctx.request.body.fields);
    let newFilePath = './uploads/' + ctx.request.body.files.image.name;
    fs.renameSync(ctx.request.body.files.image.path , newFilePath);
    ctx.body = "Received your data";
});

router.get('/setcookie', async (ctx, next) => {
    logger.info("Cookie name: " + ctx.cookies.get('foo'));
    if (!ctx.cookies.get('foo')) {
        logger.info('Cookie expired. Reseting...');
        let d = new Date();
        ctx.cookies.set('foo', 'bar', {httpOnly: false, expires: new Date(d.getTime() + 5000)});
    }
    ctx.body = ctx.cookies.get('foo');
});

router.get('/counter', async (ctx, next) => {
    var n = ctx.session.views || 0;
    ctx.session.views = ++n;
    if (n === 1) {
        ctx.body = 'Welcome here for the first time!';
    } else {
        ctx.body = "You've visited this page " + n + " times!";
    }
});

router.get('/protected', auth({ name: 'Ayusha', pass: 'India' }), (ctx, next) => {
    logger.info('protected url');
    ctx.body = 'You have access to the protected area';
});

router.get('/person', async (ctx, next) => {
    ctx.render('person');
});

router.post('/person', async (ctx, next) => {
   var personInfo = ctx.request.body;
   console.log(personInfo);
   if(!personInfo.name || !personInfo.age || !personInfo.nationality){
      ctx.render('show_message', {message: "Sorry, you provided wrong info", type: "error"});
   } else {
      var newPerson = new Person({
         name: personInfo.name,
         age: personInfo.age,
         nationality: personInfo.nationality
      });
      logger.info('Saving person');
      await newPerson.save(function(err, res) {
         if(err) {
            logger.info('Person wasn\'t saved successfully');
            ctx.render('show_message', 
               {message: "Database error", type: "error"});
        } else {
            logger.info('Person saved successfully');
            ctx.render('show_message', 
               {message: "New person added", type: "success", person: personInfo});
        }
      });
      logger.info('Query done');
   }
});

app.use(async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        ctx.status = err.status || 500;
        if (err.status == 401) {
            ctx.set('WWW-Authenticate', 'Basic');
            ctx.body = 'You have no access here';
        } else {
            logger.error("Error while executing code: " + err.message);
            ctx.app.emit('error', err, ctx);
        }
    }
});

var pug = new Pug({
    viewPath: './views',
    basedir: './views',
    app: app // Same as app.use(pug)
});

app.use(compress({
    filter: function(content_type) {
        return /text/i.test(content_type)
    },
    threshold: 2048,
    flush: require('zlib').Z_SYNC_FLUSH
}));

app.keys = ['Shh, its a secret!'];
app.use(session(app));

app.use(bodyParser({
    formidable: {uploadDir: './uploads'},
    multipart: true,
    urlencoded: true
}));

app.use(router.routes());
app.use(staticCache(path.join(__dirname, 'public'), {
    maxAge: 365 * 24 * 60 * 60
}));
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












