define(
  [
    'model/Tower',
    'model/Catenary',
    'lodash',
    'jsface',
    'eventemitter3'
  ],
  function (Tower, Catenary, _) {
    const Viewport3D = Class([EventEmitter], {
      constructor: function(config){
        var me = this;
        var scene = new THREE.Scene();
        config.scene = scene;

        me.enableSelect = false;

        me.cameraCfg = {
          fov: 45,
          aspect: config.cameraCfg.aspect,
          near: 0.1,
          far: 50000
        };

        me.ctrlTransform = null;
        me.isMouseDown = false;
        me.isRealClick = false;

        me.domElement = null;
        me.mouse = new THREE.Vector2();
        me.IS_INTERSECT = false;
        me.INTERSECT = null;
        me.IS_SELECTED = false;
        me.SELECTED_SLICE = null;
        me.SELECTED_TOWER = null;
        _.extend(me, config);
        me.towerArray = [];
        me.catenaryArray = [];

        me.width = me.domElement.style.width != ""?parseInt(_.replace(me.domElement.style.width, 'px','')):me.domElement.width;
        me.height = me.domElement.style.height != ""?parseInt(_.replace(me.domElement.style.height, 'px','')):me.domElement.height;

        me.setupCamera();
        me.setupLight();
        me.setupHelper();
        me.setOrbitControls();
        me.setupMouseActions();
        me.setupTransform();
        me.setupRaycaster()

        me.animate();
        console.log(me);
      },

      createTower(){
        var me = this;
        // init a tower and put in array
        me.towerArray.push(new Tower({
          viewport3d: me
        }).init())
      },

      createcCatenaries: function(){
        var me = this;
        _.forEach(me.catenaries, function(catenary){
          var config = {
            begin: new THREE.Vector3(catenary[0][0], catenary[0][1], catenary[0][2]),
            vertex: new THREE.Vector3(catenary[1][0], catenary[1][1], catenary[1][2]),
            end: new THREE.Vector3(catenary[2][0], catenary[2][1], catenary[2][2])
          };
          var catenaryObject = new Catenary(config);
          me.catenaryArray.push(catenaryObject);
          var catenary = catenaryObject.gen3DObjectPolynomial();
          console.log(catenary.geometry.vertices);
          catenary.name = 'catenary';
          me.scene.add(catenary);
        });
      },

      generateClearance: function(){
        var me = this;
        var bottomPoints = me.catenaryArray[0].getBottomBound();
        var topPoints = me.catenaryArray[0].getTopBound();
        var leftPoints = me.catenaryArray[0].getLeftBound();
        var rightPoints = me.catenaryArray[0].getRightBound();

        var bottomGeometry = new THREE.Geometry();
        bottomGeometry.vertices = bottomPoints;
        var leftGeometry = new THREE.Geometry();
        leftGeometry.vertices = leftPoints;
        var rightGeometry = new THREE.Geometry();
        rightGeometry.vertices = rightPoints;
        var topGeometry = new THREE.Geometry();
        topGeometry.vertices = topPoints;

        var material = new THREE.LineBasicMaterial({
          color: new THREE.Color('#00e8ff')
        });
        var bottomLine = new THREE.Line(bottomGeometry, material);
        var topLine = new THREE.Line(topGeometry, material);
        var rightLine = new THREE.Line(rightGeometry, material);
        var leftLine = new THREE.Line(leftGeometry, material);
        me.scene.add(bottomLine);
        me.scene.add(topLine);
        me.scene.add(rightLine);
        me.scene.add(leftLine);
        // console.log(me.catenaryArray[0].getBegin());
      },

      setupCamera: function(){
        var me = this;
        var camera = new THREE.PerspectiveCamera(me.cameraCfg.fov, me.cameraCfg.aspect, me.cameraCfg.near, me.cameraCfg.far);
        camera.position.set(40, 40, 40);
        camera.lookAt(me.scene.position);
        me.camera = camera;
      },

      setupLight: function(){
        var me = this;
        me.scene.add(me.light);
      },

      setupHelper: function(){
        var me = this;
        var axis = new THREE.AxisHelper(20);
        me.scene.add(axis);

        var gridHelper = new THREE.GridHelper(100,10);
        me.scene.add(gridHelper);
      },

      setOrbitControls: function(){
        var me = this;
        me.controls = new THREE.OrbitControls( me.camera, me.renderer.domElement);
        me.controls.addEventListener( 'change', me.render );
      },

      setupTransform: function(){
        var me = this;
        var ctrlTransform = me.ctrlTransform =
        new THREE.TransformControls(me.camera, me.domElement);

        ctrlTransform.addEventListener('change', function () {
          if(me.SELECTED_TOWER && ctrlTransform.getMode() == 'scale'){
            me.SELECTED_TOWER.update();
          }
          console.log(ctrlTransform.object)
        });
        ctrlTransform.setMode('scale');
        ctrlTransform.name = 'transform_control';
        me.ctrlTransform = ctrlTransform;

        me.scene.add(me.ctrlTransform);
      },

      setupRaycaster: function(){
        var me = this,
        raycaster = new THREE.Raycaster();
        me.raycaster = raycaster;
      },

      setupMouseActions: function(){
        var me = this,
        container = me.domElement;

        var onMouseMove = function(event){
          me.mouse.x = ( event.clientX / me.width ) * 2 - 1;
          me.mouse.y = - ( event.clientY / me.height ) * 2 + 1;
        }

        var onKeyDown = function(event){
          switch(event.keyCode){
            case 82:
            me.scene.remove(me.ctrlTransform);
            me.ctrlTransform.setMode('rotate');
            console.info('Edit mode: rotate');
            break;
            case 83:
            me.scene.remove(me.ctrlTransform);
            me.ctrlTransform.setMode('scale');
            console.info('Edit mode: scale');
            break;
            case 84:
            me.scene.remove(me.ctrlTransform);
            me.ctrlTransform.setMode('translate');
            console.info('Edit mode: translate');
            break;
            case 81:
            var space = me.ctrlTransform.space == "local" ? "world" : "local";
            me.ctrlTransform.setSpace(space);
            console.info('Edit space: ' + space);
          }
        }

        var onMouseClick = function( event ){
          if(me.INTERSECT){
            if(!me.scene.getObjectByName('transform_control')){
              me.scene.add(me.ctrlTransform);
            }
            var transformMode = me.ctrlTransform.getMode()
            me.IS_SELECTED = true;
            if(me.SELECTED_SLICE){
              me.ctrlTransform.detach( me.SELECTE_SLICE );
              if(me.SELECTED_TOWER){
                me.ctrlTransform.detach( me.SELECTED_TOWER.getTower() );
              }
            }
            me.SELECTED_SLICE = me.INTERSECT;
            me.SELECTED_TOWER = _.find(me.towerArray, function(tower){
              return tower.tower == me.SELECTED_SLICE.parent
            });
            if(transformMode != 'scale'){

              me.ctrlTransform.attach( me.SELECTED_TOWER.getTower() );
            }else{
              me.ctrlTransform.attach( me.SELECTED_SLICE );
            }
          }else{
            me.IS_SELECTED_SLICE = false;
            me.SELECTED_SLICE = null;
          }
        }

        window.addEventListener('keydown', onKeyDown, false);
        window.addEventListener('mousemove', onMouseMove, false);
        window.addEventListener('click', onMouseClick, false);

      },

      animate: function(){
        var me = this;
        requestAnimationFrame(me.animate.bind(this));
        me.render();
      },

      render: function(){
        var me = this;
        if(me.renderer){
          if(me.controls){
            me.controls.update();
          }
          if(me.ctrlTransform){
            me.ctrlTransform.update();
          }
          me.raycaster.setFromCamera( me.mouse, me.camera);
          var transform_mode = me.ctrlTransform.getMode();
          var intersects = me.raycaster.intersectObjects(me.scene.children, true);

          if(intersects.length > 0){
            me.IS_INTERSECT = false;
            _.each(intersects, function(intersect){
              if(transform_mode == 'scale' && intersect.object.name == 'tower_slice'){
                if(me.INTERSECT != intersect.object){
                  if ( me.INTERSECT ) me.INTERSECT.material.color.setStyle(me.INTERSECT.currentStyle);

                  me.INTERSECT = intersect.object;


                  var tower = _.find(me.towerArray, function(tower){
                    return tower.getTower().uuid == me.INTERSECT.parent.uuid;
                  });
                  me.INTERSECT.currentStyle = me.INTERSECT.material.color.getStyle();
                  // hover hint
                  me.INTERSECT.material.color.setStyle('#d2691d');
                }
                me.IS_INTERSECT = true;
                return false;
              }else if(transform_mode != 'scale' && (intersect.object.name == 'tower_slice' || intersect.object.name == 'tower_side_wall')){
                if(me.INTERSECT != intersect.object){
                  if ( me.INTERSECT ) me.INTERSECT.material.color.setStyle(me.INTERSECT.currentStyle);
                  me.INTERSECT = intersect.object;
                  me.INTERSECT.currentStyle = me.INTERSECT.material.color.getStyle();
                  // hover hint
                  me.INTERSECT.material.color.setStyle('#d2691d');
                }
                me.IS_INTERSECT = true;
                return false;
              }
            });
            if(!me.IS_INTERSECT){
              if(me.INTERSECT){
                me.INTERSECT.material.color.setStyle(me.INTERSECT.currentStyle);
              }
              me.INTERSECT = null;
            }
          }else{
            if(me.INTERSECT){
              me.INTERSECT.material.color.setStyle(me.INTERSECT.currentStyle);
            }
            me.INTERSECT = null;
          }

          me.renderer.render(me.scene, me.camera);
        }
      }

    });
    return Viewport3D;
  });
