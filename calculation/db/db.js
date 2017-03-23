var pgp = require('pg-promise')();
var _ = require('lodash');
var THREE = require('three');
var Viewport3D = require('../module/viewport3D');
var conductorConfig = require('../../app/js/constant/conductor_operating.json');
var dbConfig = require('./dbConfig.json');
var db = pgp(dbConfig);


function getPoles(params){
  return new Promise(function(resolve, reject){
    db.query('SELECT *, st_asgeojson(geom) as geom FROM poles_102086955959513 WHERE gid=$1 OR gid=$2;', params).then(function(data){
      if(data.length != 2){
        reject({error:'Missing poles'});
      }else{
        var pole_first = JSON.parse(data[0].geom),
        pole_second = JSON.parse(data[1].geom);
        var centerSpan = [pole_first.coordinates[1], pole_second.coordinates[1]];
        resolve(centerSpan);
      }
    })
    .catch(function(error){
      reject(error);
    });
  });
}

function getCatenaries(params){
  return new Promise(function(resolve, reject){
    var sqlStr = 'SELECT *, st_asgeojson(geom) as geom FROM catenaries_102086955959513 WHERE';
    _.forEach(params, function(catenary, index){
      if(index != 0){
        sqlStr += ' OR (polestart=' +  catenary.polestart + ' AND poleend=' +  catenary.poleend + ')';
      }else{
        sqlStr += ' (polestart=' +  catenary.polestart + ' AND poleend=' +  catenary.poleend + ')';
      }
    });
    // close sql
    sqlStr += ';';
    db.query(sqlStr).then(function(data){
      if(data.length > 0){
        var catenaries = [];
        _.forEach(data, function(catenary){
          var geom = JSON.parse(catenary.geom);
          var vector = geom.coordinates;
          catenaries.push(vector);
        });
        resolve(catenaries);
      }else{
        reject({error:'Missing catenaries'});
      }
      resolve(data);
    })
    .catch(function(error){
      reject(error);
    });
  });
}

function getGroudInfo(params){
  return new Promise(function(resolve, reject){
    db.query("SELECT AVG(ST_Z(geom)) AS avg_z from (SELECT geom, ST_3DDistance(ST_GeomFromText('PointZ(${x} ${y} ${z})', 2193), t.geom) as distance FROM terrain_102086955959513 t where ST_DWithin(ST_GeomFromText('PointZ(${x} ${y} ${z})', 2193), t.geom, 10) ORDER BY distance LIMIT 10) as WithInGeom", params).then(function(data){
      resolve(data);
    })
    .catch(function(error){
      reject(error);
    });
  });
}

function generateClearance(centerSpan, catenaries){
  return new Promise(function(resolve, reject){
    var voltage = 132;
    var spanMetres = 110;
    var towerHeight = centerSpan[0][2];
    // var towerHeight = 15;
    var clearanceConfig = {
      towerHeight: towerHeight
    };

    _.forEach(conductorConfig.type, function(type){
      if(type.voltage == voltage){
        clearanceConfig.P = type.p;
        clearanceConfig.B = type.b;
        _.forEach(type.span, function(span){
          if((span.metersMore < spanMetres && span.metersLess && span.metersLess >= spanMetres) || (span.metersMore < spanMetres && !span.metersLess)){
            clearanceConfig.V = span.v;
            clearanceConfig.H = span.h;
            clearanceConfig.S = span.s;
            clearanceConfig['S*'] = span['s*'];
          }
        });
      }
    });
    var config = {
      catenaries: catenaries,
      centerSpan: centerSpan,
      domElement: {
        clientWidth: 0,
        clientHeight: 0
      },
      clearanceConfig: clearanceConfig
    };

    var lowestPoint;
    _.forEach(catenaries, function(catenary){
      if(lowestPoint){
        if(lowestPoint[2] > catenary[1][2]){
          lowestPoint = catenary[1];
        }
      }else{
        lowestPoint = catenary[1];
      }
    });
    lowestPoint = {
      x: lowestPoint[0],
      y: lowestPoint[1],
      z: lowestPoint[2],
    }

    getGroudInfo(lowestPoint).then(function(data){
      config.groundZ = data[0].avg_z;
      var viewport3d = new Viewport3D(config);
      var clearance = viewport3d.getClearance();
      resolve(clearance);
    })
    .catch(function(error){
      reject(error);
    });
  })
}

function createClearance(req, res, next){
  var centerSpan = [];
  var catenaries = [];
  var promises =[];


  // // local run
  // const centerSpan = [[20,0,15], [-20, 0, 15]];
  // const line2 = [[20,2,13], [0,2,8], [-20, 2, 13]]; //right bottom
  // const line3 = [[20,2,15], [0,2,10], [-20, 2, 15]]; //right
  // const line4 = [[20,-2,13], [0,-2,8], [-20, -2, 13]]; // left bottom
  // const line5 = [[20,-2,15], [0,-2,10], [-20, -2, 15]]; //left
  //
  // const catenaries = [];
  // catenaries.push(line2);
  // catenaries.push(line3);
  // catenaries.push(line4);
  // catenaries.push(line5);
  //
  // generateClearance(centerSpan, catenaries).then(function(data){
  //   var vertices = [];
  //   _.forEach(data.object.geometry.vertices, function(vertice){
  //     vertices.push([vertice.x, vertice.y, vertice.z])
  //   });
  //   res.status(200).json({
  //     status:200,
  //     data: vertices
  //   });
  // })
  // .catch(function(error){
  //   res.status(500).json({
  //     status:500,
  //     message: error
  //   })
  // });

  if(req.body.hasOwnProperty('poles_gid') || req.body.hasOwnProperty('catenaries')){
    var poles_gid = JSON.parse(req.body.poles_gid);
    var catenaries_info = JSON.parse(req.body.catenaries);

    // query poles and catenaries
    promises.push(getPoles(poles_gid));
    promises.push(getCatenaries(catenaries_info));

    Promise.all(promises).then(function(data){
      var centerSpan = data[0];
      var catenaries = data[1];
      generateClearance(centerSpan,catenaries).then(function(data){
        var vertices = [];
        _.forEach(data.object.geometry.vertices, function(vertice){
          vertices.push([vertice.x, vertice.y, vertice.z])
        });
        res.status(200).json({
          status:200,
          data: vertices
        });
      });
    })
    .catch(function(err){
      res.status(500).json({
        status:500,
        message: err
      });
    });

  }else{
    res.status(400).json({
      status:400,
      message: 'Missing params'
    });
  }
}

module.exports = {
  createClearance: createClearance
};
