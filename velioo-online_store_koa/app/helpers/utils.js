const _ = require('lodash/lang');
const assert = require('assert');
const Crypto = require('crypto');

module.exports = {
  escapeSql: (str) => {
    if (_.isNil(str)) return str;

    const escapedStr = str
      .replace(/%/g, '!%')
      .replace(/_/g, '!_')
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"');

    return escapedStr;
  },
  createExprs: (params) => {
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
  rowExists: async (ctx, params) => {
    assert(_.isString(params.table) && _.isString(params.field) && _.isString(params.queryArg));

    const results = await ctx.myPool().query(`
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
  }
};
