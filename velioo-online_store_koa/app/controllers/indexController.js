const HOMEPAGE_PRODUCTS_LIMIT = 40;

const logger = require('../helpers/logger');
const Utils = require('../helpers/indexControllerUtils');

const assert = require('assert');
const { getArrayPages } = require('koa-ctx-paginate');

async function list (ctx, next) {
  const limit = HOMEPAGE_PRODUCTS_LIMIT;
  const offset = (+ctx.query.page > 0)
    ? +ctx.query.page * limit - limit
    : 0;

  assert(!isNaN(offset));

  const productsRows = await ctx.myPool().query(`
    SELECT products.*
    FROM products
    JOIN categories ON categories.id = products.category_id
    ORDER BY created_at DESC
    LIMIT ?
    OFFSET ?
    `, [limit, offset]);

  assert(productsRows.length >= 0);

  logger.info(`Offset: ${offset}`);

  ctx.render('index.pug', {
    products: productsRows,
    isUserLoggedIn: ctx.session.isUserLoggedIn
  });
}

async function getId (ctx, next) {
  const id = +ctx.params.id;

  assert(!isNaN(id));

  const productRows = await ctx.myPool().query(`
    SELECT products.*
    FROM products
    JOIN categories ON categories.id = products.category_id
    WHERE
      products.id = ?
    `, [id]);

  assert(productRows.length <= 1);

  if (productRows.length === 1) {
    ctx.render('product.pug', {
      product: productRows[0],
      isUserLoggedIn: ctx.session.isUserLoggedIn
    });
  } else {
    return ctx.redirect('/not_found');
  }
}

async function searchProducts (ctx, next) {
  ctx.status = 200;

  logger.info('Query string = %o', ctx.query);

  const queryArgs = Utils.processQueryStr(ctx.query);

  logger.info('QueryArgs = %o', queryArgs);

  const productsRows = await Utils.executeProductsQuery(ctx, queryArgs);

  logger.info('ProductsRows[0] = %o', productsRows[0]);

  assert(productsRows.length >= 0);

  const productsCountRows = await Utils.executeProductsCountQuery(ctx, queryArgs);

  logger.info('ProductsCountRows = %o', productsCountRows);

  assert(productsCountRows.length >= 0);

  const productsCount = productsCountRows[0].count;

  logger.info(`Products count = ${productsCount}`);

  const tagRows = await Utils.executeTagsQuery(ctx, queryArgs);

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
}

async function getMenuItems (ctx) {
  const items = await ctx.myPool().query(`
    SELECT id, name, type as c_type
    FROM categories
    `);

  ctx.body = items;
}

async function notFound (ctx) {
  ctx.status = 404;
  ctx.render('not_found', { message: 'Resource Not Found' });
}

module.exports = { list, getId, searchProducts, getMenuItems, notFound };
