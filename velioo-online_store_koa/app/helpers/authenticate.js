module.exports = async (ctx, next) => {
    await next();
        
    if (ctx.session && ctx.session.userData && ctx.session.userData.userId) {
        ctx.logged = true;
    }
    
    if (ctx.session && ctx.session.employeeData && ctx.session.employeeData.employeeId) {
        ctx.employeeLogged = true;
    }
}
