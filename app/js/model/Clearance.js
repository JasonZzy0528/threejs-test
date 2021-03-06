define(
  [
    'lodash',
    'jsface'
  ],
  function (_) {

    var Clearance = Class([], {
      constructor: function(config){
        var me = this;
        me.material = new THREE.MeshBasicMaterial({
          color : new THREE.Color('#33d7c4'),
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.5
        });
        _.extend(me, config);
      },

      init: function(){
        var me = this;
        var unitDir = me.centerSpan.getUnitVerticalNormal();

        var beginVerticeOnCenterCatenary = me.centerSpan.getBegin();
        var left, right, bottom, rightBottom, leftBottom;

        var catenaryObjArray = me.catenaryObjArray;
        _.forEach(me.catenaryObjArray, function(catenary, index){
          //check angle between one catenary begin point to centerCatenary end point and centerCatenary vertical normal
          var angle = catenary.getAngleToCatenary(me.centerSpan.getUnitVerticalNormal(),beginVerticeOnCenterCatenary, 0);
          // left catenary
          if(angle <= .5*Math.PI && angle > 0){
            if(!left){
              left = index;
            }else{
              var leftAngle = catenary.getAngleToCatenary(catenaryObjArray[left].getUnitVerticalNormal(),catenaryObjArray[left].getBegin(), 0);
              if(leftAngle <= .5*Math.PI && leftAngle > 0){
                left = index;
              }
            }
            var z = catenary.getBegin().z;
            if(!leftBottom && z < beginVerticeOnCenterCatenary.z){
              leftBottom = index
            }else if(leftBottom && z < beginVerticeOnCenterCatenary.z){
              if(z < catenaryObjArray[leftBottom].getBegin().z){
                leftBottom = index
              }
            }
          }else if(angle > .5*Math.PI && angle < Math.PI){
            //right catenary
            if(!right){
              right = index;
            }else{
              var rightAngle = catenary.getAngleToCatenary(catenaryObjArray[right].getUnitVerticalNormal(), catenaryObjArray[right].getBegin(), 0);
              if(rightAngle > .5*Math.PI && rightAngle < Math.PI){
                right = index;
              }
            }

            var z = catenary.getBegin().z;
            if(!rightBottom && z < beginVerticeOnCenterCatenary.z){
              rightBottom = index
            }else if(rightBottom && z < beginVerticeOnCenterCatenary.z){
              if(z < catenaryObjArray[rightBottom].getBegin().z){
                rightBottom = index
              }
            }
          }

          // bottom catenary
          var z = catenary.getBegin().z;
          if(!bottom && z < beginVerticeOnCenterCatenary.z){
            bottom = index
          }else if(bottom && z < beginVerticeOnCenterCatenary.z){
            if(z < catenaryObjArray[bottom].getBegin().z){
              bottom = index
            }
          }
        });

        me.rightPoints = catenaryObjArray[right].getRightBound();
        me.leftPoints = catenaryObjArray[left].getLeftBound();
        me.bottomPoints = catenaryObjArray[bottom].getBottomBound();
        me.rightBottomPoints = catenaryObjArray[rightBottom].getBottomBound();
        me.leftBottomPoints = catenaryObjArray[leftBottom].getBottomBound();
        var clearanceGeometry = new THREE.Geometry();
        var clearanceVertices = [];

        for(var i = 0; i < 21; i++){
          var spanVertices = me.getSpanVertices(i);
          clearanceGeometry.vertices = clearanceGeometry.vertices.concat(spanVertices);
          if(i < 5 || i > 16){
            if(i == 0){
              clearanceGeometry.faces.push(new THREE.Face3(0,1,3));
              clearanceGeometry.faces.push(new THREE.Face3(1,2,3));
            }else if(i == 20){
              clearanceGeometry.faces.push(new THREE.Face3(clearanceGeometry.vertices.length - 1, clearanceGeometry.vertices.length - 2, clearanceGeometry.vertices.length - 4));
              clearanceGeometry.faces.push(new THREE.Face3(clearanceGeometry.vertices.length - 2, clearanceGeometry.vertices.length - 3, clearanceGeometry.vertices.length - 4));
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

      getSpanVertices: function(index){
        var me = this;
        var towerHeight = me.towerHeight;
        if(index < 5 || index > 15){
          var topLeft = new THREE.Vector3(me.leftPoints[index].x, me.leftPoints[index].y, 5 + towerHeight);
          var topRight = new THREE.Vector3(me.rightPoints[index].x, me.rightPoints[index].y, 5 + towerHeight);
          var bottomRight = new THREE.Vector3(me.rightPoints[index].x, me.rightPoints[index].y, me.bottomPoints[index].z);
          var bottomLeft = new THREE.Vector3(me.leftPoints[index].x, me.leftPoints[index].y, me.bottomPoints[index].z);
          return [topLeft, topRight, bottomRight, bottomLeft];
        }else{
          var H = me.H;
          var S = me.S;
          var V = me.V;
          var unitDir = me.unitDir;
          var topLeft =  new THREE.Vector3(me.leftPoints[index].x, me.leftPoints[index].y, 5 + towerHeight);
          var topRight =  new THREE.Vector3(me.rightPoints[index].x, me.rightPoints[index].y, 5 + towerHeight);

          var middleRight = new THREE.Vector3(me.rightPoints[index].x, me.rightPoints[index].y, Math.sqrt(2) * 3 + H - S);

          var bottomRight = new THREE.Vector3(me.rightPoints[index].x + (H - S - me.rightBottomPoints[index].z + 3*Math.sqrt(2))*unitDir.x , me.rightPoints[index].y + (H - S - me.rightBottomPoints[index].z + 3*Math.sqrt(2))*unitDir.y , me.rightBottomPoints[index].z);

          var bottomLeft = new THREE.Vector3(me.leftPoints[index].x - (H - S - me.leftBottomPoints[index].z + 3*Math.sqrt(2))*unitDir.x , me.leftPoints[index].y - (H - S - me.leftBottomPoints[index].z + 3*Math.sqrt(2))*unitDir.y , me.leftBottomPoints[index].z);

          var middleLeft = new THREE.Vector3(me.leftPoints[index].x, me.leftPoints[index].y, Math.sqrt(2) * 3 + H - S);

          return [topLeft, topRight, middleRight, bottomRight, bottomLeft, middleLeft];
        }
      },

      get3dObject: function(){
        return this.object;
      },

      generateRayLine: function(begin, end){
        var lineGeometry = new THREE.Geometry();
        lineGeometry.vertices.push(begin);
        lineGeometry.vertices.push(end);
        var material = new THREE.LineBasicMaterial({color: new THREE.Color('#0003ff')});
        var line = new THREE.Line(lineGeometry, material);
        this.viewport3d.scene.model.add(line);
      },

      getCenterSpanMiddleVertice: function(){
        var me = this;
        var begin = me.centerSpan.begin;
        var end = me.centerSpan.end;
        var vertice = new THREE.Vector3(begin.x + (end.x - begin.x)/2, begin.y + (end.y - begin.y)/2, begin.z + (end.z - begin.z)/2);
        return vertice;
      },

      generateRayFromCenterCatenaryToPoint: function(point){
        var end = this.getCenterSpanMiddleVertice();
        var begin = point;
        this.generateRayLine(begin, end);
        var far = Math.sqrt(Math.pow(end.x - begin.x, 2) + Math.pow(end.y - begin.y, 2) + Math.pow(end.z - begin.z, 2));
        var direction = new THREE.Vector3(end.x - begin.x, end.y - begin.y, end.z - begin.z).normalize();
        var raycaster = new THREE.Raycaster(begin, direction, 0, far);
        return raycaster;
      },

      getIntersectsWithVeg: function(point){
        var raycaster = this.generateRayFromCenterCatenaryToPoint(point);
        var object = this.object;
        var intersects = raycaster.intersectObject(object, true);
        var intersections = [];
        _.forEach(intersects, function(intersect){
          if(intersect.object.name == 'clearance'){
            intersections.push(intersect.point);
          }
        });
        return intersections;
      }

    });

    return Clearance;
  }
);
