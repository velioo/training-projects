const CONSTANTS = require('../constants/constants');
const mysql = require('../db/mysql');
const pug = require('../helpers/pug').baseRenderer;
const Utils = require('../helpers/utils');
const logger = require('../helpers/logger');

const assert = require('assert');
const _ = require('lodash/lang');
const sha256 = require('js-sha256').sha256;

module.exports = {
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
  processQueryStr: (queryStrObj) => {
    assert(_.isObject(queryStrObj));

    const sortColumns = Utils.parseArrayQueryStr(queryStrObj, 'col');
    const filterColumns = Utils.parseArrayQueryStr(queryStrObj, 'fcol');

    logger.info('SortColumns = %o', sortColumns);
    logger.info('FilterColumns = %o', filterColumns);

    const filterCases = {
      0: "products.created_at LIKE '%",
      1: "products.updated_at LIKE '%",
      2: "products.name LIKE '%",
      3: "categories.name LIKE '%",
      4: "products.price_leva LIKE '%",
      5: 'products.quantity = ',
      6: '',
      7: ''
    };

    const filterExprs = Utils.createWhereClauseExprs(filterCases, filterColumns);

    logger.info('FilterExprs = %o', filterExprs);

    return {
      exprs: [
      ],
      vals: [
      ],
      limit: '',
      offset: ''
    };
  }
};
