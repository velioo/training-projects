module.exports = async (ctx, next) => {
    if (ctx.data) {
        if (ctx.session && ctx.session.userData && ctx.session.userData.userId) {
            ctx.data.logged = 1;
        }
        
        if (ctx.session && ctx.session.employeeData && ctx.session.employeeData.employeeId) {
            ctx.data.employeeLogged = true;
        }
        return;
    }
    await next();
}
