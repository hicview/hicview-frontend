/*
 * @Description:
 * @Author: Hongpeng Ma
 * @Github: gitlab.com/hongpengm
 * @Date: 2019-03-29 02:24:30
 * @LastEditTime: 2019-04-14 01:11:03
 */
import { createDOM, shiftDOM } from '../utils/DOM'
import { GenomeScene } from './mesh/genomeScene'
import { LineScene } from './mesh/lineScene'
import { ExtrudeScene } from './mesh/extrudeScene'
import { Chrom3DModel } from './model/genomeModel.js'
import * as dat from 'dat.gui'
'use strict'
const THREE = require('three')
const d3 = require('d3')
const uidv4 = require('uuid/v4')
const stats = require('stats-js')
const axios = require('axios')
require('./control/orbitControl.js')

/**
 * Graphics 3D Application
 *
 * @class Graphics3DApplication
 */
class Graphics3DApplication {

  /**
   *Creates an instance of Graphics3DApplication.
   * @param {*} parentDOM Parent DOM elements
   * @memberof Graphics3DApplication
   */
  constructor (parentDOM) {
    this.id = uidv4()
    this.initBBox(parentDOM)
    this.updateFunctions = []
    this.init()
    if (Graphics3DApplication.instances === undefined) {
      Graphics3DApplication.instances = []
    }
    Graphics3DApplication.instances.push(this)
  }
  /// //////////////////////////////////////////////////////////////////////////
  //                                   Init                                  //
  /// //////////////////////////////////////////////////////////////////////////
  
  /**
   * Init 3D Application
   *
   * @memberof Graphics3DApplication
   */
  init () {
    this.initScene()
    this.initCamera()
    this.initLight()
    this.initRenderer()
    this.initController()
    this.initGUIControl()
  }

  /**
   * Set the base DOM box given parent DOM
   *
   * @param {*} parentDOM
   * @memberof Graphics3DApplication
   */
  initBBox (parentDOM) {
    this.baseDOM = createDOM('div', uidv4(), 1000, 1000,
			     {
			       left: 700
			     })
    parentDOM.appendChild(this.baseDOM)
    let baseDOMBox = this.baseDOM.getBoundingClientRect()
    this.width = baseDOMBox.width
    this.height = baseDOMBox.height
  }

  /**
   * init the THREE.scene element of the 3D Application
   *
   * @memberof Graphics3DApplication
   */
  initScene () {
    this.scene = new THREE.Scene()
  }

  /**
   * Init the camera element of the 3D Application
   *
   * @memberof Graphics3DApplication
   */
  initCamera () {
    this.camera = new THREE.PerspectiveCamera(
      50,
      this.width / this.height,
      1,
      3000
    )
    this.camera.position.set(500, 100, 260)
    this.camera.layers.enable(0)
    this.camera.layers.enable(1)
  }

  /**
   * Init the light element of the 3D Application
   *
   * @memberof Graphics3DApplication
   */
  initLight () {
    this.light = new THREE.PointLight(0xffffff)
    this.light.position.copy(this.camera.position)
    this.scene.add(this.light)
    const ctx = this
    this.addUpdateFunctions(() => {
      ctx.light.position.copy(ctx.camera.position)
      // console.log('Hello', ctx.light, ctx.camera)
    })
  }

  /**
   * Init the renderer element
   *
   * @memberof Graphics3DApplication
   */
  initRenderer () {
    this.renderer = new THREE.WebGLRenderer()
    const r = this.renderer
    r.setPixelRatio(window.devicePixelRatio)
    r.setSize(this.width, this.height)
    r.gammaInput = true
    r.gammaOutput = true
    this.baseDOM.appendChild(r.domElement)
  }

  /**
   * Init the scene controller
   *
   * @memberof Graphics3DApplication
   */
  initController () {
    this.controller = new THREE.OrbitControls(this.camera, this.renderer.domElement)
    const c = this.controller
    c.minDistance = 5
    c.maxDistance = 2000
    c.enablePan = false
    c.enableDamping = true
    c.dampingFactor = 0.25
  }

  initGUIControl(){
    this.gui = new dat.GUI()
//    this.baseDOM.appendChild(this.gui.domElement)
    this.gui.addFolder('Chromosomes')
    this.gui.addFolder('Chrom Colors')
  }
 
  /// //////////////////////////////////////////////////////////////////////////
  //                              Add Scene Obj                              //
  /// //////////////////////////////////////////////////////////////////////////
  
  /**
   * Add a test sphere at x,y,z
   *
   * @param {Number} x
   * @param {Number} y
   * @param {Number} z
   * @memberof Graphics3DApplication
   */
  addTestSphere (x, y, z) {
    let testObject = new THREE.Object3D()
    let testObjectOffset = new THREE.Vector3(x, y, z)
    testObject.position.add(testObjectOffset)
    let testSphere = (() => {
      let geometry = new THREE.SphereBufferGeometry(3)
      let material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
      let mesh_ = new THREE.Mesh(geometry, material)
      return mesh_
    })()
    testObject.add(testSphere)

    this.scene.add(testObject)
  }

