/*
 * @Description: 
 * @Author: Hongpeng Ma
 * @Date: 2019-05-27 01:23:26
 * @Github: gitlab.com/hongpengm
 * @LastEditTime: 2019-05-27 01:27:26
 */
'use strict'
import uuidv4 from 'uuid/v4'
import { GridSystem } from './grid'
import { typeComponent,
	 typeDataComponent,
	 typeViewComponent,
	 typeViewComponent1,
	 typeViewComponent2,
	 typeViewComponent3 } from './symbols'




const componentConfig = {
  componentLifecycleState: ['unknown', '__init__', 'init', 'inited', 'ready', 'mounting', 'didMount', 'update', 'willDispose', 'disposed'],
  componentLifecycleStart: 'unknown',
  componentLifecycleSignal: ['init', 'mounting', 'update', 'dispose']
}

/**
 * Components Class, the basic elements of Hi-C Framework, store data/view structure.
 *
 * @class Component
 */
class Component {

  /**
   *Creates an instance of Component.
   * @memberof Component
   */
  constructor(){
    this.__type__ = typeComponent
    this.__lifecycleStartState__()
    this.__init__()
  }

  get type() {
    return String(this.__type__)
  }

  __init__() {
    this.id == uuidv4()
    if (!Component.instances){
      Component.instances = {}
    }
    Component.instances[this.id] = {
      instance: this,
      tag: this.tag,
      type: this.type,
      symbol: this.__type__
    }
  }
  init(){
    this.baseDom = grid.createDom('div',{top: 100},{left: 20},{width:30},{height: 40}, {'background-color': 'blue'}, {tag: this.type})
    document.body.appendChild(this.baseDom)
  }
  
  setState(){
    
    return this
  }

  getDrivedStateFromProps(){
    
  }

  render(){
    
  }
  componentDidInitialize(){
    
  }
  
  componentDidMountToStage(){
    
  }

  componentDidUpdateInStage(){
    
  }

  componentWillUnmountFromStage(){
    
  }
  componentWillDispose(){
    
  }
  __updateInstances__(){
    Component.instances[this.id].tag = this.tag
    Component.instances[this.id].type = this.type
    Component.instances[this.id].symbol = this.__type__
  }
  __lifecycleStartState__(){
    this.__lifecycle__ = componentConfig.componentLifecycleStart
    this.__signal__ = 'init'
  }
  __nextLifecycle__(){
    this.__lifecycleTransfer__(this.__lifecycle__, this.__signal__)
  }
  __lifecycleTransfer__(curState, signal){
    transferTable = {
      unknown: {
	init: '__init__',
	dispose: 'willDispose'
      },
      __init__: {
	init: 'init',
	dispose: 'willDispose'
      },
      inited: {
	init: 'ready',
	dispose: 'willDispose'
      },
      ready: {
	mount: 'mounting',
	dispose: 'willDispose'
      },
      mounting:{
	mount: 'didMount',
	dispose: 'willDispose'
      },
      didMount: {
	update: 'didMount',
	dispose: 'willUnmount'
      },
      willUnmount: {
	dispose: 'willDispose'
      },
      willDispose: {
	dispose: 'disposed'
      },
      disposed: {
	init: 'disposed',
	mount: 'disposed',
	update: 'disposed',
	dispose: 'disposed'
      }
    }
    if (transferTable[curState][signal] == undefined){
      throw 'Unknown signal'
    }
    this.__lifecycle__ = transferTable[curState[signal]]
  }
  __lifecycleUpdate__(){
    switch(this.__lifecycle__){
    case 'unknown':
      switch(this.__signal__) {
      case 'init':
	break
      case 'dispose':
	this.componentWillDispose()
      default:
	throw 'Unknown signal'
      }
      break
    case '__init__':
      switch(this.__signal__) {
      case 'init':
	this.init()
	break
      case 'dispose':
	this.componentWillDispose()
      default:
	throw 'Unknown signal'
      }
      break
    case 'init':
      switch(this.__signal__) {
      case 'init':
	this.componentDidInitialize()
	break
      case 'dispose':
	this.componentWillDispose()
      default:
	throw 'Unknown signal'
      }
      break
    case 'inited':
      switch(this.__signal__) {
      case 'init':
	break
      case 'dispose':
	this.componentWillDispose()
      default:
	throw 'Unknown signal'
      }
      break
    case 'ready':
      switch(this.__signal__) {
      case 'mount':
	this.componentWillMountToStage()
	  break
      case 'dispose':
	this.componentWillDispose()
      default:
	throw 'Unknown signal'
      }
      break
    case 'mounting':
      switch(this.__signal__){
      case 'mount':
	this.componentDidMountToStage()
	break
      case 'dispose':
	this.componentWillDispose()
	break
      default :
	break
      }
      break
    case 'didMount':
      switch(this.__signal__){
      case 'update':
	this.update()
	break
      case 'dispose':
	this.componentWillUnmountFromStage()
	break
      default:
	break
      }
      break
    case 'willUnmount':{
      switch(this.__signal__){
      case 'dispose':
	this.componentWillDispose()
	break
      default:
	throw 'Unknown signal'
	break
      }
    }
      break
    case 'willDispose':
      switch(this.__signal__) {
      case 'dispose':
	this.__dispose__()
	break
      default:
	throw 'Unknown signal'
      }
      break
    case 'disposed':
      switch(this.__signal__) {
      case 'dispose':
	break
      default:
	throw 'Unknown signal'
      }
      break
    default:
      break      
    }
    this.__nextLifecycle__()
  }
  __dispose__(){
    
  }
}
Component.updateLifecycle = function(){
  Object.keys(Component.instances).forEach((k)=>{
    Component.instances[k].instance.__lifecycleUpdate__()
  })
}

class DataComponent extends Component {
  
}

class ViewComponent extends Component {
  
}

class ViewComponent1D extends viewComponent {
  
}

class ViewComponent2D extends viewComponent1D {
  
}

class ViewComponent3D extends viewComponent3D {

  
}
export { Component,
	 DataComponent,
	 ViewComponent,
	 ViewComponent1D,
	 ViewComponent2D,
	 ViewComponent3D}
