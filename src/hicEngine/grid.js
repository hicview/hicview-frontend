'use strict'
import * as d3 from 'd3'
import uuidv4 from 'uuid/v4'
import { typeGrid } from './symbols'
import { mergeOptions,
	 capitalize} from './utils'

const gridConfig = {
  // default pixel size of grid size
  defaultGridPixel: 10,
  defaultDomStyle: {
    width: 10,
    height: 10,
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    position: 'absolute',   
    'background-color': 'lightgray',
    'border-color': 'red',
    'border-width': 'thick',
    'border-style': 'solid',
  },
  // Field names that are allowed to set to `dom.style`
  allowedDomStyleAttributes: ['width', 'height', 'top', 'bottom', 'left', 'right', 'position','background-color', 'border-color', 'border-width', 'border-style',],
  // When other class eg `Stage` init a dom, then the dom is tagged to the class type
  defaultTag: 'Untyped',
  convertGridPixelArray: ['width', 'height', 'top','bottom', 'left',
		     'right'],
  pixelSuffixArray: ['width', 'height','top','bottom', 'left',
		     'right']
}


class GridSystem {
  constructor() {
    
  }
  static get instance(){
    if (!this.__instance__) {
      this.__instance__ = new GridSystem()
      this.__instance__.__domlist__ = {}
      this.__type__ = typeGrid
    }
    return this.__instance__
  }
  get type(){
    return String(this.__type__)
  }

  // Actions //////////////////////////////////////////////////////////////////
  createDom (type, ...opt_arr){
    let options = mergeOptions(opt_arr)
    let newDom = document.createElement(type)
    newDom.id = uuidv4()
    this.__domlist__[newDom.id] = {
      instance:newDom,
      tag: newDom.tag
    }
    // Merge with the defaul style
    options = Object.assign(gridConfig.defaultDomStyle, options)
    // Set DOM element style
    this.setDomStyle(newDom, options)

    this.updateDomTag(newDom, options.tag)
    console.log(newDom);
    // Add dom to list
    
    return newDom
  }

  shiftDom(dom, ...opt_arr){
    let options = mergeOptions(opt_arr)
    this.shiftDomStyleOptions(dom, options)
    this.setDomStyle(dom)
  }

  updateDomTag(dom, tag){
    if (tag) {
      dom.tag = tag
      console.log(tag, dom.tag);
      // update domlist
      this.__domlist__[dom.id].tag = dom.tag
    } else {
      this.updateDomTag(dom, gridConfig.defaultTag)
    }
  }
  
  getDomTag(dom){
    return dom.tag
  }
  
  getDomStyleOptions(dom){
    return dom.styleOptions
  }
  // Internal Actions /////////////////////////////////////////////////////////
  
  setDomStyle(dom, styleOptions){
    /**
     * If `styleOptions` is defined, use this
     * elif `dom.styleOptions` exists, use it
     * else update default value
     */
    if (styleOptions) {
      Object.keys(styleOptions).forEach(opt=>{
	if (gridConfig.allowedDomStyleAttributes.includes(opt))
	{ // If the opt is allowed to attached to `dom.style`
	  dom.style[opt] = (gridConfig.pixelSuffixArray.includes(opt)
			    ? this.addPixelSuffix
			    : this.same )(
	    (gridConfig.convertGridPixelArray.includes(opt)
	     ? this.convertToGridPixel
	     : this.same)(styleOptions[opt])
	  )
	}
      })
      dom.styleOptions = styleOptions
    } else if (dom.styleOptions) {
      this.setDomStyle(dom, dom.styleOptions)
    } else {
      this.setDomStyle(dom, gridConfig.defaultDomStyle)
    }
  }
  
  updateDomStyleOptions(dom, styleOptions){
    dom.styleOptions = Object.assign(dom.styleOptions, styleOptions)
  }

  
  shiftDomStyleOptions(dom, styleOptions){
    Object.keys(styleOptions).forEach((opt)=>{
      if (!isNaN(styleOptions[opt])){
	dom.styleOptions[opt] = dom.styleOptions[opt]
	  ? dom.styleOptions[opt] + styleOptions[opt]
	  : styleOptions[opt]
      }
    })
  }
  
  
  // Utilities  ///////////////////////////////////////////////////////////////
  convertToGridPixel(i){
    return gridConfig.defaultGridPixel * parseInt(i, 10)
  }
  addPixelSuffix(i){
    return String(i) + 'px'
  }
  same(i) {
    return i
  }
}

export { GridSystem }
