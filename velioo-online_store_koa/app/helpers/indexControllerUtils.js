const CONSTANTS = require('../constants/constants');
const Utils = require('./utils');

const assert = require('assert');
const _ = require('lodash/lang');

module.exports = {
  processQueryStr: (queryStrObj) => {
    assert(_.isObject(queryStrObj));
    Utils.assertObjStrLen([ queryStrObj ], CONSTANTS.MAX_SEARCH_FILTER_LEN);

    const inputStr = Utils.escapeSql(queryStrObj.search_input);
    const priceFrom = +queryStrObj.price_from;
    const priceTo = +queryStrObj.price_to;
    const categoryId = +queryStrObj.category;
    const limit = +queryStrObj.limit;
    const offset = +queryStrObj.page * limit - limit;
    const tags = (!_.isNil(queryStrObj.tags) && !Array.isArray(queryStrObj.tags))
      ? [queryStrObj.tags]
      : queryStrObj.tags;

    assert(_.isNil(inputStr) || (typeof inputStr === 'string' && inputStr.length <= CONSTANTS.MAX_SEARCH_INPUT_LEN));
    assert((!_.isNil(tags) && Array.isArray(tags)) || _.isNil(tags));
    assert(!priceFrom || !isNaN(+priceFrom));
    assert(!priceTo || !isNaN(+priceTo));
    assert(!categoryId || (!isNaN(+categoryId) && categoryId > 0));
    assert(!isNaN(limit) && limit >= 0);
    assert(!isNaN(offset) && offset >= 0);

    const searchExpr = (!_.isNil(inputStr) && inputStr.length >= CONSTANTS.MIN_SEARCH_INPUT_LEN)
      ? `LIKE '%${inputStr}%' ESCAPE '!'`
      : true;

    const searchExprs = [
      (searchExpr === true) ? true : `p.name ${searchExpr}`,
      (searchExpr === true) ? true : `p.description ${searchExpr}`
    ];

    const parsedExprsVals = Utils.createExprsVals(new Map([
      ['tags.name IN (?)', tags],
      ['p.price_leva >= ?', priceFrom],
      ['p.price_leva <= ?', priceTo],
      ['c.id = ?', categoryId]
    ]));

    const sortCases = {
      price_asc: 'p.price_leva ASC',
      price_desc: 'p.price_leva DESC',
      newest: 'p.created_at DESC',
      latest_updated: 'p.updated_at DESC'
    };

    const orderByExpr = sortCases[ queryStrObj.sort_products ] || sortCases[ CONSTANTS.DEFAULT_PRODUCTS_SORT_ORDER ];
    assert(orderByExpr);

    return {
      exprs: [
        ...searchExprs,
        ...parsedExprsVals.exprs,
        orderByExpr
      ],
      vals: [
        ...parsedExprsVals.vals
      ],
      limit: limit,
      offset: offset,
      tags: tags
    };
  },
  processTagRows: (tagRows, queryTags) => {
    const processedTagRows = tagRows.reduce((processedTagRows, tagRow) => {
      const newTagRow = {};

      if (!_.isNil(queryTags)) {
        if (queryTags.includes(tagRow.name)) {
          newTagRow.checked = 1;
        }
      }

      const splitedTagRow = tagRow.name.split(':', 2);

      if (splitedTagRow.length > 1) {
        newTagRow.value = splitedTagRow[1].trim();
        newTagRow.count = tagRow.tag_count;
        processedTagRows[splitedTagRow[0]] = newTagRow;
      }

      return processedTagRows;
    }, {});

    return processedTagRows;
  }
};
