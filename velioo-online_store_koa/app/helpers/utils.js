const _ = require('lodash/lang');

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
  }
};
