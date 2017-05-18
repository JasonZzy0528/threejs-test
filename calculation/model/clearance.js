var _ = require('lodash');
var THREE = require('three');
var jsface = require('jsface'),
Class = jsface.Class;
var Clearance = Class([], {
  constructor: function(config){
    var me = this;
    me.material = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#33d7c4'),
      wireframe: false,
      transparent: true,
      opacity: 0.5,
      side: THREE.FrontSide
    });
    _.extend(me, config);
  },

  init: function(){
    var me = this;
    var unitDir = me.centerSpan.getUnitVerticalNormal();

    var beginVerticeOnCenterCatenary = me.centerSpan.getBegin();
    var endVerticeOnCenterCatenary = me.centerSpan.getEnd();
    var left, right, bottom, rightBottom, leftBottom;

    var catenaryObjArray = me.catenaryObjArray;

    var clearanceGeometry = new THREE.Geometry();

    for(var i = 0; i < 21; i++){
      var vertices = [];
      _.forEach(catenaryObjArray,function(catenary){
        vertices.push(catenary.getVertices()[i]);
      });
      var position = me.detectPosition(vertices, beginVerticeOnCenterCatenary, endVerticeOnCenterCatenary);
      var spanVertices = me.getSpanVertices(i, position);
      clearanceGeometry.vertices = clearanceGeometry.vertices.concat(spanVertices);
      if(i < 5 || i > 16){
        if(i == 0){
          // clearanceGeometry.faces.push(new THREE.Face3(0,1,3));
          // clearanceGeometry.faces.push(new THREE.Face3(1,2,3));
        }else if(i == 20){
          // clearanceGeometry.faces.push(new THREE.Face3(clearanceGeometry.vertices.length - 1, clearanceGeometry.vertices.length - 2, clearanceGeometry.vertices.length - 4));
          // clearanceGeometry.faces.push(new THREE.Face3(clearanceGeometry.vertices.length - 2, clearanceGeometry.vertices.length - 3, clearanceGeometry.vertices.length - 4));
          // connect to end
          var beginIndex =  5*4 + 10*6;
          var endIndex = clearanceGeometry.vertices.length - 1 - 3;
          clearanceGeometry.faces.push(new THREE.Face3(beginIndex , endIndex , endIndex + 1));
          clearanceGeometry.faces.push(new THREE.Face3(beginIndex, endIndex + 1, beginIndex + 1));
          clearanceGeometry.faces.push(new THREE.Face3(beginIndex + 1, endIndex + 1, beginIndex + 2));
          clearanceGeometry.faces.push(new THREE.Face3(beginIndex + 2, endIndex + 1, endIndex + 2));
          clearanceGeometry.faces.push(new THREE.Face3(beginIndex + 2, endIndex + 2, beginIndex + 3));
          clearanceGeometry.faces.push(new THREE.Face3(beginIndex + 3, endIndex + 2, endIndex + 3));
          clearanceGeometry.faces.push(new THREE.Face3(beginIndex + 3, endIndex + 3, beginIndex + 4));
          clearanceGeometry.faces.push(new THREE.Face3(beginIndex + 4, endIndex + 3, beginIndex + 5));
          clearanceGeometry.faces.push(new THREE.Face3(beginIndex + 5, endIndex + 3, endIndex));
          clearanceGeometry.faces.push(new THREE.Face3(beginIndex + 5, endIndex, beginIndex));
        }
      }else if(i == 5){
        var beginIndex = 5*4;
        // connect to begin
        clearanceGeometry.faces.push(new THREE.Face3(0, beginIndex , beginIndex + 1));
        clearanceGeometry.faces.push(new THREE.Face3(0, beginIndex + 1, 1));
        clearanceGeometry.faces.push(new THREE.Face3(1, beginIndex + 1, beginIndex + 2));
        clearanceGeometry.faces.push(new THREE.Face3(1, beginIndex + 2, 2));
        clearanceGeometry.faces.push(new THREE.Face3(2, beginIndex + 2, beginIndex + 3));
        clearanceGeometry.faces.push(new THREE.Face3(2, beginIndex + 3, 3));
        clearanceGeometry.faces.push(new THREE.Face3(3, beginIndex + 3, beginIndex + 4));
        clearanceGeometry.faces.push(new THREE.Face3(3, beginIndex + 4, beginIndex + 5));
        clearanceGeometry.faces.push(new THREE.Face3(3, beginIndex + 5, 0));
        clearanceGeometry.faces.push(new THREE.Face3(0, beginIndex + 5, beginIndex));
      }else if(i < 16 && i > 5){
        var beginIndex = 5*4 + (i-5)*6;
        clearanceGeometry.faces.push(new THREE.Face3(beginIndex - 6, beginIndex, beginIndex + 1));
        clearanceGeometry.faces.push(new THREE.Face3(beginIndex - 6, beginIndex + 1, beginIndex - 5));
        clearanceGeometry.faces.push(new THREE.Face3(beginIndex - 5, beginIndex + 1, beginIndex + 2));
        clearanceGeometry.faces.push(new THREE.Face3(beginIndex - 5, beginIndex + 2, beginIndex - 4));
        clearanceGeometry.faces.push(new THREE.Face3(beginIndex - 4, beginIndex + 2, beginIndex + 3));
        clearanceGeometry.faces.push(new THREE.Face3(beginIndex - 4, beginIndex + 3, beginIndex - 3));
        clearanceGeometry.faces.push(new THREE.Face3(beginIndex - 3, beginIndex + 3, beginIndex + 4));
        clearanceGeometry.faces.push(new THREE.Face3(beginIndex - 3, beginIndex + 4, beginIndex - 2));
        clearanceGeometry.faces.push(new THREE.Face3(beginIndex - 2, beginIndex + 4, beginIndex + 5));
        clearanceGeometry.faces.push(new THREE.Face3(beginIndex - 2, beginIndex + 5, beginIndex - 1));
        clearanceGeometry.faces.push(new THREE.Face3(beginIndex - 1, beginIndex + 5, beginIndex));
        clearanceGeometry.faces.push(new THREE.Face3(beginIndex - 1, beginIndex, beginIndex - 6));
      }
    }
    clearanceGeometry.computeFaceNormals();
    clearanceGeometry.computeVertexNormals();

    var clearance = new THREE.Mesh(clearanceGeometry, me.material);
    clearance.name = 'clearance';
    me.object = clearance;
    return this;
  },

  // check point position
  detectPosition: function(vertices, begin, end, unitDir){
    var me = this;

    // check if called from other class
    if(unitDir == undefined){
      unitDir = me.unitDir;
    }

    var position = {};

    _.forEach(vertices, function(vertice, index){
      var verticeToCenterSpan = new THREE.Vector3(vertice.x - begin.x, vertice.y - begin.y, vertice.z - begin.z);

      var angle3d = unitDir.angleTo(verticeToCenterSpan);
      var distanceA = Math.sqrt(Math.pow(end.x - begin.x, 2) + Math.pow(end.y - begin.y, 2));
      var distanceB = Math.sqrt(Math.pow(vertice.x - begin.x, 2) + Math.pow(vertice.y - begin.y, 2));
      var distanceC = Math.sqrt(Math.pow(vertice.x - end.x, 2) + Math.pow(vertice.y - end.y, 2));
      var angle =  Math.acos((Math.pow(distanceA,2) + Math.pow(distanceB, 2) - Math.pow(distanceC, 2))/(2*distanceA*distanceB));
      var distance = distanceB;
      if(angle3d <= .5*Math.PI && angle >= 0){
        if(position.left == undefined){
          position.left = {
            vertice: vertice,
            distance: Math.sin(angle)*distance
          };
        }else{
          if(Math.sin(angle)*distance > position.left.distance){
            position.left = {
              vertice: vertice,
              distance: Math.sin(angle)*distance
            };
          }
        }
        if(position.leftBottom == undefined){
          position.leftBottom = {
            vertice: vertice,
            z: vertice.z
          };
        }else if(position.leftBottom.z > vertice.z){
          position.leftBottom = {
            vertice: vertice,
            z: vertice.z
          };
        }
      }else{
        //right catenary
        if(position.right == undefined){
          position.right = {
            vertice: vertice,
            distance: Math.sin(angle)*distance
          };
        }else{
          if(Math.sin(angle)*distance > position.right.distance){
            position.right = {
              vertice: vertice,
              distance: Math.sin(angle)*distance
            };
          }
        }
        if(position.rightBottom == undefined){
          position.rightBottom = {
            vertice: vertice,
            z: vertice.z
          };
        }else if(position.rightBottom.z > vertice.z){
          position.rightBottom = {
            vertice: vertice,
            z: vertice.z
          };
        }
      }
    });

    position.bottom = {
      vertice: position.leftBottom.z<position.rightBottom.z?position.leftBottom.vertice:position.rightBottom.vertice
    };

    return position;
  },

  getSpanVertices: function(index, vertices){
    var me = this;
    var towerHeight = me.start_towerHeight + index*me.towerHeight_gap;
    var start_groundZ = me.start_groundZ;
    var groundZ_gap = me.groundZ_gap;
    var H = me.H;
    var S = me.S;
    var V = me.V;
    var P = me.P;

    var unitDir = me.unitDir;
    if(index < 5 || index > 15){
      var topLeft = new THREE.Vector3(vertices.left.vertice.x + P*unitDir.x, vertices.left.vertice.y + P*unitDir.y, 5 + towerHeight + start_groundZ + groundZ_gap*index);
      var topRight = new THREE.Vector3(vertices.right.vertice.x - P*unitDir.x, vertices.right.vertice.y - P*unitDir.y, 5 + towerHeight + start_groundZ + groundZ_gap*index);
      var bottomRight = new THREE.Vector3(vertices.right.vertice.x - P*unitDir.x, vertices.right.vertice.y - P*unitDir.y, vertices.bottom.vertice.z - P);
      var bottomLeft = new THREE.Vector3(vertices.left.vertice.x + P*unitDir.x, vertices.left.vertice.y + P*unitDir.y, vertices.bottom.vertice.z - P);
      return [topLeft, topRight, bottomRight, bottomLeft];
    }else{
      var centerSpanIndexedPoint = me.centerSpan.getIndexedPoint(index);
      var rightDistance = Math.sqrt(Math.pow(centerSpanIndexedPoint.x - vertices.right.vertice.x + H*unitDir.x, 2) + Math.pow(centerSpanIndexedPoint.y - vertices.right.vertice.y + H*unitDir.y, 2));
      var leftDistance = Math.sqrt(Math.pow(centerSpanIndexedPoint.x - vertices.left.vertice.x - H*unitDir.x, 2) + Math.pow(centerSpanIndexedPoint.y - vertices.left.vertice.y - H*unitDir.y, 2));
      // right: x - y - s - rightDistance + h + 3*Math.sqrt(2) = 0
      // left: x + y + s + leftDistance - h - 3*Math.sqrt(2) = 0
      var topLeft =  new THREE.Vector3(
        vertices.left.vertice.x + H*unitDir.x,
        vertices.left.vertice.y + H*unitDir.y,
        5 + towerHeight + start_groundZ + groundZ_gap*index
      );
      var topRight =  new THREE.Vector3(
        vertices.right.vertice.x - H*unitDir.x,
        vertices.right.vertice.y - H*unitDir.y,
        5 + towerHeight + start_groundZ + groundZ_gap*index
      );

      var middleRight, bottomRight, middleLeft, bottomLeft;
      // check intersections
      if(rightDistance - S + 3*Math.sqrt(2) + start_groundZ + groundZ_gap*index > vertices.rightBottom.vertice.z - V){

        middleRight = new THREE.Vector3(
          vertices.right.vertice.x - H*unitDir.x,
          vertices.right.vertice.y - H*unitDir.y,
          Math.sqrt(2) * 3 + rightDistance - S + start_groundZ + groundZ_gap*index
        );

        bottomRight = new THREE.Vector3(
          vertices.right.vertice.x - H*unitDir.x + (rightDistance - S - (vertices.rightBottom.vertice.z - V  - (start_groundZ + groundZ_gap*index)) + 3*Math.sqrt(2))*unitDir.x,
          vertices.right.vertice.y - H*unitDir.y + (rightDistance - S - (vertices.rightBottom.vertice.z - V  - (start_groundZ + groundZ_gap*index)) + 3*Math.sqrt(2))*unitDir.y,
          vertices.rightBottom.vertice.z - V
        );
      }else{
        middleRight = new THREE.Vector3(
          vertices.right.vertice.x - H*unitDir.x,
          vertices.right.vertice.y - H*unitDir.y,
          vertices.rightBottom.vertice.z - V
        );
        bottomRight = new THREE.Vector3(
          vertices.right.vertice.x - H*unitDir.x,
          vertices.right.vertice.y - H*unitDir.y,
          vertices.rightBottom.vertice.z - V
        );
      }

      if(leftDistance - S + 3*Math.sqrt(2) + start_groundZ + groundZ_gap*index > vertices.leftBottom.vertice.z - V){

        bottomLeft = new THREE.Vector3(
          vertices.left.vertice.x + H*unitDir.x - (leftDistance - S - (vertices.leftBottom.vertice.z - V  - (start_groundZ + groundZ_gap*index)) + 3*Math.sqrt(2))*unitDir.x,
          vertices.left.vertice.y + H*unitDir.y - (leftDistance - S - (vertices.leftBottom.vertice.z - V  - (start_groundZ + groundZ_gap*index)) + 3*Math.sqrt(2))*unitDir.y,
          vertices.leftBottom.vertice.z - V
        );

        middleLeft = new THREE.Vector3(
          vertices.left.vertice.x + H*unitDir.x,
          vertices.left.vertice.y + H*unitDir.y,
          Math.sqrt(2) * 3 + leftDistance - S + start_groundZ + groundZ_gap*index
        );
      }else{
        bottomLeft = new THREE.Vector3(
          vertices.left.vertice.x + H*unitDir.x,
          vertices.left.vertice.y + H*unitDir.y,
          vertices.leftBottom.vertice.z - V
        );
        middleLeft = new THREE.Vector3(
          vertices.left.vertice.x + H*unitDir.x,
          vertices.left.vertice.y + H*unitDir.y,
          vertices.leftBottom.vertice.z - V
        );
      }
      return [topLeft, topRight, middleRight, bottomRight, bottomLeft, middleLeft];
    }
  },

  get3dObject: function(){
    return this.object;
  },

  getIntersectsWithVeg: function(line){
    var end = new THREE.Vector3(line[0][0], line[0][1], line[0][2]);
    var begin = new THREE.Vector3(line[1][0], line[1][1], line[1][2]);
    var far = Math.sqrt(Math.pow(end.x - begin.x, 2) + Math.pow(end.y - begin.y, 2) + Math.pow(end.z - begin.z, 2));
    var direction = new THREE.Vector3(end.x - begin.x, end.y - begin.y, end.z - begin.z).normalize();
    var raycaster = new THREE.Raycaster(begin, direction, 0, far);
    var object = this.object;
    var intersects = raycaster.intersectObject(object, true);
    var intersections = [];
    _.forEach(intersects, function(intersect){
      if(intersect.object.name == 'clearance'){
        intersections.push(intersect.point);
      }
    });
    if(intersections.length > 0){
      // this.genIntersects(intersections);
      this.generateRayLine(begin, end);
    }
    return intersections;
  },

  genIntersects: function(points){
    var geometry = new THREE.Geometry();
    _.forEach(points, function(point){
      geometry.vertices.push(point);
    });
    var material = new THREE.PointsMaterial( { size: 1, color: new THREE.Color('#d53434')} );
    var intersects = new THREE.Points(geometry, material);
    intersects.name = 'intersects';
    this.viewport3d.scene.model.add(intersects);
  },

  generateRayLine: function(begin, end){
    var lineGeometry = new THREE.Geometry();
    lineGeometry.vertices.push(begin);
    lineGeometry.vertices.push(end);
    var material = new THREE.LineBasicMaterial({color: new THREE.Color('#0003ff')});
    var line = new THREE.Line(lineGeometry, material);
    line.name = 'line_' + Math.floor((Math.random() * 10) + 1).toString();
    this.viewport3d.scene.model.add(line);
  }

});

module.exports = Clearance;
