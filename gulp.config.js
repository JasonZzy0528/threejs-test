var path = require('path');
module.exports = function() {
  var app = path.join(__dirname, 'app');
  var config = {
    json:'app/app/scripts/models/environment.json',
    config:'app/app/scripts/',
    app: app,
    index: app + '/index.html',
    sass: [
      app + '/styles/*.scss',
    ],
    css:[
      app + '/styles/*.css'
    ]
  };

  return config;
};
