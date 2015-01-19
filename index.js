var express = require('express'),
        app = express(),
      askph = require('./lib/askph.js');

// Listen for the feed URL
app.get('/feed', function (req, res) {
  // Create new class
  new askph(req, res);
});

app.get('/:track_id.mp3', function (req, res) {
  var request = require('request');
  var settings = require('./lib/settings.json');
  var fs = require('fs');

  var url = 'https://api.soundcloud.com/tracks/' + req.params.track_id + '/stream?client_id=' + settings['client_id'];

  request.get(url, function (error, response, body) {
    res.end(body);
  });
});

// Start server
var server = app.listen(process.env.PORT || 3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('askph podcast app listening at http://%s:%s', host, port);
});
