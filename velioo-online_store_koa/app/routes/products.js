const {
  getHomepageProducts,
  getProductById
} = require('../controllers/indexController');

const Router = require('koa-router');
const KoaBody = require('koa-body');

module.exports = () => {
  const router = new Router();

  router
    .get('/', getHomepageProducts)
    .get('/:id([0-9]+)', getProductById);

  return router;
};
