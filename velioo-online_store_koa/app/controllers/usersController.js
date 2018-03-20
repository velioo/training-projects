const Constants = require('../constants/constants');
const { emailExists, phoneMatch } = require('../helpers/validations');
const logger = require('../helpers/logger');
var unique = require('../helpers/unique');

const sha256 = require('js-sha256').sha256;
const Crypto = require('crypto');
const assert = require('assert');
const Nodemailer = require('nodemailer');

async function renderLogin(ctx, next) {

    await next();

    ctx.render('login.pug', { 
        user: {
            logged: false
        }
    });
}

async function login(ctx, next) {
    let userData = await ctx.myPool().query(`
        SELECT password, salt, id, confirmed
        FROM users
        WHERE
            email = ?
        `, [ctx.request.body.email]);

    let loginMessage = "";

    if (userData instanceof Array && userData.length === 1 && (sha256(ctx.request.body.password + userData[0].salt) === userData[0].password)) {

        if (+userData[0].confirmed === 1) {
            ctx.session.userData = {userId: userData[0].id};
            return ctx.redirect('/products');
        } else {
            loginMessage = "Email is not confirmed";
        }
    } else {
        loginMessage = "Wrong username or password";
    }

    ctx.render('login.pug', {
        user: {
            loginMessage: loginMessage,
            logged: false
        }
    });
}


async function renderSignUp(ctx, next) {

    await next();

    let countryRows = await ctx.myPool().query(`
        SELECT nicename, phonecode
        FROM countries
        `);

    ctx.render('signup.pug', {
        countries: countryRows,
        user: {
            logged: false
        }
    });
}

