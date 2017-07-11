var express = require('express');
var router = express.Router();
router.post('/clearance', function(req,res,next){
  var projectId = req.body.projectId,
  circuitId = req.body.circuitId;
  console.log(projectId,circuitId);
  // res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({text:'clearance'}));
});

router.post('/bush', function(req,res,next){
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({text:'bush'}));
})
module.exports = router;