const _ = require('lodash/lang');
const assert = require('assert');
const Crypto = require('crypto');
const mysql = require('../db/mysql');

const self = module.exports = {
  escapeSql: (str) => {
    if (_.isNil(str)) return str;

    const escapedStr = str
      .replace(/%/g, '!%')
      .replace(/_/g, '!_')
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"');

    return escapedStr;
  },
  createExprsVals: (params) => {
    const exprs = [];
    const vals = [];

    for (let [expr, value] of params) {
      exprs.push(value ? expr : '?');
      vals.push(value || true);
    }

    return {
      exprs,
      vals
    };
  },
  createWhereClauseExprs: (filterExprs, filterColumns) => {
    let resultExprs = Array(Object.keys(filterExprs).length).fill(true);

    //resultExprs = [true, true, true, true, true, true, true, true];

    if (Object.keys(filterColumns).length !== 0) {
      Object.keys(filterColumns).forEach(function (key) {
        let filterInput = self.escapeSql(filterExprs[key]);

        assert(key in filterExprs === true);

        filterExprs[key] = (filterExprs[key])
          ? filterExprs[key] +
            filterInput +
            (
              (filterExprs[key].indexOf('=') === -1)
                ? "%' ESCAPE '!'"
                : ''
            )
          : true;
      });
    }

    return resultExprs;
  },
  rowExists: async (params) => {
    assert(_.isString(params.table) && _.isString(params.field) && _.isString(params.queryArg));

    const results = await mysql.pool.query(`
      SELECT *
      FROM ${params.table}
      WHERE
        ${params.field} = ?
      `, [params.queryArg]);

    assert(results.length <= 1);

    return results.length;
  },
  generateSalt: (bytes = 32) => {
    return Crypto.randomBytes(bytes).toString('base64');
  },
  generateUniqueId: (length = 16) => {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
  },
  parseArrayQueryStr: (obj, str) => {
    const result = {};

    Object.keys(obj).forEach((key) => {
      if (key.startsWith(str + '[') && key.indexOf(']') !== -1) {
        let index = key.slice(str.length + 1, (key.indexOf(']')));

        result[index] = obj[key];
      }
    });

    return result;
  }
};
