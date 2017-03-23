define(
  ['jsface'],
  function () {

    var Catenary = Class([], {
      constructor: function(config){
        var me = this;
        me.material = new THREE.LineBasicMaterial({
          color: new THREE.Color('#000000'),
          linewidth: 1
        });
        _.extend(me, config);
      },

      gen3DObjectPolynomial: function () {
        var i, tx, ty, v, n = 10, t, z;
        // var offset = this.getOffset();
        var begin = this.begin,
        vertex = this.vertex,
        end = this.end,
        sag = 10;

        var geometry = new THREE.Geometry();
        var dx = end.x - begin.x,
            dy = end.y - begin.y,
            x  = begin.x, y = begin.y;
        var mag = Math.sqrt((dx * dx) + (dy * dy)),
            xd = dx / mag,
            yd = dy / mag,
            xm = vertex.x,
            ym = vertex.y;
        var a = vertex.z;
        var t1 = (begin.x - xm) * xd + (begin.y - ym) * yd;
        var z1 = begin.z - a;
        var t2 = (end.x - xm) * xd + (end.y - ym) * yd;
        var z2 = end.z - a;
        var b = 0.5 * (t1 * t1 * t1 * t1 + t2 * t2 * t2 * t2) /
          (z1 * t1 * t1 + z2 * t2 * t2);
        var c = 0.0;

        // multiply 10 avoid inaccurate
        for (i = 0; i <= 10; i += 0.5) {
          x = begin.x + (i/10 * dx);
          y = begin.y + (i/10 * dy);
          t = (x - xm) * xd + (y - ym) * yd;
          var xc = (t - c);
          z = (xc * xc) / (2*b) + a;
          v = new THREE.Vector3(x, y, z);
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

      getNormal: function(){
        var me = this;
        var normal = new THREE.Vector3(me.end.x - me.begin.x, me.end.y - me.begin.y, me.end.z - me.begin.z);
        return normal;
      },

      getUnitVerticalNormal: function(){
        var me = this;
        var normal = me.getNormal();
        var secondNormal = new THREE.Vector3(0, 0, -me.begin.z);
        return normal.cross(secondNormal).normalize();
      },

      getP: function(){
        return this.clearanceConfig.P;
      },

      getH: function(){
        return this.clearanceConfig.H;
      },

      getV: function(){
        return this.clearanceConfig.V;
      },

      getS: function(){
        return this.clearanceConfig.S;
      },

      getTowerHeight: function(){
        return this.clearanceConfig.towerHeight;
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
          if(index < 5 || index > 15){
            distance = p;
          }else{
            distance = h;
          }
          var rightPoint = new THREE.Vector3(vertice.x - distance*unitDir.x, vertice.y - distance*unitDir.y, vertice.z - distance*unitDir.z);
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
          if(index < 5 || index > 15){
            distance = p;
          }else{
            distance = h;
          }
          var leftPoint = new THREE.Vector3(vertice.x + distance*unitDir.x, vertice.y + distance*unitDir.y, vertice.z + distance*unitDir.z);
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
          if(index < 5 || index > 15){
            distance = p;
          }else{
            distance = v;
          }
          var bottomPoint = new THREE.Vector3(vertice.x, vertice.y, vertice.z - distance);
          bottomPoints.push(bottomPoint);
        });
        return bottomPoints;
      },

      getTopBound: function(){
        var vertices = this.getVertices();
        var towerHeight = this.getTowerHeight();
        var topPoints = [];
        _.forEach(vertices, function(vertice, index){
          var topPoint = new THREE.Vector3(vertice.x, vertice.y, towerHeight);
          topPoints.push(topPoint);
        });
        return topPoints;
      },

      getAngleToCatenary: function(unitDir, point, index){
        var me = this;
        var vertice = me.getVertices()[index];
        var verticeToPointOnCenterCatenary = new THREE.Vector3(vertice.x - point.x, vertice.y - point.y, vertice.z - point.z);
        const angle = unitDir.angleTo(verticeToPointOnCenterCatenary);
        return angle
      },

      changeMaterialColor: function(color){
        var me = this;
        me.obj.material.color = color;
        me.obj.material.needsUpdate = true;
      }
    });

    return Catenary;
  }
);
