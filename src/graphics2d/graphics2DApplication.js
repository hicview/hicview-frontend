/*
 * @Description:
 * @Author: Hongpeng Ma
 * @Github: gitlab.com/hongpengm
 * @Date: 2019-03-29 02:24:30
 * @LastEditTime: 2019-04-14 01:59:04
 */
'use strict'
import { Horizontal1DTrack } from './horizontal1DTrack'
import { Heatmap2DTrack } from './heatmap2DTrack'
import { createDOM, shiftDOM } from '../utils/DOM'
const uidv4 = require('uuid/v4')
const d3 = require('d3')
const G2D_HORIZONTAL1D_WIDTH = 600
const G2D_HORIZONTAL1D_HEIGHT = 100
const G2D_HEATMAP2D_WIDTH = 600
const G2D_HEATMAP2D_HEIGHT = 600

function hello() {
  alert('hello')
}
/**
 *
 *
 * @class Graphics2DApplication
 */
class Graphics2DApplication {

  /**
   *Creates an instance of Graphics2DApplication.
   * @param {*} parentDOM
   * @memberof Graphics2DApplication
   */
  constructor (parentDOM) {
    this.baseDOM = createDOM('div', uidv4(), 1000, 1000)
    d3.select(this.baseDOM).attr('class', 'base')
    parentDOM.appendChild(this.baseDOM)

    // use `let` rather than `var` please
    let btn = document.createElement('button') //生成button
    btn.setAttribute('onclick', 'hello()')    //绑定响应
    this.baseDOM.appendChild(btn)    // 绑定到文档树

    let btn2 = createDOM('button', uidv4(), 100,100, {top: -100})
    //shiftDOM(btn2, -100, 0)
    btn2.onclick = hello
    this.baseDOM.appendChild(btn2)
    
    this.topTrack = []
    this.bottomTrack = []
    this.leftTrack = []
    this.rightTrack = []
    this.centerTrack = undefined
  }

  /**
   *
   *
   * @param {*} position
   * @param {*} options
   * @memberof Graphics2DApplication
   */
  add1DTrack (position, options) {
    const trackArray = this[position + 'Track']
    let trackDOM, track
    let options1d = {options:{path_type:'line'}}
    if (['top', 'bottom'].includes(position)) {
      if (options.domInfo) {
        const domInfo = options.domInfo
        trackDOM = createDOM('div', uidv4(), domInfo.width, domInfo.height, domInfo.options)
      } else {
        trackDOM = createDOM('div', uidv4(), G2D_HORIZONTAL1D_WIDTH, G2D_HORIZONTAL1D_HEIGHT)
      }
      this.baseDOM.appendChild(trackDOM)
      
      if (options.margin) {
        options1d.options = {
	  margin:options.margin,
	}
      }
      if (options.path_type){
	options1d.options.path_type = options.path_type
      }
    }
    track = new Horizontal1DTrack(trackDOM, options1d)
    if (options.drawFunction) {
      track.draw(options.drawFunction)
    }
    if (options.behaviour === 'zoom') {
      track.addZoomBehaviour()
    }
    if (options.behaviour === 'brush') {
      track.addBrushBehaviour()
    }
    trackArray.push({
      dom: trackDOM,
      track: track
    })
  }

  /**
   *
   *
   * @param {*} options
   * @memberof Graphics2DApplication
   */
  add2DTrack (options) {
    let trackDOM, track
    if (options.domInfo) {
      // TODO
    } else {
      trackDOM = createDOM('div', uidv4(), G2D_HEATMAP2D_WIDTH, G2D_HEATMAP2D_HEIGHT)
    }
    this.baseDOM.appendChild(trackDOM)
    track = new Heatmap2DTrack(trackDOM)
    if (options.loadURL) {
      track.loadImgURL(options.loadURL)
    }
    if (options.behaviour === 'zoom') {
      track.addZoomBehaviour()
    }
    if (options.behaviour === 'brush') {
      track.addBrushBehaviour()
    }
    this.centerTrack = {
      dom: trackDOM,
      track: track
    }
  }

