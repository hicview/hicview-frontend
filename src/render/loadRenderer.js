'use strict';

function loadRenderer(renderer, callback){
  callback(renderer);
  return renderer;
}

module.exports = {
  'loadRenderer': loadRenderer,
};
