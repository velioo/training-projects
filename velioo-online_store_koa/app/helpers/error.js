const logger = require('./logger');
module.exports = async (ctx, next) => {
    try {
        await next();
    } catch(err) {
        ctx.status = err.status || 500;
        if (err.status == 401) {
            ctx.set('WWW-Authenticate', 'Basic');
            ctx.body = 'You have no access here';
        } else {
            logger.error("Error while executing code: " + err.stack);
            //ctx.app.emit('error', err, ctx);
        }
        ctx.body = "Problem while processing your request";
    }
}
