'use strict';

///////////////////////////////////////////////////////////////////////////////
//                   Vmanager is a Global Variable Manager                   //
///////////////////////////////////////////////////////////////////////////////
class Vmanager {
  constructor(){
    // Singleton Pattern
    if (!!Vmanager.instance){
      return Vmanager.instance;
    }
    Vmanager.instance = this;
    return this;
  }
  addVariable (name, v){
    this[name] = v;
    return this;
  }
  display (){
    let _ = '';
    for(let property in this){
      _ += String(property)+': ' + String(this[property]) + '\n';
    }
    return _;
  }
}

module.exports = {
  'Vmanager': Vmanager
};
