const {
  DEFAULT_CART_QUANTITY
} = require('../constants/constants');
const logger = require('../helpers/logger');
const mysql = require('../db/mysql');
const utils = require('../helpers/utils');

const assert = require('assert');
const _ = require('lodash/lang');

module.exports = {
  renderCart: async (ctx, next) => {
    await next();

    assert(_.isInteger(ctx.session.userData.userId));

    const productsRows = await mysql.pool.query(`

      SELECT
        products.id,
        products.name,
        products.price_leva,
        products.image,
        cart.quantity
      FROM products
      JOIN cart ON cart.product_id = products.id
      JOIN users ON users.id = cart.user_id
      WHERE
        users.id = ?

    `, [ ctx.session.userData.userId ]);

    const paymentMethodsRows = await mysql.pool.query(`

      SELECT *
      FROM payment_methods

    `);

    assert(paymentMethodsRows.length >= 0);

    ctx.render('user_cart.pug', {
      isUserLoggedIn: ctx.session.isUserLoggedIn,
      products: productsRows,
      paymentMethods: paymentMethodsRows
    });
  },
  addProductCart: async (ctx, next) => {
    await next();

    const productId = +ctx.request.body.productId;
    const inputQuantity = +ctx.request.body.quantity || null;
    const userId = +ctx.session.userData.userId;

    logger.info('productId = ' + productId);
    logger.info('userId = ' + userId);
    logger.info('quantity = ' + inputQuantity);

    assert(_.isInteger(productId));
    assert(_.isInteger(inputQuantity) || _.isNil(inputQuantity));
    assert(_.isInteger(userId));

    const connection = await mysql.pool.getConnection();
    await connection.beginTransaction();

    const productQuantityRow = await connection.query(`

      SELECT quantity
      FROM cart
      WHERE
        user_id = ?
        AND product_id = ?

    `, [ userId, productId ]);

    assert(productQuantityRow.length <= 1);

    let productQuantity = (productQuantityRow[0])
      ? +productQuantityRow[0].quantity
      : 0;

    try {
      if (productQuantity > 0) {
        productQuantity = inputQuantity === null
          ? productQuantity + 1
          : inputQuantity;

        await connection.query(`

          UPDATE cart SET quantity = ?
          WHERE
          user_id = ?
          AND product_id = ?

        `, [ productQuantity, userId, productId ]);
      } else {
        productQuantity = inputQuantity === null
          ? DEFAULT_CART_QUANTITY
          : inputQuantity;

        await connection.query(`

          INSERT INTO cart(user_id, product_id, quantity)
          VALUES (?, ?, ?)

        `, [ userId, productId, productQuantity ]);
      }

      const productInfoRows = await connection.query(`

        SELECT cart.quantity as quantity, p.price_leva as price_leva
        FROM cart
        JOIN products p ON p.id = cart.product_id
        WHERE
          cart.user_id = ?
          AND cart.product_id = ?

      `, [ userId, productId ]);

      assert(productInfoRows.length <= 1);

      await connection.commit();

      logger.info('ProductInfoRows[0] = %o', productInfoRows[0]);

      ctx.body = productInfoRows[0];
    } catch (err) {
      logger.error(`Error while updating user cart: %o`, err);
      ctx.throw(500, 'Error while updating user cart');
    }

    await connection.rollback();
  },
  removeProductCart: async (ctx, next) => {
    await next();

    assert(_.isInteger(+ctx.session.userData.userId));
    assert(_.isInteger(+ctx.request.body.productId));

    await mysql.pool.query(`

      DELETE
      FROM cart
      WHERE
        user_id = ?
        AND product_id = ?

    `, [ ctx.session.userData.userId, ctx.request.body.productId ]);

    ctx.body = true;
  },
  getCountPriceCart: async (ctx, next) => {
    await next();

    assert(_.isInteger(ctx.session.userData.userId));

    const cartInfoRow = await mysql.pool.query(`

      SELECT
        IFNULL(SUM(cart.quantity), 0) as count,
        IFNULL(SUM(products.price_leva * cart.quantity), 0) as price_leva
      FROM cart
      JOIN products ON products.id = cart.product_id
      WHERE
        cart.user_id = ?

    `, [ ctx.session.userData.userId ]);

    assert(cartInfoRow.length <= 1);

    ctx.body = cartInfoRow[0];
  }
};
