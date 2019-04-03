function loadGeometryFromCurve(curve, callback){
  callback();
}

function addTubeGeometry(curve, callback){

  function CustomSinCurve( scale ) {
    THREE.Curve.call( this );
    this.scale = ( scale === undefined ) ? 1 : scale;

  }
  CustomSinCurve.prototype = Object.create( THREE.Curve.prototype );
  CustomSinCurve.prototype.constructor = CustomSinCurve;

  CustomSinCurve.prototype.getPoint = function ( t ) {

    let tx = t * 3 - 1.5;
    let ty = Math.sin( 2 * Math.PI * t );
    let tz = 0;

    return new THREE.Vector3( tx, ty, tz ).multiplyScalar( this.scale );

  };
 
  let path = new CustomSinCurve( 10 );
  console.log(path);
  console.log(path.getPoint(0.7));
  let geometry = new THREE.TubeGeometry( path, 20, 2, 8, false );
  callback(geometry);
  return geometry;
}

function addLineGeometry(curve, callback){
  callback();
}

module.exports ={
  'loadGeometryFromCurve': loadGeometryFromCurve,
  'addTubeGeometry': addTubeGeometry,
  'addLineGeometry': addLineGeometry,
};
