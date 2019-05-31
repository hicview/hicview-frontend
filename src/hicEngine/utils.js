'use strict'

function mergeOptions (options){
  let options_target = {}
  options.forEach((opt)=>{
    Object.assign(options_target, opt)
  })
  return options_target
}

function compareType (can1, can2){
  return can1.type === can2.type
}

function capitalize (s){
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export {
  mergeOptions,
  compareType,
  capitalize
}
