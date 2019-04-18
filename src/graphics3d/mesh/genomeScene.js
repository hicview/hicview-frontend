/*
 * @Description:
 * @Author: Hongpeng Ma
 * @Github: gitlab.com/hongpengm
 * @Date: 2019-03-27 22:18:23
 * @LastEditTime: 2019-04-14 01:33:27
 */
'use strict'
import { Color, Object3D, Vector3 } from 'three'
import { LineScene } from './lineScene'
import { ExtrudeScene } from './extrudeScene'
import { argsParser } from '../../utils/args'
import { hColor } from '../../utils/color'

const EventEmitter = require('events').EventEmitter
const uidv4 = require('uuid/v4')
const GENOME_SCENE_SKELETON_TYPE = 'line' // ['line', 'tube']

/**
 *
 *
 * @class GenomeScene
 * @extends {EventEmitter}
 */
class GenomeScene extends EventEmitter {
  /**
   *Creates an instance of GenomeScene.
   * @constructor
   * @param {Graphics3DApplication} app - parent application
   * @param {chrom3DModel} [chrom3DModel=undefined] - chrome data
   * @memberof GenomeScene
   * @property {Object} chroms - {chromkey:{mesh, color, highlight,},...}
   * @property {chrom3DModel} data - data of genome scene
   * @property {THREE.Object3D} baseObject - base object, all chromosome objects are appended to this object
   * @property {Array} _updateFunctions - [function] collection of update functions in mesh.
   */
  constructor (app, chrom3DModel, args) {
    super()
    let optionsDefault = {
      skeletonType: GENOME_SCENE_SKELETON_TYPE
    }
    const parsedArgs = argsParser(args, {
      options: optionsDefault
    })
    let { options } = parsedArgs
    this.id = uidv4()
    this.options = options
    this.subscribe = []
    this.subscribers = []
    this._updateFunctions = []

    let highlightColor = new Color()
    let chroms = {}

    // baseObject.add(chroms['1'].getLine());

    this.baseObject = new Object3D()
    this.chroms = chroms
    this.allChromsVisible = true
    this.app = app
    this.data = chrom3DModel
  }

  /**
   * Set data
   * @param {chrom3DModel} x - new data that will replace current one
   * @memberof GenomeScene
   */
  set chromData (x) {
    this.data = x
  }

  /**
   *
   * @return {chrom3DModel}
   * @readonly
   * @memberof GenomeScene
   */
  get chromData () {
    return this.data
  }

  /**
   * Set resolution params, may update line materials
   *
   * @param {number} width - viewport width
   * @param {number} height - viewport height
   * @memberof GenomeScene
   */
  setResolution (width, height) {
    this.resWidth = width
    this.resHeight = height
  }

  /**
   * return an object that can be rendered in THREE.scene
   *
   * @return {THREE.Object3D}
   * @memberof GenomeScene
   */
  sceneObject () {
    return this.baseObject
  }

  /**
   * Generate genome mesh, making an offset and add the mesh to base object.
   *
   * @memberof GenomeScene
   */
  loadGenomeMesh () {
    let color = new Color()
    // i := chromeKey.index
    for (let i = 0, l = this.data.getChromKeys().length; i < l; i++) {
      let _chromKey = this.data.getChromKeys()[i]
      color.setHSL(i / l, 0.8, 0.7)
      let chr_
      switch (this.options.skeletonType) {
      case 'line':
        chr_ = new LineScene(this.data.getChromPositions(_chromKey), color)
        chr_.setResolution(this.resWidth, this.resHeight)
        this._updateFunctions.push(chr_.updateFunctions())
        break
      case 'tube':
        chr_ = new ExtrudeScene(this.data.getChromPositions(_chromKey), color, {
	  options: {
	    shape: 'circle',
	    radius: 1,
	    shapeDivisions: 4
	  }
        })
        break
      default:
      }

      this.chroms[_chromKey] = {
        line: chr_,
        color: color.clone(),
	color255: new hColor(color).rgb255,
        visible: true,
        highlight: undefined
      }
      this.baseObject.add(chr_.mesh)
    }
    this.moveToCenter()
    this.updateAppGUI()
  }

