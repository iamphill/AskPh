var settings = require('./settings.json'),
     request = require('request'),
         o2x = require('object-to-xml'),
        feed = require('./feed.js');

// Create askph class
var AskPh = function (req, res) {
  this.req = req;
  this.res = res;

  // Get soundcloud feed
  this.getFeed();
};
AskPh.prototype.construct = AskPh;

// Get playlist feed
AskPh.prototype.getFeed = function () {
  // Create URL string
  var url = settings.endpoint;
  url = url.replace('[PLAYLIST_ID]', settings['playlist_id']);
  url = url.replace('[CLIENT_ID]', process.env['client_id']);

  // Send the request to the endpoint
  request(url, (function (error, response, body) {
    // Parse JSON
    var json = JSON.parse(body);

    // Loop all the tracks
    var tracks = [];
    json['tracks'].forEach(function (track) {
      // Create the data needed
      tracks.push(feed.getTrackData(track, settings['itunes_user'], settings['itunes_image']));
    });

    // Render the body
    this.renderBody(tracks);
  }).bind(this));
};

// Render the body
AskPh.prototype.renderBody = function (tracks) {
  // Set XML header
  this.res.set('Content-Type', 'text/xml');
  this.res.send(o2x(feed.getRSSFeed(settings, tracks, 'feed')));
};

module.exports = AskPh;
