const Router = require('koa-router');
const KoaBody = require('koa-body');
const {
  list,
  getId,
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
  logOut,
  confirmAccount
} = require('../controllers/usersController');
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
const {
  renderCart,
  addProductCart,
  removeProductCart,
  changeProductQuantityCart,
  getCountPriceCart
} = require('../controllers/cartController');

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

const cart = () => {
  const router = new Router();

  router
    .get('/', renderCart)
    .post('/add', new KoaBody(), addProductCart)
    .post('/remove', new KoaBody(), removeProductCart)
    .post('/change_quantity', new KoaBody(), changeProductQuantityCart)
    .get('/count_price', getCountPriceCart);

  return router;
};

const users = () => {
  const router = new Router();

  router
    // .get('/acount', renderDashboard),
    // .get('/details', getProducts),
    // .get('/orders', getOrders),
    .get('/log_out', logOut);

  router.use('/cart', cart().routes());

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
