var db = require('./db/db');
var _ = require('lodash');
var args = process.argv;

var poles, catenaries, point;

try {
  poles = JSON.parse(args[2]);
  catenaries = JSON.parse(args[3]);
  point = JSON.parse(args[4]);
} catch(err){
  throw err;
}

db.createClearance(poles, catenaries, point).then(function(data){
  console.log(data.getIntersectsWithVeg(point));
})
.catch(function(err){
  throw err;
});
