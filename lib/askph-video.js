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
    // Parse JSON
    var json = JSON.parse(body);

    // Loop all the tracks
    var tracks = [];
    json['feed']['entry'].forEach(function (track) {
      var desc = track['content']['$t'];
      desc = desc.replace(/@[a-zA-Z0-9-_]+/gi, "<a href='https://twitter.com/$&'>$&</a>");

      // Create the data needed
      var data = {
        id: track['id']['$t'].split('/')[track['id']['$t'].split('/').length - 1],
        title: track['media$group']['media$title']['$t'],
        link: track['link'][0]['href'],
        description: '<![CDATA[' + desc + ']]>',
        'itunes:subtitle': track['content']['$t'].split('.')[0],
        'itunes:summary': track['content']['$t'],
        'itunes:author': settings['itunes_user'],
        pubDate: new Date(track['published']['$t']).toUTCString(),
        'itunes:duration': secondsFormat(parseInt(track['media$group']['yt$duration']['seconds']), 10),
        'itunes:keywords': '',
        'itunes:explicit': 'no',
        enclosure: {
          '@': {
            url: 'http://askph.herokuapp.com/' + track['id']['$t'].split('/')[track['id']['$t'].split('/').length - 1] + '.MP4',
            type: 'video/mp4'
          }
        },
        guid: 'http://askph.herokuapp.com/' + track['id']['$t'].split('/')[track['id']['$t'].split('/').length - 1] + '.MP4',
        'itunes:image': {
          '@': {
            href: settings['itunes_image']
          }
        }
      };

      tracks.push(data);
    });

    // Render the body
    this.renderBody(tracks);
  }).bind(this));
};

// Render the body
AskPhVideo.prototype.renderBody = function (tracks) {
    // Set XML header
    this.res.set('Content-Type', 'text/xml');
    this.res.send(o2x(feed.getRSSFeed(settings, tracks, 'feed/video')));
};

module.exports = AskPhVideo;
