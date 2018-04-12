const CONSTANTS = require('../constants/constants');
const mysql = require('../db/mysql');
const pug = require('../helpers/pug').baseRenderer;
const Utils = require('./utils');
// const logger = require('../helpers/logger');

const assert = require('assert');
const _ = require('lodash/lang');
const sha256 = require('js-sha256').sha256;

const self = module.exports = {
  renderLoginPage: (ctx) => {
    return ctx.render('employee_login.pug', {
      error: ctx.error,
      user: {},
      isUserLoggedIn: ctx.session.isUserLoggedIn
    });
  },
  isLoginSuccessfull: (inputPassword, userData) => {
    return sha256(inputPassword + userData.salt) === userData.password;
  },
  executeLoginQuery: async (queryArgs, connection = mysql.pool) => {
    assert(_.isArray(queryArgs));

    return connection.query(`
      SELECT password, salt, id
      FROM employees
      WHERE
        username = ?
    `, queryArgs);
  },
  processQueryStr: (queryStrObj, filterColumnsCases, sortColumnsCases, customColumnsCases) => {
    assert(_.isObject(queryStrObj));
    Utils.assertObjStrLen([ queryStrObj ], CONSTANTS.MAX_SEARCH_FILTER_LEN);

    const priceFrom = +queryStrObj.price_from;
    const priceTo = +queryStrObj.price_to;
    const limit = +queryStrObj.size || queryStrObj.limit;
    const offset = +queryStrObj.page * limit - limit;
    const dates = [
      queryStrObj.date_c_from,
      queryStrObj.date_c_to,
      queryStrObj.date_m_from,
      queryStrObj.date_m_to
    ];

    assert(!priceFrom || !isNaN(+priceFrom));
    assert(!priceTo || !isNaN(+priceTo));
    assert(!isNaN(limit) && limit >= 0);
    assert(!isNaN(offset) && offset >= 0);
    dates.forEach((date) => assert(Utils.isValidDate));

    const sortColumns = Utils.parseArrayQueryStr(queryStrObj, 'col');
    const filterColumns = Utils.parseArrayQueryStr(queryStrObj, 'fcol');

    const filterColumnsExprs = Utils.createWhereClauseExprs(filterColumnsCases, filterColumns);

    const customFilterExprsVals = Utils.createExprsVals(new Map([
      [customColumnsCases[0], dates[0]],
      [customColumnsCases[1], dates[1]],
      [customColumnsCases[2], dates[2]],
      [customColumnsCases[3], dates[3]],
      [customColumnsCases[4], priceFrom],
      [customColumnsCases[5], priceTo]
    ]));

    const sortExpr = Utils.createOrderByClauseExpr(sortColumnsCases, sortColumns);

    return {
      exprs: [
        ...filterColumnsExprs,
        ...customFilterExprsVals.exprs,
        sortExpr
      ],
      vals: [
        ...customFilterExprsVals.vals
      ],
      limit: limit,
      offset: offset
    };
  },
  prepareHtmlDataProducts: (productsRows) => {
    assert(_.isObject(productsRows));

    let productArray = [];
    const productsArray = [];

    productsRows.forEach((productRow) => {
      productArray.push(pug.render('p #{createdAt}', { createdAt: productRow.created_at },
        { fromString: true }));
      productArray.push(pug.render('p #{updatedAt}', { updatedAt: productRow.updated_at },
        { fromString: true }));
      productArray.push(pug.render('a(href = "../products/" + productId) #{productName}',
        { productId: productRow.id, productName: productRow.name }, { fromString: true }));
      productArray.push(pug.render('p #{category}', { category: productRow.category },
        { fromString: true }));
      productArray.push(pug.render('p #{price}', { price: productRow.price_leva },
        { fromString: true }));
      productArray.push(pug.render('p #{quantity}', { quantity: productRow.quantity },
        { fromString: true }));
      productArray.push(
        pug.render('a(href = "../employee/update_product/" + productId class = "product_details") Редактирай',
          { productId: productRow.id }, { fromString: true }));
      productArray.push(pug.render('a(href = "#" class = "delete_record" data-id = productId) Изтрий',
        { productId: productRow.id }, { fromString: true }));
      productsArray.push(productArray);
      productArray = [];
    });

    return productsArray;
  },
  prepareHtmlDataOrders: (ordersRows, statusesRows) => {
    assert(_.isObject(ordersRows));

    let orderArray = [];
    const ordersArray = [];

    ordersRows.forEach((orderRow) => {
      orderArray.push(pug.render('p #{createdAt}', { createdAt: orderRow.order_created_at },
        { fromString: true }));
      orderArray.push(pug.render('p #{updatedAt}', { updatedAt: orderRow.order_updated_at },
        { fromString: true }));
      orderArray.push(pug.render('p #{productId}', { productId: orderRow.order_id },
        { fromString: true }));
      orderArray.push(pug.render('p #{userEmail}', { userEmail: orderRow.user_email },
        { fromString: true }));
      orderArray.push(pug.render('p #{amount}', { amount: orderRow.amount_leva },
        { fromString: true }));

      let selectElement = '<select class = "select_status">';

      statusesRows.forEach((statusRow) => {
        let optionElement = 'option(value = statusId';
        optionElement += (orderRow.status_id === statusRow.id)
          ? ' selected)'
          : ')';
        optionElement += ' #{statusName}';
        selectElement += pug.render(optionElement,
          { statusId: statusRow.id, statusName: statusRow.name }, { fromString: true });
      });
      selectElement += '</select>';

      orderArray.push(selectElement);
      orderArray.push(
        pug.render('a(href = "../employee/orders/" + productId class = "order_details") Детайли',
          { productId: orderRow.order_id }, { fromString: true }));
      ordersArray.push(orderArray);
      orderArray = [];
    });

    return ordersArray;
  },
  executeProductsQuery: async (queryArgs, connection = mysql.pool) => {
    assert(_.isObject(queryArgs));
    assert(_.isArray(queryArgs.exprs));
    assert(_.isArray(queryArgs.vals));

    return connection.query(`
      SELECT products.*, categories.name as category
      FROM products
      JOIN categories ON categories.id = products.category_id
      WHERE
        ${queryArgs.exprs[0]}
        AND ${queryArgs.exprs[1]}
        AND ${queryArgs.exprs[2]}
        AND ${queryArgs.exprs[3]}
        AND ${queryArgs.exprs[4]}
        AND ${queryArgs.exprs[5]}
        AND ${queryArgs.exprs[6]}
        AND ${queryArgs.exprs[7]}
        AND ${queryArgs.exprs[8]}
        AND ${queryArgs.exprs[9]}
        AND ${queryArgs.exprs[10]}
        AND ${queryArgs.exprs[11]}
        AND ${queryArgs.exprs[12]}
        AND ${queryArgs.exprs[13]}
      ORDER BY
        ${queryArgs.exprs[14]}
      LIMIT ?
      OFFSET ?
    `, [
      ...queryArgs.vals,
      queryArgs.limit,
      queryArgs.offset
    ]);
  },
  executeProductsCountQuery: async (queryArgs, connection = mysql.pool) => {
    assert(_.isObject(queryArgs));
    assert(_.isArray(queryArgs.exprs));
    assert(_.isArray(queryArgs.vals));

    return connection.query(`
      SELECT COUNT(1) as count
      FROM products
      JOIN categories ON categories.id = products.category_id
      WHERE
        ${queryArgs.exprs[0]}
        AND ${queryArgs.exprs[1]}
        AND ${queryArgs.exprs[2]}
        AND ${queryArgs.exprs[3]}
        AND ${queryArgs.exprs[4]}
        AND ${queryArgs.exprs[5]}
        AND ${queryArgs.exprs[6]}
        AND ${queryArgs.exprs[7]}
        AND ${queryArgs.exprs[8]}
        AND ${queryArgs.exprs[9]}
        AND ${queryArgs.exprs[10]}
        AND ${queryArgs.exprs[11]}
        AND ${queryArgs.exprs[12]}
        AND ${queryArgs.exprs[13]}
    `, [
      ...queryArgs.vals,
      queryArgs.limit,
      queryArgs.offset
    ]);
  },
  executeOrdersQuery: async (queryArgs, connection = mysql.pool) => {
    assert(_.isObject(queryArgs));
    assert(_.isArray(queryArgs.exprs));
    assert(_.isArray(queryArgs.vals));

    return connection.query(`
      SELECT
        orders.id as order_id,
        orders.created_at as order_created_at,
        orders.updated_at as order_updated_at,
        orders.amount_leva,
        statuses.name as status_name,
        statuses.id as status_id,
        users.email as user_email
      FROM orders
      JOIN statuses ON statuses.id = orders.status_id
      JOIN users ON users.id = orders.user_id
      WHERE
        ${queryArgs.exprs[0]}
        AND ${queryArgs.exprs[1]}
        AND ${queryArgs.exprs[2]}
        AND ${queryArgs.exprs[3]}
        AND ${queryArgs.exprs[4]}
        AND ${queryArgs.exprs[5]}
        AND ${queryArgs.exprs[6]}
        AND ${queryArgs.exprs[7]}
        AND ${queryArgs.exprs[8]}
        AND ${queryArgs.exprs[9]}
        AND ${queryArgs.exprs[10]}
        AND ${queryArgs.exprs[11]}
        AND ${queryArgs.exprs[12]}
      ORDER BY
        ${queryArgs.exprs[13]}
      LIMIT ?
      OFFSET ?
    `, [
      ...queryArgs.vals,
      queryArgs.limit,
      queryArgs.offset
    ]);
  },
  executeOrderStatusesQuery: async (queryArgs = null, connection = mysql.pool) => {
    return connection.query(`
      SELECT *
      FROM statuses
      ORDER BY statuses.name ASC
    `);
  },
  executeUserOrderStatusesQuery: async (queryArgs, connection = mysql.pool) => {
    return connection.query(`
      SELECT statuses.name, orders.amount_leva
      FROM orders
      JOIN statuses ON statuses.id = orders.status_id
      JOIN users ON users.id = orders.user_id
      WHERE
        ${queryArgs.exprs[0]}
        AND ${queryArgs.exprs[1]}
        AND ${queryArgs.exprs[2]}
        AND ${queryArgs.exprs[3]}
        AND ${queryArgs.exprs[4]}
        AND ${queryArgs.exprs[5]}
        AND ${queryArgs.exprs[6]}
        AND ${queryArgs.exprs[7]}
        AND ${queryArgs.exprs[8]}
        AND ${queryArgs.exprs[9]}
        AND ${queryArgs.exprs[10]}
        AND ${queryArgs.exprs[11]}
        AND ${queryArgs.exprs[12]}
      LIMIT ?
      OFFSET ?
    `, [
      ...queryArgs.vals,
      queryArgs.limit,
      queryArgs.offset
    ]);
  },
  executeChangeOrderStatusQuery: async (queryArgs, connection = mysql.pool) => {
    assert(_.isObject(queryArgs));

    return connection.query(`
      UPDATE orders
      SET
        status_id = ?
      WHERE
        id = ?
    `, queryArgs);
  },
  calculateOrdersProfitAndCount: async (queryArgs) => {
    assert(_.isObject(queryArgs));
    assert(_.isArray(queryArgs.exprs));
    assert(_.isArray(queryArgs.vals));

    let queryArgsCopy = Object.assign({}, queryArgs);

    queryArgsCopy.limit = CONSTANTS.ORDER_STATUSES_QUERY_LIMIT;
    queryArgsCopy.offset = 0;

    let ordersCount = 0;
    let ordersSums = { 'Всички': 0, 'Настоящи': 0, 'Очаквани': 0 };
    let orderStatusRows;

    while ((orderStatusRows = await self.executeUserOrderStatusesQuery(queryArgsCopy)).length > 0) {
      assert(orderStatusRows.length >= 0);

      ordersCount += orderStatusRows.length;

      orderStatusRows.forEach((statusRow) => {
        const statusName = statusRow.name.toLowerCase();

        if (statusName === 'delivered' || statusName === 'awaiting shipment' ||
          statusName === 'awaiting delivery') {
          ordersSums['Настоящи'] += statusRow.amount_leva * 100;
        }

        if (statusName === 'awaiting payment' || statusName === 'payment being verified') {
          ordersSums['Очаквани'] += statusRow.amount_leva * 100;
        }
      });

      queryArgsCopy.offset += CONSTANTS.ORDER_STATUSES_QUERY_LIMIT;
    }

    ordersSums['Всички'] = ((ordersSums['Настоящи'] + ordersSums['Очаквани']) / 100).toFixed(2);
    ordersSums['Настоящи'] = (ordersSums['Настоящи'] / 100).toFixed(2);
    ordersSums['Очаквани'] = (ordersSums['Очаквани'] / 100).toFixed(2);

    return {
      ordersCount,
      ordersSums
    };
  },
  assertFilters: (arr) => {
    assert(_.isArray(arr));

    const assertCases = {
      0: Utils.isValidDate,
      1: Utils.isValidDate,
      2: _.isString,
      3: _.isString,
      4: _.isFinite,
      5: _.isInteger,
      6: self.returnTrue,
      7: self.returnTrue
    };

    arr.forEach((obj) => {
      for (let [ key, val ] in obj) {
        assert(assertCases[ key ](val) || val === '');
      }
    });
  },
  returnTrue: (param = null) => {
    return true;
  }
};
