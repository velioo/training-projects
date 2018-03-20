const logger = require('../helpers/logger');
module.exports = async (ctx, next) => {

    let requestUrl = ctx.request.url;
    let userUrls = ['/login', '/sign_up', '/log_out'];

    //logger.info("Url = " + requestUrl);

    if (requestUrl.startsWith("/employee/") && (!ctx.session || !ctx.session.employeeData || !ctx.session.employeeData.employeeId)) {
        ctx.redirect('/employee_login');
    }

    if (userUrls.some( (url) => { return requestUrl.startsWith(url); }) && (ctx.session && ctx.session.userData && ctx.session.userData.userId)) {
        ctx.redirect('/');
    }
}