async function signUp(ctx, next) {

    ctx.errors = [];

    ctx.checkBody('name').len(2, 20, "Name is too long or too short");
    ctx.checkBody('last_name').optional().empty().len(2, 20, "Last name is too long or too short");
    ctx.checkBody('email').isEmail("Your entered a bad email.");
    ctx.checkBody('phone').replace(' ', '');
    ctx.checkBody('country').optional().empty().len(2, 64, "Country is too long or too short");
    ctx.checkBody('region').optional().empty().len(2, 64, "Region is too long or too short");
    ctx.checkBody('street_address').optional().empty().len(2, 64, "Street address is too long is invalid");
    ctx.checkBody('password').len(8, 255, "Password is too short or too long");
    ctx.checkBody('conf_password').eq(ctx.request.body.password, "Passwords don't match");
    ctx.checkBody('gender').default('Unknown');

    if (await emailExists(ctx)) {
        ctx.errors.push({email_exists: "Email already exists."});
    }

    if (!phoneMatch(ctx.request.body.phone)) {
        ctx.errors.push({phone: "Your entered a bad phone."});
    }

    //console.log(ctx.request.body);

    let salt = Crypto.randomBytes(32).toString('base64');
    ctx.data = {};
    ctx.data.user = {
        'name': ctx.request.body.name,
        'last_name': ctx.request.body.last_name,
        'email': ctx.request.body.email,
        'password': sha256(ctx.request.body.password + salt),
        'salt': salt,
        'gender': (ctx.request.body.gender) ? ctx.request.body.gender : 'Unknown',
        'phone': ctx.request.body.phone,
        'phone_unformatted': ctx.request.body.phone.replace(' ', ''),
        'country': ctx.request.body.country,
        'region': ctx.request.body.region,
        'street_address': ctx.request.body.street_address
    };

    const fields = ['name', 'last_name', 'email', 'password', 'salt', 'gender', 'phone', 'phone_unformatted', 'country', 'region', 'street_address'];
    const dbData = fields.map(fieldName => ctx.data.user[ fieldName ]);

    let userData = [
        ctx.request.body.name,
        ctx.request.body.last_name,
        ctx.request.body.email,
        sha256(ctx.request.body.password + salt),
        salt,
        (ctx.request.body.gender) ? ctx.request.body.gender : 'Unknown',
        ctx.request.body.phone,
        ctx.request.body.phone.replace(' ', ''),
        ctx.request.body.country,
        ctx.request.body.region,
        ctx.request.body.street_address
    ];

    logger.info("userData = %o", userData);
    logger.info("dbData = %o", dbData);

    return ctx.body = "Temporary unavailable";


    if(ctx.errors.length === 0) {
        userData.phone.replace(/[^0-9]/, "");

        var query = await ctx.myPool().query(`
            INSERT INTO users (name, last_name, email, password, salt, gender, phone, phone_unformatted, country, region, street_address)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, userData);

        if(query) {
            let tempCode = unique();

            logger.info("Temp code = " + tempCode);

            query = await ctx.myPool().query("SELECT LAST_INSERT_ID() as userId");

            if(!query || query.length == 0) {
                logger.info("Error getting user insert id.");
                return ctx.redirect("/sign_up");
            }

            let userId = query[0].userId;
            logger.info("last insert id: " + userId);
            query = await ctx.myPool().query("INSERT INTO temp_codes(user_id, hash, type) VALUES(?, ?, ?)", [userId, tempCode, "email"]);

            if(!query) {
                logger.info("Failed to insert into temp_codes.");
                await ctx.myPool().query("DELETE FROM users WHERE id = ?", [userId]);
                return ctx.redirect("/sign_up");
            }

            var transporter = Nodemailer.createTransport({
              service: 'gmail',
              auth: {
                user: "vanime.staff@gmail.com",
                pass: Constants.EMAIL_PASS
              }
            });

            var mailOptions = {
                from: "Darth Velioo <velioocs@gmail.com>",
                to: ctx.request.body.email,
                subject: "Confirm email",
                text: "Please confirm your account by clicking the link below.",
                html: "Confirm Account: <p><a href='http://localhost:8883/confirm_account/" + tempCode + "'> \nClick here </a></p>"
            }

            transporter.sendMail(mailOptions, async function(error, info){
                if(error) {
                    logger.error("Error while sending mail: " + error.stack);
                    if(!ctx.errors) {
                        ctx.errors = [];
                    }
                    ctx.errors.push({email_send: "There was a problem while sending confirmation email"});
                    await ctx.myPool().query("DELETE FROM users WHERE id = ?", [userId]);
                    await ctx.myPool().query("DELETE FROM temp_codes WHERE user_id = ? AND type = 'email'", [userId]);
                } else {
                    ctx.session.message = "You successfully signed up";
                }

                transporter.close();
            });

            if(ctx.errors) {
                return ctx.redirect('sign_up');
            }

            ctx.data = {user: {}};
            ctx.data.message = "An confirmation email was sent to your our. Please confirm your account before logging in.";
            await next();
            ctx.render('login.pug', ctx.data);
        } else {
            await ctx.myPool().query("ROLLBACK");
            ctx.render('signup.pug', ctx.data);
        }
    } else {
        ctx.data.errors = ctx.errors;
        ctx.data.countries = await ctx.myPool().query("SELECT nicename, phonecode FROM countries");
        ctx.render('signup.pug', ctx.data);
    }
}

async function logOut(ctx, next) {
    ctx.status = 200;
    ctx.data = {};

    if(ctx.session.userData) {
        ctx.session.userData = null;
        await next();
    }

    ctx.redirect('/products');
}

async function confirmAccount(ctx, next) {

    ctx.status = 200;
    let query = await ctx.myPool().query("SELECT * FROM temp_codes WHERE hash = ?", [ctx.params.code]);

    if(query && query.length > 0) {
        let userId = query[0].user_id;

        query = await ctx.myPool().query("UPDATE users SET confirmed = 1 WHERE id = ?", [userId]);

        if(query) {
            await ctx.myPool().query("DELETE FROM temp_codes WHERE hash = ?", [ctx.params.code]);
            ctx.data = {user: {}};
            ctx.data.message = "You succecssfully validated your account";

            await next();

            ctx.render('login.pug', ctx.data);
        } else {
            ctx.body = "There was a problem confirming your account";
        }
    } else {
        ctx.body = "Link is invalid or has expired";
    }
}

module.exports = {renderLogin, login, renderSignUp, signUp, logOut, confirmAccount};
