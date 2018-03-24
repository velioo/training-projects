const Router = require('koa-router');
const KoaBody = require('koa-body');
const { list, getId, searchByName, getMenuItems, notFound } = require('../controllers/indexController');
const { renderLogin, login, renderSignUp, signUp, logOut, confirmAccount } = require('../controllers/usersController');
const { renderEmployeeLogin, employeeLogin, renderDashboard,
        employeeLogOut, getProducts, renderOrders, getOrders, changeOrderStatus } = require('../controllers/backOfficeController');
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
    .get('/employee/change_order_status', changeOrderStatus)
    .get('/not_found', notFound)
    .get('/', (ctx) => { ctx.redirect('/products'); });

exports.routes = router.routes();
exports.allowedMethods = router.allowedMethods();
