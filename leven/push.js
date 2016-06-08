// var Parse = require('parse/node');

// Parse.initialize("71ancom", "71an.com");
// Parse.ServerURL="http://localhost:4040/parse";


// var Parse = require('parse/node');
// Parse.initialize("71ancom", "71an.com");
// Parse.ServerURL="http://localhost:4040/parse";


let Parse = require('parse/node');
Parse.initialize("71ancom", "71an.com");
let LiveQueryClient = Parse.LiveQueryClient;
let client = new LiveQueryClient({
  applicationId: '71an.com',
  serverURL: 'ws://baas.71an.com:8043/parse',
  javascriptKey: '71an.com',
  masterKey: '71an.com'
});

// var LiveQueryClient = Parse.LiveQueryClient;
// var client = new LiveQueryClient({
//   applicationId: '71an.com',
//   serverURL: 'ws://localhost:4040/',
//   javascriptKey: '71an.com',
//   masterKey: '71an.com'
// });
client.open();

 
var query = new Parse.Query('Player');
///query.equalTo('name', 'leven');

 
 
let subscription = client.subscribe(query);
//var subscription = query.subscribe();

subscription.on('create', (person) => {
  console.log(person.get("name"));
});