  /**
   *
   *
   * @memberof Graphics2DApplication
   */
  syncTrackAlignment () {
    let centerLeft, centerTop
    centerLeft = this.leftTrack.length > 0
      ? this.leftTrack.map(e => {
        return e.dom.getBoundingClientRect().width
      }).reduce((a, b) => { return a + b })
    : 0
    centerTop = this.topTrack.length > 0
      ? this.topTrack.map(e => {
        return e.dom.getBoundingClientRect().height
      }).reduce((a, b) => { return a + b })
    : 0
    if (this.centerTrack) {
      shiftDOM(this.centerTrack.dom, centerTop, centerLeft)
    }
    let topShiftArr = []
    let leftShiftArr = []
    let bottomShiftArr = []
    let rightShiftArr = []
    this.topTrack.map(e => {
      return e.dom.getBoundingClientRect().height
    }).forEach((val, idx, arr) => {
      if (idx === 0) {
        topShiftArr.push(0)
      } else {
        topShiftArr.push(arr[idx - 1] + val - arr[0])
      }
    })
    this.leftTrack.map(e => {
      return e.dom.getBoundingClientRect().width
    }).forEach((val, idx, arr) => {
      if (idx === 0) {
        leftShiftArr.push(0)
      } else {
        leftShiftArr.push(arr[idx - 1] + val - arr[0])
      }
    })
    this.bottomTrack.map(e => {
      return e.dom.getBoundingClientRect().height
    }).forEach((val, idx, arr) => {
      if (idx === 0) {
        bottomShiftArr.push(centerTop + this.centerTrack.dom.getBoundingClientRect().height)
      } else {
        bottomShiftArr.push(centerTop + this.centerTrack.dom.getBoundingClientRect().height + arr[idx - 1] + val - arr[0])
      }
    })
    this.rightTrack.map(e => {
      return e.dom.getBoundingClientRect().width
    }).forEach((val, idx, arr) => {
      if (idx === 0) {
        rightShiftArr.push(0)
      } else {
        rightShiftArr.push(centerLeft + this.centerTrack.dom.getBoundingClientRect().width + arr[idx - 1] + val - arr[0])
      }
    })

    this.topTrack.forEach((e, idx) => {
      shiftDOM(e.dom, topShiftArr[idx], centerLeft)
    })
    this.leftTrack.forEach((e, idx) => {
      shiftDOM(e.dom, centerTop, leftShiftArr[idx])
    })
    this.bottomTrack.forEach((e, idx) => {
      shiftDOM(e.dom, bottomShiftArr[idx], centerLeft)
    })
    this.rightTrack.forEach((e, idx) => {
      shiftDOM(e.dom, centerTop, rightShiftArr[idx])
    })
  }

  /**
   *
   *
   * @memberof Graphics2DApplication
   */
  syncTrackTransformBehaviour () {
    let track1DArr = this.topTrack
	.concat(this.leftTrack)
	.concat(this.rightTrack)
	.concat(this.bottomTrack)
    const centerTrack = this.centerTrack.track
    track1DArr.forEach(e => {
      e.track.addSubs(centerTrack, 'transform', centerTrack.respondEvents)
      centerTrack.addSubs(e.track, 'transform', e.track.respondEvents)
    })
  }

  /**
   *
   *
   * @memberof Graphics2DApplication
   */
  syncTrackBrushBehaviour () {
    let track1DArr = this.topTrack
	.concat(this.leftTrack)
	.concat(this.rightTrack)
	.concat(this.bottomTrack)
    const centerTrack = this.centerTrack.track
    track1DArr.forEach(e => {
      e.track.addSubs(centerTrack, 'selection', centerTrack.respondEvents)
      centerTrack.addSubs(e.track, 'selection', e.track.respondEvents)
    })
  }
  syncBehaviour () {

  }
}

export { Graphics2DApplication }
