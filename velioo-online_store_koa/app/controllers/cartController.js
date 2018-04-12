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

    const productId = +ctx.request.body.productId;
    const userId = +ctx.session.userData.userId;

    logger.info('productId = ' + productId);
    logger.info('userId = ' + userId);

    assert(_.isInteger(productId));
    assert(_.isInteger(userId));

    const connection = await Utils.baseUtils.executeBeginTransaction();

    const productQuantityRow = await Utils.executeProductExistsInCartQuery([ userId, productId ], connection);

    logger.info('productQuantityRow = %o', productQuantityRow);

    assert(productQuantityRow.length <= 1);

    const productQuantity = (productQuantityRow[0]) ? +productQuantityRow[0].quantity : 0;

    try {
      if (productQuantity) {
        await Utils.executeUpdateProductQuantityQuery([ productQuantity + 1, userId, productId ], connection);
      } else {
        await Utils.executeAddProductToCartQuery([ userId, productId ], connection);
      }

      await Utils.baseUtils.exucuteCommitTransaction(connection);

      ctx.body = true;
    } catch (err) {
      logger.error(`Error while updating user cart: %o`, err);
    }
  },
  removeProductCart: async (ctx, next) => {

  },
  changeProductQuantityCart: async (ctx, next) => {

  },
  getCountPriceCart: async (ctx, next) => {
    await next();

    const userId = +ctx.session.userData.userId;

    assert(_.isInteger(userId));

    const cartInfoRow = await Utils.executeGetCartInfoQuery([ userId ]);

    assert(cartInfoRow.length <= 1);

    ctx.body = cartInfoRow[0];
  }
};
