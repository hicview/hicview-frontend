/*
 * @Description:
 * @Author: Hongpeng Ma
 * @Date: 2019-05-31 12:28:48
 * @Github: gitlab.com/hongpengm
 * @LastEditTime: 2019-06-19 12:04:59
 */
'use strict'
import * as d3 from 'd3'
import uuidv4 from 'uuid/v4'
import { typeGrid } from './symbols'
import { mergeOptions,
	 capitalize } from './utils'

// Grid Configurations, settings #TODO future will move to `settings.js`
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
    'border-style': 'solid'
  },
  // Field names that are allowed to set to `dom.style`
  allowedDomStyleAttributes: ['width', 'height', 'top', 'bottom', 'left', 'right', 'position', 'background-color', 'border-color', 'border-width', 'border-style'],
  // When other class eg `Stage` init a dom, then the dom is tagged to the class type
  defaultTag: 'Untyped',
  convertGridPixelArray: ['width', 'height', 'top', 'bottom', 'left',
		     'right'],
  pixelSuffixArray: ['width', 'height', 'top', 'bottom', 'left',
		     'right']
}

class GridSystem {
  constructor () {

  }

  /**
   * Singleton Grid System, will init only once, to use the grid system
   * simple use `const gridSys = GridSystem.instance` to access the grid system
   *
   * @readonly
   * @static
   * @memberof GridSystem
   */
  static get instance () {
    if (!this.__instance__) {
      // Init the grid system
      this.__instance__ = new GridSystem()
      // Use grid system to record all elements generated or managed by Gridsystem
      // __domlist__ data format
      // {
      //   <element id> : {
      //      instance: <element>,
      //      nodeName: <element node type name>,
      //      nodeType: <element node type>,
      //      tag: <element tag>
      //      #TODO
      //   }
      // }
      this.__instance__.__domlist__ = {}
      // __type__ is a Symbol, all type Symbol imported from `symbols.js`
      this.__type__ = typeGrid
    }
    return this.__instance__
  }

  /**
   * Get the type Symbol, which will be used in compare
   *
   * @readonly
   * @memberof GridSystem
   */
  get type () {
    return String(this.__type__)
  }

  // Actions //////////////////////////////////////////////////////////////////
  createDom (type, ...optionsArr) {
    let options = mergeOptions(optionsArr)
    let newDom = document.createElement(type)
    newDom.id = uuidv4()
    this.__domlist__[newDom.id] = {
      instance: newDom,
      tag: newDom.tag
    }
    // Merge with the defaul style
    options = Object.assign(gridConfig.defaultDomStyle, options)
    // Set DOM element style
    this.setDomStyle(newDom, options)

    this.updateDomTag(newDom, options.tag)
    console.log(newDom)
    // Add dom to list

    return newDom
  }

  shiftDom (dom, ...optionsArr) {
    let options = mergeOptions(optionsArr)
    this.shiftDomStyleOptions(dom, options)
    this.setDomStyle(dom)
  }

  updateDomTag (dom, tag) {
    if (tag) {
      dom.tag = tag
      console.log(tag, dom.tag)
      // update domlist
      this.__domlist__[dom.id].tag = dom.tag
    } else {
      this.updateDomTag(dom, gridConfig.defaultTag)
    }
  }

  getDomTag (dom) {
    return dom.tag
  }

  getDomStyleOptions (dom) {
    return dom.styleOptions
  }
  // Internal Actions /////////////////////////////////////////////////////////

  setDomStyle (dom, styleOptions) {
    /**
     * If `styleOptions` is defined, use this
     * elif `dom.styleOptions` exists, use it
     * else update default value
     */
    if (styleOptions) {
      Object.keys(styleOptions).forEach(opt => {
        if (gridConfig.allowedDomStyleAttributes.includes(opt)) { // If the opt is allowed to attached to `dom.style`
	  dom.style[opt] = (gridConfig.pixelSuffixArray.includes(opt)
			    ? this.addPixelSuffix
			    : this.same)(
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

  updateDomStyleOptions (dom, styleOptions) {
    dom.styleOptions = Object.assign(dom.styleOptions, styleOptions)
  }

  shiftDomStyleOptions (dom, styleOptions) {
    Object.keys(styleOptions).forEach((opt) => {
      if (!isNaN(styleOptions[opt])) {
        dom.styleOptions[opt] = dom.styleOptions[opt]
	  ? dom.styleOptions[opt] + styleOptions[opt]
	  : styleOptions[opt]
      }
    })
  }

  // DomList //////////////////////////////////////////////////////////////////
  updateDomlist (domElement) {
    if (this.__domlist__.hasOwnProperties(domElement.id)) {
      const domEleInList = this.__domlist__[domElement.id]
    } else {
      // add identifier to domElement
      if (domElement.hasOwnProperties('id')) {
        domElement.id = uuidv4()
      }
      this.__domlist__[domElement.id] = {
        instance: domElement,
        nodeName: domElement.nodeName,
        nodeType: domElement.nodeType,
        tags: domElement.tags,
        styleOptions: domElement.styleOptions
      }
    }
  }
  // Utilities  ///////////////////////////////////////////////////////////////
  convertToGridPixel (i) {
    return gridConfig.defaultGridPixel * parseInt(i, 10)
  }
  addPixelSuffix (i) {
    return String(i) + 'px'
  }
  same (i) {
    return i
  }
}

export { GridSystem }
