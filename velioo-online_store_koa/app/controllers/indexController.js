const logger = require('../helpers/logger');
const { getArrayPages } = require('koa-ctx-paginate');

async function list(ctx, next) {
    //logger.info('In list()');
    let limit = 40;
    let offset = (ctx.query.page) ? (+ctx.query.page > 0) ? +ctx.query.page * limit - limit : 0 : 0;
    //logger.info("Offset: " + offset);
    let query = await ctx.myPool().query('SELECT products.* FROM products JOIN categories ON \
                                          categories.id = products.category_id ORDER BY created_at DESC LIMIT ? OFFSET ?',
                                          [limit, offset]);
    ctx.render('index.pug', {products: query});
}

async function getId(ctx, next) {

    //logger.info('In getId()');
    let id = ctx.params.id;
    let query = await ctx.myPool().query('SELECT products.* FROM products JOIN categories ON \
                                          categories.id = products.category_id WHERE products.id = ?', [id]);
    
    if (query.length > 0)
        query = query[0];
    else
        ctx.redirect('/not_found');
    ctx.render('product.pug', {product: query});
}

async function searchByName(ctx, next) {

    let data = {};
    let searchInput = ctx.query.search_input || "";
    //logger.info("SearchInput: " + searchInput);
    if (searchInput) {
        data['searchInput'] = searchInput;
        searchInput = searchInput.replace(/%/g, "!%").replace(/_/g, "!_").replace(/'/g, "\\'").replace(/"/g, '\\"');
    }
    let productsQuery = "SELECT products.*, categories.name as category, categories.id as category_id FROM products JOIN categories ON categories.id=products.category_id\
        LEFT JOIN product_tags ON product_tags.product_id=products.id\
        LEFT JOIN tags ON tags.id=product_tags.tag_id WHERE (products.name LIKE '%" + searchInput + "%' OR products.description LIKE '%" + searchInput + "%' ESCAPE '!') ";
    let tagsQuery = "SELECT tags.name, COUNT(tags.name) as tag_count FROM products\
        JOIN categories ON categories.id=products.category_id\
        JOIN product_tags ON product_tags.product_id=products.id\
        JOIN tags ON tags.id=product_tags.tag_id WHERE products.name LIKE '%" + searchInput + "%' ";

    let productsQueryArgs = [];
    let tagsQueryArgs = [];

    //logger.info("In searchByName");
    let limit = ctx.query.limit;
    //logger.info("Limit: " + limit);
    ////logger.info("Query String: %o", ctx.query);
    let offset = (ctx.query.page) ? (+ctx.query.page > 0) ? +ctx.query.page * ctx.query.limit - ctx.query.limit : 0 : 0;
    //logger.info("Offset: " + offset);
    //console.log(ctx.query);
    ////logger.info("Tags got: %o", ctx.query.tags);
    if(ctx.query.tags) {
        productsQuery+=" AND tags.name IN (?) ";
        productsQueryArgs.push(ctx.query.tags);
    }

    if (ctx.query.price_from) {
        productsQuery+=" AND products.price_leva >= ?";
        productsQueryArgs.push(+ctx.query.price_from);
        tagsQuery+=" AND products.price_leva >= ?";
        tagsQueryArgs.push(+ctx.query.price_from);
        data['price_from'] = ctx.query.price_from;
    }

    if (ctx.query.price_to) {
        productsQuery+=" AND products.price_leva <= ?";
        productsQueryArgs.push(+ctx.query.price_to);
        tagsQuery+=" AND products.price_leva <= ?";
        tagsQueryArgs.push(+ctx.query.price_to);
        data['price_to'] = ctx.query.price_to;
    }

    if (ctx.query.category) {
        productsQuery+=" AND categories.id = ?";
        productsQueryArgs.push(+ctx.query.category);
        tagsQuery+=" AND categories.id = ?";
        tagsQueryArgs.push(+ctx.query.category);
        data['category'] = ctx.query.category;
    }

    productsQuery+=" GROUP BY products.id";

    if (ctx.query.sort_products) {
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
        data['sort_products'] = ctx.query.sort_products;
    } else {
        data['sort_products'] = 'newest';
        productsQuery+=" ORDER BY products.updated_at DESC";
    }
    
    let productsCount = await ctx.myPool().query(productsQuery, productsQueryArgs);
    //logger.info("Products count: " + productsCount.length);
    if (productsCount.length <= 0) {
        return ctx.render('index.pug', data);
    }
    productsQuery+=" LIMIT ? OFFSET ?";
    productsQueryArgs.push(limit, offset);
    let products = await ctx.myPool().query(productsQuery, productsQueryArgs);
    ////logger.info("Products: %o", products);
    //logger.info("Products received");
    tagsQuery+=" GROUP BY tags.name";
    let tags = await ctx.myPool().query(tagsQuery, tagsQueryArgs);
    //logger.info("Tags received");
    ////logger.info("Query: " + productsQuery);
    ////logger.info("Tags object: %o", tags);
    ////logger.info("Query: " + tagsQuery);
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

    ////logger.info('New Tags: %o', newTags);
    data['tags'] = newTags;
    data['products'] = products;
    data['pageCount'] = Math.ceil(productsCount.length / +ctx.query.limit);
    data['itemCount'] = productsCount.length;
    data['currentPage'] = ctx.query.page;
    //console.log(data['pageCount']);
    ////logger.info("pageCount: " + data['pageCount']);
    ////logger.info("itemCount: " + data['itemCount']);
    data['pages'] = getArrayPages(ctx)(10, 2, ctx.query.page);
    //console.log(data['pages']);
    //logger.info("Rendering page");
    ctx.render('index.pug', data);
}

async function getMenuItems(ctx, next) {
    let items = await ctx.myPool().query("SELECT id, name, type as c_type FROM categories");
    ////logger.info("Items: %o", items);
    ctx.body = items;
}

async function not_found(ctx, next) {
    //logger.info('In not_found()');
    ctx.status = 404;
    ctx.render('not_found', {message: "Resource Not Found"});
}

module.exports = {list, getId, searchByName, getMenuItems, not_found}
