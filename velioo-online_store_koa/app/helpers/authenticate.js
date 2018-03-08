module.exports = async (ctx, next) => {
    if (ctx.data) {
        if (ctx.session && ctx.session.userData && ctx.session.userData.userId) {
            ctx.data.logged = 1;
        }
        return;
    }
    await next();
}
