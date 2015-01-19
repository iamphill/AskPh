var express = require('express'),
        app = express(),
      askph = require('./lib/askph.js'),
      chalk = require('chalk');

// Listen for the feed URL
app.get('/feed', function (req, res) {
  console.log('REQ: Request for feed received');

  // Create new class
  new askph(req, res);
});

app.get('/:track_id.mp3', function (req, res) {
  var request = require('request');
  var settings = require('./lib/settings.json');
  var fs = require('fs');

  var url = 'https://api.soundcloud.com/tracks/' + req.params.track_id + '/stream?client_id=' + settings['client_id'];

  console.log('REQ: Request for track ID `%s` received', req.params.track_id);

  request(url).pipe(res);
});

app.get('/', function (req, res) {
  console.log('REQ: Index page requested. ' + chalk.red('404'));
  res.status(404).send('404z! Better try again on another URL');
});

// Start server
console.log('app: ' + chalk.green('#AskPh Podcast Feed'));
console.log('app: ' + '==========\napp: ');
console.log('app: ' + ' ~~~> Starting app...');

var server = app.listen(process.env.PORT || 3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('app: ' + '\napp:  ~~~> Application has started.');
  console.log('app: ' + ' ~~~> Listening on port %s', port);
  console.log('app: ' + ' ~~~> Enjoy!\napp: ');
  console.log('app: ' + ' ~~~> Logging requests received:');
});
