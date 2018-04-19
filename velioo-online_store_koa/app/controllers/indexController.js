const logger = require('../helpers/logger');
const mysql = require('../db/mysql');
const utils = require('../helpers/utils');
const {
  HOMEPAGE_PRODUCTS_LIMIT,
  MAX_SEARCH_INPUT_LEN,
  MIN_SEARCH_INPUT_LEN,
  DEFAULT_PRODUCTS_SORT_ORDER
} = require('../constants/constants');

const assert = require('assert');
const _ = require('lodash/lang');
const { getArrayPages } = require('koa-ctx-paginate');

module.exports = {
  getHomepageProducts: async (ctx, next) => {
    const offset = parseInt(ctx.query.page) *
      HOMEPAGE_PRODUCTS_LIMIT - HOMEPAGE_PRODUCTS_LIMIT || 0;

    assert(!isNaN(offset));

    const productsRows = await mysql.pool.query(`
      SELECT
        p.*,
        categories.name as category_name
      FROM products p
      JOIN categories ON categories.id = p.category_id
      ORDER BY created_at DESC
      LIMIT ?
      OFFSET ?
    `, [HOMEPAGE_PRODUCTS_LIMIT, offset]);

    assert(productsRows.length >= 0);

    logger.info(`Offset: ${offset}`);

    ctx.render('index.pug', {
      products: productsRows,
      isUserLoggedIn: ctx.session.isUserLoggedIn
    });
  },
  getProductById: async (ctx, next) => {
    assert(!isNaN(ctx.params.id));

    const productRows = await mysql.pool.query(`
      SELECT products.*
      FROM products
      JOIN categories ON categories.id = products.category_id
      WHERE
        products.id = ?
    `, [ctx.params.id]);

    assert(productRows.length <= 1);

    if (productRows.length !== 1) {
      return ctx.redirect('/not_found');
    }

    ctx.render('product.pug', {
      product: productRows[0],
      isUserLoggedIn: ctx.session.isUserLoggedIn
    });
  },
  searchProducts: async (ctx, next) => {
    logger.info('Query string = %o', ctx.query);

    const queryArgs = processQueryStr(ctx.query);

    logger.info('QueryArgs = %o', queryArgs); // use join with 'AND' on queryArgs.exprs, join inputStr to be 1 expr

    const productsRows = await mysql.pool.query(`
      SELECT p.*, c.name as category_name, c.id as category_id
      FROM products as p
      JOIN categories as c ON c.id = p.category_id
      LEFT JOIN product_tags as pt ON pt.product_id = p.id
      LEFT JOIN tags ON tags.id = pt.tag_id
      WHERE
        ${queryArgs.productsExpr}
      GROUP BY p.id
      ORDER BY ${queryArgs.orderByExpr}
      LIMIT ?
      OFFSET ?
      `, [
      ...queryArgs.vals,
      queryArgs.limit,
      queryArgs.offset
    ]);

    logger.info('ProductsRows[0] = %o', productsRows[0]);

    assert(productsRows.length >= 0);

    const productsCountRows = await mysql.pool.query(`
      SELECT COUNT(1) as count
      FROM
        (
          SELECT p.id
          FROM products as p
          JOIN categories as c ON c.id = p.category_id
          LEFT JOIN product_tags as pt ON pt.product_id = p.id
          LEFT JOIN tags ON tags.id = pt.tag_id
          WHERE
           ${queryArgs.productsExpr}
          GROUP BY p.id
        ) a
      `, [
      ...queryArgs.vals
    ]);

    logger.info('ProductsCountRows = %o', productsCountRows);

    assert(productsCountRows.length >= 0);

    const productsCount = productsCountRows[0].count;

    logger.info(`Products count = ${productsCount}`);

    const tagRows = await mysql.pool.query(`
      SELECT tags.name, COUNT(tags.name) as tag_count
      FROM products as p
      JOIN categories as c ON c.id = p.category_id
      JOIN product_tags as pt ON pt.product_id = p.id
      JOIN tags ON tags.id = pt.tag_id
      WHERE
        ${queryArgs.tagsExpr}
      GROUP BY tags.name
      `, [
      ...queryArgs.vals.slice(1)
    ]);

    logger.info('TagRows[0] = %o', tagRows[0]);

    assert(tagRows.length >= 0);

    logger.info(`Tags count = ${tagRows.length}`);

    const processedTagRows = processTagRows(tagRows, queryArgs.tags);
    const pageCount = Math.ceil(productsCount / queryArgs.limit);

    ctx.render('index.pug', {
      searchInput: ctx.query.search_input,
      price_from: ctx.query.price_from,
      price_to: ctx.query.price_to,
      category: ctx.query.category,
      sort_products: ctx.query.sort_products,
      tags: processedTagRows,
      products: productsRows,
      pageCount: pageCount,
      itemCount: productsCount,
      currentPage: ctx.query.page || 1,
      pages: getArrayPages(ctx)(10, pageCount, ctx.query.page),
      isUserLoggedIn: (ctx.session.isUserLoggedIn)
    });
  },
  getMenuItems: async (ctx) => {
    const items = await mysql.pool.query(`
      SELECT id, name, type as c_type
      FROM categories
    `);

    ctx.body = items;
  },
  frontendLogger: async (ctx, next) => {
    const requestBody = ctx.request.body;

    assert(requestBody.logger);

    if (requestBody.level === 'INFO') {
      logger.info('FRONTEND INFO-------------------------------\n' +
        requestBody.message + '\nURL = ' + requestBody.url +
        '\n-------------------------------------------------------------------------------');
    } else if (requestBody.level === 'ERROR') {
      logger.error('FRONTEND ERROR-------------------------------\n' +
        requestBody.message + '\nURL = ' + requestBody.url +
        '\n-------------------------------------------------------------------------------');
    }
    ctx.status = 200;
  },
  notFound: async (ctx) => {
    ctx.status = 404;
    ctx.render('not_found', { userMessage: 'Resource Not Found' });
  }
};

