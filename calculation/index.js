var express = require('express');
var router = express.Router();
var calculation = require('./db/db');


router.post('/genReport', function(req,res,next){
  var projectId = req.body.projectId,
  circuitId = req.body.circuitId,
  schemaName = req.body.schemaName;
  res.setHeader('Content-Type', 'application/json');
  if(projectId != undefined && circuitId != undefined){
    calculation.preprocessReport(schemaName, projectId, circuitId).then(function(){
      return calculation.genClearance(projectId, circuitId)
    })
    .then(function(){
      return calculation.genBushFireRiskArea(projectId, circuitId)
    })
    .then(function(){
      return calculation.postprocessReport(schemaName, projectId, circuitId)
    })
    .then(function(){
      res.send(JSON.stringify({message:'Done'}));
    })
    .catch(function(reason){
      console.log(reason)
      res.send(JSON.stringify({message:reason}));
    });
  }else{
    res.send(JSON.stringify({message:'Incorrect projectId or circuitId'}));
  }
});


// router.post('/clearance', function(req,res,next){
//   var projectId = req.body.projectId,
//   circuitId = req.body.circuitId;
//   res.setHeader('Content-Type', 'application/json');
//   if(projectId != undefined && circuitId != undefined){
//     calculation.genClearance(projectId, circuitId).then(function(){
//       res.send(JSON.stringify({message:'Done'}));
//     }).catch(function(reason){
//       console.log(reason)
//       res.send(JSON.stringify({message:reason}));
//     });
//   }else{
//     res.send(JSON.stringify({message:'Incorrect projectId or circuitId'}));
//   }
// });
//
// router.post('/bush', function(req,res,next){
//   var projectId = req.body.projectId,
//   circuitId = req.body.circuitId;
//   res.setHeader('Content-Type', 'application/json');
//   if(projectId != undefined && circuitId != undefined){
//     calculation.genBushFireRiskArea(projectId, circuitId).then(function(){
//       res.send(JSON.stringify({message:'Done'}));
//     }).catch(function(reason){
//       console.log(reason)
//       res.send(JSON.stringify({message:reason}));
//     });
//   }else{
//     res.send(JSON.stringify({message:'Incorrect projectId or circuitId'}));
//   }
// });
//
// router.post('/report_preprocess', function(req,res,next){
//   var projectId = req.body.projectId,
//   circuitId = req.body.circuitId,
//   schemaName = req.body.schemaName;
//   res.setHeader('Content-Type', 'application/json');
//   if(projectId != undefined && circuitId != undefined){
//     calculation.preprocessReport(schemaName, projectId, circuitId).then(function(){
//       res.send(JSON.stringify({message:'Done'}));
//     }).catch(function(reason){
//       console.log(reason)
//       res.send(JSON.stringify({message:reason}));
//     });
//   }else{
//     res.send(JSON.stringify({message:'Incorrect projectId or circuitId'}));
//   }
// });
//
// router.post('/report_postprocess', function(req,res,next){
//   var projectId = req.body.projectId,
//   circuitId = req.body.circuitId,
//   schemaName = req.body.schemaName;
//   res.setHeader('Content-Type', 'application/json');
//   if(projectId != undefined && circuitId != undefined){
//     calculation.postprocessReport(schemaName, projectId, circuitId).then(function(){
//       res.send(JSON.stringify({message:'Done'}));
//     }).catch(function(reason){
//       console.log(reason)
//       res.send(JSON.stringify({message:reason}));
//     });
//   }else{
//     res.send(JSON.stringify({message:'Incorrect projectId or circuitId'}));
//   }
// });
module.exports = router;