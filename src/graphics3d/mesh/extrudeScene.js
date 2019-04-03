/*
 * @Description: 
 * @Author: Hongpeng Ma
 * @Github: gitlab.com/hongpengm
 * @Date: 2019-03-29 02:24:30
 * @LastEditTime: 2019-03-29 02:27:55
 */

const THREE = require('three')

let pts = []; let count = 20
for (let i = 0; i < count; i++) {
  let radius = 3
  let a = 2 * i / count * Math.PI
  pts.push(new THREE.Vector2(Math.cos(a) * radius, Math.sin(a) * radius))
}
const defaultExtrudeShape = new THREE.Shape(pts)

class ExtrudeScene {
  constructor (points, matColor, shape = defaultExtrudeShape, divisions = 1) {
    let extrudePath = new THREE.CatmullRomCurve3(points)
    let extrudeSettings = {
      steps: points.length * divisions,
      bevelEnabled: false,
      extrudePath: extrudePath
    }
    let geometry = new THREE.ExtrudeBufferGeometry(shape, extrudeSettings)
    let material = new THREE.MeshLambertMaterial({ color: matColor.getHex(), wireframe: false })
    let mesh = new THREE.Mesh(geometry, material)
    this.points = points
    this.length = points.length
    this.renderLength = this.length * divisions
    this.mesh = mesh
  }
}

export { ExtrudeScene }
