const HOMEPAGE_PRODUCTS_LIMIT = 40;

const logger = require('../helpers/logger');
const Utils = require('../helpers/indexControllerUtils');

const assert = require('assert');
const { getArrayPages } = require('koa-ctx-paginate');

async function list (ctx, next) {
  let limit = HOMEPAGE_PRODUCTS_LIMIT;
  let offset = (+ctx.query.page > 0)
    ? +ctx.query.page * limit - limit
    : 0;

  assert(!isNaN(offset));

  let productsRows = await ctx.myPool().query(`
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
    isUserLoggedIn: (ctx.session.isUserLoggedIn)
  });
}

async function getId (ctx, next) {
  let id = +ctx.params.id;

  assert(!isNaN(id));

  let productRows = await ctx.myPool().query(`
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
      isUserLoggedIn: (ctx.session.isUserLoggedIn)
    });
  } else {
    return ctx.redirect('/not_found');
  }
}

async function searchProducts (ctx, next) {
  ctx.status = 200;

  let productsQueryArgs = [];
  let tagsQueryArgs = [];

  logger.info('Query string = %o', ctx.query);
  // let queryStrObj = {...ctx.query...};
  // let queryStrObj = assertQueryStr(queryStrObj)
  // Put query string fields in an object then assert object and pass it to processQueryString
  // queryArgs = Utils.processQueryString(queryStrObj)

  const queryArgs = Utils.processQueryStr(ctx.query);

  logger.info('QueryArgs = %o', queryArgs);

  logger.info('ProductsQueryArgs = %o', productsQueryArgs);
  logger.info('TagsQueryArgs = %o', tagsQueryArgs);

  let productsRows = await ctx.myPool().query(`
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

  logger.info('ProductsRows = %o', productsRows);

  assert(productsRows.length >= 0);

  let productsCountRows = await ctx.myPool().query(`
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

  let productsCount = productsCountRows[0].count;

  logger.info(`Products count = ${productsCount}`);

  let tagRows = await ctx.myPool().query(`
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

  // logger.info('TagRows = %o', tagRows);

  assert(tagRows.length >= 0);

  logger.info(`Tags count = ${tagRows.length}`);

  let processedTagRows = Utils.processTagRows(tagRows, queryArgs.vals[0]);

  // logger.info('Tags = %o', processedTagRows);

  const pageCount = Math.ceil(productsCount / +ctx.query.limit);

  ctx.render('index.pug', {
    searchInput: queryArgs.inputStr,
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
  let items = await ctx.myPool().query(`
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
