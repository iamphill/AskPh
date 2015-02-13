var settings = require('./settings.json'),
     request = require('request'),
         o2x = require('object-to-xml');

function millisToMinutesAndSeconds(millis) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return "00:" + minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
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
  url = url.replace('[CLIENT_ID]', process.env['client_id']);

  // Send the request to the endpoint
  request(url, (function (error, response, body) {
    // Parse JSON
    var json = JSON.parse(body);

    // Loop all the tracks
    var tracks = [];
    json['tracks'].forEach(function (track) {
      var desc = track['description'];
      desc = desc.linkify();

      // Create the data needed
      var data = {
        id: track['id'],
        title: track['title'],
        link: track['permalink_url'],
        description: '<![CDATA[' + desc + ']]>',
        'itunes:subtitle': track['description'].split('.')[0],
        'itunes:summary': track['description'],
        'itunes:author': settings['itunes_user'],
        pubDate: new Date(track['created_at']).toUTCString(),
        'itunes:duration': millisToMinutesAndSeconds(track['duration']),
        'itunes:keywords': track['tag_list'].split(' ').join(','),
        'itunes:explicit': 'no',
        enclosure: {
          '@': {
            url: 'https://askph.herokuapp.com/' + track['id'] + '.mp3',
            length: track['original_content_size'],
            type: 'audio/mpeg'
          }
        },
        guid: 'https://askph.herokuapp.com/' + track['id'] + '.mp3',
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
AskPh.prototype.renderBody = function (tracks) {
  // Get todays date
  var d = new Date();

  var categories = settings['itunes_cat'];
  var mainCat = categories[0];

  if (Array.isArray(categories)) {
    var cats = [];

    categories.forEach(function (cat, i) {
      if (i > 0) {
        cats.push({
            '@': {
              text: cat
            }
        });
      }
    });
    categories = cats;
  }

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
          'itunes:summary': settings['itunes_summary'],
          description: settings['description'],
          'itunes:author': settings['itunes_user'],
          'itunes:owner': {
            'itunes:name': settings['itunes_user'],
            'itunes:email': settings['itunes_email']
          },
          'itunes:category': {
            '@': {
              text: mainCat
            },
            '#': {
              'itunes:category': categories
            }
          },
          'itunes:keywords': settings['itunes_keywords'],
          'itunes:explicit': 'no',
          link: 'http://www.ph-creative.com',
          'itunes:image': {
            '@': {
              href: settings['itunes_image']
            }
          },
          pubDate: d.toUTCString(),
          lastBuildDate: d.toUTCString(),
          language: settings['language'],
          copyright: '&#xA9; ' + d.getFullYear() + ' Ph.Creative',
          item: tracks
        }
      }
    }
  }));
};

module.exports = AskPh;
