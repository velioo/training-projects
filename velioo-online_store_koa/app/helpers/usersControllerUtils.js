const CONSTANTS = require('../constants/constants');
const Utils = require('./utils');
const Validations = require('./validations');
const mysql = require('../db/mysql');
const pug = require('../helpers/pug').baseRenderer;
const logger = require('../helpers/logger');

const assert = require('assert');
const _ = require('lodash/lang');
const sha256 = require('js-sha256').sha256;
const Nodemailer = require('nodemailer');

const self = module.exports = {
  renderLoginPage: (ctx) => {
    return ctx.render('login.pug', {
      error: ctx.error,
      userMessage: ctx.userMessage,
      user: {
        isUserLoggedIn: ctx.session.isUserLoggedIn
      }
    });
  },
  isLoginSuccessfull: (inputPassword, userData) => {
    return sha256(inputPassword + userData.salt) === userData.password;
  },
  isAccountConfirmed: (userData) => {
    return +userData.confirmed === 1;
  },
  executeUserEmailQuery: async (queryArgs, connection = mysql.pool) => {
    assert(_.isArray(queryArgs));

    return connection.query(`
      SELECT email
      FROM users
      WHERE
        email = ?
    `, queryArgs);
  },
  validateFields: async (ctx) => {
    ctx.checkBody('name')
      .len(CONSTANTS.MIN_USER_NAME_LEN, CONSTANTS.MAX_USER_NAME_LEN,
        `Name is too long or too short: ${CONSTANTS.MIN_USER_NAME_LEN} to ${CONSTANTS.MAX_USER_NAME_LEN} symbols`);
    ctx.checkBody('last_name')
      .optional()
      .empty()
      .len(CONSTANTS.MIN_USER_NAME_LEN, CONSTANTS.MAX_USER_NAME_LEN,
        `Last name is too long or too short: ${CONSTANTS.MIN_USER_NAME_LEN} to ${CONSTANTS.MAX_USER_NAME_LEN} symbols`);
    ctx.checkBody('email')
      .isEmail('Your entered a bad email.')
      .len(CONSTANTS.MIN_USER_EMAIL_LEN, CONSTANTS.MAX_USER_EMAIL_LEN,
        `Email is too long or too short: ${CONSTANTS.MIN_USER_EMAIL_LEN} to ${CONSTANTS.MAX_USER_EMAIL_LEN} symbols`);
    if (await Validations.emailExists(ctx)) {
      ctx.errors.push({email: 'Email already exists.'});
    }
    ctx.checkBody('country')
      .optional()
      .empty()
      .len(CONSTANTS.MIN_COUNTRY_LEN, CONSTANTS.MAX_COUNTRY_LEN,
        `Country is too long or too short: ${CONSTANTS.MIN_COUNTRY_LEN} to ${CONSTANTS.MAX_COUNTRY_LEN} symbols`);
    ctx.checkBody('phone')
      .ensure(Validations.phoneMatch(ctx.request.body.phone), 'You entered a bad phone.');
    ctx.checkBody('region')
      .optional()
      .empty()
      .len(CONSTANTS.MIN_REGION_LEN, CONSTANTS.MAX_REGION_LEN,
        `Region is too long or too short: ${CONSTANTS.MIN_REGION_LEN} to ${CONSTANTS.MAX_REGION_LEN} symbols`);
    ctx.checkBody('street_address')
      .optional()
      .empty()
      .len(CONSTANTS.MIN_STREET_ADDRESS_LEN, CONSTANTS.MAX_STREET_ADDRESS_LEN,
        `Street address is too long or too short:
          ${CONSTANTS.MIN_STREET_ADDRESS_LEN} to ${CONSTANTS.MAX_STREET_ADDRESS_LEN} symbols`);
    ctx.checkBody('password')
      .len(CONSTANTS.MIN_USER_PASSWORD_LEN, CONSTANTS.MAX_USER_PASSWORD_LEN,
        `Password is too long or too short: ${CONSTANTS.MIN_USER_PASSWORD_LEN} to ${CONSTANTS.MAX_USER_PASSWORD_LEN} symbols`);
    ctx.checkBody('conf_password')
      .eq(ctx.request.body.password, 'Passwords don\'t match');
    ctx.checkBody('gender')
      .default('Unknown');
  },
  getUserData: (ctx) => {
    const salt = Utils.generateSalt();
    return {
      'name': ctx.request.body.name,
      'last_name': ctx.request.body.last_name,
      'email': ctx.request.body.email,
      'password': sha256(ctx.request.body.password + salt),
      'salt': salt,
      'gender': (ctx.request.body.gender) ? ctx.request.body.gender : 'Unknown',
      'phone': ctx.request.body.phone.replace(/[^0-9]/, ''),
      'phone_unformatted': ctx.request.body.phone,
      'country': ctx.request.body.country,
      'region': ctx.request.body.region,
      'street_address': ctx.request.body.street_address
    };
  },
  sendConfirmationEmail: async (ctx, tempCode) => {
    const transporter = Nodemailer.createTransport({
      service: CONSTANTS.SERVICE_EMAIL_PROVIDER,
      auth: {
        user: CONSTANTS.SERVICE_EMAIL,
        pass: CONSTANTS.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: pug.render('PC Store, <#{email}>', { email: CONSTANTS.SERVICE_EMAIL }, { fromString: true }),
      to: ctx.request.body.email,
      subject: 'Confirm email',
      text: 'Please confirm your account by clicking the link below.',
      html: `Confirm Account:` + pug.render("p: a(href=ROOT + 'confirm_account/' + tempCode) Click Here",
        { ROOT: CONSTANTS.ROOT, tempCode: tempCode }, { fromString: true })
    };

    try {
      await transporter.sendMail(mailOptions);
      ctx.userMessage = `A confirmation email was sent to your email address.
        Please confirm your account before logging in.`;
    } catch (err) {
      logger.error('Error while sending mail: ' + err.stack);
      ctx.errors.push({ confirmation_email: 'There was a problem while sending confirmation email.' });
    }

    logger.info('userMessageMail = ' + ctx.userMessage);

    transporter.close();
  },
  executeLoginQuery: async (queryArgs, connection = mysql.pool) => {
    assert(_.isArray(queryArgs));

    return connection.query(`
      SELECT password, salt, id, confirmed
      FROM users
      WHERE
        email = ?
    `, queryArgs);
  },
  executeCountriesQuery: async (queryArgs = null, connection = mysql.pool) => {
    return connection.query(`
      SELECT nicename, phonecode
      FROM countries
    `);
  },
  executeInsertUserQuery: async (userData, connection = mysql.pool) => {
    assert(_.isObject(userData));

    const userDbData = Object.keys(userData).map((fieldName) => userData[ fieldName ]);

    const queryStatus = await connection.query(`
      INSERT INTO users (${Object.keys(userData).join(', ')})
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, userDbData);

    assert(queryStatus.insertId);

    return queryStatus.insertId;
  },
  executeInsertTempCodeQuery: async (queryArgs, connection = mysql.pool) => {
    assert(_.isArray(queryArgs));

    return connection.query(`
      INSERT INTO temp_codes(user_id, hash, type)
      VALUES(?, ?, ?)
    `, queryArgs);
  },
  executeTempCodeQuery: async (queryArgs, connection = mysql.pool) => {
    assert(_.isArray(queryArgs));

    return connection.query(`
      SELECT *
      FROM temp_codes
      WHERE
        hash = ?
    `, queryArgs);
  },
  executeUpdateAccountStatusQuery: async (queryArgs, connection = mysql.pool) => {
    assert(_.isArray(queryArgs));

    return connection.query(`
      UPDATE users
      SET confirmed = 1
      WHERE
        id = ?
    `, queryArgs);
  },
  executeDeleteTempCodeQuery: async (queryArgs, connection = mysql.pool) => {
    assert(_.isArray(queryArgs));

    return connection.query(`
      DELETE
      FROM temp_codes
      WHERE
        hash = ?
      `, queryArgs);
  },
  renderSignUpPage: async (ctx, userData = {}) => {
    const countryRows = await self.executeCountriesQuery();

    assert(countryRows.length >= 0);

    ctx.render('signup.pug', {
      user: userData,
      countries: countryRows,
      errors: ctx.errors,
      logged: ctx.session.isuserLoggedIn
    });
  },
  baseUtils: Utils
};
