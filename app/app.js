const apiReq = require('./api_request');
const express = require('express');
const app = express();

var jsonString = apiReq.getJsonFromRequest(null);
var object = apiReq.tryParseJsonString(jsonString);
console.log(object);

app.get('/', function(req, res) {
  res.send('I want to check on your credentials...');
});

app.listen(3000, function() {
  console.log('listening on port 3000');
});
