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
  constructor (app, chrom3DModel = undefined, otherArgs={
    skeletonType: GENOME_SCENE_SKELETON_TYPE
  }) {
    super()
    this.id = uidv4()
    this.subscribe = []
    this.subscribers = []
    this._updateFunctions = []

    let highlightColor = new Color()
    let chroms = {}

    // baseObject.add(chroms['1'].getLine());
    
    this.baseObject = new Object3D()
    this.chroms = chroms
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
      let chr_ = new LineScene(this.data.getChromPositions(_chromKey), color)
      chr_.setResolution(this.resWidth, this.resHeight)
      this.chroms[_chromKey] = {
        line: chr_,
        color: color.clone(),
        highlight: undefined
      }
      this._updateFunctions.push(chr_.updateFunctions())
      this.baseObject.add(chr_.mesh)
    }
    this.moveToCenter()
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
    let highlightLine = new ExtrudeScene(chromPositions, color)
    this.chroms[chromKey].highlight = highlightLine
    this.baseObject.add(highlightLine.mesh)
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
        console.log(this.chroms)
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
}
export { GenomeScene }
