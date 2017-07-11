var express = require('express');
var router = express.Router();
var calculation = require('./db');
router.post('/clearance', function(req,res,next){
  var projectId = req.body.projectId,
  circuitId = req.body.circuitId;
  res.setHeader('Content-Type', 'application/json');
  if(projectId != undefined && circuitId != undefined){
    db.genClearance(projectId, circuitId).then(function(){
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
    db.genBushFireRiskArea(projectId, circuitId).then(function(){
      res.send(JSON.stringify({message:'Done'}));
    });
  }else{
    res.send(JSON.stringify({message:'Incorrect projectId or circuitId'}));
  }
})
module.exports = router;