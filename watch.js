var fs = require('fs');
var server = require('./index.js');

fs.watch('lib', function (event, filename) {
  if (event === 'change') {
    server.stop();

    delete require.cache[require.resolve('./index.js')];
    delete require.cache[require.resolve('./lib/askph.js')];
    delete require.cache[require.resolve('./lib/askph-video.js')];
    delete require.cache[require.resolve('./lib/settings.json')];
    server = require('./index.js');
  }
});

fs.watchFile('index.js', function (curr, prev) {
  server.stop();

  delete require.cache[require.resolve('./index.js')];
  delete require.cache[require.resolve('./lib/askph.js')];
  delete require.cache[require.resolve('./lib/askph-video.js')];
  delete require.cache[require.resolve('./lib/settings.json')];
  server = require('./index.js');
});
