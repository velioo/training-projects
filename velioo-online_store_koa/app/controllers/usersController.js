const logger = require('../helpers/logger');
const sha256 = require('js-sha256').sha256;
const crypto = require('crypto');
const assert = require('assert');
const nodemailer = require('nodemailer');
const {emailExists} = require('../helpers/validations');

async function renderLogin(ctx, next) {
    ctx.data = {user: {}};
    if (ctx.session.userData) {
        return ctx.redirect('/products');
    }
    await next();
    ctx.render('login.pug', ctx.data);
}

async function login(ctx, next) {
    ctx.data = {user: {}};
    let userData = await ctx.myPool().query("SELECT password, salt, id, confirmed FROM users WHERE email = ?", [ctx.request.body.email]);
    if (userData instanceof Array && userData.length === 1 && (sha256(ctx.request.body.password + userData[0].salt) === userData[0].password)) {
        
        if (userData[0].confirmed == 1) {
            ctx.session.userData = {userId: userData[0].id};
            ctx.redirect('products');
        } else {
            ctx.data.message = "Email is not confirmed";
        }
        await next();
        return ctx.render('login.pug', ctx.data);
    } else {
        ctx.data.message = "Wrong username or password";
    }
    
    if(ctx.session.message) {
        ctx.data.message = ctx.session.message;
        ctx.session.message = "";
    }
    await next();
    ctx.render('login.pug', ctx.data);
}


async function renderSignUp(ctx, next) {
    ctx.data = {user: {}}
    if (ctx.session.userData) {
        return ctx.redirect('/products');
    }
    ctx.data.countries = await ctx.myPool().query("SELECT nicename, phonecode FROM countries");
    await next();
    ctx.render('signup.pug', ctx.data);
}

async function signUp(ctx, next) {
    
    ctx.data = {}
    
    ctx.checkBody('name').len(2, 20, "Name is too long or too short");
    ctx.checkBody('last_name').optional().empty().len(2, 20, "Last name is too long or too short");
    ctx.checkBody('email').isEmail("Your entered a bad email.");
    ctx.checkBody('phone').replace(' ', '').match(/\+(9[976]\d|8[987530]\d|6[987]\d|5[90]\d|42\d|3[875]\d|2[98654321]\d|9[8543210]|8[6421]|6[6543210]|5[87654321]|4[987654310]|3[9643210]|2[70]|7|1)\d{1,14}$/, "Your entered a bad phone.");
    ctx.checkBody('country').optional().empty().len(2, 64, "Country is too long or too short");
    ctx.checkBody('region').optional().empty().len(2, 64, "Region is too long or too short");
    ctx.checkBody('street_address').optional().empty().len(2, 64, "Street address is too long is invalid");
    ctx.checkBody('password').len(8, 255, "Password is too short or too long");
    ctx.checkBody('conf_password').eq(ctx.request.body.password);
    
    if(await emailExists(ctx)) {
        console.log("email exists");
        ctx.errors.push({email_exists: "Email already exists."});
    }
    
    console.log(ctx.request.body);
    
    let salt = crypto.randomBytes(32).toString('base64');
    
    ctx.data.user = {
        'name': ctx.request.body.name,
        'last_name': ctx.request.body.last_name,
        'email': ctx.request.body.email,
        'password': sha256(ctx.request.body.password + salt),
        'salt': salt,
        'gender': ctx.request.body.gender,
        'phone': ctx.request.body.phone,
        'phone_unformatted': ctx.request.body.phone.replace(' ', ''),
        'country': ctx.request.body.country,
        'region': ctx.request.body.region,
        'street_address': ctx.request.body.street_address
    };

    let userData = [
        ctx.request.body.name,
        ctx.request.body.last_name,
        ctx.request.body.email,
        sha256(ctx.request.body.password + salt),
        salt,
        ctx.request.body.gender,
        ctx.request.body.phone,
        ctx.request.body.phone.replace(' ', ''),
        ctx.request.body.country,
        ctx.request.body.region,
        ctx.request.body.street_address
    ];

    if(!ctx.errors) {
        userData[6].replace(/[^0-9]/, "");
        let query = await ctx.myPool().query("INSERT INTO users (name, last_name, email, password, salt, gender, phone, phone_unformatted, country, region, street_address)\
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", userData);
        
        if(query) {
            
            //~ var smtpTransport = mailer.createTransport("SMTP",{
            //~ service: "Gmail",
            //~ auth: {
                //~ user: "vanime.staff@gmail.com",
                //~ pass: ""
                //~ }
            //~ });
            //~ var mail = {
                //~ from: "Darth Velioo <velioocs@gmail.com>",
                //~ to: ctx.request.body.email,
                //~ subject: "Confirm email",
                //~ text: "Hello There",
                //~ html: "Confirm Account: <p><a href='//localhost:8883/confirm_account'> \nClick here </a></p>"
            //~ }

            //~ smtpTransport.sendMail(mail, function(error, response){
                //~ if(error) {
                    //~ ctx.session.message = "There was a problem while sending confirmation email";
                //~ } else {
                    //~ ctx.session.message = "You successfully signed up";
                //~ }
                
                //~ smtpTransport.close();
            //~ });
            ctx.session.message = "You successfully signed up";
            ctx.redirect('login');
        } else {
            ctx.render('signup.pug', ctx.data);
        }
    } else {
        ctx.data.errors = ctx.errors;
        ctx.data.countries = await ctx.myPool().query("SELECT nicename, phonecode FROM countries");
        ctx.render('signup.pug', ctx.data);
    }
}

async function logOut(ctx, next) {
    ctx.data = {};
    ctx.session = null;
    await next();
    ctx.redirect('products');
}

async function confirmAccount(ctx, next) {
    ctx.body = "Not yet implemented";
}


module.exports = {renderLogin, login, renderSignUp, signUp, logOut, confirmAccount}
