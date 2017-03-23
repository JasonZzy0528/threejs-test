define(
  ['jsface'],
  function () {

    var CenterSpan = Class([], {
      constructor: function(config){
        var me = this;
        me.material = new THREE.LineBasicMaterial({
          color: new THREE.Color('#000000'),
          linewidth: 1
        });
        _.extend(me, config);
      },

      gen3DObject: function(){
        var me = this;
        var begin = me.begin;
        var end = me.end;
        var geometry = new THREE.Geometry();
        geometry.vertices.push(begin);
        geometry.vertices.push(end);
        var material = me.material;
        var line = new THREE.Line(geometry, material);
        line.name = 'center_span';
        me.center_span_object = line;
        return me.center_span_object;
      },

      getTowerHeight: function(){
        return this.clearanceConfig.towerHeight;
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
        var verticalNormal = normal.cross(secondNormal).normalize();
        return verticalNormal;
      }
    });

    return CenterSpan;
  }
);
