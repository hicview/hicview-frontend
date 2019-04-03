'use strict';

function loadCamera(camera, callback){
  callback(camera);
  return camera;
}

module.exports = {
  'loadCamera':loadCamera,
};
