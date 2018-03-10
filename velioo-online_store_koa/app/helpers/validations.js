async function emailExists(ctx) {
    let query = await ctx.myPool().query("SELECT email FROM users WHERE email = ?", [ctx.request.body.email]);
    return query.length;
}

function phoneMatch(phone) {
    if(phone.search(/\+(9[976]\d|8[987530]\d|6[987]\d|5[90]\d|42\d|3[875]\d|2[98654321]\d|9[8543210]|8[6421]|6[6543210]|5[87654321]|4[987654310]|3[9643210]|2[70]|7|1)\d{1,14}$/) > -1) {
        return true;
    } else if (phone.search(/^(\d[\s-]?)?[\(\[\s-]{0,2}?\d{3}[\)\]\s-]{0,2}?\d{3}[\s-]?\d{4}$/i) > -1) {
        return true;
    } else if (phone.search(/^\d{10,14}$/) > -1) {
        return true;
    } else {
        return false;
    }
}

module.exports = {emailExists, phoneMatch}
