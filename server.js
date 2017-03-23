var express = require('express');
var bodyParser = require('body-parser');
var calculation = require('./calculation/calculation');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.use('/api', calculation);

app.listen(3000);
