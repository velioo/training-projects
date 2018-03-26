const DEFAULT_PRODUCT_ORDER = 'newest';
const HOMEPAGE_PRODUCTS_LIMIT = 40;

const logger = require('../helpers/logger');

const assert = require('assert');
const { getArrayPages } = require('koa-ctx-paginate');

async function list(ctx, next) {
    logger.info('In list()');

    let limit = HOMEPAGE_PRODUCTS_LIMIT;
    let offset = (ctx.query.page) // simplify
        ? (+ctx.query.page > 0)
            ? +ctx.query.page * limit - limit
            : 0
        : 0;

    assert(!isNaN(offset));

    let query = await ctx.myPool().query(`
        SELECT products.*
        FROM products
        JOIN categories ON categories.id = products.category_id
        ORDER BY created_at DESC
        LIMIT ?
        OFFSET ?
        `, [limit, offset]);

    //logger.info("Offset: " + offset);

    ctx.render('index.pug', {
        products: query,
        logged: (ctx.session && ctx.session.userData && ctx.session.userData.userId) //ctx.session.isUserLoggedIn (example)
    });
}

async function getId(ctx, next) {
    //logger.info('In getId()');

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
            product: productRows.shift(),
            logged: (ctx.session && ctx.session.userData && ctx.session.userData.userId)
        });
    } else {
        return ctx.redirect('/not_found');
    }
}

