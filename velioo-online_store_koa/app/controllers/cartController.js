const CONSTANTS = require('../constants/constants');
const logger = require('../helpers/logger');
const Utils = require('../helpers/cartControllerUtils');

const assert = require('assert');
const _ = require('lodash/lang');

module.exports = {
  renderCart: async (ctx, next) => {
    await next();

    const userId = ctx.session.userData.userId;

    assert(_.isInteger(userId));

    const productsRows = await Utils.executeCartProductsQuery([ userId ]);

    ctx.render('user_cart.pug', {
      isUserLoggedIn: ctx.session.isUserLoggedIn,
      products: productsRows
    });
  },
  addProductCart: async (ctx, next) => {
    await next();

    logger.info('addProductCart');

    const productId = +ctx.request.body.productId;
    const userId = +ctx.session.userData.userId;

    logger.info('productId = ' + productId);
    logger.info('userId = ' + userId);

    assert(_.isInteger(productId));
    assert(_.isInteger(userId));

    const productQuantityRow = await Utils.executeProductExistsInCartQuery([ userId, productId ]);

    assert(productQuantityRow.length <= 1);

    let productQuantity = +productQuantityRow.quantity;

    try {
      if (productQuantity) {
        logger.info('product Exists');
        await Utils.executeUpdateProductQuantityQuery([ ++productQuantity, userId, productId ]);
      } else {
        logger.info('product doesn\'t Exists');
        await Utils.executeAddProductToCartQuery([ userId, productId ]);
      }

      ctx.body = true;
    } catch (err) {
      logger.error(`Error while updating user cart: %o`, err);
      ctx.body = false;
    }
  },
  removeProductCart: async (ctx, next) => {

  },
  changeProductQuantityCart: async (ctx, next) => {

  },
  getCountPriceCart: async (ctx, next) => {

  }
};
