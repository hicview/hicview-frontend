/*
 * @Description:
 * @Author: Hongpeng Ma
 * @Github: gitlab.com/hongpengm
 * @Date: 2019-03-29 02:24:30
 * @LastEditTime: 2019-04-14 02:08:56
 */
import * as PIXI from 'pixi.js'
import { HiCEvent } from '../events/events'
const d3 = require('d3')
const uidv4 = require('uuid/v4')
const EventEmitter = require('events').EventEmitter
const HEATMAP2D_CANVAS_CLASS = 'heatmap_2d_track_canvas'
const HEATMAP2D_SVG_CLASS = 'heatmap_2d_track_svg'
const HEATMAP2D_BRUSH_CLASS = 'heatmap_2d_track_brush'
const HEATMAP2D_ZOOM_EVENT = 'g2dzoom'

/**
 *
 *
 * @class Heatmap2DTrack
 * @extends {EventEmitter}
 */
class Heatmap2DTrack extends EventEmitter {
  
  /**
   *Creates an instance of Heatmap2DTrack.
   * @param {*} parentDOM
   * @memberof Heatmap2DTrack
   */
  constructor (parentDOM) {
    super()
    this.initBBox(parentDOM)
    this.app = new PIXI.Application(
      {
	width:this.width,
	height: this.height,
        backgroundColor: 0xffffff
      })

    this.responsiveSVG = d3.select(this.baseDOM).append('svg')
      .style('z-index', 2)
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('class', HEATMAP2D_SVG_CLASS)
      .attr('id', uidv4())

    this.app.view.className = HEATMAP2D_CANVAS_CLASS
    this.app.view.id = uidv4()
    this.canvas = this.app.view

    // Be sure the PIXI is rendered below responsive svg
    this.baseDOM.appendChild(this.app.view)

    this.sprite = undefined

    this.initBehaviourHandler()
    this.external_behaviour_function = []
    this.subscribe = []
    this.subscribers = []
    this.emitEventType = undefined
    if (Heatmap2DTrack.instances === undefined) {
      Heatmap2DTrack.instances = []
    }
    Heatmap2DTrack.instances.push(this)
  }

  /// //////////////////////////////////////////////////////////////////////////
  //                                   Init                                  //
  /// //////////////////////////////////////////////////////////////////////////
  /**
   * Init 2D Track bounding box
   *
   * @param {*} parentDOM
   * @memberof Heatmap2DTrack
   */
  initBBox (parentDOM) {
    let parentBBox = parentDOM.getBoundingClientRect()
    let parentHeight = parentBBox.height
    let parentWidth = parentBBox.width
    this.width = parentWidth
    this.height = parentHeight
    let base = document.createElement('div')
    d3.select(base)
      .attr('id', uidv4())
      .attr('width', this.width + 'px')
      .attr('height', this.height + 'px')
      .style('position', 'absolute')
    this.baseDOM = base
    parentDOM.appendChild(this.baseDOM)
  }

  /// //////////////////////////////////////////////////////////////////////////
  //                               Manipulate Sprite                           //
  /// //////////////////////////////////////////////////////////////////////////

  /**
   * Get Sprite
   *
   * @return {PIXI.Sprite}
   * @memberof Heatmap2DTrack
   */
  getSprite () {
    return this.sprite
  }

  
  // Set heatmap's image's transform
  /**
   * Transform the Sprite
   *
   * @param {Object} transform
   * @memberof Heatmap2DTrack
   */
  setSpriteTransform (transform) {
    if (this.sprite !== undefined) {
      // this.sprite.scale.set(this.sprite.load_scale.x * transform.k, this.sprite.load_scale.y * transform.k)
      // this.sprite.position.set(this.sprite.load_scale.x * transform.x, this.sprite.load_scale.y * transform.y)
      this.sprite.scale.set(transform.k)
      this.sprite.position.set(transform.x, transform.y)
    }
  }

  /**
   * Load image
   *
   * @param {String} url
   * @memberof Heatmap2DTrack
   */
  loadImgURL (url) {
    this.texture = PIXI.Texture.from(url)
    this.texture.trim = new PIXI.Rectangle(0, 0, this.width, this.height)
    this.texture.updateUvs()
    // console.log(this.texture.trim)
    this.sprite = new PIXI.Sprite(this.texture)
    this.sprite.x = 0
    this.sprite.y = 0
    this.sprite.interactive = true
    this.sprite.buttonMode = true
    // this.sprite.load_scale = this.sprite.scale.clone()
    this.app.stage.addChild(this.sprite)
    // console.log(this.sprite)
  }

