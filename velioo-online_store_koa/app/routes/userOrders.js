const {
  confirmOrder,
  createOrder,
  renderUserOrders
} = require('../controllers/usersController');
const {
  getOrderById
} = require('../controllers/backOfficeController');

const Router = require('koa-router');
const KoaBody = require('koa-body');

module.exports = () => {
  const router = new Router();

  router
    .get('/', renderUserOrders)
    .get('/:id([0-9]+)', getOrderById)
    .post('/confirm_order', new KoaBody(), confirmOrder)
    .post('/create_order', new KoaBody(), createOrder);

  return router;
};
