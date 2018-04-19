const {
  getOrderById,
  renderOrdersTable
} = require('../controllers/backOfficeController');

const Router = require('koa-router');
const KoaBody = require('koa-body');

module.exports = () => {
  const router = new Router();

  router
    .get('/', renderOrdersTable)
    .get('/:id([0-9]+)', getOrderById);

  return router;
};
