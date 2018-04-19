const cart = require('./cart');
const userOrders = require('./userOrders');
const {
  logOut
} = require('../controllers/usersController');

const Router = require('koa-router');
const KoaBody = require('koa-body');

module.exports = () => {
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
