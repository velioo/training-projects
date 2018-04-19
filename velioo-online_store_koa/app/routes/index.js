const {
  searchProducts,
  getMenuItems,
  frontendLogger,
  notFound
} = require('../controllers/indexController');
const {
  renderLogin,
  login,
  renderSignUp,
  signUp,
  confirmAccount
} = require('../controllers/usersController');
const {
  renderEmployeeLogin,
  employeeLogin
} = require('../controllers/backOfficeController');
const employees = require('./employees');
const users = require('./users');
const products = require('./products');

const Router = require('koa-router');
const KoaBody = require('koa-body');

const router = new Router();

router
  .get('/search', searchProducts)
  .get('/menu_items', getMenuItems)
  .get('/login', renderLogin)
  .post('/login', new KoaBody(), login)
  .get('/sign_up', renderSignUp)
  .post('/sign_up', new KoaBody(), signUp)
  .get('/confirm_account/:code', confirmAccount)
  .get('/employee_login', renderEmployeeLogin)
  .post('/employee_login', new KoaBody(), employeeLogin)
  .get('/not_found', notFound)
  .post('/frontend_logger', new KoaBody(), frontendLogger)
  .get('/', (ctx) => { ctx.redirect('/products'); });

router.use('/employee', employees().routes());
router.use('/users', users().routes());
router.use('/products', products().routes());

exports.routes = router.routes();
exports.allowedMethods = router.allowedMethods();
