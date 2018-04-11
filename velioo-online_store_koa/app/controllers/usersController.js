const CONSTANTS = require('../constants/constants');
const logger = require('../helpers/logger');
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

    const userData = await Utils.executeLoginQuery([ requestBody.email ]);

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

    await Utils.renderSignUpPage(ctx);
  },
  signUp: async (ctx, next) => {
    ctx.errors = [];

    await Utils.validateFields(ctx);

    const userData = Utils.getUserData(ctx);

    logger.info('User Data = %o', userData);

    if (ctx.errors.length !== 0) {
      return Utils.renderSignUpPage(ctx, userData);
    }

    const connection = await Utils.executeBeginTransaction();

    const tempCode = Utils.baseUtils.generateUniqueId(32);

    const userId = await Utils.executeInsertUserQuery(connection, userData);
    await Utils.executeInsertTempCodeQuery(connection, [userId, tempCode, 'email']);

    try {
      await Utils.exucuteCommitTransaction(connection);
    } catch (err) {
      ctx.userMessage = 'There was a problem creating your account.';
    }

    await Utils.sendConfirmationEmail(ctx, tempCode);

    Utils.renderLoginPage(ctx);
  },
  logOut: async (ctx, next) => {
    await next();

    if (ctx.session.isUserLoggedIn) {
      ctx.session.userData = null;
      ctx.session.isUserLoggedIn = null;
      ctx.redirect('/products');
    }
  },
  confirmAccount: async (ctx, next) => {
    const userTempData = await Utils.executeTempCodeQuery([ctx.params.code]);

    assert(userTempData.length <= 1);

    if (userTempData.length === 0) {
      ctx.userMessage = 'Link is invalid or has expired.';
    }

    const userId = userTempData[0].user_id;

    const connection = await Utils.executeBeginTransaction();

    await Utils.executeUpdateAccountStatusQuery(connection, [userId]);
    await Utils.executeDeleteTempCodeQuery(connection, [ctx.params.code]);

    try {
      await Utils.exucuteCommitTransaction(connection);
    } catch (err) {
      ctx.userMessage = 'There was a problem confirming your account.';
    }

    ctx.userMessage = 'You succecssfully validated your account.';

    Utils.renderLoginPage(ctx);
  }
};
