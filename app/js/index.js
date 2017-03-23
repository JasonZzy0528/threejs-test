(function(){
  'use strict';
  require.config({baseUrl : 'js/'});

  require(['module/projectPointToPlane'], function(projectPointToPlane){
    let scene, camera, renderer, plane, point, controls;
    let mouse = [.5, .5],
    zoompos = -100,
    minzoomspeed = .015,
    zoomspeed = minzoomspeed;

    const pointData = {
      x: 12,
      y: 13,
      z: 12
    },
    planeData = {
      rotateX: .5*Math.PI,
      rotateY: .5*Math.PI,
      rotateZ: .5*Math.PI,
      translateX: 15,
      translateY: 3,
      translateZ: -2
    };


    init();
    animate();

    function init(){
      scene = new THREE.Scene();

      camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, .1, 3000);
      camera.position.set(40, 40, 40);


      controls = new THREE.OrbitControls( camera );
      controls.addEventListener( 'change', render );

      renderer = new THREE.WebGLRenderer();
      renderer.setSize( window.innerWidth, window.innerHeight);
      renderer.setClearColor(new THREE.Color('#c7c7c7'), 1);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.shadowMap.enableed = true;
      document.body.appendChild( renderer.domElement );

      initHelper();

      // const matrix = new THREE.Matrix4().makeTranslation(0, 1, 0);
      const plane = initPlane();
      const point = initPoint();

      const projectPoint = projectPointToPlane.getProjectPointToPlane(plane, point);
      scene.add(projectPoint);
      camera.lookAt(scene.position);
      // renderer.render(scene, camera);
      // animate()

      window.addEventListener( 'resize', onWindowResize, false );
      // window.addEventListener('mousemove', onMouseMove, false);
      // window.addEventListener( 'wheel', onMouseWheel, false );
    }

    function initHelper(){
      const axis = new THREE.AxisHelper(20);
      scene.add(axis);

      const gridHelper = new THREE.GridHelper(50,50);
      scene.add(gridHelper);
    }

    function initPoint(){
      let pointGeometry = new THREE.Geometry();
      const pointVector = new THREE.Vector3(0, 0, 0);
      pointGeometry.vertices.push(pointVector);
      const pointMaterial = new THREE.PointsMaterial({color: new THREE.Color('#0799c7')});
      let disPoint = new THREE.Points(pointGeometry, pointMaterial);
      disPoint.translateX(pointData.x);
      disPoint.translateY(pointData.y);;
      disPoint.translateZ(pointData.z);
      scene.add(disPoint);
      return disPoint;
    }

    function initPlane(){
      let planeGeometry = new THREE.PlaneGeometry(40, 40);

      const planeMaterial = new THREE.MeshBasicMaterial({color: new THREE.Color('#c76907'), side: THREE.DoubleSide});
      let disPlane = new THREE.Mesh(planeGeometry, planeMaterial);
      disPlane.rotateX(planeData.rotateX);
      disPlane.rotateY(planeData.rotateY);
      disPlane.rotateZ(planeData.rotateZ);

      disPlane.translateX(planeData.translateX);
      disPlane.translateY(planeData.translateY);
      disPlane.translateZ(planeData.translateZ);
      scene.add(disPlane);
      return disPlane;
    }

    function animate() {
      requestAnimationFrame( animate );
      controls.update();
      // render();
    }

    function render() {
      renderer.render( scene, camera );
    }
    // function render() {
    //   const minzoom = 1, maxzoom = 200;
    //   let damping = (Math.abs(zoomspeed) > minzoomspeed ? .95 : 1.0);
    //   let zoom = THREE.Math.clamp(Math.pow(Math.E, zoompos), minzoom, maxzoom);
    //   zoompos = Math.log(zoom);
    //
    //   if ((zoom == minzoom && zoomspeed < 0) || (zoom == maxzoom && zoomspeed > 0)) {
    //     damping = .85;
    //   }
    //   zoompos += zoomspeed;
    //   zoomspeed *= damping;
    //
    //   camera.position.x = Math.sin(.5 * Math.PI * (mouse[0] - .5)) * zoom;
    //   camera.position.y = Math.sin(.25 * Math.PI * (mouse[1] - .5)) * zoom;
    //   camera.position.z = Math.cos(.5 * Math.PI * (mouse[0] - .5)) * zoom;
    //   camera.lookAt(scene.position);
    //
    //   renderer.render(scene, camera);
    // }

    function onWindowResize() {

      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize( window.innerWidth, window.innerHeight );

      render();

    }

    function onMouseMove(ev) {
      mouse[0] = ev.clientX / window.innerWidth;
      mouse[1] = ev.clientY / window.innerHeight;
    }

    function onMouseWheel(ev) {
      var amount = ev.deltaY;
      if ( amount === 0 ) return;
      var dir = amount / Math.abs(amount);
      zoomspeed = dir/10;
      // Slow down default zoom speed after user starts zooming, to give them more control
      minzoomspeed = 0.001;
    }

  })

})();
