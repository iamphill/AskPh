var settings = require('./settings.json'),
     request = require('request'),
         o2x = require('object-to-xml');

function millisToMinutesAndSeconds(millis) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}

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
  url = url.replace('[CLIENT_ID]', settings['client_id']);

  // Send the request to the endpoint
  request(url, (function (error, response, body) {
    // Parse JSON
    var json = JSON.parse(body);

    // Loop all the tracks
    var tracks = [];
    json['tracks'].forEach(function (track) {
      console.log(track);
      // Create the data needed
      var data = {
        title: track['title'],
        description: track['description'],
        'itunes:subtitle': track['title'],
        'itunes:summary': track['description'],
        'itunes:author': settings['itunes_user'],
        pubDate: new Date(track['created_at']).toUTCString(),
        'itunes:duration': millisToMinutesAndSeconds(track['duration']),
        enclosure: {
          '@': {
            url: track['stream_url'] + '?client_id=' + settings['client_id'],
            length: track['original_content_size'],
            type: 'audio/mpeg'
          }
        },
        'itunes:image': {
          '@': {
            href: track['artwork_url']
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
AskPh.prototype.renderBody = function (tracks) {
  // Get todays date
  var d = new Date();

  // Set XML header
  this.res.set('Content-Type', 'text/xml');
  this.res.send(o2x({
    '?xml version="1.0" encoding="utf-8"?' : null,
    rss: {
      '@': {
        version: '2.0',
        'xmlns:itunes': 'http://www.itunes.com/dtds/podcast-1.0.dtd',
        'xmlns:media': 'http://search.yahoo.com/mrss/'
      },
      '#': {
        channel: {
          title: settings['title'],
          'itunes:subtitle': settings['itunes_sub'],
          'itunes:summary': settings['description'],
          description: settings['description'],
          'itunes:author': settings['itunes_user'],
          'itunes:owner': {
            'itunes:name': settings['itunes_user'],
            'itunes:email': settings['itunes_email']
          },
          'itunes:category': {
            '@': {
              text: settings['itunes_cat']
            }
          },
          'itunes:explicit': 'clean',
          link: 'https://soundcloud.com/ph-creative',
          'itunes:image': {
            '@': {
              href: settings['itunes_image']
            }
          },
          pubDate: d.toUTCString(),
          language: settings['language'],
          copyright: 'Copyright ' + d.getFullYear() + ' Ph.Creative',
          item: tracks
        }
      }
    }
  }));
};

module.exports = AskPh;
