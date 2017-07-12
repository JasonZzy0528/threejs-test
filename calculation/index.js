var express = require('express');
var router = express.Router();
var calculation = require('./db/db');
router.post('/clearance', function(req,res,next){
  var projectId = req.body.projectId,
  circuitId = req.body.circuitId;
  res.setHeader('Content-Type', 'application/json');
  if(projectId != undefined && circuitId != undefined){
    calculation.genClearance(projectId, circuitId).then(function(){
      res.send(JSON.stringify({message:'Done'}));
    });
  }else{
    res.send(JSON.stringify({message:'Incorrect projectId or circuitId'}));
  }
});

router.post('/bush', function(req,res,next){
  var projectId = req.body.projectId,
  circuitId = req.body.circuitId;
  res.setHeader('Content-Type', 'application/json');
  if(projectId != undefined && circuitId != undefined){
    calculation.genBushFireRiskArea(projectId, circuitId).then(function(){
      res.send(JSON.stringify({message:'Done'}));
    });
  }else{
    res.send(JSON.stringify({message:'Incorrect projectId or circuitId'}));
  }
})
module.exports = router;