  /**
   * add genome scene to a renderable scene. If not designated, will add to current parent application's scene.
   *
   * @param {THREE.scene} [scene=undefined] - THREE.scene to add
   * @memberof GenomeScene
   * @return {GenomeScene} return current object
   */
  addToScene (scene = undefined) {
    // if scene exist, add this base obj to designated scene
    if (scene !== undefined) {
      scene.add(this.baseObject)
    } else { // else add to this's parent app's scene
      this.app.scene.add(this.baseObject)
    }
    return this
  }

  /**
   * Move the genome object to (0, 0, 0)
   *
   * @memberof GenomeScene
   */
  moveToCenter () {
    // Calculate the avg center of genome and move the genome object to center
    const data = this.data
    let len = 0
    let x = new Vector3()
    Object.values(data.data).forEach((e) => {
      len += e.length
      e.forEach((e_) => {
        let point_ = e_.slice(1)
        x.add(new Vector3(point_[0],
			  point_[1],
			  point_[2]))
      })
    })
    // this genome's average offset
    x.divideScalar(len)
    // Compensate the offset
    this.baseObject.position.sub(x)
    this.offset = x
  }

  /**
   * Highlight part of a chromosome, actually this function adds a extrude line.
   *
   * @param {*} chromKey
   * @param {number} start - [0-1]
   * @param {number} end - [0-1]
   * @param {THREE.Color} [color=undefined] color of the new extrude mesh.
   * @memberof GenomeScene
   */
  setChromHighlight (chromKey, start, end, color = undefined) {
    let chromPositions = this.getChromPositions(chromKey, start, end)
    if (color === undefined) {
      color = this.chroms[chromKey].color
    }
    let highlightLine = new ExtrudeScene(chromPositions, color, {
      options: {
        shape: 'circle',
        radius: 1.5,
        shapeDivisions: 20
      }
    })
    this.chroms[chromKey].highlight = highlightLine
    if (this.chroms[chromKey].visible === true) {
      this.baseObject.add(highlightLine.mesh)
    }
  }
  highlightChroms (highlightOptions) {
    Object.keys(highlightOptions).forEach(chr => {
      const options = highlightOptions[chr]
      const start = options.start
      const end = options.end
      const color = options.color
      this.setChromHighlight(chr, start, end, color)
    })
  }
  removeAllHighlightChroms () {
    const chroms = this.chroms
    Object.keys(chroms).forEach(chr => {
      const sceneObject = chroms[chr].highlight
      if (sceneObject !== undefined) {
        this.baseObject.remove(sceneObject.mesh)
        sceneObject.mesh.geometry.dispose()
        sceneObject.mesh.material.dispose()
      }
    })
  }
  /**
   * get chromosome's positions points array.
   *
   * @param {*} chromKey
   * @param {number} [start=0]
   * @param {number} [end=1]
   * @return {Array} [THREE.Vector3] path points array.
   * @memberof GenomeScene
   */
  getChromPositions (chromKey, start = 0, end = 1) {
    let chrom = this.chroms[chromKey]
    let len = chrom.line.length
    return chrom.line.points.slice(Math.round(start * len),
				   Math.round(end * len))
  }
  updateAppGUI () {
    const { app } = this
    const gui = app.gui
    console.log(this.chroms)
    // Add Chromosome Specific Visible Checkbox
    Object.keys(this.chroms).forEach(k => {
      gui.__folders['Chromosomes']
        .add(this.chroms[k], 'visible')
	.name('Chrom ' + k)
        .onChange(() => {
           this.updateVisibility()
        })
    })
    console.log(gui)
    // Add Toggle All Chromosomes
    gui.__folders['Chromosomes']
      .add(this, 'allChromsVisible')
      .name('Toggle All')
      .onChange(()=>{
	this.chromsForEach((d)=>{
	  d.visible = d.visible ? false: true 
	})
	this.updateVisibility()
	Object.keys(gui.__folders).forEach(folder=>{
	  gui.__folders[folder].__controllers.forEach(c=>{{
	    c.updateDisplay()
	  }})
	})
      })
    // Add Chromosome Specific Color Checkbox
    Object.keys(this.chroms).forEach(k=>{
      gui.__folders['Chrom Colors']
	.addColor(this.chroms[k],'color255')
	.name(k+'Color')
	.onChange(()=>{
	  this.updateColor255()
	})
    })
    
    
    
  }
  updateVisibility () {
    Object.keys(this.chroms).forEach(k => {
      const d = this.chroms[k]
      d.line.mesh.visible = d.visible
      if (d.highlight){
	d.highlight.mesh.visible = d.visible
      }
    })
  }
  updateColor255 () {
    Object.keys(this.chroms).forEach(k => {
      const d = this.chroms[k]
      // Compare color and color 255
      console.log(d)
      let colorConvert = new hColor(d.color).rgb255
      if (d.color255.r !== colorConvert.r ||
	  d.color255.r !== colorConvert.g ||
	  d.color255.r !== colorConvert.b 
	 ){
	// If not equal, set color to color 255
	d.color.r = d.color255.r / 255
	d.color.g = d.color255.g / 255
	d.color.b = d.color255.b / 255
	// update material
	d.line.mesh.material.color.set(d.color)
      }
    })
  }
  updateFunctions () {
    return this._updateFunctions
  }

