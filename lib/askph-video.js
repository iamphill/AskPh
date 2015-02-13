var settings = require('./settings.json'),
     request = require('request'),
         o2x = require('object-to-xml'),
        feed = require('./feed.js');

function secondsFormat(seconds) {
  var date = new Date(1970,0,1);
  date.setSeconds(seconds);
  return date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
}

// Create AskPhVideo class
var AskPhVideo = function (req, res) {
  this.req = req;
  this.res = res;

  // Get soundcloud feed
  this.getFeed();
};
AskPhVideo.prototype.construct = AskPhVideo;

// Get playlist feed
AskPhVideo.prototype.getFeed = function () {
  // Create URL string
  var url = settings.ytendpoint;

  // Send the request to the endpoint
  request(url, (function (error, response, body) {
    if (!error) {
      // Parse JSON
      var json = JSON.parse(body);

      // Loop all the tracks
      var tracks = [];
      json['feed']['entry'].forEach(function (track) {
        // Create the data needed
        var seconds = feed.secondsFormat(parseInt(track['media$group']['yt$duration']['seconds']));
        var d = {
          'id': track['id']['$t'].split('/')[track['id']['$t'].split('/').length - 1],
          'title': track['media$group']['media$title']['$t'],
          'permalink_url': track['link'][0]['href'],
          'description': track['content']['$t'],
          'created_at': track['published']['$t'],
          'duration': parseInt(track['media$group']['yt$duration']['seconds']),
          'tag_list': [],
        };

        tracks.push(feed.getTrackData(d, track['id']['$t'].split('/')[track['id']['$t'].split('/').length - 1], 'MP4', seconds, settings['itunes_user'], settings['itunes_image']));
      });

      // Render the body
      this.renderBody(tracks);
    } else {
      feed.sendError(res);
    }
  }).bind(this));
};

// Render the body
AskPhVideo.prototype.renderBody = function (tracks) {
    // Set XML header
    this.res.set('Content-Type', 'text/xml');
    this.res.send(o2x(feed.getRSSFeed(settings, tracks, 'feed/video')));
};

module.exports = AskPhVideo;
