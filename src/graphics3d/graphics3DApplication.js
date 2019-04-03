/*
 * @Description:
 * @Author: Hongpeng Ma
 * @Github: gitlab.com/hongpengm
 * @Date: 2019-03-29 02:24:30
 * @LastEditTime: 2019-03-29 02:27:37
 */
import { createDOM, shiftDOM } from '../utils/DOM'
import { GenomeScene } from './mesh/genomeScene'
import { LineScene } from './mesh/lineScene'
import { ExtrudeScene } from './mesh/extrudeScene'
import { Chrom3DModel } from './model/genomeModel.js'
'use strict'
const THREE = require('three')
const d3 = require('d3')
const uidv4 = require('uuid/v4')
const stats = require('stats-js')
const axios = require('axios')
require('./control/orbitControl.js')

class Graphics3DApplication {
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
  init () {
    this.initScene()
    this.initCamera()
    this.initLight()
    this.initRenderer()
    this.initController()
  }
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
  initScene () {
    this.scene = new THREE.Scene()
  }
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
  initRenderer () {
    this.renderer = new THREE.WebGLRenderer()
    const r = this.renderer
    r.setPixelRatio(window.devicePixelRatio)
    r.setSize(this.width, this.height)
    r.gammaInput = true
    r.gammaOutput = true
    this.baseDOM.appendChild(r.domElement)
  }
  initController () {
    this.controller = new THREE.OrbitControls(this.camera, this.renderer.domElement)
    const c = this.controller
    c.minDistance = 5
    c.maxDistance = 2000
    c.enablePan = false
    c.enableDamping = true
    c.dampingFactor = 0.25
  }
  /// //////////////////////////////////////////////////////////////////////////
  //                              Add Scene Obj                              //
  /// //////////////////////////////////////////////////////////////////////////
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

  async addTestGenome () {
    const data = await this.getGenomeDataByURL('http://localhost:8080/Human/liberman_MDS.txt')
    const genomeScene = new GenomeScene(this, data)
    genomeScene.setResolution(this.width, this.height)
    genomeScene.loadGenomeMesh()
    let testColor = new THREE.Color()
    testColor.setHSL(0.8, 1, 0.5)
    genomeScene.setChromHighlight('1', 0.3, 0.7, testColor)
    genomeScene.removeAllHighlightChroms()
    genomeScene.highlightChroms({
      '2': { start: 0.4, end: 0.5, color: testColor }
    })
    genomeScene.addToScene()
    this.addUpdateFunctions(genomeScene.updateFunctions())
    this.genomeScene = genomeScene
  }
  addCustomizedMesh () {

  }
  /// //////////////////////////////////////////////////////////////////////////
  //                           Retrieve Genome Data                          //
  /// //////////////////////////////////////////////////////////////////////////
  async getURLData (url) {
    return await axios.get(url)
  }
  parseGenomeStringData (str) {
    return new Chrom3DModel(str)
  }
  async getGenomeDataByURL (url) {
    const response = await this.getURLData(url)
    return this.parseGenomeStringData(response.data)
  }
  /// //////////////////////////////////////////////////////////////////////////
  //                             Animate & Render                            //
  /// //////////////////////////////////////////////////////////////////////////
  animate (app) {
    const ctx = this
    window.requestAnimationFrame(app.animate)
    this.render()
  }
  render () {
    const r = this.renderer
    r.setClearColor(0x000000, 0)
    r.setViewport(0, 0, this.width, this.height)
    // console.log(this.updateFunctions)
    this.executeUpdateFunctions()
    r.render(this.scene, this.camera)
  }
  addUpdateFunctions (f) {
    if (Array.isArray(f)) {
      this.updateFunctions = this.updateFunctions.concat(f)
    } else {
      this.updateFunctions.push(f)
    }
  }
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
