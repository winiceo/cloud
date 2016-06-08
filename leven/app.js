var express = require('express')
var ParseServer = require('parse-server').ParseServer;
var ParseDashboard = require('parse-dashboard');
var Primus = require('primus.io');
var path = require("path");



var api = new ParseServer({
    databaseURI: 'mongodb://localhost:27017',
    cloud: './cloud/main.js',
    appId: '71an.com',
    fileKey: '71an.com',
    restAPIKey: "71an.com",
    javascriptKey: "71an.com",
    masterKey: '71an.com',
    liveQuery: {
        classNames: ['Player']
    },
    // push: {
    // News: {
    //       senderId: '71an.com',
    //       apiKey: '71an.com'
    //     }
    //  }, // See the Push wiki page
    // filesAdapter:{},
    serverURL: 'https://baas.71an.com/parse',

    keyPairs: {
        "restAPIKey": "71an.com",
        "javascriptKey": "71an.com",
        "clientKey": "71an.com",
        "windowsKey": "71an.com",
        "masterKey": "71an.com"
    },

    websocketTimeout: 10 * 1000,
    cacheTimeout: 60 * 600 * 1000,
    logLevel: 'VERBOSE'
});


var dashboard = new ParseDashboard({
    "apps": [{
        "serverURL": "https://baas.71an.com/parse",
        "appId": "71an.com",
        "masterKey": "71an.com",
        "appName": "My Parse Server App",
        "iconName": "MyAppIcon.png",
    }],
    "users": [{
        "user": "leven",
        "pass": "56os.com",
        "apps": [{ "appId": "71an.com" }]
    }],
    allowInsecureHTTP: true
});




var secret = 'qwrj;ladf;afafsf';
var jwt = require('jwt-simple');


// Primus server


// serve index.html

module.exports.create = function(server, host, port, publicDir) {
    var app = express();

    app.use(express.static(publicDir));
    app.use('/parse', api);
    app.use('/1', api);
    app.use('/dashboard', dashboard);

    app.get('/login', function(req, res) {
        Parse.User.logIn("leven", "56os.com", {
            success: function(user) {
                var currentUser = Parse.User.current();
                if (currentUser) {

                    console.log(currentUser)
                        // do stuff with the user
                } else {
                    var timestamp = Date.now();
                    var token = jwt.encode({
                        exp: timestamp + 10 * 60 * 1000, // Expiration Time.
                        iat: timestamp, // Issued at.
                        iss: user // Issuer.
                    }, secret);
                    console.log(token)
                    console.log(user.getSessionToken())
                    return res.send({ token: token })
                        // show the signup or login page
                }
                //user.session=user.getSessionToken();

                // Do stuff after successful login.
            },
            error: function(user, error) {
                // The login failed. Check error to see why.
            }
        });
    });
    app.use('/', express.static(path.join(__dirname, '/public')));
    ParseServer.createLiveQueryServer(server);
    var primus = new Primus(server, { transformer: 'websockets', parser: 'JSON' });

    primus.authorize(function(req, authorized) {
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

    primus.on('connection', function(spark) {

        spark.on('message', function(data) {
            console.log(data);

            primus.send(data.cate, data);
        });
    });
    return app;
};
