'use strict'

import uuidv4 from 'uuid/v4'

import { GridSystem } from './grid'
import { typeStage,
	 typeStage1D,
	 typeStage2D,
	 typeStage3D} from './symbols'


const stageConfig = {
  stageLifecycleState: ['unknown', '__init__', 'init', 'inited', 'ready', 'update', 'udpated', 'willDispose', 'disposed'],
  stageLifecycleStart: 'unknown',
  stageLifecycleSignal: ['init', 'update', 'dispose'],
}

let grid = GridSystem.instance

class Stage {
  constructor() {
    this.__type__ = typeStage
    this.__lifecycleStartState__()
    this.__init__()
    
  }
  get type() {
    return String(this.__type__)
  }

  __init__() {
    this.id = uuidv4()
    if (!Stage.instances){
      Stage.instances = {}
    }
    Stage.instances[this.id] = {
      instance: this,
      tag: this.tag,
      type: this.type,
      symbol: this.__type__
    }
  }

  init() {
    this.baseDom = grid.createDom('div',{top: 20},{left: 20},{width:30},{height: 40}, {tag: this.type})
    document.body.appendChild(this.baseDom)
  }
  
  setState(){
    
  }
  
  getDerivedStateFromProps(){
    
  }

  render(){
    
  }

  stageDidInitialize(){
    
  }

  stageDidUpdate(){
    
  }

  stageWillDispose(){
    
  }

  // update Stage instances ///////////////////////////////////////////////////
  __updateInstances__(){
    Stage.instances[this.id].tag = this.tag
    Stage.instances[this.id].type = this.type
    Stage.instances[this.id].symbol = this.__type__
  }

  // Lifecycle State Management ///////////////////////////////////////////////
  __lifecycleStartState__() {
    this.__lifecycle__ = stageConfig.stageLifecycleStart
    this.__signal__ = 'init'
  }

  __lifecycleUpdate__() {
    console.log(this.__lifecycle__, this.__signal__)
    switch(this.__lifecycle__){
    case 'unknown':
      switch(this.__signal__) {
      case 'init':
	this.__nextLifecycle__()
	break
      case 'dispose':
	this.__lifecycle__ = 'willDispose'
	this.stageWillDispose()
	this.__nextLifecycle__()
      default:
	throw 'Unknown signal'
      }
      break
    case '__init__':
      switch(this.__signal__) {
      case 'init':
	this.__lifecycle__ = 'init'
	this.init()
	this.__nextLifecycle__()
	break
      case 'dispose':
	this.__lifecycle__ = 'willDispose'
	this.stageWillDispose()
	this.__nextLifecycle__()
      default:
	throw 'Unknown signal'
      }
      break
    case 'init':
      switch(this.__signal__) {
      case 'init':
	this.__lifecycle__ = 'inited'
	this.stageDidInitialize()
	this.__nextLifecycle__()
	break
      case 'dispose':
	this.__lifecycle__ = 'willDispose'
	this.stageWillDispose()
	this.__nextLifecycle__()
      default:
	throw 'Unknown signal'
      }
      break
    case 'inited':
      switch(this.__signal__) {
      case 'init':
	this.__lifecycle__ = 'ready'
	this.__nextLifecycle__()
	break
      case 'dispose':
	this.__lifecycle__ = 'willDispose'
	this.stageWillDispose()
	this.__nextLifecycle__()
      default:
	throw 'Unknown signal'
      }
      break
    case 'ready':
      switch(this.__signal__) {
      case 'update':
	this.__lifecycle__ = 'update'
	this.
	break
      case 'dispose':
	this.__lifecycle__ = 'willDispose'
	this.stageWillDispose()
	this.__nextLifecycle__()
      default:
	throw 'Unknown signal'
      }
      break
    case 'willDispose':
      switch(this.__signal__) {
      case 'dispose':
	this.__lifecycle__ = 'dispose'
	this.__nextLifecycle__()
      default:
	throw 'Unknown signal'
      }
      break
    case 'disposed':
      switch(this.__signal__) {
      case 'dispose':
	this.__lifecycle__ = 'willDispose'
	this.__dispose__()
	break
      default:
	throw 'Unknown signal'
      }
      break
    default:
      break      
    }
  }
  __nextLifecycle__() {
    this.__lifecycleTransfer__(this.__lifecycle__, this.__signal__)
  }
  __lifecycleTransfer__(curState, signal){
    switch(curState) {
    case 'unknown':
      switch(signal) {
      case 'init':
	this.__lifecycle__ = '__init__'
	break
      case 'dispose':
	this.__lifecycle__ = 'willDispose'
      default:
	throw 'Unknown signal'
      }
      break
    case '__init__':
      switch(signal) {
      case 'init':
	this.__lifecycle__ = 'init'
	break
      case 'dispose':
	this.__lifecycle__ = 'willDispose'
      default:
	throw 'Unknown signal'
      }
      break
    case 'init':
      switch(signal) {
      case 'init':
	this.__lifecycle__ = 'inited'
	break
      case 'dispose':
	this.__lifecycle__ = 'willDispose'
      default:
	throw 'Unknown signal'
      }
      break
    case 'inited':
      switch(signal) {
      case 'init':
	this.__lifecycle__ = 'ready'
	break
      case 'dispose':
	this.__lifecycle__ = 'willDispose'
      default:
	throw 'Unknown signal'
      }
      break
    case 'ready':
      switch(signal) {
      case 'update':
	this.__lifecycle__ = 'update'
	break
      case 'dispose':
	this.__lifecycle__ = 'willDispose'
      default:
	throw 'Unknown signal'
      }
      break
    case 'update':
      switch(signal) {
      case 'dispose':
	this.__lifecycle__ = 'willDispose'
	break
      default:
	// default -> ready
	this.__lifecycle__ = 'updated'
      }
    case 'updated':
      switch(signal) {
      case 'update':
	this.__lifecycle__ = 'updated'
	break
      default:
	throw 'Unknown signal'
      }
    case 'willDispose':
      switch(signal) {
      case 'dispose':
	this.__lifecycle__ = 'dispose'
	break
      default:
	throw 'Unknown signal'
      }
      break
    case 'disposed':
      switch(signal) {
      case 'init':
	this.__lifecycle__ = 'init'
	break
      case 'dispose':
	this.__lifecycle__ = 'willDispose'
      default:
	throw 'Unknown signal'
      }
      break
    default:
      break
    }
  }
  __dispose__() {
    
  }
}

Stage.updateLifecycle = function () {
  console.log(Stage.instances)
  Object.keys(Stage.instances).forEach((k)=>{
    Stage.instances[k].instance.__lifecycleUpdate__()
  })
  requestAnimationFrame(Stage.updateLifecycle)
}


class Stage1D extends Stage{
  constructor(){
    super()
    this.__type__ = typeStage1D
    
  }
  get type() {
    return String(this.__type__)
  }
  init() {
    this.__updateInstances__()
  }
}

class Stage2D extends Stage{
  constructor(){
    super()
    this.__type__ = typeStage2D
    
  }
  get type() {
    return String(this.__type__)
  }
  init() {
    this.__updateInstances__()
  }
}

class Stage3D extends Stage{
  constructor(){
    super()
    this.__type__ = typeStage3D
    
    
  }
  get type() {
    return String(this.__type__)
  }
  init() {
    this.__updateInstances__()
  }
}


export {
  Stage,
  Stage2D,
  Stage3D
}
