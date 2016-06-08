var express = require('express'),
    Primus = require('primus.io'),
    http = require('http'),
    app = express(),
    server = http.createServer(app);
path=require("path");
console.log(324234)
var Parse = require('parse/node');
Parse.initialize("71an.com", "71an.com");
//Parse.serverUrl=("http://localhost:4040/parse");
Parse.CoreManager.set('SERVER_URL', "http://baas.71an.com:8043/parse");




var user = new Parse.User();
user.set("username", "my name");
user.set("password", "my pass");
user.set("email", "email@example.com");

// other fields can be set just like with Parse.Object
user.set("phone", "415-392-0202");

// user.signUp(null, {
//   success: function(user) {
//     console.log(user)
//     // Hooray! Let them use the app now.
//   },
//   error: function(user, error) {
//     // Show the error message somewhere and let the user try again.
//     console.log("Error: " + error.code + " " + error.message);
//   }
// });

var secret = 'shhhh, very secret';
var jwt = require('jwt-simple');



// Primus server
var primus = new Primus(server, { transformer: 'websockets', parser: 'JSON' });

primus.authorize(function(req,authorized) {
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
app.use('/', express.static(path.join(__dirname, '/public')));

// serve index.html
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
          iat: timestamp,                  // Issued at.
          iss: user              // Issuer.
        }, secret);
        console.log(token)
        console.log(user.getSessionToken())
        return res.send({token:token})
        // show the signup or login page
      }
      //user.session=user.getSessionToken();

      // Do stuff after successful login.
    },
    error: function(user, error) {
      console.log(error)
      // The login failed. Check error to see why.
    }
  });
});

server.listen(8122);
