module.exports = async (ctx, next) => {
  const requestUrl = ctx.request.url;
  const userServiceUrls = [ '/login', '/sign_up' ];
  const userLoggedInUrls = [ '/users/' ];
  const employeeLoggedInUrls = [ '/employee/' ];
  const employeeServiceUrls = [ '/employee_login' ];
  // const logger = require('./logger');

  if (userServiceUrls.some((url) => requestUrl.startsWith(url)) &&
      ctx.session.isUserLoggedIn) {
    ctx.throw(200, 'User already logged in.', { userLoggedIn: true });
  }

  if (employeeServiceUrls.some((url) => requestUrl.startsWith(url)) &&
      ctx.session.isEmployeeLoggedIn) {
    ctx.throw(200, 'Employee already logged in.', { employeeLoggedIn: true });
  }

  if (userLoggedInUrls.some((url) => requestUrl.startsWith(url) || (requestUrl + '/').startsWith(url))) {
    if (!ctx.session.isUserLoggedIn) {
      ctx.throw(403, 'User not logged in.', { userNotLoggedIn: true });
    }

    return;
  }

  if (employeeLoggedInUrls.some((url) => requestUrl.startsWith(url) || (requestUrl + '/').startsWith(url))) {
    if (!ctx.session.isEmployeeLoggedIn) {
      ctx.throw(403, 'Employee not logged in.', { employeeNotLoggedIn: true });
    }

    return;
  }

  await next();
};