  /**
   * Add a test line
   *
   * @memberof Graphics3DApplication
   */
  async addTestLine () {
    const data = await this.getGenomeDataByURL('http://localhost:8080/Human/liberman_MDS.txt')
    let color = new THREE.Color()
    color.setHSL(0.5, 1, 0.5)
    let chr_ = new LineScene(data.getChromPositions('1'), color)
    chr_.setResolution(this.width, this.height)
    this.scene.add(chr_.mesh)
    this.addUpdateFunctions(
      chr_.updateFunctions()
    )
    let chr2 = new ExtrudeScene(data.getChromPositions('2'), color)
    this.scene.add(chr2.mesh)
    // this.addUpdateFunctions(()=>{
    //   chr_.matLine.resolution.set(this.width,this.height)
    // })
  }

  /**
   * Add a test genome
   *
   * @memberof Graphics3DApplication
   */
  async addTestGenome () {
    const data = await this.getGenomeDataByURL('http://localhost:8080/Human/liberman_MDS.txt')
    const genomeScene = new GenomeScene(this, data, {
      options: {
	skeletonType: 'tube'
      }
    })
    genomeScene.setResolution(this.width, this.height)
    genomeScene.loadGenomeMesh()
    let testColor = new THREE.Color()
    testColor.setHSL(0.8, 1, 0.5)
    genomeScene.setChromHighlight('1', 0.3, 0.7, testColor)
    genomeScene.removeAllHighlightChroms()
    genomeScene.highlightChroms({
      '2': { start: 0.4, end: 0.5, color: testColor }
    })
    genomeScene.addToScene();
    //['1','2','3','4','5','6','7'].forEach(k=>{
    //  genomeScene.chroms[k].line.mesh.visible = false
    //})
    this.addUpdateFunctions(genomeScene.updateFunctions())
    this.genomeScene = genomeScene
  }
  async addGenome(dataURL){
    const app = this
    const data = await this.getGenomeDataByURL(dataURL)
    const genomeScene = new GenomeScene(this, data)
    genomeScene.setResolution(this.width, this.height)
    genomeScene.loadGenomeMesh()
    genomeScene.addToScene()
    this.addUpdateFunctions(genomeScene.updateFunctions())
    this.genomeScene = genomeScene
  }

  /**
   * Adding a customized mesh
   *
   * @memberof Graphics3DApplication
   */
  addCustomizedMesh () {

  }
  /// //////////////////////////////////////////////////////////////////////////
  //                           Retrieve Genome Data                          //
  /// //////////////////////////////////////////////////////////////////////////
  
  /**
   * Async get URL data
   *
   * @param {String} url
   * @returns {response}
   * @memberof Graphics3DApplication
   */
  async getURLData (url) {
    return await axios.get(url)
  }

  /**
   * Convert a genome string file to Chrom3DModel
   *
   * @param {String} str
   * @returns {Chrom3DModel}
   * @memberof Graphics3DApplication
   */
  parseGenomeStringData (str) {
    return new Chrom3DModel(str)
  }

  /**
   * Async retrieve the genome data given a url
   *
   * @param {String} url
   * @returns {Chrom3DModel}
   * @memberof Graphics3DApplication
   */
  async getGenomeDataByURL (url) {
    const response = await this.getURLData(url)
    return this.parseGenomeStringData(response.data)
  }
  /// //////////////////////////////////////////////////////////////////////////
  //                             Animate & Render                            //
  /// //////////////////////////////////////////////////////////////////////////
  
  /**
   * Animate the application
   *
   * @param {*} app
   * @memberof Graphics3DApplication
   */
  animate (app) {
    const ctx = this
    window.requestAnimationFrame(app.animate)
    this.render()
  }

  /**
   * Render the scene
   *
   * @memberof Graphics3DApplication
   */
  render () {
    const r = this.renderer
    r.setClearColor(0x000000, 0)
    r.setViewport(0, 0, this.width, this.height)
    // console.log(this.updateFunctions)
    this.executeUpdateFunctions()
    r.render(this.scene, this.camera)
  }

  /**
   * Add a function to execute every render loop
   *
   * @param {Function} f
   * @memberof Graphics3DApplication
   */
  addUpdateFunctions (f) {
    if (Array.isArray(f)) {
      this.updateFunctions = this.updateFunctions.concat(f)
    } else {
      this.updateFunctions.push(f)
    }
  }

  /**
   * Execute update functions in the updateFunctions queue
   *
   * @memberof Graphics3DApplication
   */
  executeUpdateFunctions () {
    this.updateFunctions.forEach(f => {
      f()
    })
  }
}
Graphics3DApplication.each = function (f) {
  Graphics3DApplication.instances.forEach(f)
}
export { Graphics3DApplication }
