const logger = require('../helpers/logger');

async function list(ctx, next) {
    logger.info('In list()');
    let limit = 40;
    let offset = (ctx.query.page) ? +ctx.query.page * limit : 0;
    logger.info("Offset: " + offset);
    let query = await ctx.myPool().query('SELECT products.* FROM products JOIN categories ON \
                                          categories.id = products.category_id ORDER BY created_at DESC LIMIT ? OFFSET ?',
                                          [limit, offset]);
    ctx.render('index.pug', {products: query});
}

async function getId(ctx, next) {

    logger.info('In getId()');
    let id = ctx.params.id;
    let query = await ctx.myPool().query('SELECT products.* FROM products JOIN categories ON \
                                          categories.id = products.category_id WHERE products.id = ?', [id]);
    //console.log(query);
    ctx.render('product.pug', {product: query[0]});
}

async function not_found(ctx, next) {
    logger.info('In not_found()');
    ctx.status = 404;
    ctx.render('not_found', {message: "Resource Not Found"});
}

module.exports = {list, getId, not_found}
