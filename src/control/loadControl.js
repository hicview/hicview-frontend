'use strict';

function loadController(control, callback){
  callback(control);
  return control;
}

class Controller {
  constructor() {
    if (!!Controller.instance){
      return Controller.instance;
    }
    Controller.instance = this;
    return this;
  }
  
}


module.exports = {
  'loadController':loadController,
};