async function searchByName(ctx, next) {
    ctx.status = 200;

    logger.info('Query string = %o', ctx.query);
    //can assert length of string
    if (ctx.query.search_input) { // move in variable
        ctx.query.search_input = ctx.query.search_input // move in function
            .replace(/%/g, '!%')
            .replace(/_/g, '!_')
            .replace(/'/g, "\\'")
            .replace(/"/g, '\\"');
    }

    let searchInputExpr1 = (ctx.query.search_input)// use const where you can
        ? `products.name LIKE '%${ctx.query.search_input}%' ESCAPE '!'`
        : true;

    let searchInputExpr2 = (ctx.query.search_input)
        ? "products.description LIKE '%" + ctx.query.search_input + "%' ESCAPE '!'"
        : true;

    logger.info("SearchInputExpr1 = " + searchInputExpr1);

    let productsQueryArgs = [];
    let tagsQueryArgs = [];

    if (ctx.query.tags && !Array.isArray(ctx.query.tags)) {
        ctx.query.tags = [ctx.query.tags];
    }

    assert(!ctx.query.tags || Array.isArray(ctx.query.tags));

    let tagsExpr = (ctx.query.tags)
        ? 'tags.name IN (?)'
        : '?';
    productsQueryArgs.push(ctx.query.tags || true);

    logger.info("Tags = %o", ctx.query.tags);

    assert(!ctx.query.price_from || !isNaN(+ctx.query.price_from));

    let priceFromExpr = (ctx.query.price_from)
        ? 'products.price_leva >= ?'
        : '?';
    let priceFromArgsExpr = +ctx.query.price_from || true;

    productsQueryArgs.push(priceFromArgsExpr);
    tagsQueryArgs.push(priceFromArgsExpr);

    logger.info("PriceFromExpr = ", priceFromExpr);
    logger.info("PriceFromArgsExpr = ", priceFromArgsExpr);

    assert(!ctx.query.price_to || !isNaN(+ctx.query.price_to));

    let priceToExpr = (ctx.query.price_to)
        ? 'products.price_leva <= ?'
        : '?';
    let priceToArgsExpr = +ctx.query.price_to || true;

    productsQueryArgs.push(priceToArgsExpr);
    tagsQueryArgs.push(priceToArgsExpr);

    logger.info("PriceToExpr = ", priceToExpr);

    assert(!ctx.query.category || !isNaN(+ctx.query.category));

    let categoryExpr = (ctx.query.category)
        ? 'categories.id = ?'
        : '?';
    productsQueryArgs.push(ctx.query.category || true);
    tagsQueryArgs.push(ctx.query.category || true);

    logger.info("CategoryExpr = ", categoryExpr);

    const sortCases = {
        price_asc: 'products.price_leva ASC',
        price_desc: 'products.price_leva DESC',
        newest: 'products.created_at DESC',
        latest_updated: 'products.updated_at DESC'
    };

    const orderByExpr = sortCases[ ctx.query.sort_products ] || sortCases[ DEFAULT_PRODUCT_ORDER ];
    //assert((!ctx.query.sort_products && sortCases[DEFAULT_PRODUCT_ORDER]) || sortCases[ctx.query.sort_products]);
    assert(orderByExpr);

    // let orderByExpr = (ctx.query.sort_products)
    //     ? sortCases[ctx.query.sort_products]
    //     : sortCases[DEFAULT_PRODUCT_ORDER];

    logger.info('Sort products by = ' + ctx.query.sort_products);

    let limit = +ctx.query.limit;

    assert(!isNaN(limit));

    productsQueryArgs.push(limit);

    logger.info("Limit = " + limit);

    let offset = (ctx.query.page)
        ? (+ctx.query.page > 0)
            ? +ctx.query.page * limit - limit
            : 0
        : 0;

    assert(!isNaN(offset));

    productsQueryArgs.push(offset);

    logger.info("Offset = " + offset);

    let productsQuery = `
        SELECT p.*, c.name as category, c.id as category_id
        FROM products as p
        JOIN categories as c ON c.id = p.category_id
        LEFT JOIN product_tags as pt ON pt.product_id = p.id
        LEFT JOIN tags ON tags.id = pt.tag_id
        WHERE
            (${searchInputExpr1} OR ${searchInputExpr2})
            AND ${tagsExpr}
            AND ${priceFromExpr}
            AND ${priceToExpr}
            AND ${categoryExpr}
        GROUP BY p.id
        ORDER BY ${orderByExpr}
        LIMIT ?
        OFFSET ?
        `;
 // as above
    let productsCountQuery = `
        SELECT COUNT(1) as count
        FROM
            (
                SELECT products.id
                FROM products
                JOIN categories ON categories.id=products.category_id
                LEFT JOIN product_tags ON product_tags.product_id=products.id
                LEFT JOIN tags ON tags.id=product_tags.tag_id
                WHERE
                    (${searchInputExpr1} OR ${searchInputExpr2})
                    AND ${tagsExpr}
                    AND ${priceFromExpr}
                    AND ${priceToExpr}
                    AND ${categoryExpr}
                GROUP BY products.id
            ) a
        `;

    let tagsQuery = `
        SELECT tags.name, COUNT(tags.name) as tag_count
        FROM products
        JOIN categories ON categories.id=products.category_id
        JOIN product_tags ON product_tags.product_id=products.id
        JOIN tags ON tags.id=product_tags.tag_id
        WHERE
            ${searchInputExpr1}
            AND ${priceFromExpr}
            AND ${priceToExpr}
            AND ${categoryExpr}
        GROUP BY tags.name
        `;

    let productsRows = await ctx.myPool().query(productsQuery, [
        ...productsQueryArgs,  // remove offset and limit from queryArgs
        offset,
        limit
    ]); // inline sql

    assert(productsRows.length >= 0);

    /*productsQueryArgs.pop();
    productsQueryArgs.pop();*/

    //logger.info('Query = '' + productsQuery);
    //logger.info('ProductsRows = %o', productsRows);
    //logger.info('ProductsCountQuery = ' + productsCountQuery);

    let productsCountRows = await ctx.myPool().query(productsCountQuery, productsQueryArgs);

    logger.info('ProductsCountRows = %o', productsCountRows);

    assert(productsCountRows.length >= 0);

    let productsCount = productsCountRows[0].count;

    //logger.info('Products count = ' + productsCount);
    //logger.info('ProductsCountRows = %o' + productsCountRows);

    let tagRows = await ctx.myPool().query(tagsQuery, tagsQueryArgs);

    assert(tagRows.length >= 0);

    //logger.info('TagRows = %o', tagRows);
    //logger.info('TagsQuery = ' + tagsQuery);
    //logger.info('Tags count = ' + tagRows.length);

    let processedTagRows = {};

    if (tagRows.length > 0) {
        // do with Array.reduce
        tagRows.forEach(function (tagRow) {
            //logger.info('TagRow = %o', tagRow);

            let newTagRow = {};

            if (ctx.query.tags && Array.isArray(ctx.query.tags)) {
                if (ctx.query.tags.includes(tagRow.name)) {
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

    //logger.info('Tags = %o', processedTagRows);

    const pageCount = Math.ceil(productsCount / +ctx.query.limit);

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
        logged: (ctx.session && ctx.session.userData && ctx.session.userData.userId)
    });
}

async function getMenuItems(ctx) {
    let items = await ctx.myPool().query(`
        SELECT id, name, type as c_type
        FROM categories
        `);

    ////logger.info('Items = %o', items);

    ctx.body = items;
}

async function notFound(ctx) {
    //logger.info('In not_found()');

    ctx.status = 404;
    ctx.render('not_found', { message: 'Resource Not Found' });
}

module.exports = { list, getId, searchByName, getMenuItems, notFound };
