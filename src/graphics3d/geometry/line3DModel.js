const THREE = require('three')
const { ThreeRenderRegistry } = require('../render/renderRegistry.js')
require('./lines/LineGeometry.js')
require('./lines/LineMaterial.js')
require('./lines/Line2.js')
const line3DGeometry = function (points, color, divisions = 1) {
  let positions = []
  let colors = []
  let spline = new THREE.CatmullRomCurve3(points)

  for (let i = 0, l = points.length * divisions; i < l; i++) {
    let point = spline.getPoint(i / l)
    positions.push(point.x, point.y, point.z)
    colors.push(color.r, color.g, color.b)
  }
  let geometry = new THREE.LineGeometry()
  geometry.setPositions(positions)
  geometry.setColors(colors)

  return geometry
}
let pts = []; let count = 20
for (let i = 0; i < count; i++) {
  let radius = 3
  let a = 2 * i / count * Math.PI
  pts.push(new THREE.Vector2(Math.cos(a) * radius, Math.sin(a) * radius))
}
const default_extrude_shape = new THREE.Shape(pts)

class ExtrudeLine {
  constructor (points, matColor, shape = default_extrude_shape, divisions = 1) {
    let extrude_path = new THREE.CatmullRomCurve3(points)
    let extrudeSettings = {
      steps: points.length * divisions,
      bevelEnabled: false,
      extrudePath: extrude_path
    }
    let geometry = new THREE.ExtrudeBufferGeometry(shape, extrudeSettings)
    let material = new THREE.MeshLambertMaterial({ color: matColor.getHex(), wireframe: false })
    let mesh = new THREE.Mesh(geometry, material)
    this.points = points
    this.length = points.length
    this.renderLength = this.length * divisions
    this.mesh = mesh
    return this
  }
}

class LineScene {
  constructor (points, color, divisions = 1) {
    let positions = []
    let colors = []
    let spline = new THREE.CatmullRomCurve3(points)

    for (let i = 0, l = points.length * divisions; i < l; i++) {
      let point = spline.getPoint(i / l)
      positions.push(point.x, point.y, point.z)
      colors.push(color.r, color.g, color.b)
    }
    let geometry = new THREE.LineGeometry()
    geometry.setPositions(positions)
    geometry.setColors(colors)

    let matLine = new THREE.LineMaterial({
      color: 0xffffff,
      linewidth: 5, // in pixels
      vertexColors: THREE.VertexColors,
      // resolution:  // to be set by renderer, eventually
      dashed: false
    })
    let line = new THREE.Line2(geometry, matLine)
    line.computeLineDistances()
    line.scale.set(1, 1, 1)

    this.length = points.length
    this.points = points
    this.colors = colors
    this.geometry = geometry
    this.matLine = matLine
    this.line = line

    let renderRegistry = new ThreeRenderRegistry()
    renderRegistry.registerFunction(() => {
      this.matLine.resolution.set(window.innerWidth, window.innerHeight) // resolution of the viewport
    })
  }
  getLine () {
    return this.line
  }

  setColors (defaultColor, highlightColor) {
    this.defaultColor = defaultColor
    this.highlightColor = highlightColor
  }

  reColor (start, end, color) {
    // start/end: [0-1] float
    let colors = this.colors
    let _start = Math.round(start * this.length)
    let _end = Math.round(end * this.length)
    for (let i = _start * 3; i < _end * 3; i += 3) {
      colors[i] = color.r
      colors[i + 1] = color.g
      colors[i + 2] = color.b
    }
    this.colors = colors
    this.line.geometry.setColors(colors)
  }
}

class line2Point {
  constructor (pointa, pointb, color, divisions = 1) {
    let points = [pointa, pointb]
    let positions = []
    let colors = []
    let spline = new THREE.CatmullRomCurve3(points)

    for (let i = 0, l = points.length * divisions; i < l; i++) {
      let point = spline.getPoint(i / l)
      positions.push(point.x, point.y, point.z)
      colors.push(color.r, color.g, color.b)
    }
    let geometry = new THREE.LineGeometry()
    geometry.setPositions(positions)
    geometry.setColors(colors)

    let matLine = new THREE.LineMaterial({
      color: 0xffffff,
      linewidth: 5, // in pixels
      vertexColors: THREE.VertexColors,
      // resolution:  // to be set by renderer, eventually
      dashed: false
    })
    let line = new THREE.Line2(geometry, matLine)
    line.computeLineDistances()
    line.scale.set(1, 1, 1)

    this.length = points.length
    this.colors = colors
    this.geometry = geometry
    this.matLine = matLine
    this.line = line

    let renderRegistry = new ThreeRenderRegistry()
    renderRegistry.registerFunction(() => {
      this.matLine.resolution.set(window.innerWidth, window.innerHeight) // resolution of the viewport
    })
  }
  getLine () {
    return this.line
  }
}

class lineScene2 {
  constructor (points, color) {
    let lineSceneObj = new THREE.Object3D()
    let lineSegments = []
    for (let i = 0; i < points.length - 1; i++) {
      let lineSegment = new line2Point(points[i], points[i + 1], color)
      lineSegments.push(lineSegment)
      lineSceneObj.add(lineSegment.line)
    }

    this.lineSceneObject = lineSceneObj
    this.lineSegments = lineSegments
  }
  getObject () {
    return this.lineSceneObject
  }
}
module.exports = {
  'line3DGeometry': line3DGeometry,
  'LineScene': LineScene,
  lineScene2: lineScene2,
  line2Point: line2Point,
  ExtrudeLine: ExtrudeLine
}
