module.exports = {
  millisToMinutesAndSeconds: function (millis) {
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    return "00:" + minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
  },
  secondsFormat: function (seconds) {
    var date = new Date(1970,0,1);
    date.setSeconds(seconds);
    return date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
  },
  getTrackData: function (track, streamurl, streamtype, duration, author, image) {
    // Descrition
    var desc = track['description'];
    desc = desc.replace(/(?:\r\n|\r|\n)/g, '<br />');
    desc = desc.linkify();

    // Tags
    var tags = '';
    if (track['tag_list'].length) {
      tags = track['tag_list'].split(' ').join(',')
    }

    return {
      id: track['id'],
      title: track['title'],
      link: track['permalink_url'],
      description: '<![CDATA[' + desc + ']]>',
      'itunes:subtitle': track['description'].split('.')[0],
      'itunes:summary': track['description'],
      'itunes:author': author,
      pubDate: new Date(track['created_at']).toUTCString(),
      'itunes:duration': duration,
      'itunes:keywords': tags,
      'itunes:explicit': 'no',
      enclosure: {
        '@': {
          url: 'https://askph.herokuapp.com/' + streamurl + '.' + streamtype,
          length: track['original_content_size'],
          type: 'audio/mpeg'
        }
      },
      guid: 'https://askph.herokuapp.com/' + streamurl + '.' + streamtype,
      'itunes:image': {
        '@': {
          href: image
        }
      }
    };
  },
  getRSSFeed: function (settings, tracks, endpoint) {
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

    return {
      '?xml version="1.0" encoding="utf-8"?' : null,
      'rss': {
        '@': {
          'version': '2.0',
          'xmlns:itunes': 'http://www.itunes.com/dtds/podcast-1.0.dtd',
          'xmlns:atom': 'http://www.w3.org/2005/Atom'
        },
        '#': {
          'channel': {
            'title': settings['title'],
            'atom:link': {
              '@': {
                'href': 'https://askph.herokuapp.com/' + endpoint,
                'rel': 'self',
                'type': 'application/rss+xml'
              }
            },
            'itunes:subtitle': settings['itunes_sub'],
            'itunes:summary': settings['itunes_summary'],
            'description': settings['description'],
            'itunes:author': settings['itunes_user'],
            'itunes:owner': {
              'itunes:name': settings['itunes_user'],
              'itunes:email': settings['itunes_email']
            },
            'itunes:category': {
              '@': {
                'text': mainCat
              },
              '#': {
                'itunes:category': categories
              }
            },
            'itunes:keywords': settings['itunes_keywords'],
            'itunes:explicit': 'no',
            'link': 'http://www.ph-creative.com',
            'itunes:image': {
              '@': {
                'href': settings['itunes_image']
              }
            },
            'pubDate': d.toUTCString(),
            'lastBuildDate': d.toUTCString(),
            'language': settings['language'],
            'copyright': '&#xA9; ' + d.getFullYear() + ' Ph.Creative',
            'item': tracks
          }
        }
      }
    };
  },
  sendError: function (res) {
    res.send('Error with podcast feed. Please try again later.');
  }
};
