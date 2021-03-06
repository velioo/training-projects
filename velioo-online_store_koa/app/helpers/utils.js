const _ = require('lodash/lang');
const assert = require('assert');
const Crypto = require('crypto');
const mysql = require('../db/mysql');

const self = module.exports = {
  escapeSql: (str) => {
    if (_.isNil(str)) return str;

    assert(_.isString(str));

    const escapedStr = str
      .replace(/%/g, '!%')
      .replace(/_/g, '!_')
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"');

    return escapedStr;
  },
  createExprsVals: (params) => {
    assert(_.isObject(params));

    const exprs = [];
    const vals = [];

    for (let [ expr, value ] of params) {
      exprs.push(value ? expr : '?');
      vals.push(value || true);
    }

    return {
      exprs,
      vals
    };
  },
  createWhereClauseExprs: (filterCases, filterColumns) => {
    assert(_.isObject(filterCases) && _.isArray(filterColumns));

    const resultExprs = Array(Object.keys(filterCases).length).fill(true);

    if (filterColumns.length === 0) {
      return resultExprs;
    }

    filterColumns.forEach(function (obj) {
      const entries = Object.entries(obj)[0];

      assert(entries.length === 2);

      const key = entries[0];
      const filterInput = self.escapeSql(entries[1]);

      assert(entries[0] in filterCases === true);

      resultExprs[ key ] = (filterCases[ key ])
        ? filterCases[ key ] +
          filterInput +
          (
            (filterCases[ key ].indexOf('=') === -1)
              ? "%' ESCAPE '!'"
              : ''
          )
        : true;
    });

    return resultExprs;
  },
  createOrderByClauseExpr: (sortCases, sortColumns) => {
    assert(_.isObject(sortCases) && _.isObject(sortColumns));

    let sortExpr = '';

    if (sortColumns.length === 0) {
      return sortExpr;
    }

    sortColumns.forEach(function (obj) {
      const entries = Object.entries(obj)[0];

      assert(entries.length === 2);

      const key = entries[0];
      const sortInput = self.escapeSql(entries[1]);

      assert(entries[0] in sortCases === true);

      sortExpr += (sortCases[ key ])
        ? sortCases[ key ] +
        (
          (sortInput === '1')
            ? 'DESC, '
            : 'ASC, '
        )
        : '';
    });

    if (sortExpr) {
      sortExpr = sortExpr.slice(0, sortExpr.lastIndexOf(','));
    }

    return sortExpr;
  },
  rowExists: async (params) => {
    assert(_.isString(params.table) && _.isString(params.field));

    const results = await mysql.pool.query(`
      SELECT *
      FROM ${params.table}
      WHERE
        ${params.field} = ?
      `, [ params.queryArg ]);

    assert(results.length <= 1);

    return (results.length);
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
    assert(_.isObject(obj) && _.isString(str));

    const result = [];

    Object.keys(obj).forEach((key) => {
      if (key.startsWith(str + '[') && key.indexOf(']') !== -1) {
        const valIndex = key.slice(str.length + 1, (key.indexOf(']')));
        const val = self.escapeSql(obj[ key ]);

        assert(_.isFinite(+valIndex));

        result.push({ [ valIndex ]: val });
      }
    });

    return result;
  },
  assertObjStrLen: (obj, limit) => {
    for (let key in obj) {
      if (_.isString(obj[ key ])) {
        assert(obj[ key ].length < limit);
      }
    }
  },
  isValidDate: (dateStr) => { // yyyy-mm-dd
    assert(_.isString(dateStr));

    const regEx = /^\d{4}-\d{2}-\d{2}$/;

    if (!dateStr.match(regEx)) {
      return false;
    }

    const date = new Date(dateStr);

    if (!date.getTime() && date.getTime() !== 0) {
      return false;
    }

    return date.toISOString().slice(0, 10) === dateStr;
  }
};