let processQueryStr = (queryStrObj) => {
  assert(_.isObject(queryStrObj));
  utils.assertObjStrLen([ queryStrObj ], MAX_SEARCH_INPUT_LEN);

  assert(_.isNil(queryStrObj.search_input) || typeof queryStrObj.search_input === 'string');
  assert(!queryStrObj.price_from || !isNaN(queryStrObj.price_from));
  assert(!queryStrObj.price_to || !isNaN(queryStrObj.price_to));
  assert(!queryStrObj.category || parseInt(queryStrObj.category) > 0);
  assert(parseInt(queryStrObj.limit) >= 0);

  const inputStr = utils.escapeSql(queryStrObj.search_input);
  const offset = +queryStrObj.page * queryStrObj.limit - queryStrObj.limit;
  const tags = (!_.isNil(queryStrObj.tags) && !Array.isArray(queryStrObj.tags))
    ? [queryStrObj.tags]
    : queryStrObj.tags;

  assert((!_.isNil(tags) && Array.isArray(tags)) || _.isNil(tags));

  assert(parseInt(offset) >= 0);

  const likeClause = (!_.isNil(inputStr) && inputStr.length >= MIN_SEARCH_INPUT_LEN)
    ? `LIKE '%${inputStr}%' ESCAPE '!'`
    : true;

  logger.info('likeClause = %o', likeClause);

  const searchExprs = [
    (likeClause === true) ? true : `p.name ${likeClause}`,
    (likeClause === true) ? true : `p.description ${likeClause}`
  ];

  const parsedExprsVals = utils.createExprsVals(new Map([
    ['tags.name IN (?)', tags],
    ['p.price_leva >= ?', queryStrObj.price_from],
    ['p.price_leva <= ?', queryStrObj.price_to],
    ['c.id = ?', queryStrObj.category]
  ]));

  const sortCases = {
    price_asc: 'p.price_leva ASC',
    price_desc: 'p.price_leva DESC',
    newest: 'p.created_at DESC',
    latest_updated: 'p.updated_at DESC'
  };

  const orderByExpr = sortCases[ queryStrObj.sort_products ] || sortCases[ DEFAULT_PRODUCTS_SORT_ORDER ];
  assert(orderByExpr);

  return {
    productsExpr: [
      '( ' + searchExprs.join(' OR ') + ' )',
      ...parsedExprsVals.exprs
    ].join(' AND '),
    tagsExpr: [
      ...searchExprs.slice(0, 1),
      ...parsedExprsVals.exprs.slice(1)
    ].join(' AND '),
    orderByExpr: orderByExpr,
    vals: [
      ...parsedExprsVals.vals
    ],
    limit: queryStrObj.limit,
    offset: offset,
    tags: tags
  };
};

let processTagRows = (tagRows, queryTags) => {
  const processedTagRows = tagRows.reduce((processedTagRows, tagRow) => {
    const newTagRow = {};

    if (!_.isNil(queryTags)) { // simplify
      if (queryTags.includes(tagRow.name)) {
        newTagRow.checked = 1;
      }
    }

    const [key, value] = tagRow.name.split(':', 2);

    if (value !== undefined) {
      newTagRow.value = value.trim();
      newTagRow.count = tagRow.tag_count;
      processedTagRows[ key ] = newTagRow;
    }

    return processedTagRows;
  }, {});

  return processedTagRows;
};
