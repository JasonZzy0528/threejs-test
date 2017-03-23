(function(){
  // 'use strict';
  require.config({
    baseUrl : 'js/',
    paths: {
      jsface: 'lib/jsface/jsface',
      lodash: 'lib/lodash/lodash',
      eventemitter3: 'lib/eventemitter3/index',
      'three-transform': 'lib/threejs/TransformControls_modified',
      text: 'lib/requirejs-plugins/lib/text',
      json: 'lib/requirejs-plugins/src/json',
      bluebird: 'lib/bluebird/js/browser/bluebird',
      four: 'lib/four/dist/four',
      tween: 'lib/tween.js/src/Tween'
    },
    shim:{
      'bluebird': {
        'exports': 'Promise'
      },
      'four': {
        'deps': ['bluebird', 'tween']
      }
    }
  });

  require([
    'module/Viewport3D4FourScene',
    'module/Intersections',
    'json!constant/conductor_operating.json',
  ], function(Viewport3D, Intersections, conductorConfig){


    const centerSpan = [[20,0,15], [-20, 0, 15]];
    const line2 = [[20,2,13], [0,2,8], [-20, 2, 13]]; //right bottom
    const line3 = [[20,2,15], [0,2,10], [-20, 2, 15]]; //right
    const line4 = [[20,-2,13], [0,-2,8], [-20, -2, 13]]; // left bottom
    const line5 = [[20,-2,15], [0,-2,10], [-20, -2, 15]]; //left

    const catenaries = [];
    // catenaries.push(line1);
    catenaries.push(line2);
    catenaries.push(line3);
    catenaries.push(line4);
    catenaries.push(line5);

    const domElement = document.getElementById('viewport3d');

    const voltage = 132;
    const spanMetres = 110;
    const towerHeight = 15;
    let clearanceConfig = {
      towerHeight: 15
    };

    _.forEach(conductorConfig.type, function(type){
      if(type.voltage == voltage){
        clearanceConfig.P = type.p;
        clearanceConfig.B = type.b;
        _.forEach(type.span, function(span){
          if((span.metersMore < spanMetres && span.metersLess && span.metersLess >= spanMetres) || (span.metersMore < spanMetres && !span.metersLess)){
            clearanceConfig.V = span.v;
            clearanceConfig.H = span.h;
            clearanceConfig.S = span.s;
            clearanceConfig['S*'] = span['s*'];
          }
        });
      }
    });

    clearanceConfig.towerHeight = towerHeight;
    const config = {
      catenaries: catenaries,
      centerSpan: centerSpan,
      domElement: domElement,
      clearanceConfig: clearanceConfig
    };
    var viewport3d = new Viewport3D(config);

    viewport3d.generateIntersection(new THREE.Vector3(20, 0, 0))
  });
})();
