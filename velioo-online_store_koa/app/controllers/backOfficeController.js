//const ROOT = require('../constants/constants').ROOT;
const logger = require('../helpers/logger');

const assert = require('assert');
const sha256 = require('js-sha256').sha256;
const escape = require('escape-html');

async function renderEmployeeLogin(ctx, next) {
    ctx.status = 200;

    await next();

    ctx.render('employee_login.pug', {
        user: {}
    });
}

async function employeeLogin(ctx, next) {

    let message;
    let userData = await ctx.myPool().query(`
        SELECT password, salt, id
        FROM employees
        WHERE
            username = ?
        `, [ctx.request.body.username]);

    if (userData instanceof Array && userData.length === 1 && (sha256(ctx.request.body.password + userData[0].salt) === userData[0].password)) {
        
        ctx.session.employeeData = { employeeId: userData[0].id };

        return ctx.redirect('/employee/dashboard');
    } else {
        error = "Wrong username or password.";
    }

    ctx.render('employee_login.pug', {
        error: error,
        user: {}
    });
}

async function renderDashboard(ctx, next) {

    await next();

    ctx.render('dashboard.pug', {
        logged: true,
        user: {}
    });
}

async function employeeLogOut(ctx, next) {

    await next();

    if (ctx.session.employeeData) {
        ctx.session.employeeData = null;
        ctx.redirect('/products');
    }

}

