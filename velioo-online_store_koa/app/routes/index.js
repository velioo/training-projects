const Router = require('koa-router');
const KoaBody = require('koa-body');
const { list, getId, searchProducts, getMenuItems, notFound } = require('../controllers/indexController');
const { renderLogin, login, renderSignUp, signUp, logOut, confirmAccount } = require('../controllers/usersController');
const {
  renderEmployeeLogin,
  employeeLogin,
  renderDashboard,
  employeeLogOut,
  getProducts,
  renderOrders,
  getOrders,
  changeOrderStatus
} = require('../controllers/backOfficeController');
const router = new Router();

const employees = () => {
  const router = new Router();

  router
    .get('/dashboard', renderDashboard)
    .get('/log_out', employeeLogOut)
    .get('/get_products', getProducts)
    .get('/orders', renderOrders)
    .get('/get_orders', getOrders)
    .post('/change_order_status', new KoaBody(), changeOrderStatus);

  return router;
};

const products = () => {
  const router = new Router();

  router
    .get('/', list)
    .get('/:id([0-9]+)', getId);

  return router;
};

router
  .get('/search', searchProducts)
  .get('/menu_items', getMenuItems)
  .get('/login', renderLogin)
  .post('/login', new KoaBody(), login)
  .get('/sign_up', renderSignUp)
  .post('/sign_up', new KoaBody(), signUp)
  .get('/log_out', logOut)
  .get('/confirm_account/:code', confirmAccount)
  .get('/employee_login', renderEmployeeLogin)
  .post('/employee_login', new KoaBody(), employeeLogin)
  .get('/not_found', notFound)
  .get('/', (ctx) => { ctx.redirect('/products'); });

router.use('/employee', employees().routes());
router.use('/products', products().routes());

exports.routes = router.routes();
exports.allowedMethods = router.allowedMethods();
