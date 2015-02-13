var express = require('express'),
        app = express(),
      askph = require('./lib/askph.js'),
 askphVideo = require('./lib/askph-video.js'),
      chalk = require('chalk'),
    cluster = require('cluster'),
recruitment = require('./lib/recruitment.js');

if(!String.linkify) {
  String.prototype.linkify = function() {
    // http://, https://, ftp://
    var urlPattern = /\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim;

    // www. sans http:// or https://
    var pseudoUrlPattern = /(^|[^\/])(www\.[\S]+(\b|$))/gim;

    // Email addresses
    var emailAddressPattern = /[\w.]+@[a-zA-Z_-]+?(?:\.[a-zA-Z]{2,6})+/gim;

    return this
        .replace(urlPattern, '<a href="$&" target="_blank">$&</a>')
        .replace(pseudoUrlPattern, '$1<a href="http://$2" target="_blank">$2</a>')
        .replace(emailAddressPattern, '<a href="mailto:$&">$&</a>');
  };
}

// Load env file
if (process.env['client_id'] == undefined) {
  var env = require('node-env-file');
  env(__dirname + '/.env');
}

if (cluster.isMaster) {
  var cpuCount = require('os').cpus().length;

  // Create a worker for each CPU
  for (var i = 0; i < cpuCount; i += 1) {
    cluster.fork();
  }

  cluster.on('exit', function (worker) {
    cluster.fork();
  });
} else {
  app.use(express.static(process.cwd() + '/public'));
  // Listen for the feed URL
  app.get('/feed', function (req, res) {
    console.log('REQ: Request for audio feed received');

    // Create new class
    new askph(req, res);
  });

  app.get('/feed/recruitment', function (req, res) {
    console.log('REQ: Request for audio feed received');

    // Create new class
    new recruitment(req, res);
  });

  // Get video video
  app.get('/feed/video', function (req, res) {
    console.log('REQ: Request for video feed received');

    // Create new class
    new askphVideo(req, res);
  });

  app.get('/:track_id.mp3', function (req, res) {
    var request = require('request');
    var settings = require('./lib/settings.json');

    var url = 'https://api.soundcloud.com/tracks/' + req.params.track_id + '/stream?client_id=' + process.env['client_id'];
    console.log('REQ: Request for track ID `%s` received', req.params.track_id);

    req.pipe(request(url)).pipe(res);
  });

  // Get the video
  var streamVideo = function (req, res, url, request, querystring) {
    request(url, function (err, response, body) {
      var qstring = querystring.parse(body);
      var videoString = querystring.parse(qstring['url_encoded_fmt_stream_map']);
      var videoUrl = videoString['url'];

      if (Array.isArray(videoUrl)) {
        videoUrl = videoUrl[2];
      }

      request.get(videoUrl).on('response', function (respon) {
        if (respon.statusCode === 403) {
          streamVideo(req, res, url, request, querystring);
        } else {
          req.pipe(request(videoUrl)).pipe(res);
        }
      });
    });
  };
  app.get('/:video_id.MP4', function (req, res) {
    var request = require('request');
    var querystring = require('querystring');
    var settings = require('./lib/settings.json');
    var id = req.params.video_id;
    var url = settings['videoinfo'] + id + '&asv=3';

    console.log('REQ: Request for video ID `%s` received', id);

    streamVideo(req, res, url, request, querystring);
  });

  // Start server
  console.log('app: ' + chalk.green('#AskPh Podcast Feed'));
  console.log('app: ' + '==========\napp: ');
  console.log('app: ' + ' ~~~> Starting app...');

  var server;
  var start = function () {
    server = app.listen(process.env.PORT || 3000, function () {
      var host = server.address().address;
      var port = server.address().port;

      console.log('app: ' + '\napp:  ~~~> Application has started.');
      console.log('app: ' + ' ~~~> Listening on port %s', port);
      console.log('app: ' + ' ~~~> Enjoy!\napp: ');
      console.log('app: ' + ' ~~~> Logging requests received:');
    });
  };
  start();

  module.exports = {
    stop: function () {
      console.log('app:');
      console.log('app:  ~~~> Stopping server');
      server.close();
    },
     start: start
  };
}
