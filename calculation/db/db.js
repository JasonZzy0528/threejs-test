var pgp = require('pg-promise')();
var _ = require('lodash');
var THREE = require('three');
var Viewport3D = require('../module/viewport3D');
var conductorConfig = require('../../app/js/constant/conductor_operating.json');
var dbConfig = require('./dbConfig.json');
var db = pgp(dbConfig);
var veg_clearance_table;
var veg_clearance_table_name;
var veg_clearance_table_has_intersect_column;
var SRID;

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

function checkIntersectionColumn(columnName){
  var sql = `SELECT column_name FROM information_schema.columns WHERE table_name='${veg_clearance_table_name}' and column_name='${columnName}';`
  return db.query(sql).then(function(data){
    if(data.length != 0){
      return true;
    }else{
      return false;
    }
  })
}

function genClearance(projectId, circuitId) {
  return getAllData(projectId, circuitId).then(function(data){
    return checkIntersectionColumn('intersection').then(function(hasColumn){
      if(!hasColumn){
        var sql = `SELECT AddGeometryColumn('public', 'veg_clearances_${projectId}', 'intersection', cb_project_srid(${projectId}), 'POINT', 3)`;
        return db.query(sql).then(function(result){ return data; });
      }else{
        return data;
      }
    });
  }).then(function(data){
    var promises = [];
    // generate clearance for each center span
    _.forEach(Object.keys(data), function(attribute){
        if(data[attribute].lines.length > 0){
          // generate center span
          var cats = data[attribute].cats;
          var beginAvg = [0,0,0];
          var endAvg = [0,0,0];
          _.forEach(cats, function(cat){
            var begin = cat.geom.coordinates[0];
            var end = cat.geom.coordinates[2];
            var x;
            if(begin[0] > end[0]){
              x = end;
              end = begin;
              begin = x;
            }
            beginAvg[0] += begin[0];
            beginAvg[1] += begin[1];
            beginAvg[2] += begin[2];
            endAvg[0] += end[0];
            endAvg[1] += end[1];
            endAvg[2] += end[2];
          });
          var n = cats.length;
          beginAvg[0] /= n;
          beginAvg[1] /= n;
          beginAvg[2] /= n;
          endAvg[0] /= n;
          endAvg[1] /= n;
          endAvg[2] /= n;
          var centerSpan = [beginAvg, endAvg];
          var voltage = 132;
          var spanMetres = data[attribute].line_span_length;
          var start_towerHeight = +data[attribute].polestart_height;
          var end_towerHeight = +data[attribute].poleend_height;
          var towerHeight_gap = (end_towerHeight - start_towerHeight)/20;

          var start_groundZ = data[attribute].polestart_geom.coordinates[0][2];
          var end_groundZ = data[attribute].poleend_geom.coordinates[0][2];
          var groundZ_gap = (end_groundZ - start_groundZ)/20;
          var clearanceConfig = {
            start_towerHeight: start_towerHeight,
            towerHeight_gap: towerHeight_gap,
            start_groundZ: start_groundZ,
            groundZ_gap: groundZ_gap
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
          cats = cleanCatenaries(_.map(cats, function(cat){
            return cat.geom.coordinates;
          }));

          if (!clearanceConfig.V) { clearanceConfig.V = 0; }
          if (!clearanceConfig.H) { clearanceConfig.H = 0; }
          if (!clearanceConfig.S) { clearanceConfig.S = 0; }

          var config = {
            catenaries: cats,
            centerSpan: centerSpan,
            domElement: {
              clientWidth: 0,
              clientHeight: 0
            },
            clearanceConfig: clearanceConfig,
            type: 'clearance'
          };


          // generate clearance
          var viewport3d = new Viewport3D(config);

          var clearance = viewport3d.getClearance();

          var lines = data[attribute].lines;
          console.log(`Updating ${veg_clearance_table}`);
          _.forEach(lines, function(line){
            var intersects = clearance.getIntersectsWithVeg(line.geom.coordinates, line.id);

            // use vertices to get closest distance
            var closestIntersect = clearance.getClosestIntersect(line.geom.coordinates, line.id);

            // raycaster to get closest distance
            // var closestIntersect = clearance.getClosestIntersectByRaycaster(line.geom.coordinates, line.id);

            if(intersects.length > 0){
              var point = `POINTZ(${intersects[0].x} ${intersects[0].y} ${intersects[0].z})`;
              var sql = `UPDATE ${veg_clearance_table} SET intersection = ST_GeomFromText('${point}', cb_project_srid(${projectId})), p = ${clearanceConfig.P}, b = ${clearanceConfig.B}, v = ${clearanceConfig.V}, h = ${clearanceConfig.H}, s = ${clearanceConfig.S} WHERE gid = ${line.id};`;
              console.log(sql);
              promises.push(db.query(sql).catch(function(error) {console.error(sql);console.error(error);}));
            }else{
              return;
            }
            if(closestIntersect != null){
              var point = `POINTZ(${closestIntersect.intersect.x} ${closestIntersect.intersect.y} ${closestIntersect.intersect.z})`;
              var distance = closestIntersect.distance;
              var sql = `UPDATE ${veg_clearance_table} SET clearance_closest_intersection = ST_GeomFromText('${point}', cb_project_srid(${projectId})), clearance_closest_distance=${distance} WHERE gid = ${line.id};`;
              console.log(sql);
              promises.push(db.query(sql).catch(function(error) {console.error(sql);console.error(error);}));
            }
          });

          // output OBJ
          // var scene = viewport3d.scene.model;
          // var exporter = new THREE.OBJExporter();
          // var results = exporter.parse(scene);
          // var fs = require('fs');
          // fs.writeFile("./tmp.OBJ", results, function(err) {
          //   if(err) {
          //     return console.log(err);
          //   }
          //   console.log("The file was saved!");
          // });
        }
    });
    // update veg_clearance_table
    if(promises.length > 0){
      return Promise.all(promises).then(function(){
        console.log(' Clearance Done');
      }).catch(function(err){
        console.log(err);
      })
    }else{
      console.log('Clearance Done');
      return;
    }
  });
}

function genCenterline(data){
  _.forEach(Object.keys(data), function(attribute){
    var cats = data[attribute].cats;
    var beginAvg = [0,0,0];
    var endAvg = [0,0,0];
    var begin = cats[0].geom.coordinates[0];
    var end = cats[0].geom.coordinates[2]
    _.forEach(cats, function(cat){
      beginAvg[0] += begin[0];
      beginAvg[1] += begin[1];
      beginAvg[2] += begin[2];
      endAvg[0] += end[0];
      endAvg[1] += end[1];
      endAvg[2] += end[2];
    });
    var n = cats.length;
    beginAvg[0] /= n;
    beginAvg[1] /= n;
    beginAvg[2] /= n;
    endAvg[0] /= n;
    endAvg[1] /= n;
    endAvg[2] /= n;
    var centerSpan = [beginAvg, endAvg];
    data[attribute].centerspan = centerSpan;
  });
  return data;
}

function subOffset(point){
  var offset = [289236.43396549916,6156670.9094580505,87.21476105969055];
  return [point[0] - offset[0], point[1] - offset[1], point[2] - offset[2]]
}

function getAllData(projectId, circuitId){
  return new Promise(function(resolve, reject){
    veg_clearance_table = `public.veg_clearances_${projectId}`;
    veg_clearance_table_name = `veg_clearances_${projectId}`;
    var sql = 'SELECT * FROM veg_clearance_intersects($1, $2)';
    var params = [parseInt(projectId), parseInt(circuitId)];
    db.query(sql, params).then(function(data){
      var centerline_list = {};
      _.forEach(data, function(record){
        var polestart = record.polestart;
        var polestart_geom = JSON.parse(record.polestart_geom);
        var polestart_height = record.polestart_height;
        var poleend = record.poleend;
        var poleend_geom = JSON.parse(record.poleend_geom);
        var poleend_height = record.poleend_height;
        var cat_id = record.cat_id;
        var cat_geom = JSON.parse(record.cat_geom);
        var line_geom = JSON.parse(record.line_geom);
        var line_gid = record.line_gid;
        var line_span_length = record.cat_span_length;

        //sub offset only for test
        // _.forEach(cat_geom.coordinates, function(coordinate, index){
        //   cat_geom.coordinates[index] = subOffset(coordinate)
        // });
        // _.forEach(polestart_geom.coordinates, function(coordinate, index){
        //   polestart_geom.coordinates[index] = subOffset(coordinate);
        // });
        // if(line_geom != undefined || line_geom != null){
        //   _.forEach(line_geom.coordinates, function(coordinate, index){
        //     line_geom.coordinates[index] = subOffset(coordinate)
        //   });
        // }
        // _.forEach(poleend_geom.coordinates, function(coordinate, index){
        //   poleend_geom.coordinates[index] = subOffset(coordinate);
        // });

        if(centerline_list.hasOwnProperty(`${polestart}_${poleend}`)){
          if(_.findIndex(centerline_list[`${polestart}_${poleend}`].cats,function(o){return o.id == cat_id}) == -1){
            centerline_list[`${polestart}_${poleend}`].cats.push({id: cat_id, geom: cat_geom});
          }
          if(_.findIndex(centerline_list[`${polestart}_${poleend}`].lines,function(o){return o.id == line_gid}) == -1){
            if(line_gid != undefined || line_gid != null){
              centerline_list[`${polestart}_${poleend}`].lines.push({id: line_gid, geom: line_geom});
            }
          }
        }else{
          centerline_list[`${polestart}_${poleend}`] = {
            polestart: polestart,
            polestart_geom: polestart_geom,
            polestart_height: polestart_height,
            poleend: poleend,
            poleend_geom: poleend_geom,
            poleend_height: poleend_height,
            line_span_length: line_span_length,
            cats:[{
              id: cat_id,
              geom: cat_geom
            }],
            lines:[]
          };
          if(line_gid != undefined || line_gid != null){
            centerline_list[`${polestart}_${poleend}`].lines.push({ id: line_gid, geom: line_geom });
          }
        }
      });
      resolve(centerline_list);
    })
    .catch(function(error){
      console.log(error);
      reject(error);
    });
  });
}

function genBushFireRiskArea(projectId, circuitId){
  return getAllData(projectId, circuitId).then(function(data){
    return checkIntersectionColumn('risk_area_intersection').then(function(hasColumn){
      if(!hasColumn){
        // var sql = `ALTER TABLE ${veg_clearance_table} ADD risk_area_intersection GEOMETRY(POINTZ, 28354);`;
        var sql = `ALTER Table ${veg_clearance_table}
                    ADD COLUMN risk_area_h NUMERIC,
                    ADD COLUMN risk_area_s NUMERIC,
                    ADD COLUMN risk_area_p NUMERIC,
                    ADD COLUMN risk_area_b NUMERIC,
                    ADD COLUMN risk_area_v NUMERIC,
                    ADD COLUMN risk_area_d2 NUMERIC;
                    SELECT AddGeometryColumn('public', 'veg_clearances_${projectId}', 'risk_area_intersection', cb_project_srid(${projectId}), 'POINT', 3);
                    `
        return db.query(sql).then(function(result){ return data; });
      }else{
        return data;
      }
    });
  }).then(function(data){
    var promises = [];
    // generate clearance for each center span
    _.forEach(Object.keys(data), function(attribute){
      if(data[attribute].lines.length > 0){
        // generate center span
        var cats = data[attribute].cats;
        var beginAvg = [0,0,0];
        var endAvg = [0,0,0];
        _.forEach(cats, function(cat){
          var begin = cat.geom.coordinates[0];
          var end = cat.geom.coordinates[2];
          var x;
          if(begin[0] > end[0]){
            x = end;
            end = begin;
            begin = x;
          }
          beginAvg[0] += begin[0];
          beginAvg[1] += begin[1];
          beginAvg[2] += begin[2];
          endAvg[0] += end[0];
          endAvg[1] += end[1];
          endAvg[2] += end[2];
        });
        var n = cats.length;
        beginAvg[0] /= n;
        beginAvg[1] /= n;
        beginAvg[2] /= n;
        endAvg[0] /= n;
        endAvg[1] /= n;
        endAvg[2] /= n;
        var centerSpan = [beginAvg, endAvg];
        var voltage = 132;
        var spanMetres = data[attribute].line_span_length;
        var start_towerHeight = +data[attribute].polestart_height;
        var end_towerHeight = +data[attribute].poleend_height;
        var towerHeight_gap = (end_towerHeight - start_towerHeight)/20;

        var start_groundZ = data[attribute].polestart_geom.coordinates[0][2];
        var end_groundZ = data[attribute].poleend_geom.coordinates[0][2];
        var groundZ_gap = (end_groundZ - start_groundZ)/20;
        var clearanceConfig = {
          start_towerHeight: start_towerHeight,
          towerHeight_gap: towerHeight_gap,
          start_groundZ: start_groundZ,
          groundZ_gap: groundZ_gap
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
        cats = cleanCatenaries(_.map(cats, function(cat){
          return cat.geom.coordinates;
        }));

        var config = {
          catenaries: cats,
          centerSpan: centerSpan,
          domElement: {
            clientWidth: 0,
            clientHeight: 0
          },
          clearanceConfig: clearanceConfig,
          type: 'bushFireRiskArea'
        };

        // generate bush fire risk area
        var viewport3d = new Viewport3D(config);
        var bushFireRiskArea = viewport3d.getBushFireRiskArea();


        var lines = data[attribute].lines;
        console.log(`Updating ${veg_clearance_table}`);
        _.forEach(lines, function(line){
          var intersects = bushFireRiskArea.getIntersectsWithVeg(line.geom.coordinates, line.id);
          var closestIntersect = bushFireRiskArea.getClosestIntersect(line.geom.coordinates, line.id);
          if(intersects.length === 1){
            var point = `POINTZ(${intersects[0].x} ${intersects[0].y} ${intersects[0].z})`;
            var sql = `UPDATE ${veg_clearance_table} SET risk_area_intersection = ST_GeomFromText('${point}', cb_project_srid(${projectId})), risk_area_p = ${clearanceConfig.P}, risk_area_b = ${clearanceConfig.B}, risk_area_v = ${clearanceConfig.V}, risk_area_h = ${clearanceConfig.H}, risk_area_s = ${clearanceConfig.S} WHERE gid = ${line.id};`;
            console.log(sql);
            promises.push(db.query(sql).catch(function(error) {console.error(sql);console.error(error);}));
          }else{
            return;
          }
          if(closestIntersect.intersect){
            var point = `POINTZ(${closestIntersect.intersect.x} ${closestIntersect.intersect.y} ${closestIntersect.intersect.z})`;
            var distance = closestIntersect.distance;
            var sql = `UPDATE ${veg_clearance_table} SET risk_area_closest_intersection = ST_GeomFromText('${point}', cb_project_srid(${projectId})), risk_area_closest_distance=${distance} WHERE gid = ${line.id};`;
            console.log(sql);
            promises.push(db.query(sql).catch(function(error) {console.error(sql);console.error(error);}));
          }
        });

        // output OBJ
        // var scene = viewport3d.scene.model;
        // var exporter = new THREE.OBJExporter();
        // var results = exporter.parse(scene);
        // var fs = require('fs');
        // fs.writeFile("./tmp.OBJ", results, function(err) {
        //   if(err) {
        //     return console.log(err);
        //   }
        //   console.log("The file was saved!");
        // });
      }
    });

    // update veg_clearance_table
    if(promises.length > 0){
      Promise.all(promises).then(function(){
        console.log('Done');
      }).catch(function(err){
        console.log(err);
      })
    }else{
      console.log('Done');
    }
  });
}

function preprocessReport(schema, projectId, circuitId){
  return new Promise(function(resolve, reject){
    var sql = 'SELECT * FROM cb_report_preprocess(${schema}, ${projectId}, ${circuitId})';
    var params = {
      schema: schema,
      projectId: parseInt(projectId),
      circuitId: parseInt(circuitId)
    }
    return db.query(sql, params).then(function(data){
      resolve(data);
    })
    .catch(function(error){
      reject(error);
    });
  });
}

function postprocessReport(schema, projectId, circuitId){
  return new Promise(function(resolve, reject){
    var sql = 'SELECT * FROM cb_report_postprocess(${schema}, ${projectId}, ${circuitId})';
    var params = {
      schema: schema,
      projectId: parseInt(projectId),
      circuitId: parseInt(circuitId)
    }
    return db.query(sql, params).then(function(data){
      resolve(data);
    })
    .catch(function(error){
      reject(error);
    });
  });
}

module.exports = {
  genClearance: genClearance,
  genBushFireRiskArea: genBushFireRiskArea,
  preprocessReport: preprocessReport,
  postprocessReport: postprocessReport
};
