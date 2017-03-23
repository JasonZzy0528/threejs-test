define(
  ['lodash'],
  function(_){
    'use strict';
    return {
      getRayFromLine: function(Line){
        var begin = Line.geometry.vertices[0];
        var end = Line.geometry.vertices[Line.geometry.vertices.length - 1];
        var far = Math.sqrt(Math.pow(end.x - begin.x, 2) + Math.pow(end.y - begin.y, 2) + Math.pow(end.z - begin.z, 2));
        var direction = new THREE.Vector3(end.x - begin.x, end.y - begin.y, end.z - begin.z).normalize();
        var raycaster = new THREE.Raycaster(begin, direction, 0, far);
        return raycaster;
      },

      hasIntersectionWithClearance: function(models, line){
        var raycaster = this.getRayFromLine(line);
        var intersects = raycaster.intersectObjects(models, true);
        var intersectWithClearance = false;
        _.forEach(intersects, function(intersect){
          if(intersect.object.name == 'clearance'){
            intersectWithClearance = true;
            return false;
          }
        });
        return intersectWithClearance;
      },

      getIntersectionWithClearance: function(models, line){
        var raycaster = this.getRayFromLine(line);
        var intersects = raycaster.intersectObjects(models, true);
        var intersections = [];
        _.forEach(intersects, function(intersect){
          if(intersect.object.name == 'clearance'){
            intersections.push(intersect);
          }
        });
        return intersections;
      },

    };
  }
);
