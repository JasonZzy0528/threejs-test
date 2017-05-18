var _ = require('lodash');
var FOUR = require('../lib/four/dist/four');
var THREE = require('three');
var jsface = require('jsface'),
Class = jsface.Class;
var CenterSpan = require('../model/center_span');
var Catenary = require('../model/catenary');
var Clearance = require('../model/clearance');

const Viewport3D = Class([FOUR.Viewport3D], {

  constructor: function(config){
    var me = this;
    var scene = new FOUR.Scene();

    config.scene = scene;
    Viewport3D.$super.call(this, config);

    me.isMouseDown = false;
    me.isRealClick = false;

    this.domElement = null; // DOMElement of the <div> container

    _.extend(this, config);

    // record collection of catenary
    me.catenaryObjArray = [];
    me.clearanceObj = {};
    me.centerSpanObj = {};
    me.intersectObjArray = [];

    me.setupCamera();

    me.backgroundColor = new THREE.Color('#efffff');
    me.renderer.setClearColor(me.backgroundColor);

    me.render();
    me.createCenterSpan();
    me.createCatenaries();
    me.generateClearance();
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
    var H = me.clearanceConfig.H;
    var S = me.clearanceConfig.S;
    var V = me.clearanceConfig.V;
    var P = me.clearanceConfig.P;
    var B = me.clearanceConfig.B;
    var unitDir = centerSpan.getUnitVerticalNormal();
    var start_towerHeight = me.clearanceConfig.start_towerHeight;
    var towerHeight_gap = me.clearanceConfig.towerHeight_gap;
    var config = {
      centerSpan: centerSpan,
      catenaryObjArray: me.catenaryObjArray,
      unitDir: unitDir,
      H: H,
      S: S,
      V: V,
      P: P,
      B: B,
      start_towerHeight: start_towerHeight,
      towerHeight_gap: towerHeight_gap,
      start_groundZ: me.clearanceConfig.start_groundZ,
      groundZ_gap: me.clearanceConfig.groundZ_gap,
      viewport3d: me
    };
    var clearance = new Clearance(config).init();
    me.clearanceObj = clearance;
    me.scene.model.add(clearance.get3dObject());
  },

  getClearance: function(){
    return this.clearanceObj;
  },

  setupCamera: function(){
    var me = this;
    var camera = new FOUR.TargetCamera(45, 1, 0.1, 10000);
    camera.name = 'camera';
    camera.setPositionAndTarget(new THREE.Vector3(), new THREE.Vector3());
    me.setCamera(camera);
  }
});

module.exports = Viewport3D;
