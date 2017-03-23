(function(){
  'use strict';
  require.config({
    baseUrl : 'js/',
    paths: {
      jsface: 'lib/jsface/jsface',
      lodash: 'lib/lodash/lodash',
      // 'three-transform': 'lib/threejs-transform-control/TransformControls',
      'three-transform': 'lib/threejs-transform-control/TransformControls_modified',
      'eventemitter3': 'lib/eventemitter3/index',
    }
  });

  require([
    'jsface',
    'model/Tower',
    'module/Viewport3D',
    'three-transform',
    'eventemitter3'
  ], function(jsface, Tower, Viewport3D){
    let light, renderer;

    light = new THREE.AmbientLight( new THREE.Color('#ffffff') ); // soft white light


    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight);
    renderer.setClearColor(new THREE.Color('#c7c7c7'), 1);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enableed = true;
    document.body.appendChild( renderer.domElement );

    const slice_1 = [[4,0,5],[-4,0,5],[-4,0,-5],[4,0,-5],[4,0,5]],
    slice_2 = [[2,2,4],[-2,2,4],[-2,2,-4],[2,2,-4],[2,2,4]],
    slice_3 = [[2,5,2],[-2,5,2],[-2,5,-2],[2,5,-2],[2,5,2]],
    slice_4 = [[5,7,4],[-5,7,4],[-5,7,-4],[5,7,-4],[5,7,4]],
    slice_5 = [[2,10,1],[-2,10,1],[-2,10,-1],[2,10,-1],[2,10,1]];


    const slices = [slice_1, slice_2, slice_3, slice_4, slice_5],
    center_axis = [[0,0,0],[0,10,0]],
    direct = [0,0,1];

    const centerAxis = [[0,0,0],[0,10,0]]

    const config = {
      cameraCfg: {
        aspect: window.innerWidth / window.innerHeight
      },
      light: light,
      domElement: renderer.domElement,
      renderer: renderer,
      slices: slices,
      centerAxis: centerAxis
    };

    var viewport3d = new Viewport3D(config);
    viewport3d.createTower();
  })

})();
