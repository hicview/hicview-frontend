'use strict'
import * as THREE from 'three'
require('./lines/LineGeometry.js')
require('./lines/LineMaterial.js')
require('./lines/Line2.js')

class lineGeometry {
  constructor (points, color, divisions = 1) {
    let positions = []
    let colors = []
    let spline = new THREE.CatmullRomCurve3(points)

    for (let i = 0, l = points.length * divisions; i < l; i++) {
      let point = spline.getPoint(i / l)
      positions.push(point.x, point.y, point.z)
      colors.push(color.r, color.g, color.b)
    }
    this.positions = positions
    this.colors = colors
    this.spline = spline
    this.geometry = new THREE.LineGeometry()
    this.geometry.setPositions(positions)
    this.geometry.setColors(colors)
  }

  get geometry () {
    return this._geometry
  }

  set geometry (x) {
    this._geometry = x
  }
}

export { lineGeometry }
