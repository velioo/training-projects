const DEFAULT_PRODUCT_ORDER = 'newest';
const MAX_INPUT_STRING_LEN = 100;

const Utils = require('../helpers/utils');

const assert = require('assert');
const lodashLang = require('lodash/lang');

module.exports = {
  processQueryStr: (queryStr) => {
    let inputStr = queryStr.search_input;

    assert((!inputStr && lodashLang.isNil(inputStr)) || inputStr.length < MAX_INPUT_STRING_LEN);

    if (inputStr) {
      inputStr = Utils.escapeSql(inputStr);
    }

    const searchExpr = (inputStr)
      ? `LIKE '%${inputStr}%' ESCAPE '!'`
      : true;

    const searchExprs = [
      (searchExpr === true) ? true : `p.name ${searchExpr}`,
      (searchExpr === true) ? true : `p.description ${searchExpr}`
    ];

    let tags = queryStr.tags;

    if (!lodashLang.isNil(tags) && !Array.isArray(tags)) {
      tags = [tags];
    }

    assert((!lodashLang.isNil(tags) && Array.isArray(tags)) || lodashLang.isNil(tags));
    assert(!queryStr.price_from || !isNaN(+queryStr.price_from));
    assert(!queryStr.price_to || !isNaN(+queryStr.price_to));
    assert(!queryStr.category || !isNaN(+queryStr.category));

    let parsedExprs = Utils.createExprs(new Map([
      ['tags.name IN (?)', tags],
      ['p.price_leva >= ?', queryStr.price_from],
      ['p.price_leva <= ?', queryStr.price_to],
      ['c.id = ?', queryStr.category]
    ]));

    const sortCases = {
      price_asc: 'p.price_leva ASC',
      price_desc: 'p.price_leva DESC',
      newest: 'p.created_at DESC',
      latest_updated: 'p.updated_at DESC'
    };

    const orderByExpr = sortCases[ queryStr.sort_products ] || sortCases[ DEFAULT_PRODUCT_ORDER ];
    assert(orderByExpr);

    let limit = +queryStr.limit;

    assert(!isNaN(limit));

    let offset = (+queryStr.page > 0)
      ? +queryStr.page * limit - limit
      : 0;

    assert(!isNaN(offset));

    return {
      exprs: [
        ...searchExprs,
        ...parsedExprs.exprs,
        orderByExpr
      ],
      vals: [
        ...parsedExprs.vals
      ],
      limit: limit,
      offset: offset,
      inputStr: inputStr
    };
  },
  processTagRows: (tagRows, queryTags) => {
    let processedTagRows = {};

    if (tagRows.length > 0) {
      // do with Array.reduce
      tagRows.forEach(function (tagRow) {
        let newTagRow = {};

        if (queryTags && Array.isArray(queryTags)) {
          if (queryTags.includes(tagRow.name)) {
            newTagRow.checked = 1;
          }
        }

        let splitedTagRow = tagRow.name.split(':', 2);

        if (splitedTagRow.length > 1) {
          newTagRow.value = splitedTagRow[1].trim();
          newTagRow.count = tagRow.tag_count;
          processedTagRows[splitedTagRow[0]] = newTagRow;
        }
      });
    }

    return processedTagRows;
  }
};
