const logger = require('../helpers/logger');
const mysql = require('../db/mysql');
const pug = require('../helpers/pug').baseRenderer;
const utils = require('../helpers/utils');
const {
  MAX_USERNAME_LEN,
  MAX_USER_PASSWORD_LEN,
  MAX_SEARCH_FILTER_LEN,
  ORDER_STATUSES_QUERY_LIMIT
} = require('../constants/constants');

const assert = require('assert');
const _ = require('lodash/lang');
const sha256 = require('js-sha256').sha256;

module.exports = {
  renderEmployeeLogin: async (ctx, next) => {
    await next();

    renderLoginPage(ctx);
  },
  employeeLogin: async (ctx, next) => {
    assert(ctx.request.body.username.length <= MAX_USERNAME_LEN);
    assert(ctx.request.body.password.length <= MAX_USER_PASSWORD_LEN);

    const userData = await mysql.pool.query(`

      SELECT password, salt, id
      FROM employees
      WHERE
        username = ?

    `, [ ctx.request.body.username ]);

    if (userData.length === 1 && isLoginSuccessfull(ctx.request.body.password, userData[0])) {
      ctx.session.employeeData = { employeeId: userData[0].id };
      ctx.session.isEmployeeLoggedIn = true;

      return ctx.redirect('/employee/dashboard');
    } else {
      ctx.error = 'Wrong username or password.';
    }

    renderLoginPage(ctx);
  },
  renderDashboard: async (ctx, next) => {
    await next();

    ctx.render('dashboard.pug', {
      isEmployeeLoggedIn: ctx.session.isEmployeeLoggedIn,
      user: {}
    });
  },
  renderOrdersTable: async (ctx, next) => {
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

    const queryArgs = processQueryStr(ctx.query,
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
        ${queryArgs.expr}
      ORDER BY
        ${queryArgs.orderByExpr}
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
       ${queryArgs.expr}

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

    const products = (productsCount > 0) ? prepareHtmlDataProducts(productsRows) : [];

    result.rows = products;

    ctx.body = result;
  },
  getOrders: async (ctx, next) => {
    logger.info('Query params = %o', ctx.query);

    const queryArgs = processQueryStr(ctx.query,
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
        ${queryArgs.expr}
      ORDER BY
        ${queryArgs.orderByExpr}
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
      ? prepareHtmlDataOrders(ordersRows, statusRows)
      : [];

    const result = { rows: orders };

    const ordersInfo = await calculateOrdersProfitAndCount(`

      SELECT statuses.name, orders.amount_leva
      FROM orders
      JOIN statuses ON statuses.id = orders.status_id
      JOIN users ON users.id = orders.user_id
      WHERE
        ${queryArgs.expr}
      LIMIT ?
      OFFSET ?

    `, queryArgs);

    logger.info('OrdersInfo = %o', ordersInfo);

    result.total_rows = ordersInfo.ordersCount;
    result.sums = ordersInfo.ordersSums;

    ctx.body = result;
  },
  getOrderById: async (ctx, next) => {
    await next();

    assert(_.isInteger(+ctx.params.id));

    let orderId = ctx.params.id;

    const userInfoRows = await mysql.pool.query(`

      SELECT
        u.name,
        u.last_name,
        u.country,
        u.region,
        u.street_address,
        u.phone_unformatted,
        u.email,
        pm.name as paymentMethodName,
        pm.image as paymentMethodImage,
        pm.details as paymentMethodDetails,
        o.id as orderId,
        o.amount_leva as orderSum
      FROM users u
      JOIN orders o ON o.user_id = u.id
      JOIN payment_methods pm ON pm.id = o.payment_method_id
      WHERE
        o.id = ?

    `, [ orderId ]);

    logger.info('UserInfoRows = %o', userInfoRows);

    assert(userInfoRows.length <= 1);

    if (userInfoRows.length === 0) {
      ctx.redirect('/not_found')
    }

    const orderDataRows = await mysql.pool.query(`

      SELECT
        p.id,
        p.name,
        p.image,
        op.price_leva,
        op.quantity
      FROM products p
      JOIN order_products op ON op.product_id = p.id
      JOIN orders o ON o.id = op.order_id
      WHERE
        o.id = ?

    `, [ orderId ]);

    logger.info('orderDataRows = %o', orderDataRows);

    assert(orderDataRows.length >= 0);

    ctx.render('employee_order.pug', {
      user: userInfoRows[0],
      products: orderDataRows,
      hasProducts: (orderDataRows.length > 0)
    });
  },
  changeOrderStatus: async (ctx, next) => {
    assert(_.isInteger(+ctx.request.body.statusId) && _.isInteger(+ctx.request.body.orderId));

    await mysql.pool.query(`

      UPDATE orders
      SET
        status_id = ?
      WHERE
        id = ?

    `, [+ctx.request.body.statusId, +ctx.request.body.orderId]);

    ctx.body = true;
  }
};

let renderLoginPage = (ctx) => {
  return ctx.render('employee_login.pug', {
    error: ctx.error,
    user: {},
    isUserLoggedIn: ctx.session.isUserLoggedIn
  });
};

let isLoginSuccessfull = (inputPassword, userData) => {
  return sha256(inputPassword + userData.salt) === userData.password;
};

let processQueryStr = (queryStrObj, filterColumnsCases, sortColumnsCases, customColumnsCases) => {
  assert(_.isObject(queryStrObj));
  utils.assertObjStrLen([ queryStrObj ], MAX_SEARCH_FILTER_LEN);

  assert(_.isNil(queryStrObj.price_from) || !isNaN(queryStrObj.price_from));
  assert(_.isNil(queryStrObj.price_to) || !isNaN(queryStrObj.price_to));
  assert(parseInt(queryStrObj.size) >= 0);
  assert(parseInt(queryStrObj.limit) >= 0);
  assert(parseInt(queryStrObj.page) >= 0);

  const limit = +queryStrObj.size || +queryStrObj.limit;
  const offset = +queryStrObj.page * limit - limit;
  const dates = [
    queryStrObj.date_c_from,
    queryStrObj.date_c_to,
    queryStrObj.date_m_from,
    queryStrObj.date_m_to
  ];

  dates.forEach((date) => assert(utils.isValidDate));

  const sortColumns = utils.parseArrayQueryStr(queryStrObj, 'col');
  const filterColumns = utils.parseArrayQueryStr(queryStrObj, 'fcol');

  const filterColumnsExprs = utils.createWhereClauseExprs(filterColumnsCases, filterColumns);

  const customFilterExprsVals = utils.createExprsVals(new Map([
    [customColumnsCases[0], dates[0]],
    [customColumnsCases[1], dates[1]],
    [customColumnsCases[2], dates[2]],
    [customColumnsCases[3], dates[3]],
    [customColumnsCases[4], queryStrObj.price_from],
    [customColumnsCases[5], queryStrObj.price_to]
  ]));

  const orderByExpr = utils.createOrderByClauseExpr(sortColumnsCases, sortColumns);

  return {
    expr: [
      ...filterColumnsExprs,
      ...customFilterExprsVals.exprs
    ].join(' AND '),
    orderByExpr: orderByExpr,
    vals: [
      ...customFilterExprsVals.vals
    ],
    limit: limit,
    offset: offset
  };
};

let prepareHtmlDataProducts = (productsRows) => {
  assert(_.isObject(productsRows));

  let productArray = [];
  const productsArray = [];

  const decimalFormatter = new Intl.NumberFormat(`en-US`, {
    style: `decimal`,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  });

  const basicNumberFormatter = new Intl.NumberFormat();

  productsRows.forEach((productRow) => {
    productArray.push(pug.render('p #{createdAt}',
      { createdAt: productRow.created_at },
      { fromString: true }));
    productArray.push(pug.render('p #{updatedAt}',
      { updatedAt: productRow.updated_at },
      { fromString: true }));
    productArray.push(pug.render('a(href = "../products/" + productId) #{productName}',
      { productId: productRow.id, productName: productRow.name },
      { fromString: true }));
    productArray.push(pug.render('p #{category}',
      { category: productRow.category },
      { fromString: true }));
    productArray.push(pug.render('p #{price}',
      { price: decimalFormatter
        .format(productRow.price_leva) },
      { fromString: true }));
    productArray.push(pug.render('p #{quantity}',
      { quantity: basicNumberFormatter
        .format(productRow.quantity) },
      { fromString: true }));
    productArray.push(
      pug.render('a(href = "../employee/update_product/" + productId class = "product_details") Редактирай',
        { productId: productRow.id },
        { fromString: true }));
    productArray.push(pug.render('a(href = "#" class = "delete_record" data-id = productId) Изтрий',
      { productId: productRow.id },
      { fromString: true }));
    productsArray.push(productArray);
    productArray = [];
  });

  return productsArray;
};

let prepareHtmlDataOrders = (ordersRows, statusRows) => {
  assert(_.isObject(ordersRows));

  let orderArray = [];
  const ordersArray = [];

  const decimalFormatter = new Intl.NumberFormat(`en-US`, {
    style: `decimal`,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  });

  const basicNumberFormatter = new Intl.NumberFormat();

  ordersRows.forEach((orderRow) => {
    orderArray.push(pug.render('p #{createdAt}',
      { createdAt: orderRow.order_created_at },
      { fromString: true }));
    orderArray.push(pug.render('p #{updatedAt}',
      { updatedAt: orderRow.order_updated_at },
      { fromString: true }));
    orderArray.push(pug.render('p #{productId}',
      { productId: basicNumberFormatter
        .format(orderRow.order_id) },
      { fromString: true }));
    orderArray.push(pug.render('p #{userEmail}',
      { userEmail: orderRow.user_email },
      { fromString: true }));
    orderArray.push(pug.render('p #{amount}',
      { amount: decimalFormatter
        .format(orderRow.amount_leva) },
      { fromString: true }));

    let selectElement = '<select class = "select_status">';

    statusRows.forEach((statusRow) => {
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
};

let calculateOrdersProfitAndCount = async (query, queryArgs) => {
  assert(_.isString(query));
  assert(_.isObject(queryArgs));
  assert(_.isArray(queryArgs.vals));

  let queryArgsCopy = Object.assign({}, queryArgs);

  queryArgsCopy.limit = ORDER_STATUSES_QUERY_LIMIT;
  queryArgsCopy.offset = 0;

  let ordersCount = 0;
  let ordersSums = { 'Всички': 0, 'Настоящи': 0, 'Очаквани': 0 };
  let orderStatusRows;

  while ((orderStatusRows = await mysql.pool.query(query,
    [
      ...queryArgsCopy.vals,
      queryArgsCopy.limit,
      queryArgsCopy.offset
    ])).length > 0) {
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

    queryArgsCopy.offset += ORDER_STATUSES_QUERY_LIMIT;
  }

  ordersSums['Всички'] = ((ordersSums['Настоящи'] + ordersSums['Очаквани']) / 100).toFixed(2);
  ordersSums['Настоящи'] = (ordersSums['Настоящи'] / 100).toFixed(2);
  ordersSums['Очаквани'] = (ordersSums['Очаквани'] / 100).toFixed(2);

  return {
    ordersCount,
    ordersSums
  };
};

let assertFilters = (arr) => {
  assert(_.isArray(arr));

  const assertCases = {
    0: utils.isValidDate,
    1: utils.isValidDate,
    2: _.isString,
    3: _.isString,
    4: _.isFinite,
    5: _.isInteger,
    6: returnTrue,
    7: returnTrue
  };

  arr.forEach((obj) => {
    for (let [ key, val ] in obj) {
      assert(assertCases[ key ](val) || val === '');
    }
  });
};

let returnTrue = (param = null) => {
  return true;
};
