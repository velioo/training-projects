module.exports = async (ctx, next) => {
  const requestUrl = ctx.request.url;
  const userServiceUrls = [ '/login', '/sign_up' ];
  const userLoggedInUrls = [ '/users/' ];
  const employeeLoggedInUrls = [ '/employee/' ];
  const employeeServiceUrls = [ '/employee_login' ];

  if (userServiceUrls.some((url) => requestUrl.startsWith(url)) &&
      ctx.session.isUserLoggedIn) {
    return ctx.redirect('/');
  }

  if (employeeServiceUrls.some((url) => requestUrl.startsWith(url)) &&
      ctx.session.isEmployeeLoggedIn) {
    return ctx.redirect('/employee/dashboard');
  }

  if (userLoggedInUrls.some((url) => requestUrl.startsWith(url) || (requestUrl + '/').startsWith(url))) {
    if (!ctx.session.isUserLoggedIn) {
      return ctx.redirect('/login');
    }

    return;
  }

  if (employeeLoggedInUrls.some((url) => requestUrl.startsWith(url) || (requestUrl + '/').startsWith(url))) {
    if (!ctx.session.isEmployeeLoggedIn) {
      return ctx.redirect('/employee_login');
    }

    return;
  }

  await next();
};
