var settings = require('./settings.json'),
     request = require('request'),
         o2x = require('object-to-xml');

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
            url: 'https://askph.herokuapp.com/' + track['id']['$t'].split('/')[track['id']['$t'].split('/').length - 1] + '.MP4',
            length: 50000,
            type: 'video/mp4'
          }
        },
        guid: 'https://askph.herokuapp.com/' + track['id']['$t'].split('/')[track['id']['$t'].split('/').length - 1] + '.MP4',
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

module.exports = AskPhVideo;
