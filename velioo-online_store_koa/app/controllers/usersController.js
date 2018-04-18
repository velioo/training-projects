const CONSTANTS = require('../constants/constants');
const logger = require('../helpers/logger');
const mysql = require('../db/mysql');
const Utils = require('../helpers/usersControllerUtils');

const assert = require('assert');

module.exports = {
  renderLogin: async (ctx, next) => {
    ctx.status = 200;

    await next();

    Utils.renderLoginPage(ctx);
  },
  login: async (ctx, next) => {
    const requestBody = ctx.request.body;

    assert(requestBody.email.length <= CONSTANTS.MAX_USER_EMAIL_LEN);
    assert(requestBody.password.length <= CONSTANTS.MAX_USER_PASSWORD_LEN);

    const userData = await mysql.pool.query(`
      SELECT password, salt, id, confirmed
      FROM users
      WHERE
        email = ?
    `, [ requestBody.email ]);

    assert(userData.length <= 1);

    if (userData.length === 1 && Utils.isLoginSuccessfull(requestBody.password, userData[0])) {
      if (Utils.isAccountConfirmed(userData[0])) {
        ctx.session.userData = { userId: userData[0].id };
        ctx.session.isUserLoggedIn = true;

        return ctx.redirect('/products');
      } else {
        ctx.error = 'Email is not confirmed.';
      }
    } else {
      ctx.error = 'Wrong username or password.';
    }

    Utils.renderLoginPage(ctx);
  },
  renderSignUp: async (ctx, next) => {
    ctx.status = 200;

    await next();

    const countryRows = await mysql.pool.query(`
      SELECT nicename, phonecode
      FROM countries
    `);

    assert(countryRows.length >= 0);

    await Utils.renderSignUpPage(ctx, {}, countryRows);
  },
  signUp: async (ctx, next) => {
    ctx.errors = [];

    await Utils.validateFields(ctx);

    const userData = Utils.getUserData(ctx);

    logger.info('User Data = %o', userData);

    if (ctx.errors.length !== 0) {
      return Utils.renderSignUpPage(ctx, userData);
    }

    const tempCode = Utils.baseUtils.generateUniqueId(32);

    const userDbData = Object.keys(userData).map((fieldName) => userData[ fieldName ]);
    const userDbFields = Object.keys(userData).join(', ');

    const connection = await mysql.pool.getConnection();
    await connection.beginTransaction();

    try {
      const queryStatus = await connection.query(`
        INSERT INTO users (${userDbFields})
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, userDbData);

      assert(queryStatus.insertId);

      const userId = queryStatus.insertId;

      await connection.query(`
        INSERT INTO temp_codes(user_id, hash, type)
        VALUES(?, ?, ?)
      `, [userId, tempCode, 'email']);

      await connection.commit();
    } catch (err) {
      ctx.userMessage = 'There was a problem creating your account.';
      return Utils.renderSignUpPage(ctx, userData);
    }

    await Utils.sendConfirmationEmail(ctx, tempCode);

    Utils.renderLoginPage(ctx);
  },
  logOut: async (ctx, next) => {
    await next();

    if (ctx.session.isUserLoggedIn) {
      ctx.session.userData = null;
      ctx.session.isUserLoggedIn = false;
      ctx.redirect('/products');
    }
  },
  confirmAccount: async (ctx, next) => {
    const userTempData = await mysql.pool.query(`
      SELECT *
      FROM temp_codes
      WHERE
        hash = ?
    `, [ctx.params.code]);

    assert(userTempData.length <= 1);

    if (userTempData.length === 0) {
      ctx.userMessage = 'Link is invalid or has expired.';
    }

    const userId = userTempData[0].user_id;

    const connection = await mysql.pool.getConnection();
    await connection.beginTransaction();

    try {
      await connection.query(`
        UPDATE users
        SET confirmed = 1
        WHERE
          id = ?
      `, [userId]);

      await connection.query(`
        DELETE
        FROM temp_codes
        WHERE
          hash = ?
      `, [ctx.params.code]);

      await connection.commit();
    } catch (err) {
      ctx.userMessage = 'There was a problem confirming your account.';
      return Utils.renderLoginPage(ctx);
    }

    ctx.userMessage = 'You succecssfully validated your account.';

    Utils.renderLoginPage(ctx);
  },
  renderUserOrders: async (ctx, next) => {
    ctx.status = 200;
  },
  confirmOrder: async (ctx, next) => {
    await next();

    const requestBody = ctx.request.body;
    const paymentMethodId = +requestBody.paymentMethod;

    assert(_.isInteger(paymentMethodId));

  },
  createOrder: async (ctx, next) => {
    ctx.status = 200;
  }
};
