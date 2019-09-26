/*
 * @Description:
 * @Author: Hongpeng Ma
 * @Github: gitlab.com/hongpengm
 * @Date: 2019-03-29 02:24:30
 * @LastEditTime: 2019-03-29 02:27:55
 */
import { argsParser } from '../../utils/args'
import { hColor } from '../../utils/color'

const THREE = require('three')

let pts = []; let count = 20
for (let i = 0; i < count; i++) {
  let radius = 3
  let a = 2 * i / count * Math.PI
  pts.push(new THREE.Vector2(Math.cos(a) * radius, Math.sin(a) * radius))
}
const defaultExtrudeShape = new THREE.Shape(pts)

const circleShape = function (radius = 3, count = 30) {
  let pts = []
  for (let i = 0; i < count; i++) {
    let a = 2 * i / count * Math.PI
    pts.push(new THREE.Vector2(Math.cos(a) * radius, Math.sin(a) * radius))
  }
  return new THREE.Shape(pts)
}

class ExtrudeScene {
  constructor (points, matColor, args) {
    let optionsDefault = {
      shape: defaultExtrudeShape,
      radius: 3,
      shapeDivisions: 30,
      divisions: 1
    }
    const parsedArgs = argsParser(args, {
      options: optionsDefault
    })
    let { options } = parsedArgs
    this.options = options
    let { shape, divisions } = options
    let extrudePath = new THREE.CatmullRomCurve3(points)
    if (shape === 'circle') {
      shape = circleShape(options.radius, options.shapeDivisions)
    }
    let extrudeSettings = {
      steps: points.length * divisions,
      bevelEnabled: false,
      extrudePath: extrudePath
    }
    let geometry = new THREE.ExtrudeBufferGeometry(shape, extrudeSettings)
    let material = new THREE.MeshLambertMaterial({ color: matColor.getHex(), wireframe: false })
    let mesh = new THREE.Mesh(geometry, material)
    this.points = points
    this.extrudePath = extrudePath
    this.length = points.length
    this.renderLength = this.length * divisions
    this.mesh = mesh
  }
  changeColor (color) {
    this.mesh.material.color.setHex(color)
  }
  getPoint (pos) { // float
    return this.extrudePath.getPoint(pos)
  }
}

export { ExtrudeScene,
	 circleShape }
