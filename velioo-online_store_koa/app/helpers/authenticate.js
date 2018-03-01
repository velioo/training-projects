module.exports = async (ctx, next) => {
    if (ctx.data) {
        if (ctx.session.userData.userId) {
            ctx.data.logged = 1;
        }
        return;
    }
    await next();
}
