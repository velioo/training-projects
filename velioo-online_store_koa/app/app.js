const PORT = +process.argv[2] || 8883;
const ROOT = 'http://localhost:' + PORT + '/';

exports.PORT = PORT;
exports.ROOT = ROOT;

const RECORDS_PER_PAGE = 40;
const MAX_RECORDS_PER_PAGE = 100;

const logger = require('./helpers/logger');
const globalErrHandler = require('./helpers/error');
const Authenticate = require('./helpers/authenticate');
const { routes, allowedMethods } = require('./routes');
const pug = require('./helpers/pug');
const Mysql = require('./db/mysql');
let dirs = {};

const Koa = require('koa');
const app = new Koa();
const Session = require('koa-session');
const StaticCache = require('koa-static-cache');
const Paginate = require('koa-ctx-paginate');
const Validate = require('koa-validate');

app.use(globalErrHandler);

app.use(new StaticCache('./assets', {
    maxAge: 365 * 24 * 60 * 60
}, dirs));
app.use(new StaticCache('./uploads', {
    maxAge: 365 * 24 * 60 * 60
}, dirs));

pug.locals.root = ROOT;
pug.use(app);

app.keys = ['Shh, its a secret!'];

app.use(new Session(app));
app.use(Mysql);
app.use(Paginate.middleware(RECORDS_PER_PAGE, MAX_RECORDS_PER_PAGE));

Validate(app);

app.use(routes);
app.use(allowedMethods);
app.use(Authenticate);
app.use((ctx) => {
    logger.info('Checking if 404');

    if (ctx.status !== 404) {
        return;
    }

    if (ctx.request.url.startsWith('/imgs')) {
        logger.info('Request starts with /imgs');
        ctx.redirect('http://localhost:8883/imgs/no_image.png');
    } else {
        ctx.redirect('/not_found');
    }
});

logger.info('Server started');

app.listen(PORT, () => {
    console.log('Server running on http://localhost:' + PORT);
});
