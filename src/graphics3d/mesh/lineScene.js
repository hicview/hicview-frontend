/*
 * @Description:
 * @Author: Hongpeng Ma
 * @Github: gitlab.com/hongpengm
 * @Date: 2019-03-27 20:37:07
 * @LastEditTime: 2019-03-29 01:36:25
 */

const THREE = require('three')

require('../geometry/lines/LineGeometry.js')
require('../geometry/lines/LineMaterial.js')
require('../geometry/lines/Line2.js')

/**
 *
 *
 * @class LineScene
 */

class LineScene {
  // points [Vector3(),...]

  /**
   *Creates an instance of LineScene.
   * @constructor
   * @param {Array} points - [THREE.Vector3] Path, Array of Vector3
   * @param {THREE.Color} color - The color of new line, THREE.Color()
   * @param {number} [divisions=1] - default segments
   * @memberof LineScene
   * @property {Array} points - [THREE.Vector3] path points
   * @property {number} length - path length
   * @property {THREE.Color} color - line init color
   * @property {number} [divisions=1] - default segments
   * @property {THREE.geometry} geometry - geometry
   * @property {THREE.material} material - material
   * @property {THREE.mesh} mesh - mesh object
   */
  constructor (points, color, divisions = 1) {
    this.points = points
    this.length = points.length
    this.color = color
    this.divisions = divisions
    this.initGeometry()

    this.initMesh()
    this.mesh.computeLineDistances()
    this.mesh.scale.set(1, 1, 1)
  }

  /**
   * Init Geometry of Line Scene
   *
   * @memberof LineScene
   */
  initGeometry () {
    this.spline = new THREE.CatmullRomCurve3(this.points)
    this.positions = []
    this.colors = []
    for (let i = 0, l = this.points.length * this.divisions; i < l; i++) {
      let point = this.spline.getPoint(i / l)
      this.positions.push(point.x, point.y, point.z)
      this.colors.push(this.color.r, this.color.g, this.color.b)
    }
    this.geometry = new THREE.LineGeometry()
    this.geometry.setPositions(this.positions)
    this.geometry.setColors(this.colors)
  }

  /**
   * Init mesh of the scene.
   *
   * @memberof LineScene
   */
  initMesh () {
    this.matLine = new THREE.LineMaterial({
      color: 0xffffff,
      linewidth: 5, // in pixels
      vertexColors: THREE.VertexColors,
      // resolution:  // to be set by renderer, eventually
      dashed: false
    })
    this.mesh = new THREE.Line2(this.geometry, this.matLine)
  }

  /**
   *
   *
   * @return {THREE.mesh} - return a mesh object.
   * @memberof LineScene
   */
  getMesh () {
    return this.mesh
  }

  /**
   * Set resolution for material update.
   *
   * @param {*} width - viewport width.
   * @param {*} height - viewport height.
   * @memberof LineScene
   */
  setResolution (width, height) {
    this.resWidth = width
    this.resHeight = height
  }

  /**
   * Set the default color and highlight color, currently disabled
   *
   * @param {*} defaultColor
   * @param {*} highlightColor
   * @memberof LineScene
   */
  setColors (defaultColor, highlightColor) {
    this.defaultColor = defaultColor
    this.highlightColor = highlightColor
  }

  /**
   * Recolor the line, currently you should not use it.
   *
   * @param {number} start - [0-1] number, new color start
   * @param {number} end - [0-1] number, new color ends
   * @param {THREE.Color} color - new color
   * @memberof LineScene
   */
  reColor (start, end, color) {
    // start/end: [0-1] float
    const colors = this.colors
    let _start = Math.round(start * this.length)
    let _end = Math.round(end * this.length)
    for (let i = _start * 3; i < _end * 3; i += 3) {
      colors[i] = color.r
      colors[i + 1] = color.g
      colors[i + 2] = color.b
    }
    this.colors = colors
    this.mesh.geometry.setColors(colors)
  }

  /**
   * Function that updates materials' resolution.
   *
   * @return {function} - returns a closure function that updates material in render loop.
   * @memberof LineScene
   */
  updateFunctions () {
    return () => { this.matLine.resolution.set(this.resWidth, this.resHeight) } // resolution of the viewport
  }
  destroy () {
    this.geometry.dispose()
    this.material.dispose()
  }
}

export { LineScene }
