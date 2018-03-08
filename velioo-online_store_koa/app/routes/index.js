const logger = require('../helpers/logger');
const Router = require('koa-router'),
      KoaBody = require('koa-body'),
      {list, getId, searchByName, getMenuItems, not_found} = require('../controllers/indexController'),
      {renderLogin, login, renderSignUp, signUp, logOut, confirmAccount} = require('../controllers/usersController');
      
      //~ {
        //~ formidable: {uploadDir: '../../uploads'},
        //~ multipart: true,
        //~ urlencoded: true
      //~ }
      //getId, createProduct, updateProduct, removeProduct
const router = new Router();

router.get('/products', list)
    .get('/products/:id([0-9]+)', getId)
    .get('/search', searchByName)
    .get('/menu_items', getMenuItems)
    .get('/login', renderLogin)
    .post('/login', KoaBody(), login)
    .get('/sign_up', renderSignUp)
    .post('/sign_up', KoaBody(), signUp)
    .get('/log_out', logOut)
    .get('/confirm_account', confirmAccount)
    //~ .post('/products', KoaBody(), createProduct)
    //~ .post('/products/:id', KoaBody, updateProduct)
    //~ .delete('/products/:id', removeProduct)
    .get('/not_found', not_found)
    .get('/', (ctx) => {ctx.redirect('/products');});
    
module.exports = {
    routes () { return router.routes(); },
    allowedMethods () { return router.allowedMethods(); }
};
