define(
  [],
  function () {

    var Catenary = Class([], {
      constructor: function(config){
        this.material = new THREE.LineBasicMaterial({
          color: new THREE.Color('#ff4d00'),
          linewidth: 10
        });
        _.extend(this, config);
      },


      // switch all y and all z with z and y
      gen3DObjectPolynomial: function () {
        var i, tx, ty, v, n = 10, t, z;
        var offset = new THREE.Vector3(0,0,0);
        var begin = this.begin,
        vertex = this.vertex,
        end = this.end,
        // sag = this.sag;
        sag = 10;

        var geometry = new THREE.Geometry();
        var dx = end.x - begin.x,
        dz = end.z - begin.z,
        x  = begin.x, z = begin.z;
        var mag = Math.sqrt((dx * dx) + (dz * dz)),
        xd = dx / mag,
        zd = dz / mag,
        xm = vertex.x,
        zm = vertex.z;
        var a = vertex.y;
        var t1 = (begin.x - xm) * xd + (begin.z - zm) * zd;
        var z1 = begin.y - a;
        var t2 = (end.x - xm) * xd + (end.z - zm) * zd;
        var z2 = end.y - a;
        var b = 0.5 * (t1 * t1 * t1 * t1 + t2 * t2 * t2 * t2) /
        (z1 * t1 * t1 + z2 * t2 * t2);
        var c = 0.0;
        for (i = 0; i <= 10; i += 0.5){
          // mutiply 10 to avoid inaccuracy
          x = begin.x + (i / 10 * dx);console.log(x);
          z = begin.z + (i / 10 * dz);
          t = (x - xm) * xd + (z - zm) * zd;
          var xc = (t - c);
          y = (xc * xc) / (2*b) + a;
          v = new THREE.Vector3(x, y, z).sub(offset);
          geometry.vertices.push(v);
        }
        this.obj = new THREE.Line(geometry, this.material);
        return this.obj;
      },

      getQuarterPoints: function(){
        if(this.obj){
          return [this.obj.geometry.vertices[5], this.obj.geometry.vertices[15]];
        }else{
          return null;
        }
      },

      getBegin: function(){
        return this.begin;
      },

      getEnd: function(){
        return this.end;
      },

      getUnitVerticalNormal: function(){
        var me = this;
        var normal = new THREE.Vector3(me.end.x - me.begin.x, me.end.y - me.begin.y, me.end.z - me.begin.z);
        var secondNormal = new THREE.Vector3(me.end.x - me.vertex.x, me.end.y - me.vertex.y, me.end.z - me.vertex.z);
        return normal.cross(secondNormal).normalize();
      },

      getP: function(){
        return 2.5;
      },

      getH: function(){
        return 3;
      },

      getV: function(){
        return 3;
      },

      getTowerHeight: function(){
        return 30;
      },

      getRightBound: function(){
        var me = this;
        var vertices = me.getVertices();
        var unitDir = me.getUnitVerticalNormal();
        var rightPoints = [];
        var p = this.getP();
        var h = this.getH();
        _.forEach(vertices, function(vertice, index){
          var distance;
          if(index <= 5 || index >= 15){
            distance = p;
          }else{
            distance = h;
          }
          var rightPoint = new THREE.Vector3(vertice.x + distance*unitDir.x, vertice.y + distance*unitDir.y, vertice.z + distance*unitDir.z);
          rightPoints.push(rightPoint);
        });
        return rightPoints;
      },

      getLeftBound: function(){
        var me = this;
        var vertices = me.getVertices();
        var unitDir = me.getUnitVerticalNormal();
        var leftPoints = [];
        var p = this.getP();
        var h = this.getH();
        _.forEach(vertices, function(vertice, index){
          var distance;
          if(index <= 5 || index >= 15){
            distance = p;
          }else{
            distance = h;
          }
          var leftPoint = new THREE.Vector3(vertice.x - distance*unitDir.x, vertice.y - distance*unitDir.y, vertice.z - distance*unitDir.z);
          leftPoints.push(leftPoint);
        });
        return leftPoints;
      },

      getVertices: function(){
        return this.obj.geometry.vertices;
      },

      getBottomBound: function(){
        var vertices = this.getVertices();
        var p = this.getP();
        var v = this.getV();
        var bottomPoints = [];
        _.forEach(vertices, function(vertice, index){
          var distance;
          if(index <= 5 || index >= 15){
            distance = p;
          }else{
            distance = v;
          }
          var bottomPoint = new THREE.Vector3(vertice.x, vertice.y - distance, vertice.z);
          bottomPoints.push(bottomPoint);
        });
        return bottomPoints;
      },

      getTopBound: function(){
        var vertices = this.getVertices();
        var towerHeight = this.getTowerHeight();
        var topPoints = [];
        _.forEach(vertices, function(vertice, index){
          var topPoint = new THREE.Vector3(vertice.x, towerHeight, vertice.z);
          topPoints.push(topPoint);
        });
        return topPoints;
      }

    });

    return Catenary;
  }
);
