'use strict'
import * as THREE from 'three'
import { argsParser }  from '../../utils/args'
import { circleShape } from './extrudeScene'

class GeneticElement {
  constructor (gePositions, args) {

    //    TorusGeometry(radius : Float, tube : Float, radialSegments : Integer, tubularSegments : Integer, arc : Float)
    let optionsDefault = {
      shape: 'circle',
      radius: 1.75,
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
    let positions = []
    let normals = []
    let colors = []
    let color = new THREE.Color()
    let vector = new THREE.Vector3()
    let geometry = new THREE.Geometry()

    gePositions.forEach(d=>{
      geometry.copy(this.createExtrudeGeometry())
      geometry.lookAt(d.lookAt)
      geometry.translate(d.local.x, d.local.y, d.local.z)
      geometry.faces.forEach( function ( face ) {
	positions.push( geometry.vertices[ face.a ].x )
	positions.push( geometry.vertices[ face.a ].y )
	positions.push( geometry.vertices[ face.a ].z )
	positions.push( geometry.vertices[ face.b ].x )
	positions.push( geometry.vertices[ face.b ].y )
	positions.push( geometry.vertices[ face.b ].z )
	positions.push( geometry.vertices[ face.c ].x )
	positions.push( geometry.vertices[ face.c ].y )
	positions.push( geometry.vertices[ face.c ].z )
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
    })
    
//    for ( let i = 1, l = count; i <= l ; i ++ ) {
//      let phi = Math.acos( - 1 + ( 2 * i ) / l )
//      let theta = Math.sqrt( l * Math.PI ) * phi
//      vector.setFromSphericalCoords( tRadius, phi, theta )
//      geometry.copy( this.baseGeometry )
//      geometry.lookAt( vector )
//      geometry.translate( vector.x, vector.y, vector.z )
//      color.setHSL( ( i / l ), 1.0, 0.7 )
//      geometry.faces.forEach( function ( face ) {
//	positions.push( geometry.vertices[ face.a ].x )
//	positions.push( geometry.vertices[ face.a ].y )
//	positions.push( geometry.vertices[ face.a ].z )
//	positions.push( geometry.vertices[ face.b ].x )
//	positions.push( geometry.vertices[ face.b ].y )
//	positions.push( geometry.vertices[ face.b ].z )
//	positions.push( geometry.vertices[ face.c ].x )
//	positions.push( geometry.vertices[ face.c ].y )
//	positions.push( geometry.vertices[ face.c ].z )
//	normals.push( face.normal.x )
//	normals.push( face.normal.y )
//	normals.push( face.normal.z )
//	normals.push( face.normal.x )
//	normals.push( face.normal.y )
//	normals.push( face.normal.z )
//	normals.push( face.normal.x )
//	normals.push( face.normal.y )
//	normals.push( face.normal.z )
//	colors.push( color.r )
//	colors.push( color.g )
//	colors.push( color.b )
//	colors.push( color.r )
//	colors.push( color.g )
//	colors.push( color.b )
//	colors.push( color.r )
//	colors.push( color.g )
//	colors.push( color.b )
//      } )
//    }
    this.bufferGeometry.addAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) )
    this.bufferGeometry.addAttribute( 'normal', new THREE.Float32BufferAttribute( normals, 3 ) )
    this.bufferGeometry.addAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) )

    this.material = new THREE.MeshPhongMaterial( { shininess: 80, vertexColors: THREE.VertexColors } )
    this.mesh = new THREE.Mesh(this.bufferGeometry,
			       this.material)
    
  }
  // TODO
  // Create extrude geometry with specific base length and memorize them
  createExtrudeGeometry(length=undefined) {
    // Create a length-baseGeometry hash if not exist
    if ( this.existGeometries === undefined){
      this.existGeometries = {}
    }
    // If the required were created, return the required object
    if (length === undefined){
      if (this.existGeometries.hasOwnProperty('undefined')){
	return this.existGeometries.undefined
      }
    } else {
      if (this.existGeometries.hasOwnProperty(length.toString())){
	return this.existGeometries[length.toString()]
      }
    }


    // Create required object and save to hash
    let points = []
    points.push(new THREE.Vector3(0,0,0))
    points.push(new THREE.Vector3(0,0,
				  length === undefined ?
				  2 : length))   
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
    this.existGeometries[length === undefined
			 ? 'undefined'
			 : length.toString()] = geometry
    return geometry
  }
  
}

export { GeneticElement }
