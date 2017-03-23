define(
  [
    'lodash',
    'jsface',
    'three-transform'
  ],
  function (_) {
    var tower = Class([EventEmitter], {
      constructor: function (config) {
        this.tower = null;
        this.vertices = [];
        this.centerAxis = null;
        _.extend(this, config);
        this.dom = this.viewport3d.domElement;
        this.material = {
          tower : new THREE.MeshBasicMaterial({
            color : new THREE.Color('#565e11'),
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.4
          }),
          centerAxis: new THREE.MeshBasicMaterial({
            color : new THREE.Color('#21a7e9'),
          })
        };
      },

      init: function () {
        var me = this,
        group = new THREE.Group(),
        slices = me.viewport3d.slices,
        centerAxisPoints = me.viewport3d.centerAxis,
        centerAxisMaterial = me.material.centerAxis;

        _.each(slices, function(slice){
          _.each(slice, function(vertice){
            const vector = new THREE.Vector3(vertice[0], vertice[1], vertice[2]);
            var index = _.findIndex(me.vertices,function(v){ return v.equals(vector)});
            if(index == -1){
              me.vertices.push(vector);
            }
          });
        });

        group = me.generateTower();
        me.tower = group;
        me.viewport3d.scene.add(me.tower);

        var centerAxisGeometry = new THREE.Geometry();
        centerAxisGeometry.vertices.push(new THREE.Vector3(centerAxisPoints[0][0],centerAxisPoints[0][1],centerAxisPoints[0][2]));
        centerAxisGeometry.vertices.push(new THREE.Vector3(centerAxisPoints[1][0],centerAxisPoints[1][1],centerAxisPoints[1][2]));

        var centerAxis = new THREE.Line(centerAxisGeometry, centerAxisMaterial);
        me.centerAxis = centerAxis;
        me.viewport3d.scene.add(me.centerAxis);

        return this;
      },

      getTower: function(){
        return this.tower;
      },

      showCenterAxis: function(){

      },

      update: function(){
        var me = this;
        var transformMode = me.viewport3d.ctrlTransform.getMode();
        // find changed slice
        var updateSliceIndex= _.findIndex(me.tower.children, function(slice){
          return slice.name == 'tower_slice' && !slice.scale.equals(new THREE.Vector3(1,1,1));
        });

        if(updateSliceIndex != -1){
          var updateSlice = me.tower.children[updateSliceIndex];

          // me.viewport3d.ctrlTransform.detach(updateSlice);
          var vertices = me.vertices;
          _.forEach(updateSlice.geometry.vertices, function(vertice){
            var vector = new THREE.Vector3();
            vector.copy( vertice );
            vector.applyMatrix4( updateSlice.matrix );
            var verticeIndex = _.findIndex(vertices,function(v){ return v.equals(vertice)});
            me.vertices[verticeIndex] = vector;
          });


          var group = me.generateTower();

          // translate
          var origPosition = me.tower.position,
          currentPosition = group.position;
          var axis = new THREE.Vector3(origPosition.x - currentPosition.x, origPosition.y - currentPosition.y, origPosition.z - currentPosition.z).normalize();
          var distance = currentPosition.distanceTo(origPosition);
          group.translateOnAxis ( axis, distance );
          // rotate
          group.setRotationFromEuler(me.tower.getWorldRotation());
          group.updateMatrixWorld();
          me.viewport3d.scene.remove(me.tower);

          me.tower = group;
          me.viewport3d.scene.add(me.tower);
          // me.viewport3d.ctrlTransform.attach(me.tower.children[updateSliceIndex]);
          me.viewport3d.ctrlTransform.object = me.tower.children[updateSliceIndex];
          me.viewport3d.SELECTED_TOWER = me;
        }
      },

      generateTower: function(){
        var me = this;
        var towerMaterial = me.material.tower;
        var index = 0;
        var slicePointNum = 4;
        var slice_side_face_geometry = new THREE.Geometry();
        slice_side_face_geometry.vertices = me.vertices;
        var group = new THREE.Group();
        while(index < me.vertices.length){
          var slice_face_geometry_vertices = _.slice(me.vertices,index, index + slicePointNum);
          var slice_face_geometry = new THREE.Geometry();
          slice_face_geometry.vertices = slice_face_geometry_vertices;
          slice_face_geometry.faces.push(new THREE.Face3(0,1,2));
          slice_face_geometry.faces.push(new THREE.Face3(0,3,2));
          slice_face_geometry.verticesNeedUpdate = true;
          slice_face_geometry.computeFaceNormals();
          slice_face_geometry.computeVertexNormals();

          let slice_mesh = new THREE.Mesh(slice_face_geometry, towerMaterial);
          slice_mesh.name = 'tower_slice';
          group.add(slice_mesh);

          if(index - 4 >= 0){
            const side_face1 = new THREE.Face3(index, index + 1, index - 4 );
            const side_face2 = new THREE.Face3(index + 1, index - 3, index - 4 );
            const side_face3 = new THREE.Face3(index + 1, index + 2, index - 3 );
            const side_face4 = new THREE.Face3(index + 2, index - 3, index - 2 );
            const side_face5 = new THREE.Face3(index + 2, index + 3, index - 2 );
            const side_face6 = new THREE.Face3(index + 3, index - 2, index - 1);
            const side_face7 = new THREE.Face3(index + 3, index , index - 1);
            const side_face8 = new THREE.Face3(index, index - 4 , index - 1);
            slice_side_face_geometry.faces.push(side_face1);
            slice_side_face_geometry.faces.push(side_face2);
            slice_side_face_geometry.faces.push(side_face3);
            slice_side_face_geometry.faces.push(side_face4);
            slice_side_face_geometry.faces.push(side_face5);
            slice_side_face_geometry.faces.push(side_face6);
            slice_side_face_geometry.faces.push(side_face7);
            slice_side_face_geometry.faces.push(side_face8);
          }
          index = index + 4;
        }
        slice_side_face_geometry.verticesNeedUpdate = true;
        slice_side_face_geometry.computeFaceNormals();
        slice_side_face_geometry.computeVertexNormals();
        var slice_side_mesh = new THREE.Mesh(slice_side_face_geometry, towerMaterial);
        slice_side_mesh.name = 'tower_side_wall';
        group.add(slice_side_mesh)
        group.name = 'tower';
        return group;
      }
    });
    return tower;
  }
);
