var _ = require('lodash');
var THREE = require('three');
var jsface = require('jsface'),
Class = jsface.Class;
var Clearance = require('./clearance');

var BushFireArea = Class([Clearance], {
  constructor: function(config){
    BushFireArea.$super.call(this, config);
  },

  init: function(){
    var me = this;
    var unitDir = me.centerSpan.getUnitVerticalNormal();

    var beginVerticeOnCenterCatenary = me.centerSpan.getBegin();
    var endVerticeOnCenterCatenary = me.centerSpan.getEnd();
    var left, right, bottom, rightBottom, leftBottom;

    var catenaryObjArray = me.catenaryObjArray;

    var riskAreaGeometry = new THREE.Geometry();
    for(var i = 0; i < 21; i++){
      var vertices = [];
      _.forEach(catenaryObjArray,function(catenary){
        vertices.push(catenary.getVertices()[i]);
      });
      var position = me.detectPosition(vertices, beginVerticeOnCenterCatenary, endVerticeOnCenterCatenary, unitDir);
      var spanVertices = me.getSpanVertices(i, position);
      riskAreaGeometry.vertices = riskAreaGeometry.vertices.concat(spanVertices);
      if(i == 0){
        riskAreaGeometry.faces.push(new THREE.Face3(3,2,0));
        riskAreaGeometry.faces.push(new THREE.Face3(2,1,0));
      }else{
        if(i == 20){
          riskAreaGeometry.faces.push(new THREE.Face3(riskAreaGeometry.vertices.length - 4, riskAreaGeometry.vertices.length - 3, riskAreaGeometry.vertices.length - 1));
          riskAreaGeometry.faces.push(new THREE.Face3(riskAreaGeometry.vertices.length - 3, riskAreaGeometry.vertices.length - 2, riskAreaGeometry.vertices.length - 1));
        }
        // connect to end
        riskAreaGeometry.faces.push(new THREE.Face3(riskAreaGeometry.vertices.length - 4, riskAreaGeometry.vertices.length - 8, riskAreaGeometry.vertices.length - 3));
        riskAreaGeometry.faces.push(new THREE.Face3(riskAreaGeometry.vertices.length - 3, riskAreaGeometry.vertices.length - 8, riskAreaGeometry.vertices.length - 7));
        riskAreaGeometry.faces.push(new THREE.Face3(riskAreaGeometry.vertices.length - 3, riskAreaGeometry.vertices.length - 7, riskAreaGeometry.vertices.length - 2));
        riskAreaGeometry.faces.push(new THREE.Face3(riskAreaGeometry.vertices.length - 2, riskAreaGeometry.vertices.length - 7, riskAreaGeometry.vertices.length - 6));
        riskAreaGeometry.faces.push(new THREE.Face3(riskAreaGeometry.vertices.length - 2, riskAreaGeometry.vertices.length - 6, riskAreaGeometry.vertices.length - 1));
        riskAreaGeometry.faces.push(new THREE.Face3(riskAreaGeometry.vertices.length - 1, riskAreaGeometry.vertices.length - 6, riskAreaGeometry.vertices.length - 5));
        riskAreaGeometry.faces.push(new THREE.Face3(riskAreaGeometry.vertices.length - 1, riskAreaGeometry.vertices.length - 5, riskAreaGeometry.vertices.length - 4));
        riskAreaGeometry.faces.push(new THREE.Face3(riskAreaGeometry.vertices.length - 4, riskAreaGeometry.vertices.length - 5, riskAreaGeometry.vertices.length - 8));
      }

    }

    riskAreaGeometry.computeFaceNormals();
    riskAreaGeometry.computeVertexNormals();

    var riskArea = new THREE.Mesh(riskAreaGeometry, me.material);
    riskArea.name = 'bushFireRistArea';
    me.object = riskArea;
    return this;
  },

  getSpanVertices: function(index, vertices){
    var me = this;
    var towerHeight = me.start_towerHeight + index*me.towerHeight_gap;
    var start_groundZ = me.start_groundZ;
    var groundZ_gap = me.groundZ_gap;
    var S = me.S;

    var unitDir = me.unitDir;
    var topLeft, topRight, bottomRight, bottomLeft;
    if(index < 5 || index > 15){
      topLeft = new THREE.Vector3(vertices.left.vertice.x + (5 + towerHeight)*unitDir.x, vertices.left.vertice.y + (5 + towerHeight)*unitDir.y, 5 + towerHeight + start_groundZ + groundZ_gap*index);
      topRight = new THREE.Vector3(vertices.right.vertice.x - (5 + towerHeight)*unitDir.x, vertices.right.vertice.y - (5 + towerHeight)*unitDir.y, 5 + towerHeight + start_groundZ + groundZ_gap*index);
      bottomRight = new THREE.Vector3(vertices.right.vertice.x, vertices.right.vertice.y, start_groundZ + groundZ_gap*index);
      bottomLeft = new THREE.Vector3(vertices.left.vertice.x, vertices.left.vertice.y, start_groundZ + groundZ_gap*index);
    }else{
      topLeft = new THREE.Vector3(vertices.left.vertice.x + (5 + towerHeight + S)*unitDir.x, vertices.left.vertice.y + (5 + towerHeight + S)*unitDir.y, 5 + towerHeight + start_groundZ + groundZ_gap*index);
      topRight = new THREE.Vector3(vertices.right.vertice.x - (5 + towerHeight + S)*unitDir.x, vertices.right.vertice.y - (5 + towerHeight + S)*unitDir.y, 5 + towerHeight + start_groundZ + groundZ_gap*index);
      bottomRight = new THREE.Vector3(vertices.right.vertice.x - S*unitDir.x, vertices.right.vertice.y - S*unitDir.y, start_groundZ + groundZ_gap*index);
      bottomLeft = new THREE.Vector3(vertices.left.vertice.x + S*unitDir.x, vertices.left.vertice.y + S*unitDir.y, start_groundZ + groundZ_gap*index);
    }
    return [topLeft, topRight, bottomRight, bottomLeft];
  },


  get3dObject: function(){
    return this.object;
  },

  getIntersectsWithVeg: function(line, id){
    var end = new THREE.Vector3(line[0][0], line[0][1], line[0][2]);
    var begin = new THREE.Vector3(line[1][0], line[1][1], line[1][2]);
    // disable raycaster far
    // var far = Math.sqrt(Math.pow(end.x - begin.x, 2) + Math.pow(end.y - begin.y, 2) + Math.pow(end.z - begin.z, 2));
    var direction = new THREE.Vector3(end.x - begin.x, end.y - begin.y, end.z - begin.z).normalize();
    // var raycaster = new THREE.Raycaster(begin, direction, 0, far);
    var raycaster = new THREE.Raycaster(begin, direction);
    var object = this.object;
    var intersects = raycaster.intersectObject(object, true);
    var intersections = [];
    _.forEach(intersects, function(intersect){
      if(intersect.object.name == 'bushFireRistArea'){
        intersections.push(intersect.point);
      }
    });
    if(intersections.length > 0){
      // this.genIntersects(intersections);
      this.generateRayLine(begin, intersections[0], id);
    }else{
      this.generateRayLine(begin, end, id);
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

  generateRayLine: function(begin, end, id){
    var lineGeometry = new THREE.Geometry();
    lineGeometry.vertices.push(begin);
    lineGeometry.vertices.push(end);
    var material = new THREE.LineBasicMaterial({color: new THREE.Color('#0003ff')});
    var line = new THREE.Line(lineGeometry, material);
    line.name = 'line_' + id;
    this.viewport3d.scene.model.add(line);
  }

});

module.exports = BushFireArea;