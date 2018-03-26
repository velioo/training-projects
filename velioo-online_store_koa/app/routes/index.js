const Router = require('koa-router');
const KoaBody = require('koa-body');
const { list, getId, searchByName, getMenuItems, notFound } = require('../controllers/indexController');
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

router
    .get('/products', list)
    .get('/products/:id([0-9]+)', getId)
    .get('/search', searchByName)
    .get('/menu_items', getMenuItems)
    .get('/login', renderLogin)
    .post('/login', new KoaBody(), login)
    .get('/sign_up', renderSignUp)
    .post('/sign_up', new KoaBody(), signUp)
    .get('/log_out', logOut)
    .get('/confirm_account/:code', confirmAccount)
    .get('/employee_login', renderEmployeeLogin)
    .post('/employee_login', new KoaBody(), employeeLogin)
    .get('/employee/dashboard', renderDashboard)
    .get('/employee/log_out', employeeLogOut)
    .get('/employee/get_products', getProducts)
    .get('/employee/orders', renderOrders)
    .get('/employee/get_orders', getOrders)
    .post('/employee/change_order_status', new KoaBody(), changeOrderStatus)
    .get('/not_found', notFound)
    .get('/', (ctx) => { ctx.redirect('/products'); });

exports.routes = router.routes();
exports.allowedMethods = router.allowedMethods();



// router.use('/countries', countries().routes());
// router.use('/velio', countries().routes());


// const countries =  (queriesFactory, configuredMethods = {}) => {
//   const router = new Router();
//   const pgCrud = pgCrudFactory(queriesFactory, configuredMethods);

//   // GET /
//   router.get('/', pgCrud.initialize, pgCrud.get);

//   // GET /:id
//   router.get('/:id', pgCrud.initialize, pgCrud.getById);

//   // POST /
//   router.post('/', pgCrud.initialize, pgCrud.post);

//   // POST /multi
//   router.post('/multi', pgCrud.initialize, pgCrud.postMulti);

//   // DELETE /
//   router.delete('/:id', pgCrud.initialize, pgCrud.delete);

//   // DELETE /multi
//   router.delete('/multi', pgCrud.initialize, pgCrud.deleteMulti);

//   // PUT /:id
//   router.put('/:id', pgCrud.initialize, pgCrud.put);

//   return router;
// };