  /**
   *
   *
   * @param {*} transform
   * @param {boolean} [emitEvents=true]
   * @memberof Heatmap2DTrack
   */
  applyTransform (transform, emitEvents = true) {
    this.setSpriteTransform(transform)
    if (emitEvents) {
      let emitSubEvent = new HiCEvent()
      emitSubEvent.attr('transform', transform)
      emitSubEvent.attr('sourceEvent', 'transform')
      emitSubEvent.attr('sourceObject', this)
      this.emitSubs('transform', emitSubEvent)
    }
  }

  /**
   *
   *
   * @param {HiCEvent} e
   * @memberof Heatmap2DTrack
   */
  respondEvents (e) {
    if (this !== e.sourceObject) {
      switch (e.sourceEvent) {
        case 'transform':
          this.applyTransform(e.transform)
          break
        case 'selection':
          // 2D situation
          if (Array.isArray(e.selection[0])) {

          } else { // 1D situation
            if (e.selectionType === 'x') {
              const eSelection = [e.selection[0] / e.context.width,
                e.selection[1] / e.context.width]
              let selection = [[Math.round(eSelection[0] * this.width), 0],
                [Math.round(eSelection[1] * this.width), this.height]]

              d3.brush().move(this.brush_g, selection)
            }
          }
          break
        default:
          break
      }
    }
  }
  /// //////////////////////////////////////////////////////////////////////////
  //                                Behaviour                                //
  /// //////////////////////////////////////////////////////////////////////////
  
  /**
   *
   *
   * @memberof Heatmap2DTrack
   */
  initBehaviourHandler () {
    this.zoom_handler = d3.zoom()
      .scaleExtent([1, 8])
      .on('zoom', this.zoomed)
    this.brush_handler = d3.brush()
      .extent([[0, 0], [this.width, this.height]])
      .on('brush start', this.brushed)
      .on('end', this.brushended)
    this.behaviour = undefined
  }

  /**
   *
   *
   * @param {String} behav
   * @memberof Heatmap2DTrack
   */
  addBehaviour (behav) {
    switch (behav) {
      case 'zoom':
        this.addZoomBehaviour()
        break
      case 'brush':
        this.addBrushBehaviour()
        break
      default:
        break
    }
  }

  /**
   *
   *
   * @param {*} caller
   * @param {*} handler
   * @memberof Heatmap2DTrack
   */
  callBehaviour (caller, handler) {
    caller.call(handler)
  }

  /**
   *
   *
   * @param {String} behav
   * @memberof Heatmap2DTrack
   */
  switchBehaviour (behav) {
    this.removeBehaviour()
    this.addBehaviour(behav)
  }

  /**
   *
   *
   * @memberof Heatmap2DTrack
   */
  removeBehaviour () {
    switch (this.behaviour) {
      case undefined:
        break
      case 'brush':
        this.brush_g.on('.brush', null)
        break
      case 'zoom':
        d3.select(this.canvas)
          .on('.zoom', null)
        break
      default:

        console.log('Current behaviour is unknown\nCurrent type is:', this.behaviour)
        break
    }
    this.emitEventType = undefined
  }

  /**
   *
   *
   * @param {String} behav
   * @returns {Function}
   * @memberof Heatmap2DTrack
   */
  getBehaviourCallback (behav) {
    // TODO
    switch (behav) {
      case 'zoom':
        return this.zoomedCallback
      default:
        break
    }
  }

  /**
   *
   *
   * @memberof Heatmap2DTrack
   */
  addBrushBehaviour () {
    this.removeBehaviour()
    this.behaviour = 'brush'
    this.brush_g = this.responsiveSVG.append('g')
      .attr('class', HEATMAP2D_BRUSH_CLASS)
      .attr('id', uidv4())
    this.callBehaviour(this.brush_g, this.brush_handler)
  }

  /**
   *
   *
   * @memberof Heatmap2DTrack
   */
  addZoomBehaviour () {
    this.removeBehaviour()
    // console.log(this.responsiveSVG.zIndex, this.canvas.zIndex)
    this.behaviour = 'zoom'
    this.emitEventType = HEATMAP2D_ZOOM_EVENT
    let canvas = d3.select(this.canvas)
    this.callBehaviour(canvas, this.zoom_handler)
    // canvas.call(this.zoom_handler)
  }
  // Brush Behaviour //////////////////////////////////////////////////////////

  // brush actions

