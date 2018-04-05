const CONSTANTS = require('../constants/constants');
const Utils = require('../helpers/utils');
const mysql = require('../db/mysql');

const assert = require('assert');
const _ = require('lodash/lang');

module.exports = {
  processQueryStr: (queryStrObj) => {
    assert(_.isObject(queryStrObj));

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

    const parsedExprs = Utils.createExprsVals(new Map([
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
        ...parsedExprs.exprs,
        orderByExpr
      ],
      vals: [
        ...parsedExprs.vals
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
  },
  executeHomepageQuery: async (queryArgs) => {
    assert(_.isArray(queryArgs));

    return mysql.pool.query(`
      SELECT products.*
      FROM products
      JOIN categories ON categories.id = products.category_id
      ORDER BY created_at DESC
      LIMIT ?
      OFFSET ?
    `, queryArgs);
  },
  executeProductIdQuery: async (queryArgs) => {
    assert(_.isArray(queryArgs));

    return mysql.pool.query(`
      SELECT products.*
      FROM products
      JOIN categories ON categories.id = products.category_id
      WHERE
        products.id = ?
    `, queryArgs);
  },
  executeProductsQuery: async (queryArgs) => {
    assert(_.isObject(queryArgs));
    assert(_.isArray(queryArgs.exprs));
    assert(_.isArray(queryArgs.vals));

    return mysql.pool.query(`
      SELECT p.*, c.name as category, c.id as category_id
      FROM products as p
      JOIN categories as c ON c.id = p.category_id
      LEFT JOIN product_tags as pt ON pt.product_id = p.id
      LEFT JOIN tags ON tags.id = pt.tag_id
      WHERE
        (${queryArgs.exprs[0]} OR ${queryArgs.exprs[1]})
        AND ${queryArgs.exprs[2]}
        AND ${queryArgs.exprs[3]}
        AND ${queryArgs.exprs[4]}
        AND ${queryArgs.exprs[5]}
      GROUP BY p.id
      ORDER BY ${queryArgs.exprs[6]} LIMIT ?
      OFFSET ?
      `, [
      ...queryArgs.vals,
      queryArgs.limit,
      queryArgs.offset
    ]);
  },
  executeProductsCountQuery: async (queryArgs) => {
    assert(_.isObject(queryArgs));
    assert(_.isArray(queryArgs.exprs));
    assert(_.isArray(queryArgs.vals));

    return mysql.pool.query(`
      SELECT COUNT(1) as count
      FROM
        (
          SELECT p.id
          FROM products as p
          JOIN categories as c ON c.id = p.category_id
          LEFT JOIN product_tags as pt ON pt.product_id = p.id
          LEFT JOIN tags ON tags.id = pt.tag_id
          WHERE
            (${queryArgs.exprs[0]} OR ${queryArgs.exprs[1]})
            AND ${queryArgs.exprs[2]}
            AND ${queryArgs.exprs[3]}
            AND ${queryArgs.exprs[4]}
            AND ${queryArgs.exprs[5]}
          GROUP BY p.id
        ) a
      `, [
      ...queryArgs.vals
    ]);
  },
  executeTagsQuery: async (queryArgs) => {
    assert(_.isObject(queryArgs));
    assert(_.isArray(queryArgs.exprs));
    assert(_.isArray(queryArgs.vals));

    return mysql.pool.query(`
      SELECT tags.name, COUNT(tags.name) as tag_count
      FROM products as p
      JOIN categories as c ON c.id = p.category_id
      JOIN product_tags as pt ON pt.product_id = p.id
      JOIN tags ON tags.id = pt.tag_id
      WHERE
        ${queryArgs.exprs[0]}
        AND ${queryArgs.exprs[3]}
        AND ${queryArgs.exprs[4]}
        AND ${queryArgs.exprs[5]}
      GROUP BY tags.name
      `, [
      ...queryArgs.vals.slice(1)
    ]);
  },
  executeMenuItemsQuery: async () => {
    return mysql.pool.query(`
      SELECT id, name, type as c_type
      FROM categories
    `);
  }
};
