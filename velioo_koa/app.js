var koa = require('koa');
var Router = require('koa-router');
var app = module.exports = new koa();
var router = new Router();
const PORT = +process.argv[2] || 8883;

router.get('/hello', (ctx, next) => {
    ctx.body = "Hello there from GET!\n";
});
router.post('/hello', (ctx, next) => {
    ctx.body = "Hello there from POST!\n";
});
router.all('/all', (ctx, next) => {
    ctx.body = "Hello there from ANY!\n";
});
app.use(router.routes());
app.listen(PORT, function() {
    console.log('Server running on https://localhost:' + PORT);
});
