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
            url: track['stream_url'].replace("https", "http") + '?client_id=' + settings['client_id'],'https://ec-media.soundcloud.com/YdoSiX6xss7O.128.mp3?f10880d39085a94a0418a7ef69b03d522cd6dfee9399eeb9a522039d6dfcb73db71862962f6eaaf72d916858ca5dc7023f4953800b65001dd45e66f2a35ce6461e6ebad02e&AWSAccessKeyId=AKIAJNIGGLK7XA7YZSNQ&Expires=1421249102&Signature=QkvA0ClM1ZN940%2F8WP6IKTk2IiM%3D',
            length: track['original_content_size'],
            type: 'audio/mpeg'
          }
        },
        guid: track['stream_url'].replace("https", "http") + '?client_id=' + settings['client_id'],
        'itunes:image': {
          '@': {
            href: track['artwork_url'].replace("https", "http").replace("large", "t500x500")
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
        'xmlns:atom': 'http://www.w3.org/2005/Atom'
      },
      '#': {
        channel: {
          title: settings['title'],
          'atom:link': {
            '@': {
              href: 'https://askph.herokuapp.com/feed',
              rel: 'self',
              type: 'application/rss+xml'
            }
          },
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
