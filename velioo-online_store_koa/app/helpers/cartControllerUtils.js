const CONSTANTS = require('../constants/constants');
const Utils = require('./utils');
const mysql = require('../db/mysql');

const assert = require('assert');
const _ = require('lodash/lang');

module.exports = {
  executeCartProductsQuery: async (queryArgs, connection = mysql.pool) => {
    assert(_.isObject(queryArgs));

    return connection.query(`
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
    `, queryArgs);
  },
  executeProductExistsInCartQuery: async (queryArgs, connection = mysql.pool) => {
    assert(_.isObject(queryArgs));

    return connection.query(`
      SELECT quantity
      FROM cart
      WHERE
        user_id = ?
        AND product_id = ?
    `, queryArgs);
  },
  executeAddProductToCartQuery: async (queryArgs, connection = mysql.pool) => {
    assert(_.isObject(queryArgs));

    return connection.query(`
      INSERT INTO cart(user_id, product_id)
      VALUES (?, ?)
    `, queryArgs);
  },
  executeUpdateProductQuantityQuery: async (queryArgs, connection = mysql.pool) => {
    assert(_.isObject(queryArgs));

    return connection.query(`
      UPDATE cart SET quantity = ?
      WHERE
        user_id = ?
        AND product_id = ?
    `, queryArgs);
  },
  executeGetCartInfoQuery: async (queryArgs, connection = mysql.pool) => {
    assert(_.isObject(queryArgs));

    return connection.query(`
      SELECT
        IFNULL(SUM(cart.quantity), 0) as count,
        IFNULL(SUM(products.price_leva * cart.quantity), 0) as price_leva
      FROM cart
      JOIN products ON products.id = cart.product_id
      WHERE
        cart.user_id = ?
    `, queryArgs);
  },
  baseUtils: Utils
};
