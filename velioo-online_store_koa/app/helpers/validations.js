async function emailExists(ctx) {
    let query = await ctx.myPool().query("SELECT email FROM users WHERE email = ?", [ctx.request.body.email]);
    console.log(query.length);
    return query.length;
}

module.exports = {emailExists}
