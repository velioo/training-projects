const CONSTANTS = require('../constants/constants');
const Utils = require('./utils');
const mysql = require('../db/mysql');

const assert = require('assert');
const _ = require('lodash/lang');

module.exports = {
  executeCartProductsQuery: async (queryArgs) => {
    assert(_.isObject(queryArgs));

    return mysql.pool.query(`
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
  executeProductExistsInCartQuery: async (queryArgs) => {
    assert(_.isObject(queryArgs));

    return mysql.pool.query(`
      SELECT quantity
      FROM cart
      WHERE
        user_id = ?
        AND product_id = ?
    `, queryArgs);
  },
  executeAddProductToCartQuery: async (queryArgs) => {
    assert(_.isObject(queryArgs));

    return mysql.pool.query(`
      INSERT INTO cart(user_id, product_id)
      VALUES (?, ?)
    `, queryArgs);
  },
  executeUpdateProductQuantityQuery: async (queryArgs) => {
    assert(_.isObject(queryArgs));

    return mysql.pool.query(`
      UPDATE cart SET quantity = ?
      WHERE
        user_id = ?
        AND product_id = ?
    `, queryArgs);
  }
};
