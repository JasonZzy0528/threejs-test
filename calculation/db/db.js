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
      reject({
        status: 'error',
        message: JSON.stringify(error)
      });
    });
  });
}

function getCatenaries(params){
  return new Promise(function(resolve, reject){
    db.query('SELECT *, st_asgeojson(geom) as geom FROM catenaries_102086955959513 WHERE (polestart=$1 AND poleend=$2) OR (polestart=$2 AND poleend=$1)', params).then(function(data){
      if(data.length > 0){
        var catenaries = [];
        _.forEach(data, function(catenary){
          var geom = JSON.parse(catenary.geom);
          var vector = geom.coordinates;
          catenaries.push(vector);
        });
        resolve(catenaries);
      }else{
        reject({
          status: 'error',
          message: 'Missing catenaries'
        });
      }
      resolve(data);
    })
    .catch(function(error){
      reject({
        status: 'error',
        message: JSON.stringify(error)
      });
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

function cleanCatenaries(catenaries){
  var sortedCatenaries = [];
  _.forEach(catenaries, function(catenary){
    if(catenary[0][0] > catenary[2][0]){
      var tmpCatenary = [catenary[2], catenary[1], catenary[0]];
      sortedCatenaries.push(tmpCatenary);
    }else{
      sortedCatenaries.push(catenary);
    }
  });
  return sortedCatenaries;
}

function cleanCenterSpan(centerSpan){
  var tmpCenterSpan = [];
  if(centerSpan[0][0] > centerSpan[1][0]){
    tmpCenterSpan = [centerSpan[1], centerSpan[0]];
  }else{
    tmpCenterSpan = centerSpan;
  }
  return tmpCenterSpan;
}

function createClearance(poleIds, catenaryIds, point){
  var promises =[];
  return new Promise(function(resolve, reject){
    if(poleIds.length == 2 || catenaryIds.length == 2){
      // query poles and catenaries
      promises.push(getPoles(poleIds));
      promises.push(getCatenaries(catenaryIds));

      Promise.all(promises).then(function(data){
        var centerSpan = cleanCenterSpan(data[0]);
        var catenaries = cleanCatenaries(data[1]);
        generateClearance(centerSpan,catenaries, point).then(function(data){
          resolve(data);
        });
      })
      .catch(function(err){
        reject({
          status: 'error',
          message: JSON.stringify(err)
        })
      });

    }else{
      reject({
        status: 'error',
        message: 'Incorrect poles or catenaries input'
      })
    }
  });
}

module.exports = {
  createClearance: createClearance
};
