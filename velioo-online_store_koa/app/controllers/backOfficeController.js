const CONSTANTS = require('../constants/constants');
const logger = require('../helpers/logger');
const mysql = require('../db/mysql');
const Utils = require('../helpers/backOfficeControllerUtils');

const assert = require('assert');

module.exports = {
  renderEmployeeLogin: async (ctx, next) => {
    ctx.status = 200;

    await next();

    Utils.renderLoginPage(ctx);
  },
  employeeLogin: async (ctx, next) => {
    const requestBody = ctx.request.body;

    assert(requestBody.username.length <= CONSTANTS.MAX_USERNAME_LEN);
    assert(requestBody.password.length <= CONSTANTS.MAX_USER_PASSWORD_LEN);

    const userData = await mysql.pool.query(`
      SELECT password, salt, id
      FROM employees
      WHERE
        username = ?
    `, [ requestBody.username ]);

    if (userData.length === 1 && Utils.isLoginSuccessfull(requestBody.password, userData[0])) {
      ctx.session.employeeData = { employeeId: userData[0].id };
      ctx.session.isEmployeeLoggedIn = true;

      return ctx.redirect('/employee/dashboard');
    } else {
      ctx.error = 'Wrong username or password.';
    }

    Utils.renderLoginPage(ctx);
  },
  renderDashboard: async (ctx, next) => {
    await next();

    ctx.render('dashboard.pug', {
      isEmployeeLoggedIn: ctx.session.isEmployeeLoggedIn,
      user: {}
    });
  },
  renderOrders: async (ctx, next) => {
    await next();

    ctx.render('backoffice_orders.pug', {
      isEmployeeLoggedIn: ctx.session.isEmployeeLoggedIn,
      user: {}
    });
  },
  employeeLogOut: async (ctx, next) => {
    await next();

    if (ctx.session.isEmployeeLoggedIn) {
      ctx.session.employeeData = null;
      ctx.session.isEmployeeLoggedIn = false;
      ctx.redirect('/products');
    }
  },
  getProducts: async (ctx, next) => {
    logger.info('Query params = %o', ctx.query);

    const queryArgs = Utils.processQueryStr(ctx.query,
      {
        0: "products.created_at LIKE '%",
        1: "products.updated_at LIKE '%",
        2: "products.name LIKE '%",
        3: "categories.name LIKE '%",
        4: "products.price_leva LIKE '%",
        5: 'products.quantity = ',
        6: '',
        7: ''
      },
      {
        0: 'products.created_at ',
        1: 'products.updated_at ',
        2: 'products.name ',
        3: 'categories.name ',
        4: 'products.price_leva ',
        5: 'products.quantity ',
        6: '',
        7: ''
      },
      {
        0: 'DATE(products.created_at) >= ?',
        1: 'DATE(products.created_at) <= ?',
        2: 'DATE(products.updated_at) >= ?',
        3: 'DATE(products.updated_at) <= ?',
        4: 'products.price_leva >= ?',
        5: 'products.price_leva <= ?'
      }
    );

    logger.info('QueryArgs = %o', queryArgs);

    const productsRows = await mysql.pool.query(`
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

    const productsCountRows = await mysql.pool.query(`
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

    assert(productsRows.length >= 0);

    logger.info('ProductsRows[0] = %o', productsRows[0]);

    assert(productsCountRows.length >= 0);

    const productsCount = productsCountRows[0].count;

    logger.info('ProductsCount = ' + productsCount);

    const result = { total_rows: productsCount };

    const products = (productsCount > 0) ? Utils.prepareHtmlDataProducts(productsRows) : [];

    result.rows = products;

    ctx.body = result;
  },
  getOrders: async (ctx, next) => {
    logger.info('Query params = %o', ctx.query);

    const queryArgs = Utils.processQueryStr(ctx.query,
      {
        0: "orders.created_at LIKE '%",
        1: "orders.updated_at LIKE '%",
        2: 'orders.id = ',
        3: "users.email LIKE '%",
        4: 'orders.amount_leva = ',
        5: "statuses.name LIKE '%",
        6: ''
      },
      {
        0: 'orders.created_at ',
        1: 'orders.updated_at ',
        2: 'orders.id ',
        3: 'users.email ',
        4: 'orders.amount_leva ',
        5: 'statuses.name ',
        6: ''
      },
      {
        0: 'DATE(orders.created_at) >= ?',
        1: 'DATE(orders.created_at) <= ?',
        2: 'DATE(orders.updated_at) >= ?',
        3: 'DATE(orders.updated_at) <= ?',
        4: 'orders.amount_leva >= ?',
        5: 'orders.amount_leva <= ?'
      }
    );

    logger.info('QueryArgs = %o', queryArgs);

    const ordersRows = await mysql.pool.query(`
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

    assert(ordersRows.length >= 0);

    logger.info('OrdersRows[0] = %o', ordersRows[0]);

    const statusRows = await mysql.pool.query(`
      SELECT *
      FROM statuses
      ORDER BY statuses.name ASC
    `);

    assert(statusRows.length >= 0);

    logger.info('OrderStatusRows = %o', statusRows);

    const orders = (ordersRows.length > 0)
      ? Utils.prepareHtmlDataOrders(ordersRows, statusRows)
      : [];

    const result = { rows: orders };

    const ordersInfo = await Utils.calculateOrdersProfitAndCount(`
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
    `, queryArgs);

    logger.info('OrdersInfo = %o', ordersInfo);

    result.total_rows = ordersInfo.ordersCount;
    result.sums = ordersInfo.ordersSums;

    ctx.body = result;
  },
  changeOrderStatus: async (ctx, next) => {
    assert(!isNaN(ctx.request.body.statusId) && !isNaN(ctx.request.body.orderId));

    ctx.body = true;

    try {
      await mysql.pool.query(`
        UPDATE orders
        SET
          status_id = ?
        WHERE
          id = ?
      `, [+ctx.request.body.statusId, +ctx.request.body.orderId]);
    } catch (err) {
      logger.info('Error changing order status: %o', err);
      ctx.throw(500, 'Error changing order status');
    }
  }
};
