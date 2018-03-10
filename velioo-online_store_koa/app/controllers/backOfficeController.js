const logger = require('../helpers/logger');
const sha256 = require('js-sha256').sha256;

async function renderEmployeeLogin(ctx, next) {
    logger.info("In renderEmployeelogin");
    ctx.data = {user: {}};
    if (ctx.session.employeeData) {
        return ctx.redirect('/employee/dashboard');
    }
    await next();
    ctx.render('employee_login.pug', ctx.data);
}

async function employeeLogin(ctx, next) {
    ctx.data = {user: {}};
    let userData = await ctx.myPool().query("SELECT password, salt, id FROM employees WHERE username = ?", [ctx.request.body.username]);
    if (userData instanceof Array && userData.length === 1 && (sha256(ctx.request.body.password + userData[0].salt) === userData[0].password)) {
        
        ctx.session.employeeData = {employeeId: userData[0].id};
        return ctx.redirect('/employee/dashboard');
    } else {
        ctx.data.message = "Wrong username or password";
    }
    
    await next();
    ctx.render('employee_login.pug', ctx.data);
}

async function renderDashboard(ctx, next) {
    ctx.data = {user: {}};
    let logged = await next();
    if(ctx.data.employeeLogged === true) {
        ctx.render('dashboard.pug', ctx.data);
    } else {
        ctx.redirect('employee_login');
    }
}

module.exports = {renderEmployeeLogin, employeeLogin, renderDashboard}
