const assert = require('assert');
const logger = require('../helpers/logger');
const { getArrayPages } = require('koa-ctx-paginate');

async function list(ctx, next) {
    logger.info('In list()');

    ctx.status = 200;
    await next();

    let limit = 40;
    // let offset = ctx.query.page || 0;

    // assert(!isNaN(offset));

    let offset = (ctx.query.page)
        ? (+ctx.query.page > 0)
            ? +ctx.query.page * limit - limit
            : 0
        : 0;
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
        logged: ctx.logged
    });
}

async function getId(ctx, next) {

    //logger.info('In getId()');
    ctx.status = 200;
    ctx.data = {};
    let id = ctx.params.id;
    let query = await ctx.myPool().query(`
        SELECT products.* FROM products JOIN categories ON
        categories.id = products.category_id WHERE products.id = ?
        `, [id]);
    //assert single product
    if (query.length > 0) {
        ctx.data.product = query[0]
    } else {
        return ctx.redirect('/not_found');
    }
    await next();
    ctx.render('product.pug', ctx.data);
}

async function searchByName(ctx, next) {
    ctx.status = 200;
    await next();

    let searchInputExpr = (ctx.query.search_input)
        ? (ctx.query.search_input !== '')
            ? ctx.query.search_input.replace(/%/g, "!%").replace(/_/g, "!_").replace(/'/g, "\\'").replace(/"/g, '\\"')
            : '?'
        : '?';

    logger.info("Search Expr = " + searchInputExpr);

    let productsQueryArgs = [];
    let tagsQueryArgs = [];

    let limit = (ctx.query.limit)? +ctx.query.limit: 40;
    productsQueryArgs.push(limit);

    logger.info("Limit: " + limit);

    let offset = (ctx.query.page)
        ? (+ctx.query.page > 0)
            ? +ctx.query.page * limit - limit
            : 0
        : 0;

    productsQueryArgs.push(offset);

    logger.info("Offset: " + offset);

    let tagsExpr = (ctx.query.tags) ? 'tags.name IN (?)' : '?';
    productsQueryArgs.push((ctx.query.tags) ? ctx.query.tags : true);

    logger.info("Tags: %o" + ctx.query.tags);

    let priceFromExpr = (ctx.query.price_from) ? 'products.price_leva >= ?' : '?';
    productsQueryArgs.push((ctx.query.price_from) ? +ctx.query.price_from : true);
    tagsQueryArgs.push((ctx.query.price_from) ? +ctx.query.price_from : true);

    logger.info("PriceFromExpr = ", priceFromExpr);

    let priceToExpr = (ctx.query.price_to) ? 'products.price_leva <= ?' : '?';    
    productsQueryArgs.push((ctx.query.price_to) ? +ctx.query.price_to : true);
    tagsQueryArgs.push((ctx.query.price_to) ? +ctx.query.price_to : true);

    logger.info("PriceToExpr = ", priceToExpr);

    let categoryExpr = (ctx.query.category) ? 'categories.id = ?' : '?';    
    productsQueryArgs.push((ctx.query.category) ? ctx.query.category : true);
    tagsQueryArgs.push((ctx.query.category) ? ctx.query.category : true);

    logger.info("CategoryExpr = ", categoryExpr);

    let productsQuery = `
        SELECT products.*, categories.name as category, categories.id as category_id 
        FROM products
        JOIN categories ON categories.id=products.category_id
        LEFT JOIN product_tags ON product_tags.product_id=products.id
        LEFT JOIN tags ON tags.id=product_tags.tag_id
        WHERE 
            (products.name LIKE '%${searchInputExpr}%' OR products.description LIKE '%${searchInputExpr}%' ESCAPE '!')
            AND ${tagsExpr}
            AND ${priceFromExpr}
            AND ${priceToExpr}
            AND ${categoryExpr}
        LIMIT ?
        OFFSET ?
        `;
    let tagsQuery = `
        SELECT tags.name, COUNT(tags.name) as tag_count 
        FROM products
        JOIN categories ON categories.id=products.category_id
        JOIN product_tags ON product_tags.product_id=products.id
        JOIN tags ON tags.id=product_tags.tag_id 
        WHERE 
            products.name LIKE '%${searchInputExpr}%'
            AND ${priceFromExpr}
            AND ${priceToExpr}
            AND ${categoryExpr}
        `;

    // var tagsExpr = condition ? 'tags.name IN (?)' : '?';
    // args.push(condition ? tags : true);
    // var query = `
    
        //~ SELECT 1
        //~ FROM tablename
        //~ WHERE
            //~ id > 0
            //~ AND ${tagsExpr}
    
    //~ `;

    //logger.info("Tags got: %o", ctx.query.tags);
   /* if(ctx.query.tags) {
        productsQuery += " AND tags.name IN (?) ";
        productsQueryArgs.push(ctx.query.tags);
    }*/

    i/*f (ctx.query.price_from) {
        productsQuery += " AND products.price_leva >= ?";
        productsQueryArgs.push(+ctx.query.price_from);
        tagsQuery+=" AND products.price_leva >= ?";
        tagsQueryArgs.push(+ctx.query.price_from);
        ctx.data.price_from = ctx.query.price_from;
    }

    if (ctx.query.price_to) {
        productsQuery+=" AND products.price_leva <= ?";
        productsQueryArgs.push(+ctx.query.price_to);
        tagsQuery+=" AND products.price_leva <= ?";
        tagsQueryArgs.push(+ctx.query.price_to);
        ctx.data.price_to = ctx.query.price_to;
    }*/

    if (ctx.query.category) {
        productsQuery+=" AND categories.id = ?";
        productsQueryArgs.push(+ctx.query.category);
        tagsQuery+=" AND categories.id = ?";
        tagsQueryArgs.push(+ctx.query.category);
        ctx.data.category = ctx.query.category;
    }

    productsQuery+=" GROUP BY products.id";
    tagsQuery+=" GROUP BY tags.name";

    if (ctx.query.sort_products) {
        //~ const cases = {
                //~ price_asc: 'order by producsts.price_leva asc',
                //~ price_desc: 'order by producsts.price_leva desc',
        //~ };
        
        //~ assert(cases[ctx.query.sort_products])
        
        //~ productsQuery += cases[ctx.query.sort_products];
        
        
        switch(ctx.query.sort_products) {
            case 'price_asc':
                productsQuery+=" ORDER BY products.price_leva ASC";
                break;
            case 'price_desc':
                productsQuery+=" ORDER BY products.price_leva DESC";
                break;
            case 'newest':
                productsQuery+=" ORDER BY products.created_at DESC";
                break;
            case 'latest_updated':
                productsQuery+=" ORDER BY products.updated_at DESC";
                break;
            default:
                break;
        }
        ctx.data.sort_products = ctx.query.sort_products;
    } else {
        ctx.data.sort_products = 'newest';
        productsQuery+=" ORDER BY products.updated_at DESC";
    }
    
    let productsCount = await ctx.myPool().query(productsQuery, productsQueryArgs);
    //logger.info("Products count: " + productsCount.length);
    if (productsCount.length <= 0) {
        return ctx.render('index.pug', ctx.data);
    }
    //productsQuery+=" LIMIT ? OFFSET ?";
    //productsQueryArgs.push(limit, offset);
    let products = await ctx.myPool().query(productsQuery, productsQueryArgs);
    //logger.info("Products: %o", products);
    //logger.info("Products received");

    let tags = await ctx.myPool().query(tagsQuery, tagsQueryArgs);
    //logger.info("Tags received");
    //logger.info("Query: " + productsQuery);
    //logger.info("Tags object: %o", tags);
    //logger.info("Query: " + tagsQuery);
    //logger.info("Tags count: " + tags.length);
    let newTags = {};
    if (tags.length > 0) {
        tags.forEach(function(tag) {
            ////logger.info("Tag: %o", tag);
            let tempObj = {};
            if (ctx.query.tags) {
                if (ctx.query.tags.includes(tag['name'])) {
                    tempObj['checked'] = 1;
                }
            }
            let splitedTag = tag['name'].split(':', 2);
            if (splitedTag.length > 1) {
                tempObj['value'] = splitedTag[1].trim();
                tempObj['count'] = tag['tag_count'];
                newTags[splitedTag[0]] = tempObj;
            }
        });
    }
    //logger.info("Tags processed");

    //logger.info('New Tags: %o', newTags);
    // ctx.data.tags = newTags;
    // ctx.data.products = products;
    // ctx.data.pageCount = Math.ceil(productsCount.length / +ctx.query.limit);
    // ctx.data.itemCount = productsCount.length;
    // ctx.data.currentPage = ctx.query.page;
    //console.log(data['pageCount']);
    ////logger.info("pageCount: " + data['pageCount']);
    ////logger.info("itemCount: " + data['itemCount']);
    // ctx.data.pages = getArrayPages(ctx)(10, 2, ctx.query.page);
    //console.log(data['pages']);
    //logger.info("Rendering page");

    ctx.render('index.pug', {
        searchInput: ctx.query.search_input,
        price_from: ctx.query.price_from,
        price_to: ctx.query.price_to,
        category: ctx.query.category,
        sort_products: ctx.query.sort_products,
        tags: newTags,
        products: products,
        pageCount: Math.ceil(productsCount.length / +ctx.query.limit),
        itemCount: productsCount.length,
        pages: getArrayPages(ctx)(10, 2, ctx.query.page)
    });
}

async function getMenuItems(ctx, next) {
    let items = await ctx.myPool().query("SELECT id, name, type as c_type FROM categories");
    ////logger.info("Items: %o", items);
    ctx.body = items;
}

async function notFound(ctx, next) {
    //logger.info('In not_found()');
    ctx.status = 404;
    ctx.render('not_found', {message: "Resource Not Found"});
}

module.exports = {list, getId, searchByName, getMenuItems, notFound}
