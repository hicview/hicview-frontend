'use strict';
///////////////////////////////////////////////////////////////////////////////
//         Render Registry Allows Add Executable Code to Render Cycle        //
///////////////////////////////////////////////////////////////////////////////
class ThreeRenderRegistry {
  constructor(){
    if (!!ThreeRenderRegistry.instance){
      return ThreeRenderRegistry.instance;
    }
    ThreeRenderRegistry.instance = this;
    return this;
  }
  registerFunction(func){
    if (typeof this.renderFuncArray === 'undefined'){
      this.renderFuncArray = [];
    }
    this.renderFuncArray.push(func);
  }
  executeRegisteredFunction(){
    this.renderFuncArray.forEach((func)=>{
      func();
    });
  }
}
module.exports = {
  'ThreeRenderRegistry': ThreeRenderRegistry
};
