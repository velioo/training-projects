const CONSTANTS = require('../constants/constants');
const mysql = require('../db/mysql');
const pug = require('../helpers/pug').baseRenderer;
const Utils = require('../helpers/utils');
const logger = require('../helpers/logger');

const assert = require('assert');
const _ = require('lodash/lang');
const escapeHtml = require('escape-html');
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
  executeLoginQuery: async (queryArgs) => {
    assert(_.isArray(queryArgs));

    return mysql.pool.query(`
      SELECT password, salt, id
      FROM employees
      WHERE
        username = ?
    `, queryArgs);
  },
  processQueryStr: (queryStrObj, filterColumnsCases, sortColumnsCases) => {
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
      ['DATE(products.created_at) >= ?', dates[0]],
      ['DATE(products.created_at) <= ?', dates[1]],
      ['DATE(products.updated_at) >= ?', dates[2]],
      ['DATE(products.updated_at) <= ?', dates[3]],
      ['products.price_leva >= ?', priceFrom],
      ['products.price_leva <= ?', priceTo]
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
  prepareHtmlData: (productsRows) => {
    assert(_.isObject(productsRows));

    let productArray = [];
    const productsArray = [];

    productsRows.forEach((productRow) => {
      productArray.push(escapeHtml(productRow.created_at));
      productArray.push(escapeHtml(productRow.updated_at));
      productArray.push(pug.render('a(href = "../products/" + productId) #{productName}',
        { productId: productRow.id, productName: productRow.name }, { fromString: true }));
      productArray.push(escapeHtml(productRow.category));
      productArray.push(escapeHtml(productRow.price_leva));
      productArray.push(escapeHtml(productRow.quantity));
      productArray.push(pug.render('a(href = "../employee/update_product/" + productId class = "product_details") Редактирай',
        { productId: productRow.id }, { fromString: true }));
      productArray.push(pug.render('a(href = "#" class = "delete_record" data-id = productId) Изтрий',
        { productId: productRow.id }, { fromString: true }));
      productsArray.push(productArray);
      productArray = [];
    });

    return productsArray;
  },
  executeProductsQuery: async (queryArgs) => {
    assert(_.isObject(queryArgs));
    assert(_.isArray(queryArgs.exprs));
    assert(_.isArray(queryArgs.vals));

    return mysql.pool.query(`
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
  executeProductsCountQuery: async (queryArgs) => {
    assert(_.isObject(queryArgs));
    assert(_.isArray(queryArgs.exprs));
    assert(_.isArray(queryArgs.vals));

    return mysql.pool.query(`
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
  executeOrdersQuery: async (queryArgs) => {
    assert(_.isObject(queryArgs));
    assert(_.isArray(queryArgs.exprs));
    assert(_.isArray(queryArgs.vals));

    return mysql.pool.query(`
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
  executeOrderStatusesQuery: async (queryArgs) => {
    return mysql.pool.query(`
      SELECT statuses.name
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
  processOrders: async (queryArgs) => {
    assert(_.isObject(queryArgs));
    assert(_.isArray(queryArgs.exprs));
    assert(_.isArray(queryArgs.vals));

    let queryArgsCopy = Object.assign({}, queryArgs);

    queryArgsCopy.limit = CONSTANTS.ORDER_STATUSES_QUERY_LIMIT;
    queryArgsCopy.offset = 0;

    let ordersCount = 0;
    let ordersSums = { 'Всички': 0, 'Настоящи': 0, 'Очаквани': 0 }; //  don't use float use int or bigInt libarar
    let orderStatusesRows;

    while ((orderStatusesRows = await self.executeOrderStatusesQuery(queryArgsCopy)).length > 0) {
      assert(orderStatusesRows.length >= 0);

      ordersCount += orderStatusesRows.length;

      logger.info('OrdersCount = ' + ordersCount);

      orderStatusesRows.forEach(function (orderStatusRow) {
        if (orderStatusRow.status_name === 'Delivered' || orderStatusRow.status_name === 'Awaiting Shipment' ||
          orderStatusRow.status_name === 'Awaiting Delivery') {
          ordersSums['Настоящи'] += orderStatusRow.amount_leva;
        }

        if (orderStatusRow.status_name === 'Awaiting Payment' || orderStatusRow.status_name === 'Payment being verified') {
          ordersSums['Очаквани'] += orderStatusRow.amount_leva;
        }
      });

      queryArgsCopy.offset += CONSTANTS.ORDER_STATUSES_QUERY_LIMIT;
    }

    ordersSums['Всички'] = (ordersSums['Настоящи'] + ordersSums['Очаквани']).toFixed(2);
    ordersSums['Настоящи'] = ordersSums['Настоящи'].toFixed(2);
    ordersSums['Очаквани'] = ordersSums['Очаквани'].toFixed(2);

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
