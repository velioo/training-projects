//const ROOT = require('../constants/constants').ROOT;
const logger = require('../helpers/logger');
const ORDER_STATUSES_QUERY_LIMIT = 10000;

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

async function renderOrders(ctx, next) {

    await next();

    ctx.render('backoffice_orders.pug', {
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
        '5': "products.quantity = ",
        '6': "",
        '7': ""
    };

    let filterExprs = [true, true, true, true, true, true, true, true];

    if (Object.keys(filterColumns).length !== 0 && filterColumns.constructor === Object) {
        Object.keys(filterColumns).forEach(function (key) {
            let filterInput = filterColumns[key].replace(/%/g, "!%").replace(/_/g, "!_").replace(/'/g, "\\'").replace(/"/g, '\\"');

            assert(key in filterCases === true);

            filterExprs[key] = (filterCases[key])
                ? filterCases[key] + filterInput + ((filterCases[key].indexOf('=') === -1)
                    ? "%' ESCAPE '!'"
                    : ""
                    )
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
            productArray.push(`<a href="../products/${escape(productRow.id)}">${escape(productRow.name)}</a>`);
            productArray.push(escape(productRow.category));
            productArray.push(escape(productRow.price_leva));
            productArray.push(escape(productRow.quantity));
            productArray.push(`<a href="../employee/update_product/${escape(productRow.id)}" class="product_details">Редактирай</a>`);
            productArray.push(`<a href="#" data-id="${escape(productRow.id)}" class="delete_record">Изтрий</a>`);
            productsArray.push(productArray);
            productArray = [];
        });
    }

    result.rows = productsArray;

    //logger.info('Result = %o', result);

    ctx.body = result;
}

async function getOrders(ctx, next) {
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
        '0': "orders.created_at LIKE '%",
        '1': "orders.updated_at LIKE '%",
        '2': "orders.id =",
        '3': "users.email LIKE '%",
        '4': "orders.amount_leva =",
        '5': "statuses.name LIKE '%"
    };

    let filterExprs = [true, true, true, true, true, true, true];

    if (Object.keys(filterColumns).length !== 0 && filterColumns.constructor === Object) {
        Object.keys(filterColumns).forEach(function (key) {
            let filterInput = filterColumns[key].replace(/%/g, "!%").replace(/_/g, "!_").replace(/'/g, "\\'").replace(/"/g, '\\"');

            assert(key in filterCases === true);

            filterExprs[key] = (filterCases[key])
                ? filterCases[key] + filterInput + ((filterCases[key].indexOf('=') === -1)
                    ? "%' ESCAPE '!'"
                    : ""
                    )
                : true;
        });
    }

    logger.info('FilterExprs = %o', filterExprs);

    let ordersQueryArgs = [];

    let dateCreatedAtFromExpr = (ctx.query.date_c_from)
        ? 'DATE(orders.created_at) >= ?'
        : '?';
    ordersQueryArgs.push(ctx.query.date_c_from || true);

    logger.info('DateCreatedAtFromExpr = ' + dateCreatedAtFromExpr);

    let dateCreatedAtToExpr = (ctx.query.date_c_to)
        ? 'DATE(orders.created_at) <= ?'
        : '?';
    ordersQueryArgs.push(ctx.query.date_c_to || true);

    logger.info('DateCreatedAtToExpr = ' + dateCreatedAtToExpr);

    let dateUpdatedAtFromExpr = (ctx.query.date_m_from)
        ? 'DATE(orders.updated_at) >= ?'
        : '?';
    ordersQueryArgs.push(ctx.query.date_m_from || true);

    logger.info('DateUpdatedAtFromExpr = ' + dateUpdatedAtFromExpr);

    let dateUpdatedAtToExpr = (ctx.query.date_m_to)
        ? 'DATE(orders.updated_at) <= ?'
        : '?';
    ordersQueryArgs.push(ctx.query.date_m_to || true);

    logger.info('DateUpdatedAtToExpr = ' + dateUpdatedAtToExpr);

    let priceFromExpr = (ctx.query.price_from)
        ? 'orders.amount_leva >= ?'
        : '?';
    ordersQueryArgs.push(ctx.query.price_from || true);

    logger.info('PriceFromExpr = ' + priceFromExpr);

    let priceToExpr = (ctx.query.price_to)
        ? 'orders.amount_leva <= ?'
        : '?';
    ordersQueryArgs.push(ctx.query.price_to || true);

    logger.info('PriceToExpr = ' + priceToExpr);

    const sortCases = {
        '0': 'orders.created_at ',
        '1': 'orders.updated_at ',
        '2': 'orders.id ',
        '3': 'users.email ',
        '4': 'orders.amount_leva ',
        '5': 'statuses.name ',
        '6': ''
    };

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

    ordersQueryArgs.push(limit);

    logger.info("Limit = " + limit);

    let offset = (ctx.query.page)
        ? (+ctx.query.page > 0)
            ? +ctx.query.page * limit - limit
            : 0
        : 0;

    assert(!isNaN(offset));

    ordersQueryArgs.push(offset);

    logger.info("Offset = " + offset);

    let ordersQuery = `
        SELECT
            orders.id as order_id,
            orders.created_at as order_created_at,
            orders.updated_at as order_updated_at,
            orders.amount_leva,
            statuses.name as status_name,
            statuses.id as status_id,
            users.email as user_email
        FROM orders
        JOIN statuses ON statuses.id = orders.status_id
        JOIN users ON users.id = orders.user_id
        WHERE
            ${filterExprs[0]}
            AND ${filterExprs[1]}
            AND ${filterExprs[2]}
            AND ${filterExprs[3]}
            AND ${filterExprs[4]}
            AND ${filterExprs[5]}
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

    let statusesQuery = `
            SELECT *
            FROM statuses
            ORDER BY statuses.name ASC
        `;

    logger.info('ordersQuery = ' + ordersQuery);
    logger.info('ordersQueryArgs = %o', ordersQueryArgs);

    let ordersRows = await ctx.myPool().query(ordersQuery, ordersQueryArgs);

    assert(ordersRows.length >= 0);

    logger.info("ordersRows = %o", ordersRows);

    let statusesRows = await ctx.myPool().query(statusesQuery);

    assert(statusesRows.length >= 0);

    logger.info("statusesRows = %o", statusesRows);

    let orderArray = [];
    let ordersArray = [];

    if (ordersRows.length > 0) {
        ordersRows.forEach(function (orderRow) {
            orderArray.push(escape(orderRow.order_created_at));
            orderArray.push(escape(orderRow.order_updated_at));
            orderArray.push(escape(orderRow.order_id));
            orderArray.push(escape(orderRow.user_email));
            orderArray.push(escape(orderRow.amount_leva));

            let selectElement = '<select class="select_status">';

            statusesRows.forEach(function (statusRow) {
                selectElement += `<option value="${escape(statusRow.id)}"`;

                selectElement += (orderRow.status_id === statusRow.id)
                    ? 'selected>'
                    : '>';

                selectElement += escape(statusRow.name) + '</option>';
            });

            selectElement += '</select>';
            orderArray.push(selectElement);
            orderArray.push(`<a href="../employee/orders/${escape(orderRow.id)}" class="order_details">Детайли</a>`);
            ordersArray.push(orderArray);
            orderArray = [];
        });
    }

    let result = { rows: ordersArray };

    let orderStatusesQueryArgs = ordersQueryArgs;
    offset = 0;

    orderStatusesQueryArgs[orderStatusesQueryArgs.length - 2] = ORDER_STATUSES_QUERY_LIMIT;
    orderStatusesQueryArgs[orderStatusesQueryArgs.length - 1] = offset;

    logger.info('orderStatusesQueryArgs = %o', orderStatusesQueryArgs);

    let orderStatusesQuery = `
        SELECT statuses.name
        FROM orders
        JOIN statuses ON statuses.id = orders.status_id
        JOIN users ON users.id = orders.user_id
        WHERE
            ${filterExprs[0]}
            AND ${filterExprs[1]}
            AND ${filterExprs[2]}
            AND ${filterExprs[3]}
            AND ${filterExprs[4]}
            AND ${filterExprs[5]}
            AND ${dateCreatedAtFromExpr}
            AND ${dateCreatedAtToExpr}
            AND ${dateUpdatedAtFromExpr}
            AND ${dateUpdatedAtToExpr}
            AND ${priceFromExpr}
            AND ${priceToExpr}
        LIMIT ?
        OFFSET ?
        `;

    let ordersCount = 0;
    let ordersSums = { 'Всички': 0.00, 'Настоящи': 0.00, 'Очаквани': 0.00 };
    let orderStatusesRows;

    logger.info('Offset = ' + offset);

    while ((orderStatusesRows = await ctx.myPool().query(orderStatusesQuery, orderStatusesQueryArgs)).length > 0) {

        assert(orderStatusesRows.length >= 0);

        //logger.info("orderStatusesRows = %o", orderStatusesRows);

        ordersCount += orderStatusesRows.length;

        orderStatusesRows.forEach(function (orderStatusRow) {
            if (orderStatusRow.status_name === 'Delivered' || orderStatusRow.status_name === 'Awaiting Shipment' ||
                orderStatusRow.status_name === 'Awaiting Delivery') {
                ordersSums['Настоящи'] += orderStatusRow.amount_leva;
            }

            if (orderStatusRow.status_name === 'Awaiting Payment' || orderStatusRow.status_name === 'Payment being verified') {
                ordersSums['Очаквани'] += orderStatusRow.amount_leva;
            }
        });

        logger.info('Offset = ' + offset);

        offset += ORDER_STATUSES_QUERY_LIMIT;
        orderStatusesQueryArgs[orderStatusesQueryArgs.length - 1] = offset;
    }

    ordersSums['Всички'] = (ordersSums['Настоящи'] + ordersSums['Очаквани']).toFixed(2);
    ordersSums['Настоящи'] = ordersSums['Настоящи'].toFixed(2);
    ordersSums['Очаквани'] = ordersSums['Очаквани'].toFixed(2);

    result.total_rows = ordersCount;
    result.sums = ordersSums;

    logger.info('Result = %o', result);

    ctx.body = result;
}

async function changeOrderStatus(ctx, next) {

}

module.exports = { renderEmployeeLogin, employeeLogin, renderDashboard, employeeLogOut, getProducts, renderOrders, getOrders, changeOrderStatus };