  /**
   *
   *
   * @memberof Heatmap2DTrack
   */
  brushed () {
    const track = Heatmap2DTrack.findInstanceByBrush(this)
    this.brushSelection = d3.event.selection
    let emitSubEvent = new HiCEvent()
    emitSubEvent
      .attr('selection', d3.event.selection)
      .attr('transform', {
        k: track.sprite.scale.x,
        x: track.sprite.position.x,
        y: track.sprite.position.y
      })
      .attr('context', {
        width: track.width,
        height: track.height })
      .attr('sourceEvent', 'selection')
    //  track.setSpriteTransform(d3.event.transform)
    track.emitSubs('selection', emitSubEvent)
  }

  /**
   *
   *
   * @memberof Heatmap2DTrack
   */
  brushended () {
    const track = Heatmap2DTrack.findInstanceByBrush(this)
    let emitSubEvent = new HiCEvent()

    emitSubEvent
      .attr('selection', this.brushSelection)
      .attr('transform', {
        k: track.sprite.scale.x,
        x: track.sprite.position.x,
        y: track.sprite.position.y
      })
      .attr('context', {
        width: track.width,
        height: track.height })
      .attr('sourceEvent', 'selectionEnds')
      //  track.setSpriteTransform(d3.event.transform)
    track.emitSubs('selectionEnds', emitSubEvent)

  }

  /**
   *
   *
   * @param {HiCEvent} hicE
   * @memberof Heatmap2DTrack
   */
  brushedCallback (hicE) {
    d3.brush().move(this.brush_g, hicE.selection)
  }

  // Zoom Behaviour ///////////////////////////////////////////////////////////

  // zoom actions

  /**
   *
   *
   * @memberof Heatmap2DTrack
   */
  zoomed () {
    // `this` in the context is the listener binded canvas
    const track = Heatmap2DTrack.findInstanceByCanvas(this)
    track.applyTransform(d3.event.transform)
    // call external behaviour
    let emitSubEvent = new HiCEvent()
    emitSubEvent
      .attr('transform', d3.event.transform)
      .attr('sourceEvent', HEATMAP2D_ZOOM_EVENT)
    track.emitSubs(HEATMAP2D_ZOOM_EVENT, emitSubEvent)
  }

  /**
   *
   *
   * @param {HiCEvent} hicE
   * @memberof Heatmap2DTrack
   */
  zoomedCallback (hicE) {
    this.applyTransform(hicE.transform)
  }

  /// //////////////////////////////////////////////////////////////////////////
  //                             Event Management                            //
  /// //////////////////////////////////////////////////////////////////////////
  
  /**
   *
   *
   * @param {*} sub
   * @param {*} type
   * @param {*} cb
   * @memberof Heatmap2DTrack
   */
  addSubs (sub, type, cb) {
    sub.on(type, cb)
    sub.subscribe.push({
      this: this,
      type: type,
      callback: cb
    })
    this.subscribers.push({
      'type': type,
      'subscriber': sub
    })
  }

  /**
   *
   *
   * @param {*} type
   * @param {*} args
   * @memberof Heatmap2DTrack
   */
  emitSubs (type, ...args) {
    this.subscribers.forEach(sub => {
      if (sub.type === type) {
        // ES6 hacky apply
        sub.subscriber.emit(...[type].concat(args))
        // Above line is equal to below ES5 one
        // sub.subscriber.emit.apply(sub.subscriber, [type].concat(args))
      }
    })
  }

  /// //////////////////////////////////////////////////////////////////////////
  //                                 Destroy                                 //
  /// //////////////////////////////////////////////////////////////////////////
  // this function is to destroy the obj to prevent memory leak
  
  /**
   *
   *
   * @memberof Heatmap2DTrack
   */
  destroy () {
    this.app.destroy()
    let i = 0
    while (Heatmap2DTrack.instances[i] !== this) { i++ }
    Heatmap2DTrack.instances.splice(i, 1)
  }
}

// Loop through heatmap2dtrack instances
Heatmap2DTrack.each = function (fn) {
  Heatmap2DTrack.instances.forEach(fn)
}

Heatmap2DTrack.findInstanceByCanvas = function (canvas) {
  let instance
  Heatmap2DTrack.each(ele => {
    if (ele.canvas === canvas) {
      instance = ele
    }
  })
  return instance
}
Heatmap2DTrack.findInstanceByBrush = function (g) {
  let instance
  Heatmap2DTrack.each(ele => {
    //    console.log(ele.brush_g.node())
    if (ele.brush_g.node() === g) {
      instance = ele
    }
  })
  return instance
}
export {
  Heatmap2DTrack
}
