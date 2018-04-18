const CONSTANTS = require('../constants/constants');
const logger = require('../helpers/logger');
const mysql = require('../db/mysql');
const Utils = require('../helpers/indexControllerUtils');

// include constants like routes index.js

const assert = require('assert');
const { getArrayPages } = require('koa-ctx-paginate');

module.exports = {
  getHomepageProducts: async (ctx, next) => {
    const offset = parseInt(ctx.query.page) * CONSTANTS.HOMEPAGE_PRODUCTS_LIMIT - CONSTANTS.HOMEPAGE_PRODUCTS_LIMIT || 0;

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
    `, [CONSTANTS.HOMEPAGE_PRODUCTS_LIMIT, offset]);

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
    ctx.status = 200;

    logger.info('Query string = %o', ctx.query);

    const queryArgs = Utils.processQueryStr(ctx.query);

    logger.info('QueryArgs = %o', queryArgs); // use join with 'AND' on queryArgs.exprs, join inputStr to be 1 expr

    const productsRows = await mysql.pool.query(`
      SELECT p.*, c.name as category_name, c.id as category_id
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
      ORDER BY ${queryArgs.exprs[6]}
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
        ${queryArgs.exprs[0]}
        AND ${queryArgs.exprs[3]}
        AND ${queryArgs.exprs[4]}
        AND ${queryArgs.exprs[5]}
      GROUP BY tags.name
      `, [
      ...queryArgs.vals.slice(1)
    ]);

    logger.info('TagRows[0] = %o', tagRows[0]);

    assert(tagRows.length >= 0);

    logger.info(`Tags count = ${tagRows.length}`);

    const processedTagRows = Utils.processTagRows(tagRows, queryArgs.tags);
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
