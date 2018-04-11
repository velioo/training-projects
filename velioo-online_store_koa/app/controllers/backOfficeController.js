const CONSTANTS = require('../constants/constants');
const logger = require('../helpers/logger');
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

    const userData = await Utils.executeLoginQuery([ requestBody.username ]);

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
      ctx.session.isEmployeeLoggedIn = null;
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

    const productsRows = await Utils.executeProductsQuery(queryArgs);
    const productsCountRows = await Utils.executeProductsCountQuery(queryArgs);

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

    const ordersRows = await Utils.executeOrdersQuery(queryArgs);

    assert(ordersRows.length >= 0);

    logger.info('OrdersRows[0] = %o', ordersRows[0]);

    const statusesRows = await Utils.executeOrderStatusesQuery();

    assert(statusesRows.length >= 0);

    logger.info('OrderStatusesRows = %o', statusesRows);

    const orders = (ordersRows.length > 0)
      ? Utils.prepareHtmlDataOrders(ordersRows, statusesRows)
      : [];

    const result = { rows: orders };

    const ordersInfo = await Utils.calculateOrdersProfitAndCount(queryArgs);

    logger.info('OrdersInfo = %o', ordersInfo);

    result.total_rows = ordersInfo.ordersCount;
    result.sums = ordersInfo.ordersSums;

    ctx.body = result;
  },
  changeOrderStatus: async (ctx, next) => {
    assert(!isNaN(ctx.request.body.statusId) && !isNaN(ctx.request.body.orderId));

    ctx.body = true;

    try {
      await Utils.executeChangeOrderStatusQuery([+ctx.request.body.statusId, +ctx.request.body.orderId]);
    } catch (err) {
      logger.info('ChangeOrderStatus Error = %o', err);
      ctx.body = false;
    }
  }
};
