define(
  [
    'model/CenterSpan',
    'model/Catenary',
    'model/Clearance',
    'lodash',
    'four',
    'jsface'
  ],
  function (CenterSpan, Catenary, Clearance, _) {
    const Viewport3D = Class([FOUR.Viewport3D], {

      constructor: function(config){
        var me = this;
        var scene = new FOUR.Scene();

        config.scene = scene;
        Viewport3D.$super.call(this, config);

        me.isMouseDown = false;
        me.isRealClick = false;

        this.domElement = null; // DOMElement of the <div> container

        me.attrOverlay = new FOUR.Overlay({
          viewport: me,
          domElement: document.getElementById('attr-overlay')
        });

        _.extend(this, config);

        // record collection of catenary
        me.catenaryObjArray = [];
        me.clearanceObj = {};
        me.centerSpanObj = {};

        me.setupCamera();
        me.setupLayers();
        me.setupHelper();
        me.setupSelection();
        me.setupControllers();


        me.backgroundColor = new THREE.Color('#efffff');
        me.renderer.setClearColor(me.backgroundColor);

        me.render();

        //
        me.createCenterSpan();
        me.createCatenaries();
        me.generateClearance();

        // event listeners
        me.camera.addEventListener('continuous-update-end', function (e) {
          me.onContinuousUpdateEnd(e);
        });
        me.camera.addEventListener('continuous-update-start', function (e) {
          me.onContinuousUpdateStart(e);
        });
        me.camera.addEventListener(FOUR.EVENT.UPDATE, me.render.bind(me), false);
        me.domElement.addEventListener('mousedown', function () {
          me.isMouseDown = true;
        });
        me.domElement.addEventListener('mousemove', function () {
          if (me.isMouseDown) {
            me.update(true);
          }
          me.render();
        });
        me.domElement.addEventListener('mousewheel', function () {
          me.update(true);
          me.render();
        });
        me.domElement.addEventListener('mouseup', function () {
          me.isMouseDown = true;
        });
        me.scene.addEventListener('update', me.render.bind(me), false);

      },

      createCenterSpan: function(){
        var me = this;
        var centerSpan = me.centerSpan;
        var clearanceConfig = me.clearanceConfig;
        var config = {
          begin: new THREE.Vector3(centerSpan[0][0], centerSpan[0][1], centerSpan[0][2]),
          end: new THREE.Vector3(centerSpan[1][0], centerSpan[1][1], centerSpan[1][2]),
          clearanceConfig: clearanceConfig
        };
        var centerSpanObject = new CenterSpan(config);
        me.centerSpanObj = centerSpanObject;
        var object = centerSpanObject.gen3DObject()
        me.scene.model.add(object);
      },

      createCatenaries: function(){
        var me = this;
        var clearanceConfig = me.clearanceConfig;
        _.forEach(me.catenaries, function(catenary){
          var config = {
            begin: new THREE.Vector3(catenary[0][0], catenary[0][1], catenary[0][2]),
            vertex: new THREE.Vector3(catenary[1][0], catenary[1][1], catenary[1][2]),
            end: new THREE.Vector3(catenary[2][0], catenary[2][1], catenary[2][2]),
            clearanceConfig: clearanceConfig
          };
          var catenaryObject = new Catenary(config);
          me.catenaryObjArray.push(catenaryObject);
          var catenary = catenaryObject.gen3DObjectPolynomial();
          catenary.name = 'catenary';
          me.scene.model.add(catenary);
        });
      },

      generateClearance: function(){
        var me = this;
        var centerSpan = me.centerSpanObj;
        var H = centerSpan.getH();
        var S = centerSpan.getS();
        var V = centerSpan.getV();
        var unitDir = centerSpan.getUnitVerticalNormal();
        var towerHeight = centerSpan.getTowerHeight();
        var config = {
          centerSpan: centerSpan,
          catenaryObjArray: me.catenaryObjArray,
          unitDir: unitDir,
          H: H,
          S: S,
          V: V,
          towerHeight: towerHeight,
          viewport3d: me
        }
        //
        var clearance = new Clearance(config).init();
        me.clearanceObj = clearance;
        me.scene.model.add(clearance.get3dObject());
      },

      generateIntersection: function(point){
        var me = this;
        var intersectGeometry = new THREE.Geometry();
        var clearance = me.clearanceObj;
        var points = clearance.getIntersectsWithVeg(point);
        intersectGeometry.vertices = _.extend(intersectGeometry.vertices, points);
        console.log(points);
        var material = new THREE.PointsMaterial({color: new THREE.Color('#da1a1a')});
        var intersects = new THREE.Points(intersectGeometry, material);
        me.scene.model.add(intersects);
      },

      setupCamera: function(){
        var me = this;
        var camera = new FOUR.TargetCamera(45, me.domElement.clientWidth / me.domElement.clientHeight, 0.1, 10000);
        camera.name = 'camera';
        camera.setPositionAndTarget(new THREE.Vector3(50, 50, 50), new THREE.Vector3());
        me.setCamera(camera);
      },

      setupHelper: function(){
        var me = this;

        var axis = new THREE.AxisHelper(20);
        me.scene.helpers.add(axis);


        var size = 100;
        var step = 10;
        var gridHelper = new THREE.GridHelper(size, step);
        gridHelper.rotateOnAxis(new THREE.Vector3(1,0,0), Math.PI / 2);
        me.scene.helpers.add(gridHelper);
      },

      setupControllers: function () {
        var me = this;

        // Scene navigation controllers.
        var arrow = me.controllers.arrow = new FOUR.ArrowController({viewport: me});
        var pan = me.controllers.pan = new FOUR.PanController({viewport: me,
          panSpeed: 1.7});
          var rotate = me.controllers.rotate = new FOUR.RotateController({viewport: me});
          var zoom = me.controllers.zoom = new FOUR.ZoomController({
            viewport: me,
            wheelZoomSpeed: 500,
            PIXEL_STEP: 5,
            WHEEL_ZOOM_RATIO: 1000
          });

          // The tour controller generates a tour path whenever the selection
          // set changes. It is used to facilitate quick review of selected
          // entities and should be enabled by default at all times.
          var tour = me.controllers.tour = new FOUR.TourController({
            planner: {
              workersPath: '/js/vendor/four/dist/workers/'
            },
            viewport: me
          });

          // orbit navigation mode
          var orbit = me.controllers.orbit = new FOUR.MultiController({viewport: me});
          orbit.addController(arrow, 'arrow');
          orbit.addController(pan, 'pan');
          orbit.addController(rotate, 'rotate');
          orbit.addController(me.controllers.selection, 'select');
          orbit.addController(tour, 'tour');
          orbit.addController(zoom, 'zoom');

          // first person navigation mode
          var look = me.controllers.look = new FOUR.LookController({viewport: me});
          var walk = me.controllers.walk = new FOUR.WalkController({viewport: me});
          walk.movementSpeed = 5.0;
          walk.enforceWalkHeight = true;

          var firstperson = me.controllers.firstperson = new FOUR.MultiController({viewport: me});
          firstperson.addController(arrow, 'arrow');
          firstperson.addController(look, 'look');
          firstperson.addController(me.controllers.selection, 'select');
          firstperson.addController(tour, 'tour');
          firstperson.addController(walk, 'walk');

          // set default controller
          me.setActiveController('orbit');
        },

        setupSelection: function () {
          var me = this;

          // Selection set of 3D scene objects. Update the selection
          // bounding box whenever the selection set changes.
          var selectionSet = me.selectionSet = new FOUR.SelectionSet();
          selectionSet.addEventListener('update', function (event) {
            console.info('Select', event);
            selectionBoundingBox.update(event.selection);
          });

          // The selection bounding box. Render the viewport whenever the
          // bounding box changes.
          var selectionBoundingBox = me.selectionBoundingBox = new FOUR.BoundingBox();
          selectionBoundingBox.addEventListener('update', me.render.bind(me));

          // Click and marquee selection. These two selection modes can both be
          // enabled at the same time. We'll make them part of a single
          // multi-controller so that we can turn selection on and off whenever
          // we need to.
          var select = new FOUR.MultiController({viewport: me});

          var click = new FOUR.ClickSelectionController({viewport: me});
          click.addEventListener('add', function (event) {
            selectionSet.add(event.selection);
          });
          click.addEventListener('clear', function () {
            selectionSet.removeAll();
          });
          click.addEventListener('lookat', function (event) {
            me.camera.setTarget(event.position, true).then(function () {
              return me.camera.setDistance(100, true);
            });
          });
          click.addEventListener('remove', function (event) {
            selectionSet.remove(event.selection);
          });
          click.addEventListener('select', function (event) {
            selectionSet.select([event.selection]);
          });
          click.addEventListener('settarget', function (event) {
            var bbox = new FOUR.BoundingBox();
            bbox.update([event.object]);
            me.zoomToFit(bbox);
          });
          click.addEventListener('update', function () {
            me.render();
          });

          var hover = new FOUR.HoverSelectionController({
            viewport: me,
            HOVER_TIMEOUT: 600
          });
          hover.addEventListener('hover', function (event) {
            var overlay = me.attrOverlay;

            if (event.selection && Cb.shiftKey) {
              try {
                overlay.clear();
                // $('#cb-tip').empty();
              } catch (e) {
                // pass
              }
              // build the popup
              var data = event.selection.object.userData;
              var item = data.item;
              if (!item) { return; }
              var table = item.genAttrTable();
              console.log('hover at', event.selection.object.uuid);
              // $('#cb-tip').html(table);
              overlay.add({
                className: 'label blue fw animated fadeIn',
                innerHTML: table,
                position: FOUR.POSITION.CENTER,
                target: event.selection.object.uuid
              });
            }
            if (!event.selection) {
              //$('#cb-tip').empty();
              overlay.clear();
            }
          });

          select.addController(click, 'click');
          select.addController(hover, 'hover');
          select.enable();

          me.controllers.click = click;
          me.controllers.hover = hover;
          me.controllers.selection = select;
        },

        setupLayers: function () {
          var me = this;
          // TO clean up
          me.container3d = new THREE.Object3D();
          me.scene.model.add(me.container3d);

          me.pointCursorInit();
        },

        pointCursorInit: function () {
          var sphereGeom = new THREE.SphereGeometry(1, 8, 8);
          var sphereMaterial = new THREE.MeshLambertMaterial({
            color: '#63f07a',
            wireframe: false,
            opacity: 0.5,
            transparent: true
          });
          this.pointCursor = new THREE.Mesh(sphereGeom, sphereMaterial);
          this.pointCursor.visible = false;
          this.scene.helpers.add(this.pointCursor);
        },

        setupTransform: function () {
          var me = this;
          var ctrlTransform = me.ctrlTransform =
          new THREE.TransformControls(me.camera, me.domElement);
          // TODO add the transform controller to controllers
          // switch to that controller as is done with others
          ctrlTransform.addEventListener('mouseDown', function () {
            me.controller.disable();
          });
          ctrlTransform.addEventListener('mouseUp', function () {
            me.controller.enable();
          });
          me.scene.add(ctrlTransform);
          return ctrlTransform;
        },

      });
      return Viewport3D;
    });
