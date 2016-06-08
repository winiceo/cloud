var express = require('express');
 var ParseDashboard = require('parse-dashboard');
var Primus = require('primus.io');
var path = require("path");


var dashboard = new ParseDashboard({
    "apps": [
        {
            "serverURL": "http://baas.71an.com:7123/parse",
            "appId": "71an",
            "masterKey": "1123581321",
            "appName": "My Parse Server App",
            "iconName": "MyAppIcon.png",
        }
    ],
    "users": [
        {
            "user": "leven",
            "pass": "56os.com",
            "apps": [{"appId": "71an"}]
        }],
    allowInsecureHTTP:true
});

var app = express();


// make the Parse Server available at /parse

// make the Parse Dashboard available at /dashboard
app.use('/dashboard', dashboard);

app.use('/', express.static(path.join(__dirname, '/public')));


var httpServer = require('http').createServer(app);


var secret = 'qwrj;ladf;afafsf';
var jwt = require('jwt-simple');


// Primus server
var primus = new Primus(httpServer, {transformer: 'websockets', parser: 'JSON'});

primus.authorize(function (req, authorized) {
    var token = req.query.token,
        error, payload;

    if (!token) {
        error = new Error('Missing access token');
        console.error(error.message);
        return authorized(error);
    }

    //
    // `jwt-simple` throws errors if something goes wrong when decoding the JWT.
    //
    try {
        payload = jwt.decode(token, secret);
    } catch (e) {
        console.error(e.message);
        return authorized(e);
    }
    console.log(payload)

    //
    // At this point we have decoded and verified the token. Check if it is
    // expired.
    //
    if (Date.now() > payload.exp) {
        error = new Error('Expired access token');
        console.error(error.message);
        return authorized(error);
    }


    //
    // Check if the user is still present and allowed in our db. You could tweak
    // this to invalidate a token.
    //
    // var user = db.getUser(payload.iss);
    // if (!user || user.deauthorized) {
    //     error = new Error('Invalid access token');
    //     console.error(error.message);
    //     return authorized(error);
    // }

    authorized();

});

primus.on('connection', function (spark) {

    spark.on('message', function (data) {
        console.log(data);

        primus.send(data.cate, data);
    });
});
app.use('/', express.static(path.join(__dirname, '/public')));

// serve index.html
app.get('/login', function (req, res) {
    Parse.User.logIn("leven", "56os.com", {
        success: function (user) {
            var currentUser = Parse.User.current();
            if (currentUser) {

                console.log(currentUser)
                // do stuff with the user
            } else {
                var timestamp = Date.now();
                var token = jwt.encode({
                    exp: timestamp + 10 * 60 * 1000, // Expiration Time.
                    iat: timestamp,                  // Issued at.
                    iss: user              // Issuer.
                }, secret);
                console.log(token)
                console.log(user.getSessionToken())
                return res.send({token: token})
                // show the signup or login page
            }
            //user.session=user.getSessionToken();

            // Do stuff after successful login.
        },
        error: function (user, error) {
            // The login failed. Check error to see why.
        }
    });
});


var fs = require('fs');

var https = require('https');


var credentials = {key: fs.readFileSync('key.pem'), cert: fs.readFileSync('cert.pem')};

var httpsServer = https.createServer(credentials, app);





httpsServer.listen(8443);


