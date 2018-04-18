const Router = require('koa-router');
const KoaBody = require('koa-body');
const {
  getHomepageProducts,
  getProductById,
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
  confirmAccount,
  confirmOrder,
  createOrder,
  renderUserOrders
} = require('../controllers/usersController');
const {
  renderEmployeeLogin,
  employeeLogin,
  renderDashboard,
  employeeLogOut,
  getProducts,
  renderOrdersTable,
  getOrders,
  getOrderById,
  changeOrderStatus
} = require('../controllers/backOfficeController');
const {
  renderCart,
  addProductCart,
  removeProductCart,
  getCountPriceCart
} = require('../controllers/cartController');

const router = new Router();

const userOrders = () => { // move routes to files
  const router = new Router();

  router
    .get('/', renderUserOrders)
    .get('/:id([0-9]+)', getOrderById)
    .post('/confirm_order', new KoaBody(), confirmOrder)
    .post('/create_order', new KoaBody(), createOrder);

  return router;
};

const backOfficeOrders = () => {
  const router = new Router();

  router
    .get('/', renderOrdersTable)
    .get('/:id([0-9]+)', getOrderById);

  return router;
};

const employees = () => {
  const router = new Router();

  router
    .get('/dashboard', renderDashboard)
    .get('/log_out', employeeLogOut)
    .get('/get_products', getProducts)
    .get('/get_orders', getOrders)
    .post('/change_order_status', new KoaBody(), changeOrderStatus);

  router.use('/orders', backOfficeOrders().routes());

  return router;
};

const cart = () => {
  const router = new Router();

  router
    .get('/', renderCart)
    .post('/add', new KoaBody(), addProductCart)
    .post('/remove', new KoaBody(), removeProductCart)
    .post('/change_quantity', new KoaBody(), addProductCart)
    .post('/count_price', getCountPriceCart);

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
  router.use('/orders', userOrders().routes());

  return router;
};

const products = () => {
  const router = new Router();

  router
    .get('/', getHomepageProducts)
    .get('/:id([0-9]+)', getProductById);

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
