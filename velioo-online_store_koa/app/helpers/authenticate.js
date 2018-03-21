const logger = require('../helpers/logger');

module.exports = async (ctx, next) => {

    let requestUrl = ctx.request.url;
    let userServiceUrls = ['/login', '/sign_up'];
    let employeeServiceUrls = ['/employee_login', ];

    //logger.info("Url = " + requestUrl);

    if (userServiceUrls.some( (url) => { return requestUrl.startsWith(url); }) && (ctx.session && ctx.session.userData && ctx.session.userData.userId)) {
        return ctx.redirect('/');
    }

    if (requestUrl.startsWith('/log_out') && (!ctx.session || (!ctx.session.userData || !ctx.session.userData.userId))) {
        return ctx.redirect('/login');
    }

    if (requestUrl.startsWith('/employee/')) {

        if (!ctx.session || (!ctx.session.employeeData || !ctx.session.employeeData.employeeId)) {
            return ctx.redirect('/employee_login');
        }

        return;
    }

    if (employeeServiceUrls.some( (url) => { return requestUrl.startsWith(url); }) && (ctx.session && ctx.session.employeeData && ctx.session.employeeData.employeeId)) {
        return ctx.redirect('/employee/dashboard');
    }

    await next();
}
