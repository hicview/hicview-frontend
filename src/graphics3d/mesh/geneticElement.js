'use strict'
import * as THREE from 'three'
import { argsParser }  from '../../utils/args'
import { circleShape } from './extrudeScene'

class GeneticElement {
  constructor (positions, args) {

    //    TorusGeometry(radius : Float, tube : Float, radialSegments : Integer, tubularSegments : Integer, arc : Float)
    let optionsDefault = {
      shape: 'circle',
      radius: 0.75,
      shapeDivisions: 30,
      divisions: 1
    }
    const parsedArgs = argsParser(args,{
      options: optionsDefault
    })
    let { options } = parsedArgs
    this.options = options
    const { shape, radius, shapeDivisions, divisions} = options
    // create a base geometry for a single genetic element
    this.baseGeometry = this.createExtrudeGeometry()
    /*
      TODO
      Given genetic elements' positions on chromsomes & colors
      Return a mesh of all genetic elements on one chromosomes
      --------------------
      genetic elements' positions data format
      [
        {
	  local: Vector3, // translation vector to a local coordinate
	  lookAt: Vector3, // direction vector to of this g.e.
	  color: Color // color of this g.e.
	},...
      ]
      --------------------
      return:
      a mesh object // THREE.Mesh
      --------------------
      Genetic element information is dealt in GenomeScene
    */
    this.bufferGeometry = new THREE.BufferGeometry()
    let tRadius = 125
    let count = 80
    let tPositions = []
    let normals = []
    let colors = []
    let color = new THREE.Color()
    let vector = new THREE.Vector3()
    let geometry = new THREE.Geometry()
    for ( let i = 1, l = count; i <= l ; i ++ ) {
      let phi = Math.acos( - 1 + ( 2 * i ) / l )
      let theta = Math.sqrt( l * Math.PI ) * phi
      vector.setFromSphericalCoords( tRadius, phi, theta )
      geometry.copy( this.baseGeometry )
      geometry.lookAt( vector )
      geometry.translate( vector.x, vector.y, vector.z )
      color.setHSL( ( i / l ), 1.0, 0.7 )
      geometry.faces.forEach( function ( face ) {
	tPositions.push( geometry.vertices[ face.a ].x )
	tPositions.push( geometry.vertices[ face.a ].y )
	tPositions.push( geometry.vertices[ face.a ].z )
	tPositions.push( geometry.vertices[ face.b ].x )
	tPositions.push( geometry.vertices[ face.b ].y )
	tPositions.push( geometry.vertices[ face.b ].z )
	tPositions.push( geometry.vertices[ face.c ].x )
	tPositions.push( geometry.vertices[ face.c ].y )
	tPositions.push( geometry.vertices[ face.c ].z )
	normals.push( face.normal.x )
	normals.push( face.normal.y )
	normals.push( face.normal.z )
	normals.push( face.normal.x )
	normals.push( face.normal.y )
	normals.push( face.normal.z )
	normals.push( face.normal.x )
	normals.push( face.normal.y )
	normals.push( face.normal.z )
	colors.push( color.r )
	colors.push( color.g )
	colors.push( color.b )
	colors.push( color.r )
	colors.push( color.g )
	colors.push( color.b )
	colors.push( color.r )
	colors.push( color.g )
	colors.push( color.b )
      } )
    }
    this.bufferGeometry.addAttribute( 'position', new THREE.Float32BufferAttribute( tPositions, 3 ) )
    this.bufferGeometry.addAttribute( 'normal', new THREE.Float32BufferAttribute( normals, 3 ) )
    this.bufferGeometry.addAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) )

    this.material = new THREE.MeshPhongMaterial( { shininess: 80, vertexColors: THREE.VertexColors } )
    this.mesh = new THREE.Mesh(this.bufferGeometry,
			       this.material)
    
  }
  // TODO
  // Create extrude geometry with specific base length and memorize them
  createExtrudeGeometry() {
    let points = []
    points.push(new THREE.Vector3(0,0,0))
    points.push(new THREE.Vector3(0,0,1))
    const extrudePath = new THREE.CatmullRomCurve3(points)
    const extrudeSettings = {
      steps: 100,
      bevelEnabled: false,
      extrudePath: extrudePath
    }
    let geometry
    if (this.options.shape === 'circle'){
      geometry = new THREE.ExtrudeGeometry(
	circleShape(this.options.radius,
		    this.options.shapeDivisions),
	extrudeSettings
      )
    }
    return geometry
  }
  
}

export { GeneticElement }
