const {
  renderCart,
  addProductCart,
  removeProductCart,
  getCountPriceCart
} = require('../controllers/cartController');

const Router = require('koa-router');
const KoaBody = require('koa-body');

module.exports = () => {
  const router = new Router();

  router
    .get('/', renderCart)
    .post('/add', new KoaBody(), addProductCart)
    .post('/remove', new KoaBody(), removeProductCart)
    .post('/change_quantity', new KoaBody(), addProductCart)
    .post('/count_price', getCountPriceCart);

  return router;
};
