const THREE = require('three')
const Stats = require('stats-js')
const dat = require('dat.gui')

const { Vmanager } = require('./variableManager.js')
const { ThreeRenderRegistry } = require('./render/renderRegistry.js')

require('./control/orbitControl.js')
require('./control/trackBallControl.js')
const WEBGL = require('./WEBGL.js')

const { ExtrudeLine,
  lineScene2,
  line2Point,
  LineScene } = require('./geometry/line3DModel.js')
const { GenomeScene } = require('./geometry/genome3Dmodel.js')
const { loadGeometryFromCurve,
  addTubeGeometry,
  addLineGeometry } = require('./geometry/loadGeometry.js')
const { addMesh } = require('./mesh/loadMesh.js')
const { loadCamera } = require('./camera/loadCamera.js')
const { loadRenderer } = require('./render/loadRenderer.js')
const { loadController } = require('./control/loadControl.js')
const { convertModelTxtToObj, Chrom3DModel } = require('./loadModel/loader3DModel.js')

function initThree () {
  let vm = new Vmanager()
  let renderRegistry = new ThreeRenderRegistry()
  // Container ////////////////////////////////////////////////////////////////
  vm.addVariable('container', document.createElement('div'))
  document.body.appendChild(vm.container)

  // Camera ///////////////////////////////////////////////////////////////////
  // Tube Camera
  //  let camera = loadCamera(new THREE.PerspectiveCamera( 27, window.innerWidth/window.innerHeight, 0.1, 3000 ), (camera)=>{
  //    camera.position.z = 270;
  //    vm.addVariable('camera', camera);
  // });

  // Fat Lines Camera
  let camera = loadCamera(new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 3000), (camera) => {
    camera.position.set(500, 100, 260)
    camera.layers.enable(0)
    camera.layers.enable(1)
    vm.addVariable('camera', camera)
  })

  // Scene ////////////////////////////////////////////////////////////////////

  vm.addVariable('scene', new THREE.Scene())

  let light = new THREE.PointLight(0xffffff)
  light.position.copy(camera.position)
  vm.addVariable('light', light)
  renderRegistry.registerFunction(() => {
    light.position.copy(vm.camera.position)
  })
  vm.scene.add(light)

  // Geometry, Material & Mesh ////////////////////////////////////////////////

  // Convert Genome data to Scene Obj & add to Scene
  let test_chroms = new Chrom3DModel(vm.test_model)
  let test_genome = new GenomeScene(test_chroms)
  test_genome.addToScene(vm.scene)
  vm.addVariable('test_genome', test_genome)

  // Test highlight
  let test_color = new THREE.Color()
  test_color.setHSL(0.8, 1, 0.5)
  test_genome.chroms['1'].line.reColor(0.3, 0.7, test_color)
  test_genome.setChromHighlight('1', 0.3, 0.7, test_color)

  // Add a red center sphere. TODO change to a 3d coordinate
  let centerSphere = (() => {
    let geometry = new THREE.SphereBufferGeometry(20)
    let material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
    let mesh_ = new THREE.Mesh(geometry, material)
    return mesh_
  })()
  vm.scene.add(centerSphere)

  /*
    Test Region
   */

  let test_object = new THREE.Object3D()
  let test_object_offset = new THREE.Vector3(150, 150, 150)
  test_object.position.add(test_object_offset)
  let testSphere = (() => {
    let geometry = new THREE.SphereBufferGeometry(3)
    let material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
    let mesh_ = new THREE.Mesh(geometry, material)
    return mesh_
  })()
  // test_object.add(testSphere);

  let t_data = test_genome.data.getChromPositions('1')
  let t_line = new lineScene2(t_data, test_color)
  // let t_line2 = new line2Point(t_data[0], t_data[1], test_color);
  //  test_object.add(t_line.getObject());
  // test_object.add(extrude_mesh);
  vm.scene.add(test_object)

  // Raycaster ////////////////////////////////////////////////////////////////

  // Renderer /////////////////////////////////////////////////////////////////

  let renderer = loadRenderer(new THREE.WebGLRenderer(), (r) => {
    r.setPixelRatio(window.devicePixelRatio)
    r.setSize(window.innerWidth, window.innerHeight)
    r.gammaInput = true
    r.gammaOutput = true
    vm.addVariable('renderer', r)
  })

  // Controller ///////////////////////////////////////////////////////////////

  // OrbitController

  let controller = loadController(new THREE.OrbitControls(vm.camera, vm.renderer.domElement), (c) => {
    c.minDistance = 5
    c.maxDistance = 2000
    c.enablePan = false
    c.enableDamping = true
    c.dampingFactor = 0.25
    vm.addVariable('controls', c)
  })

  // TrackballController

  //  let controller = loadController(new THREE.TrackballControls( vm.camera, vm.renderer.domElement ),(c)=>{
  //    c.rotateSpeed = 1.0;
  //    c.zoomSpeed = 1.2;
  //    c.panSpeed = 0.8;
  //    c.noZoom = false;
  //    c.noPan = false;
  //    c.staticMoving = true;
  //    c.dynamicDampingFactor = 0.3;
  //    c.keys = [ 65, 83, 68 ];
  //    c.addEventListener( 'change', render );
  //
  //    vm.addVariable('controls', c);
  //  });

  // States bar ///////////////////////////////////////////////////////////////

  let stats = new Stats()
  vm.container.appendChild(stats.dom)
  vm.addVariable('stats', stats)

  // GUI //////////////////////////////////////////////////////////////////////

  let genome_gui = {}
  test_genome.data.getChromKeys().forEach((key) => {
    genome_gui[key] = true
  })

  let gui = new dat.GUI()

  Object.keys(genome_gui).forEach((chrom) => {
    gui.add(genome_gui, chrom).onChange(() => {
      test_genome.chroms[chrom].line.line.visible = genome_gui[chrom]
    })
  })

  vm.container.appendChild(vm.renderer.domElement)
  //
  window.addEventListener('resize', onWindowResize, false)
}

function onWindowResize () {
  let vm = new Vmanager()
  vm.camera.aspect = window.innerWidth / window.innerHeight
  vm.camera.updateProjectionMatrix()
  vm.renderer.setSize(window.innerWidth, window.innerHeight)
}
//
function threeAnimate () {
  let vm = new Vmanager()
  requestAnimationFrame(threeAnimate)
  threeRender()
  vm.controls.update()
  vm.stats.update()
}

function threeRender () {
  let vm = new Vmanager()
  let renderRegistry = new ThreeRenderRegistry()
  vm.renderer.setClearColor(0x000000, 0)
  vm.renderer.setViewport(0, 0, window.innerWidth, window.innerHeight)
  renderRegistry.executeRegisteredFunction()
  vm.renderer.render(vm.scene, vm.camera)
}

module.exports = {
  'initThree': initThree,
  'threeAnimate': threeAnimate
}
