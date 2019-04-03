'use strict';
//import * as THREE from 'three';
function createMesh(geometry, material, callback){
  let mesh = new THREE.Mesh(geometry, material);
  callback(mesh);
  return mesh;
}
module.exports = { 'addMesh': createMesh};
