var express = require('express'),
        app = express(),
      askph = require('./lib/askph.js');

// Listen for the feed URL
app.get('/feed', function (req, res) {
  // Create new class
  new askph(req, res);
});

// Start server
var server = app.listen(process.env.PORT || 3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('askph podcast app listening at http://%s:%s', host, port);
});
