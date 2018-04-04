const CONSTANTS = require('../constants/constants');
const logger = require('../helpers/logger');
const Utils = require('../helpers/usersControllerUtils');

const assert = require('assert');
const Nodemailer = require('nodemailer');

async function renderLogin (ctx, next) {
  ctx.status = 200;

  await next();

  ctx.render('login.pug', {
    user: {
      isUserLoggedIn: ctx.session.isUserLoggedIn
    }
  });
}

async function login (ctx, next) {
  const requestBody = ctx.request.body;

  assert(requestBody.email.length <= CONSTANTS.MAX_USER_EMAIL_LEN);
  assert(requestBody.password.length <= CONSTANTS.MAX_USER_PASSWORD_LEN);

  const userData = await Utils.executeLoginQuery(ctx, [ requestBody.email ]);

  assert(userData.length <= 1);

  let error = '';

  if (userData.length === 1 && Utils.isLoginSuccessfull(requestBody.password, userData[0])) {
    if (Utils.isAccountConfirmed(userData[0])) {
      ctx.session.userData = { userId: userData[0].id };
      ctx.session.isUserLoggedIn = true;
      return ctx.redirect('/products');
    } else {
      error = 'Email is not confirmed.';
    }
  } else {
    error = 'Wrong username or password.';
  }

  ctx.render('login.pug', {
    error: error,
    user: {
      isUserLoggedIn: ctx.session.isUserLoggedIn
    }
  });
}

async function renderSignUp (ctx, next) {
  ctx.status = 200;

  await next();

  await Utils.renderSignUpPage(ctx);
}

async function signUp (ctx, next) {
  ctx.errors = [];

  await Utils.validateFields(ctx);

  const userData = Utils.getUserData(ctx);

  logger.info('User Data = %o', userData);

  const userDbData = Object.keys(userData).map((fieldName) => userData[ fieldName ]);

  if (ctx.errors.length !== 0) {
    return Utils.renderSignUpPage(ctx, userData);
  }

  const userInsertStatus = await ctx.myPool().query(`
    INSERT INTO users (${Object.keys(userData).join(', ')})
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, userDbData);

  logger.info('userInsertStatus = %o', userInsertStatus);

  if (!userInsertStatus) {
    return Utils.renderSignUpPage(ctx, userData);
  }

  const tempCode = Utils.baseUtils.generateUniqueId(32);

  logger.info(`Temp code = ${tempCode}`);

  const userId = userInsertStatus.insertId;

  const codeInsertStatus = await ctx.myPool().query(`
    INSERT INTO temp_codes(user_id, hash, type)
    VALUES(?, ?, ?)
    `, [userId, tempCode, 'email']);

  if (codeInsertStatus) {
    const transporter = Nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'vanime.staff@gmail.com',
        pass: CONSTANTS.EMAIL_PASS
      }
    });

    const mailOptions = { // in pug template
      from: 'Darth Velioo <velioocs@gmail.com>',
      to: ctx.request.body.email,
      subject: 'Confirm email',
      text: 'Please confirm your account by clicking the link below.',
      html: `Confirm Account: <p><a href="${CONSTANTS.ROOT}confirm_account/${tempCode}">\nClick here </a></p>`
    };

    let message;

    transporter.sendMail(mailOptions, async (error, info) => {
      if (error) {
        logger.error('Error while sending mail: ' + error.stack);
        message = 'There was an error while sending confirmation email. Please try again later.';

        ctx.errors.push({email_send: 'There was a problem while sending confirmation email.'});

        await ctx.myPool().query(`
          DELETE
          FROM users
          WHERE
            id = ?
          `, [userId]);

        await ctx.myPool().query(`
          DELETE
          FROM temp_codes
          WHERE
            user_id = ?
            AND type = 'email'
          `, [userId]);
      } else {
        message = 'A confirmation email was sent to your email address. Please confirm your account before logging in.';
      }

      transporter.close();
    });

    return ctx.render('login.pug', {
      message: message,
      user: {}
    });
  } else {
    logger.error('Failed to insert into temp_codes.');

    const userDeleteStatus = await ctx.myPool().query(`
      DELETE
      FROM users
      WHERE
        id = ?
      `, [userId]);

    if (!userDeleteStatus) {
      throw Error(`Error while deleting temp_codes table row. User id = ${userId}. Status = ${userDeleteStatus}`);
    }
  }
}

async function logOut (ctx, next) {
  await next();

  if (ctx.session.isUserLoggedIn) {
    ctx.session.userData = null;
    ctx.session.isUserLoggedIn = null;
    ctx.redirect('/products');
  }
}

async function confirmAccount (ctx, next) {
  const userTempData = await ctx.myPool().query(`
    SELECT *
    FROM temp_codes
    WHERE
      hash = ?
    `, [ctx.params.code]);

  assert(userTempData.length <= 1);

  let message;

  if (userTempData.length > 0) {
    const userId = userTempData[0].user_id;

    const resultSetHeader = await ctx.myPool().query(`
      UPDATE users
      SET confirmed = 1
      WHERE
        id = ?
      `, [userId]);

    if (resultSetHeader) {
      await ctx.myPool().query(`
        DELETE
        FROM temp_codes
        WHERE
          hash = ?
        `, [ctx.params.code]);

      message = 'You succecssfully validated your account.';
    } else {
      message = 'There was a problem confirming your account.';
    }
  } else {
    message = 'Link is invalid or has expired.';
  }

  ctx.render('login.pug', {
    message: message,
    user: {}
  });
}

module.exports = { renderLogin, login, renderSignUp, signUp, logOut, confirmAccount };
