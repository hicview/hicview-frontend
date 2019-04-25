'use strict'
import { Vector3,
	 Color } from 'three'
import * as THREE from 'three'
import { argsParser } from '../../utils/args'
// import { LineMaterial } from '../geometry/lineMaterialES6'
// import { LineMaterial } from '../geometry/lines/LineMaterial'
require('../geometry/lines/LineMaterial')
require('../geometry/lines/LineSegmentsGeometry')
require('../geometry/lines/LineSegments2')
require('../geometry/lines/Line2')
require('../geometry/lines/LineGeometry')
class InteractionLine {
  constructor (args) {
    /*
      Line args
      --------------------
      Input data format
      [
        {
	  start: THREE.Vector3,
	  end: THREE.Vector3,
	  color: THREE.Color(),
	  strength: float // represent the strength of the interaction
	},...
      ]
    */
    let optionsDefault = {
      dashed: true
    }
    const parsedArgs = argsParser(args, {
      options: optionsDefault
    })
    let { options } = parsedArgs
    this.options = options
    //Vector3 {x: 52.00774695473526, y: 51.42180258020614, z: 108.66202877608329}
    //{x: 78.22422273385182, y: 62.11731146241934, z: 150.94714545531826}
    let data = [
      {
        start: new Vector3(52.0077, 51.42180258020614, 108.66202877608329),
        end: new Vector3(78.2242, 62.117, 150.94714),
        color: new Color(0xff00ff),
        strength: 5.5
      },
      {
        start: new Vector3(-20, 0, 0),
        end: new Vector3(0, 0, 30),
        color: new Color(0xff00ff),
        strength: 5.5
      }
    ]
    this.data = data
    let vertices = []
    let colors = []
    data.forEach(d => {
      vertices.push(d.start.x, d.start.y, d.start.z)
      vertices.push(d.end.x, d.end.y, d.end.z)
      colors.push(d.color.r, d.color.g, d.color.b)
    })

    /// ////////////////////////////////////////////////////////////////////////
    //                               Material 1 ...OK                             //
    /// ////////////////////////////////////////////////////////////////////////
    // Rendering using Basic Line Segments ////////////////////////////////////
    if (false) {
      this.geometry = new THREE.BufferGeometry()
      this.geometry.addAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
      this.material = new THREE.LineDashedMaterial({
        color: 'white',
        linewidth: 5,
        dashSize: 2,
        gapSize: 0.5
      })
      this.mesh = new THREE.LineSegments(this.geometry,
					 this.material)
      this.mesh.computeLineDistances()
    } else {
    /// ////////////////////////////////////////////////////////////////////////
    //                               Material 2                              //
    /// ////////////////////////////////////////////////////////////////////////
      this.geometry = new THREE.LineSegmentsGeometry()
      this.geometry.setPositions(vertices)
      // this.geometry.setColors(colors)
      this.material = new THREE.LineMaterial({
        color: 0x0000ff,
        linewidth: 5, // in pixels
        // vertexColors: THREE.VertexColors,
        // resolution:  // to be set by renderer, eventually
        dashed: false
      })
      // this.material.resolution.set(1000, 1000)
      this.mesh = new THREE.LineSegments2(this.geometry,
					  this.material)
      this.mesh.computeLineDistances()
    }
    

    
  };
  loadText(scene){
    let fontMesh
    let loader = new THREE.FontLoader()
    loader.load('http://localhost:8080/asset/helvetiker_regular.typeface.json', font => {
      let xMid, text
      let color = 0x000000
      let matLite = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide
      })
      let positions = []
      let normals = []
      let uvs = []
      let bufGeo = new THREE.Object3D()
      this.data.forEach((d,i)=>{
	let msg = d.strength.toString()
	let geo = new THREE.ShapeBufferGeometry(font.generateShapes(msg, 2))
	geo.computeBoundingBox()
	geo.translate((d.start.x + d.end.x)/2,
		      (d.start.y + d.end.y)/2,
		      (d.start.z + d.end.z)/2)
	let textMesh = new THREE.Mesh(geo, matLite)
	bufGeo.add(textMesh)
      })
      console.log(positions)
      
      let message = ' Interaction Strength.'
      let shapes = font.generateShapes(message, 2)
      let geometry = new THREE.ShapeBufferGeometry(shapes)
      geometry.computeBoundingBox()
      xMid = -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x)
      geometry.translate(xMid, 0, 0)
      // make shape ( N.B. edge view not visible )
      text = new THREE.Mesh(geometry, matLite)
      fontMesh = text
      scene.add(bufGeo)
      console.log(text)
    })
    console.log(fontMesh)
    this.fontMesh = fontMesh
  }
  dispose () {
    this.geometry.dispose()
    this.material.dispose()
  }
}

export { InteractionLine }
