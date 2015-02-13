var settings = require('./recruitment.json'),
     request = require('request'),
         o2x = require('object-to-xml'),
        feed = require('./feed.js');

// Create RecruitmentPodcast class
var RecruitmentPodcast = function (req, res) {
  this.req = req;
  this.res = res;

  // Get soundcloud feed
  this.getFeed();
};
RecruitmentPodcast.prototype.construct = RecruitmentPodcast;

// Get playlist feed
RecruitmentPodcast.prototype.getFeed = function () {
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
      tracks.push(feed.getTrackData(track, track['id'], 'mp3', feed.millisToMinutesAndSeconds(track['duration']), settings['itunes_user'], settings['itunes_image']));
    });

    // Render the body
    this.renderBody(tracks);
  }).bind(this));
};

// Render the body
RecruitmentPodcast.prototype.renderBody = function (tracks) {
  // Set XML header
  this.res.set('Content-Type', 'text/xml');
  this.res.send(o2x(feed.getRSSFeed(settings, tracks, 'feed/recruitment')));
};

module.exports = RecruitmentPodcast;
