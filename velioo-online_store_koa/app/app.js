const PORT = +process.argv[2] || 8883;
const ROOT = 'http://localhost:' + PORT + '/';

exports.PORT = PORT;
exports.ROOT = ROOT;

const {
  MAX_ASSETS_AGE,
  MAX_UPLOADS_AGE,
  RECORDS_PER_PAGE,
  MAX_RECORDS_PER_PAGE,
  FRONTEND_LOGGER_INTERVAL
} = require('./constants/constants');
const logger = require('./helpers/logger');
const globalErrHandler = require('./middlewares/errorHandler');
const authenticate = require('./middlewares/authenticate');
const { routes, allowedMethods } = require('./routes');
const pug = require('./helpers/pug').fileRenderer;
const dirs = {};

const Koa = require('koa');
const app = new Koa();
const Session = require('koa-session');
const StaticCache = require('koa-static-cache');
const Paginate = require('koa-ctx-paginate');
const Validate = require('koa-validate');

app.use(globalErrHandler);

app.use(new StaticCache('./assets', {
  maxAge: MAX_ASSETS_AGE
}, dirs));
app.use(new StaticCache('./uploads', {
  maxAge: MAX_UPLOADS_AGE
}, dirs));

pug.locals.ROOT = ROOT;
pug.locals.FRONTEND_LOGGER_INTERVAL = FRONTEND_LOGGER_INTERVAL;
pug.use(app);

app.keys = ['Shh, its a secret!'];

app.use(new Session(app));
app.use(async (ctx, next) => {
  ctx.session.isUserLoggedIn = ctx.session.isUserLoggedIn || false;
  ctx.session.isEmployeeLoggedIn = ctx.session.isEmployeeLoggedIn || false;

  await next();
});
app.use(Paginate.middleware(RECORDS_PER_PAGE, MAX_RECORDS_PER_PAGE));

Validate(app);

app.use(routes);
app.use(allowedMethods);
app.use(authenticate);
app.use((ctx) => {
  if (ctx.status !== 404) {
    return;
  }

  if (ctx.request.url.startsWith('/imgs')) {
    ctx.redirect('http://localhost:8883/imgs/no_image.png');
  } else {
    ctx.redirect('/not_found');
  }
});

logger.info('Server started');

app.listen(PORT, () => {
  console.log('Server running on http://localhost:' + PORT);
});