async function getProducts(ctx, next) {

    logger.info('Query params = %o', ctx.query);

    let sortColumns = {};
    let filterColumns = {};

    Object.keys(ctx.query).forEach(function (key) {
        if (key.startsWith('col[')) {
            if (typeof (+key.charAt(4)) === 'number') {
                sortColumns[+key.charAt(4)] = ctx.query[key];
            }
        }
        if (key.startsWith('fcol[')) {
            if (typeof (+key.charAt(5)) === 'number') {
                filterColumns[+key.charAt(5)] = ctx.query[key];
            }
        }
    });

    logger.info('sortColumns = %o', sortColumns);
    logger.info('filterColumns = %o', filterColumns);

    const filterCases = {
        '0': "products.created_at LIKE '%",
        '1': "products.updated_at LIKE '%",
        '2': "products.name LIKE '%",
        '3': "categories.name LIKE '%",
        '4': "products.price_leva LIKE '%",
        '5': "products.quantity LIKE '%",
        '6': "",
        '7': ""
    };

    let filterExprs = [true, true, true, true, true, true, true, true];

    if (Object.keys(filterColumns).length !== 0 && filterColumns.constructor === Object) {
        Object.keys(filterColumns).forEach(function (key) {
            let filterInput = filterColumns[key].replace(/%/g, "!%").replace(/_/g, "!_").replace(/'/g, "\\'").replace(/"/g, '\\"');

            assert(key in filterCases === true);

            filterExprs[key] = (filterCases[key])
                ? filterCases[key] + filterInput + "%' ESCAPE '!'"
                : true;
        });
    }

    logger.info('FilterExprs = %o', filterExprs);

    let productsQueryArgs = [];

    let dateCreatedAtFromExpr = (ctx.query.date_c_from)
        ? 'DATE(products.created_at) >= ?'
        : '?';
    productsQueryArgs.push(ctx.query.date_c_from || true);

    logger.info('DateCreatedAtFromExpr = ' + dateCreatedAtFromExpr);

    let dateCreatedAtToExpr = (ctx.query.date_c_to)
        ? 'DATE(products.created_at) <= ?'
        : '?';
    productsQueryArgs.push(ctx.query.date_c_to || true);

    logger.info('DateCreatedAtToExpr = ' + dateCreatedAtToExpr);

    let dateUpdatedAtFromExpr = (ctx.query.date_m_from)
        ? 'DATE(products.updated_at) >= ?'
        : '?';
    productsQueryArgs.push(ctx.query.date_m_from || true);

    logger.info('DateUpdatedAtFromExpr = ' + dateUpdatedAtFromExpr);

    let dateUpdatedAtToExpr = (ctx.query.date_m_to)
        ? 'DATE(products.updated_at) <= ?'
        : '?';
    productsQueryArgs.push(ctx.query.date_m_to || true);

    logger.info('DateUpdatedAtToExpr = ' + dateUpdatedAtToExpr);

    let priceFromExpr = (ctx.query.price_from)
        ? 'products.price_leva >= ?'
        : '?';
    productsQueryArgs.push(ctx.query.price_from || true);

    logger.info('PriceFromExpr = ' + priceFromExpr);

    let priceToExpr = (ctx.query.price_to)
        ? 'products.price_leva <= ?'
        : '?';
    productsQueryArgs.push(ctx.query.price_to || true);

    logger.info('PriceToExpr = ' + priceToExpr);

    const sortCases = {
        '0': 'products.created_at ',
        '1': 'products.updated_at ',
        '2': 'products.name ',
        '3': 'categories.name ',
        '4': 'products.price_leva ',
        '5': 'products.quantity ',
        '6': '',
        '7': ''
    };

    //let sortExprs = [true, true, true, true, true, true, true, true];
    let sortExpr = '';
    let orderByClause = '';

    if (Object.keys(sortColumns).length !== 0 && sortColumns.constructor === Object) {
        Object.keys(sortColumns).forEach(function (key) {
            let sortInput = sortColumns[key];

            assert(key in sortCases === true);

            sortExpr += (sortCases[key])
                ? sortCases[key] + ((sortInput === '1')
                    ? 'DESC, '
                    : 'ASC, '
                    )
                : '';
        });
    }

    if (sortExpr) {
        orderByClause = 'ORDER BY';
        sortExpr = sortExpr.slice(0, sortExpr.lastIndexOf(','));
    }

    logger.info('sortExpr = ' + sortExpr);

    let limit = +ctx.query.size || 30;

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
        SELECT products.*, categories.name as category
        FROM products
        JOIN categories ON categories.id = products.category_id
        WHERE
            ${filterExprs[0]}
            AND ${filterExprs[1]}
            AND ${filterExprs[2]}
            AND ${filterExprs[3]}
            AND ${filterExprs[4]}
            AND ${filterExprs[5]}
            AND ${filterExprs[6]}
            AND ${filterExprs[7]}
            AND ${dateCreatedAtFromExpr}
            AND ${dateCreatedAtToExpr}
            AND ${dateUpdatedAtFromExpr}
            AND ${dateUpdatedAtToExpr}
            AND ${priceFromExpr}
            AND ${priceToExpr}
        ${orderByClause}
            ${sortExpr}
        LIMIT ?
        OFFSET ?
        `;

    let productsCountQuery = `
        SELECT COUNT(1) as count
        FROM products
        JOIN categories ON categories.id = products.category_id
        WHERE
            ${filterExprs[0]}
            AND ${filterExprs[1]}
            AND ${filterExprs[2]}
            AND ${filterExprs[3]}
            AND ${filterExprs[4]}
            AND ${filterExprs[5]}
            AND ${filterExprs[6]}
            AND ${filterExprs[7]}
            AND ${dateCreatedAtFromExpr}
            AND ${dateCreatedAtToExpr}
            AND ${dateUpdatedAtFromExpr}
            AND ${dateUpdatedAtToExpr}
            AND ${priceFromExpr}
            AND ${priceToExpr}
    `;

    logger.info('ProductsQuery = ' + productsQuery);
    logger.info('ProductsQueryArgs = %o', productsQueryArgs);

    let productsRows = await ctx.myPool().query(productsQuery, productsQueryArgs);

    assert(productsRows.length >= 0);

    //logger.info("ProductsRows = %o", productsRows);

    productsQueryArgs.pop();
    productsQueryArgs.pop();

    let productsCountRows = await ctx.myPool().query(productsCountQuery, productsQueryArgs);

    //logger.info("ProductsCountRows = %o", productsCountRows);

    assert(productsCountRows.length >= 0);

    let productsCount = productsCountRows.shift().count;

    let result = { total_rows: productsCount };

    let productArray = [];
    let productsArray = [];

    if (productsCount > 0) {
        productsRows.forEach(function (productRow) {
            productArray.push(escape(productRow.created_at));
            productArray.push(escape(productRow.updated_at));
            productArray.push('<a href="../products/' + escape(productRow.id) + '">' + escape(productRow.name) + '</a>');
            productArray.push(escape(productRow.category));
            productArray.push(escape(productRow.price_leva));
            productArray.push(escape(productRow.quantity));
            productArray.push('<a href="../employee/update_product/' + escape(productRow.id) + '" class="product_details">Редактирай</a>');
            productArray.push('<a href="#" data-id="' + escape(productRow.id) + '" class="delete_record">Изтрий</a>');
            productsArray.push(productArray);
            productArray = [];
        });
    }

    result.rows = productsArray;

    //logger.info('Result = %o', result);

    ctx.body = result;
}

module.exports = { renderEmployeeLogin, employeeLogin, renderDashboard, employeeLogOut, getProducts };
