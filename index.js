var express = require('express'),
        app = express(),
      askph = require('./lib/askph.js'),
 askphVideo = require('./lib/askph-video.js'),
      chalk = require('chalk');

// Load env file
if (process.env['client_id'] == undefined) {
  var env = require('node-env-file');
  env(__dirname + '/.env');
}

app.use(express.static(process.cwd() + '/public'));
// Listen for the feed URL
app.get('/feed', function (req, res) {
  console.log('REQ: Request for audio feed received');

  // Create new class
  new askph(req, res);
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
app.get('/:video_id.MP4', function (req, res) {
  var request = require('request');
  var querystring = require('querystring');
  var settings = require('./lib/settings.json');
  var id = req.params.video_id;
  var url = settings['videoinfo'] + id

  console.log('REQ: Request for video ID `%s` received', id);

  request(url, function (err, response, body) {
    var qstring = querystring.parse(body);
    var videoString = querystring.parse(qstring['url_encoded_fmt_stream_map']);
    var videoUrl = videoString['url'];

    if (Array.isArray(videoUrl)) {
      videoUrl = videoUrl[0];
    }

    req.pipe(request(videoUrl)).pipe(res, {
      end: false
    });
  });
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
