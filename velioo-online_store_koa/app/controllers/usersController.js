const logger = require('../helpers/logger');
const sha256 = require('js-sha256').sha256;

async function renderLogin(ctx, next) {
    ctx.data = {user: {}};
    if (ctx.session.userData) {
        return ctx.redirect('/products');
    }
    await next();
    ctx.render('login.pug', ctx.data);
}

async function login(ctx, next) {
    ctx.data = {user: {}};
    let userData = await ctx.myPool().query("SELECT password, salt, id, confirmed FROM users WHERE email = ?", [ctx.request.body.email]);
    if (userData instanceof Array && userData.length === 1 && (sha256(ctx.request.body.password + userData[0].salt) === userData[0].password)) {
        
        if (userData[0].confirmed == 1) {
            ctx.session.userData = {userId: userData[0].id};
            ctx.redirect('products');
        } else {
            ctx.data.message = "Email is not confirmed";
        }
        await next();
        return ctx.redirect('products');
    } else {
        ctx.data.message = "Wrong username or password";
    }
    ctx.render('login.pug', ctx.data);
}


async function renderSignUp(ctx, next) {
    ctx.data = {user: {}}
    if (ctx.session.userData) {
        return ctx.redirect('/products');
    }
    await next();
    ctx.render('signup.pug', ctx.data);
}

async function signUp(ctx, next) {


}

async function logOut(ctx, next) {
    ctx.data = {};
    ctx.session = null;
    await next();
    render('products', ctx.data);
}



module.exports = {renderLogin, login, renderSignUp, signUp, logOut}
