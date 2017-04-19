var db = require('./db/db');
var _ = require('lodash');
var args = process.argv;

var projectId, circuitId;

try {
  projectId = JSON.parse(args[2]);
  circuitId = JSON.parse(args[3]);
} catch(err){
  throw err;
}

db.genClearance(projectId, circuitId);
