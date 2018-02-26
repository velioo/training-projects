const logger = require('../helpers/logger');
const Router = require('koa-router'),
      KoaBody = require('koa-body'),
      {list, getId, not_found} = require('../controllers/indexController');
      
      //~ {
        //~ formidable: {uploadDir: '../../uploads'},
        //~ multipart: true,
        //~ urlencoded: true
      //~ }
      //getId, createProduct, updateProduct, removeProduct
const router = new Router();

router.get('/products', KoaBody(), list)
    .get('/products/:id', getId)
    //~ .post('/products', KoaBody(), createProduct)
    //~ .post('/products/:id', KoaBody, updateProduct)
    //~ .delete('/products/:id', removeProduct)
    .get('/not_found', not_found)
    .get('/', (ctx) => {ctx.redirect('/products');});
    
module.exports = {
    routes () { return router.routes(); },
    allowedMethods () { return router.allowedMethods(); }
};
