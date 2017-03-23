define(
  [],
  function(){
    'use strict';
    return {
      getProjectPointToPlane: function(plane, point, scence){
        // plane.updateMatrixWorld();
        const globalPlanePosit = plane.localToWorld(plane.position);
        const globalPlaneDir = plane.getWorldDirection();
        const globalPlaneRevDir = new THREE.Vector3(-globalPlaneDir.x, -globalPlaneDir.y, -globalPlaneDir.z);
        const globalPointPosit = point.localToWorld(point.position);
        const globalPlaneToPoint = new THREE.Vector3(globalPointPosit.x - globalPlanePosit.x, globalPointPosit.y - globalPlanePosit.y, globalPointPosit.z - globalPlanePosit.z);
        const angle = globalPlaneRevDir.angleTo(globalPlaneToPoint);

        const distance = Math.abs(globalPlanePosit.distanceTo(globalPointPosit));

        const projectPointDistance = Math.abs(distance*Math.cos(angle));
        let unitDir;
        if(angle <= .5*Math.PI){
          unitDir = globalPlaneDir.normalize();
        }else{
          unitDir = globalPlaneRevDir.normalize();
        }

        let pointGeometry = new THREE.Geometry();
        const projectPoint = new THREE.Vector3(0, 0, 0);
        pointGeometry.vertices.push(projectPoint);
        const pointMaterial = new THREE.PointsMaterial({color: new THREE.Color('#108c3a')});
        let disPoint = new THREE.Points(pointGeometry, pointMaterial);
        disPoint.translateX(globalPointPosit.x + projectPointDistance*unitDir.x);
        disPoint.translateY(globalPointPosit.y + projectPointDistance*unitDir.y);
        disPoint.translateZ(globalPointPosit.z + projectPointDistance*unitDir.z);
        return disPoint;

      },
    };
  }
);
