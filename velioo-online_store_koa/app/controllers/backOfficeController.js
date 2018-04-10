const CONSTANTS = require('../constants/constants');
const logger = require('../helpers/logger');
const mysql = require('../db/mysql');
const Utils = require('../helpers/backOfficeControllerUtils');

const assert = require('assert');
const escapeHtml = require('escape-html');

async function renderEmployeeLogin (ctx, next) {
  ctx.status = 200;

  await next();

  Utils.renderLoginPage(ctx);
}

async function employeeLogin (ctx, next) {
  const requestBody = ctx.request.body;

  assert(requestBody.username.length <= CONSTANTS.MAX_USERNAME_LEN);
  assert(requestBody.password.length <= CONSTANTS.MAX_USER_PASSWORD_LEN);

  const userData = await Utils.executeLoginQuery([ requestBody.username ]);

  if (userData.length === 1 && Utils.isLoginSuccessfull(requestBody.password, userData[0])) {
    ctx.session.employeeData = { employeeId: userData[0].id };
    ctx.session.isEmployeeLoggedIn = true;

    return ctx.redirect('/employee/dashboard');
  } else {
    ctx.error = 'Wrong username or password.';
  }

  Utils.renderLoginPage(ctx);
}

async function renderDashboard (ctx, next) {
  await next();

  ctx.render('dashboard.pug', {
    isEmployeeLoggedIn: ctx.session.isEmployeeLoggedIn,
    user: {}
  });
}

async function renderOrders (ctx, next) {
  await next();

  ctx.render('backoffice_orders.pug', {
    isEmployeeLoggedIn: ctx.session.isEmployeeLoggedIn,
    user: {}
  });
}

async function employeeLogOut (ctx, next) {
  await next();

  if (ctx.session.isEmployeeLoggedIn) {
    ctx.session.employeeData = null;
    ctx.session.isEmployeeLoggedIn = null;
    ctx.redirect('/products');
  }
}

async function getProducts (ctx, next) {
  logger.info('Query params = %o', ctx.query);

  const queryArgs = Utils.processQueryStr(ctx.query, {
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
  });

  logger.info('QueryArgs = %o', queryArgs);

  const productsRows = await Utils.executeProductsQuery(queryArgs);
  const productsCountRows = await Utils.executeProductsCountQuery(queryArgs);

  assert(productsRows.length >= 0);

  logger.info('ProductsRows[0] = %o', productsRows[0]);

  assert(productsCountRows.length >= 0);

  const productsCount = productsCountRows[0].count;

  logger.info('ProductsCount = ' + productsCount);

  const result = { total_rows: productsCount };

  const products = (productsCount > 0) ? Utils.prepareHtmlData(productsRows) : [];

  result.rows = products;

  ctx.body = result;
}

async function getOrders (ctx, next) {
  logger.info('Query params = %o', ctx.query);

  const queryArgs = Utils.processQueryStr(ctx.query, {
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
    3: 'usrs.email ',
    4: 'orders.amount_leva ',
    5: 'statuses.name ',
    6: ''
  });

  logger.info('QueryArgs = %o', queryArgs);

  const ordersRows = await Utils.executeOrdersQuery(queryArgs);

  let statusesQuery = `
      SELECT *
      FROM statuses
      ORDER BY statuses.name ASC
    `;

  assert(ordersRows.length >= 0);

  logger.info('ordersRows = %o', ordersRows);

  let statusesRows = await mysql.pool.query(statusesQuery);

  assert(statusesRows.length >= 0);

  logger.info('statusesRows = %o', statusesRows);

  let orderArray = [];
  let ordersArray = [];

  if (ordersRows.length > 0) {
    ordersRows.forEach(function (orderRow) { // use pug to create html string
      orderArray.push(escapeHtml(orderRow.order_created_at));
      orderArray.push(escapeHtml(orderRow.order_updated_at));
      orderArray.push(escapeHtml(orderRow.order_id));
      orderArray.push(escapeHtml(orderRow.user_email));
      orderArray.push(escapeHtml(orderRow.amount_leva));

      let selectElement = '<select class="select_status">';

      statusesRows.forEach(function (statusRow) {
        selectElement += `<option value="${escapeHtml(statusRow.id)}"`;

        selectElement += (orderRow.status_id === statusRow.id)
          ? 'selected>'
          : '>';

        selectElement += escapeHtml(statusRow.name) + '</option>';
      });

      selectElement += '</select>';
      orderArray.push(selectElement);
      orderArray.push(`<a href="../employee/orders/${escapeHtml(orderRow.id)}" class="order_details">Детайли</a>`);
      ordersArray.push(orderArray);
      orderArray = [];
    });
  }

  let result = { rows: ordersArray };

  const ordersInfo = await Utils.processOrders(queryArgs);

  logger.info('OrdersInfo = %o', ordersInfo);

  result.total_rows = ordersInfo.ordersCount;
  result.sums = ordersInfo.ordersSums;

  ctx.body = result;
}

async function changeOrderStatus (ctx, next) {
  if (ctx.request.body.statusId && ctx.request.body.orderId) {
    assert(!isNaN(ctx.request.body.statusId) && !isNaN(ctx.request.body.orderId));

    let resultSetHeader = await mysql.pool.query(`
      UPDATE orders
      SET
        status_id = ?,
      WHERE
        id = ?
      `, [ctx.request.body.statusId, ctx.request.body.orderId]);

    logger.info('resultSetHeader = %o', resultSetHeader);

    if (resultSetHeader) {
      ctx.body = true;
    } else {
      ctx.body = false;
    }
  }
}

module.exports = { renderEmployeeLogin, employeeLogin, renderDashboard, employeeLogOut, getProducts, renderOrders, getOrders, changeOrderStatus };
