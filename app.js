var express = require('express');
var path = require('path');

const PACKAGE_INFO = require('./package.json');

var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// health check API endpoint
app.use('/health', function (req, res) {
  const SUCCESS = {
    "service": PACKAGE_INFO.name,
    "status": "200",
    "version": PACKAGE_INFO.version,
  }
  res.json(SUCCESS);
});

app.use('/jupiter', require('./routes/controller'));
module.exports = app;