  respondEvents (e) {
    console.log('Genome Scene Received', e)
    switch (e.sourceEvent) {
    case 'selectionEnds':
      console.log(e)
      const chromKeys = this.data.getChromKeys()
      const chromSelection = [e.selection[0][0] / e.context.width * chromKeys.length,
			      e.selection[1][0] / e.context.width * chromKeys.length]
      let select = [[Math.floor(chromSelection[0]),
		     chromSelection[0] - Math.floor(chromSelection[0])],
		    [Math.floor(chromSelection[1]),
		     chromSelection[1] - Math.floor(chromSelection[1])]]
      let highlightOptions = {}
      if (select[0][0] === select[0][1]) {
        highlightOptions[chromKeys[select[0][0]]] = {
          start: select[0][1],
          end: select[1][1]
        }
      } else {
        for (let i = select[0][0]; i <= select[1][0]; i++) {
          if (i === select[0][0]) {
            highlightOptions[chromKeys[i]] = {
              start: select[0][1],
              end: 1
            }
          } else if (i === select[1][0]) {
            highlightOptions[chromKeys[i]] = {
              start: 0,
              end: select[1][1]

            }
          } else {
            highlightOptions[chromKeys[i]] = {
              start: 0,
              end: 1
            }
          }
        }
      }
      console.log(highlightOptions)
      this.removeAllHighlightChroms()
      this.highlightChroms(highlightOptions)
      break
    default:
      break
    }
  }
  /// //////////////////////////////////////////////////////////////////////////
  //                              Event Handling                             //
  /// //////////////////////////////////////////////////////////////////////////
  addSubs (sub, type, cb) {
    sub.on(type, cb)
    sub.subscribe.push({
      this: this,
      type: type,
      callback: cb
    })
    this.subscribers.push({
      'type': type,
      'subscriber': sub
    })
  }
  emitSubs (type, ...args) {
    this.subscribers.forEach(sub => {
      if (sub.type === type) {
        console.log([type].concat(args))
        console.log(sub.subscriber)
        sub.subscriber.emit(...[type].concat(args))
        // Above line is equal to below ES5 one
        // sub.subscriber.emit.apply(sub.subscriber, [type].concat(args))
      }
    })
  }
  /////////////////////////////////////////////////////////////////////////////
  //                                  Utils                                  //
  /////////////////////////////////////////////////////////////////////////////
  chromsForEach(f){
    Object.keys(this.chroms).forEach((chromKey)=>{
      f(this.chroms[chromKey])
    })
    
  }
}
export { GenomeScene }
