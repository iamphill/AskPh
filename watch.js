var fs = require('fs');
var server = require('./index.js');

fs.watch('lib', function (event, filename) {
  if (event === 'change') {
    server.restart();
  }
});

fs.watchFile('index.js', function (curr, prev) {
  server.restart();
});
