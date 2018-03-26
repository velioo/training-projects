const Constants = require('../constants/constants');
const { emailExists, phoneMatch } = require('../helpers/validations');
const logger = require('../helpers/logger');
var unique = require('../helpers/unique');

const sha256 = require('js-sha256').sha256;
const Crypto = require('crypto');
const assert = require('assert');
const Nodemailer = require('nodemailer');

async function renderLogin(ctx, next) {
    ctx.status = 200;

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

    let error = "";

    if (userData.length === 1 && (sha256(ctx.request.body.password + userData[0].salt) === userData[0].password)) {

        if (+userData[0].confirmed === 1) {
            ctx.session.userData = { userId: userData[0].id };
            return ctx.redirect('/products');
        } else {
            error = 'Email is not confirmed.';
        }
    } else {
        error = 'Wrong username or password.';
    }

    ctx.render('login.pug', {
        error: error,
        user: {
            logged: false
        }
    });
}


async function renderSignUp(ctx, next) {
    ctx.status = 200;

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

    ctx.checkBody('name').len(2, 20, 'Name is too long or too short');
    ctx.checkBody('last_name').optional().empty().len(2, 20, 'Last name is too long or too short');
    ctx.checkBody('email').isEmail('Your entered a bad email.');
    ctx.checkBody('phone');
    ctx.checkBody('country').optional().empty().len(2, 64, 'Country is too long or too short');
    ctx.checkBody('region').optional().empty().len(2, 64, 'Region is too long or too short');
    ctx.checkBody('street_address').optional().empty().len(2, 64, 'Street address is too long is invalid');
    ctx.checkBody('password').len(8, 255, 'Password is too short or too long');
    ctx.checkBody('conf_password').eq(ctx.request.body.password, 'Passwords don\'t match');
    ctx.checkBody('gender').default('Unknown');

    if (await emailExists(ctx)) {
        ctx.errors.push({email_exists: 'Email already exists.'});
    }

    if (!phoneMatch(ctx.request.body.phone)) {
        ctx.errors.push({phone: 'Your entered a bad phone.'});
    }

    //console.log(ctx.request.body);

    let salt = Crypto.randomBytes(32).toString('base64');

    let userData = {
        'name': ctx.request.body.name,
        'last_name': ctx.request.body.last_name,
        'email': ctx.request.body.email,
        'password': sha256(ctx.request.body.password + salt),
        'salt': salt,
        'gender': (ctx.request.body.gender) ? ctx.request.body.gender : 'Unknown',
        'phone': ctx.request.body.phone.replace(/[^0-9]/, ""),
        'phone_unformatted': ctx.request.body.phone,
        'country': ctx.request.body.country,
        'region': ctx.request.body.region,
        'street_address': ctx.request.body.street_address
    };

    const userDbfields = ['name', 'last_name', 'email', 'password', 'salt', 'gender', 'phone', 'phone_unformatted', 'country', 'region', 'street_address'];
    const userDbData = userDbfields.map( (fieldName) => userData[ fieldName ]);

    if(ctx.errors.length === 0) { // if is too long

        let resultSetHeader = await ctx.myPool().query(`
            INSERT INTO users (name, last_name, email, password, salt, gender, phone, phone_unformatted, country, region, street_address)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, userDbData); // use dbFields

        logger.info('Result from insert = ' + resultSetHeader.insertId);
        logger.info('ResultsetHeader = %o', resultSetHeader);

        if(resultSetHeader) {
            let tempCode = unique();

            logger.info('Temp code = ' + tempCode);

            let userId = resultSetHeader.insertId;

            resultSetHeader = await ctx.myPool().query(`
                INSERT INTO temp_codes(user_id, hash, type)
                VALUES(?, ?, ?)
                `, [userId, tempCode, 'email']);

            if(resultSetHeader) {

                let transporter = Nodemailer.createTransport({
                  service: 'gmail',
                  auth: {
                    user: 'vanime.staff@gmail.com',
                    pass: Constants.EMAIL_PASS
                  }
                });

                let mailOptions = { // in pug template
                    from: 'Darth Velioo <velioocs@gmail.com>',
                    to: ctx.request.body.email,
                    subject: "Confirm email",
                    text: 'Please confirm your account by clicking the link below.',
                    html: 'Confirm Account: <p><a href="' + Constants.ROOT + 'confirm_account/' + tempCode + '"> \nClick here </a></p>'
                }

                let message;

                transporter.sendMail(mailOptions, async function(error, info){
                    if(error) {
                        logger.error('Error while sending mail: ' + error.stack);
                        message = 'There was an error while sending confirmation email. Please try again later.';

                        ctx.errors.push({email_send: 'There was a problem while sending confirmation email.'});

                        await ctx.myPool().query(`
                            DELETE
                            FROM users
                            WHERE
                                id = ?
                            `, [userId]);

                        await ctx.myPool().query(`
                            DELETE
                            FROM temp_codes
                            WHERE
                                user_id = ?
                                AND type = 'email'
                            `, [userId]);
                    } else {
                        message = 'A confirmation email was sent to your email address. Please confirm your account before logging in.';
                    }

                    transporter.close();
                });

                return ctx.render('login.pug', {
                    message: message,
                    user: {}
                });

            } else {

                logger.error('Failed to insert into temp_codes.');

                let resultSetHeader = await ctx.myPool().query(`
                    DELETE
                    FROM users
                    WHERE
                        id = ?
                    `, [userId]);

                if (!resultSetHeader) {
                    throw Error('Error while deleting temp_codes table row. User id = ' + userId + '. Status = ' + resultSetHeader);
                }
            }
        }
    }

    let countryRows = await ctx.myPool().query(`
        SELECT nicename, phonecode
        FROM countries
        `);

    ctx.render('signup.pug', {
        user: userData,
        countries: countryRows,
        errors: ctx.errors
    });
}

async function logOut(ctx, next) {

    await next();

    if(ctx.session.userData) {
        ctx.session.userData = null;
        ctx.redirect('/products');
    }
}

async function confirmAccount(ctx, next) {

    let userTempData = await ctx.myPool().query(`
        SELECT *
        FROM temp_codes
        WHERE
            hash = ?
        `, [ctx.params.code]);

    let message;

    if (userTempData.length > 0) {

        let userId = userTempData[0].user_id;

        let resultSetHeader = await ctx.myPool().query(`
            UPDATE users
            SET confirmed = 1
            WHERE
                id = ?
            `, [userId]);

        if(resultSetHeader) {

            await ctx.myPool().query(`
                DELETE
                FROM temp_codes
                WHERE
                    hash = ?
                `, [ctx.params.code]);

            message = 'You succecssfully validated your account.';
        } else {
            message = 'There was a problem confirming your account.';
        }
    } else {
        message = 'Link is invalid or has expired.';
    }

    ctx.render('login.pug', {
        message: message,
        user: {}
    });
}

module.exports = { renderLogin, login, renderSignUp, signUp, logOut, confirmAccount };
