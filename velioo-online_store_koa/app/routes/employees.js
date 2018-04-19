const backOfficeOrders = require('./backOfficeOrders');
const {
  renderDashboard,
  employeeLogOut,
  getProducts,
  getOrders,
  changeOrderStatus
} = require('../controllers/backOfficeController');

const Router = require('koa-router');
const KoaBody = require('koa-body');

module.exports = () => {
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
