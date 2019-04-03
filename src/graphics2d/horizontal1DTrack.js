/*
 * @Description:
 * @Author: Hongpeng Ma
 * @Github: gitlab.com/hongpengm
 * @Date: 2019-03-24 22:39:51
 * @LastEditTime: 2019-03-29 02:12:17
 */
'use strict'
import { HiCEvent } from '../events/events'
const d3 = require('d3')
const uidv4 = require('uuid/v4')
const EventEmitter = require('events').EventEmitter
const HORIZONTAL1D_MARGIN_TOP = 0.05
const HORIZONTAL1D_MARGIN_BOTTOM = 0.05
const HORIZONTAL1D_MARGIN_RIGHT = 0.05
const HORIZONTAL1D_MARGIN_LEFT = 0.05
const HORIZONTAL1D_LINE_STROKE_WIDTH = 1.5
const HORIZONTAL1D_CIRCLE_RADIUS = 5
const HORIZONTAL1D_SVG_CLASS = 'horizontal_1d_track_svg'
const HORIZONTAL1D_BRUSH_CLASS = 'horizontal_1d_track_brush'
const HORIZONTAL1D_X_AXIS_TICK_PIXEL = 40
const HORIZONTAL1D_Y_AXIS_TICK_PIXEL = 20

/**
 *
 *
 * @class Horizontal1DTrack
 * @extends {EventEmitter}
 * @property {function} each iterate a fucntion to all Horizontal1DTrack's instances
 * @property {Array} instances all instances of this class
 * @property {function} findInstanceBySvg find a track instance given a svg element
 */
class Horizontal1DTrack extends EventEmitter {
  /**
   *Creates an instance of Horizontal1DTrack.
   * @constructor
   * @param {*} parentDOM dom element that this track will bind to
   * @param {*} [margin={
   *     top: HORIZONTAL1D_MARGIN_TOP,
   *     bottom: HORIZONTAL1D_MARGIN_BOTTOM,
   *     right: HORIZONTAL1D_MARGIN_RIGHT,
   *     left: HORIZONTAL1D_MARGIN_LEFT
   *   }]
   * margin of this track
   * @param {*} [options={
   *     line_stroke_width: HORIZONTAL1D_LINE_STROKE_WIDTH,
   *     circle_radius: HORIZONTAL1D_CIRCLE_RADIUS
   *   }]
   * extra options of this track
   * line_stroke_width is the line width
   * circle_radius is the circle mark point's radius
   * @memberof Horizontal1DTrack
   * @property {Document.Element} baseDOM - base DOM element that all other elements bind to
   * @property {number} width
   * @property {number} height
   * @property {svg} svg - parent svg
   * @property {g} svgg - g element that svg's transform to bind
   * @property {svg:clipPath} clip_path - mask
   * @property {Object} options - track options
   * @property {Array} subscribe - events that this track has subscribed
   * @property {Array} subscribers - object that subscribed this track
   * @property {String} behaviour - current behaviour
   * @property {*} zoom_handler - default zoom behaviour handler
   * @property {*} brush_handler - default brush behaviour handler
   * @property {*} drag_handler - default drag behaviour handler #Not implemented
   * @property {d3.axisBottom} xAxis
   * @property {d3.axisLeft} yAxis
   * @property {g} gX
   * @property {g} gY
   * @property {d3.scale} x_scale
   * @property {d3.scale} y_scale
   */
  constructor (parentDOM, margin = {
    top: HORIZONTAL1D_MARGIN_TOP,
    bottom: HORIZONTAL1D_MARGIN_BOTTOM,
    right: HORIZONTAL1D_MARGIN_RIGHT,
    left: HORIZONTAL1D_MARGIN_LEFT
  }, options = {
    line_stroke_width: HORIZONTAL1D_LINE_STROKE_WIDTH,
    circle_radius: HORIZONTAL1D_CIRCLE_RADIUS
  }) {
    super()
    this.initBBox(parentDOM, margin)

    this.svg = d3.select(this.baseDOM).append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .attr('class', HORIZONTAL1D_SVG_CLASS)
      .attr('id', uidv4())
    this.clip_path = this.svg.append('svg:clipPath')
      .attr('id', 'clip')
      .append('svg:rect')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('x', 0)
      .attr('y', 0)
    this.svgg = this.svg.append('g')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')')
    this.options = options
    this.subscribe = []
    this.subscribers = []
    this.initBehaviourHandler()
    this.init()
    if (Horizontal1DTrack.instances === undefined) {
      Horizontal1DTrack.instances = []
    }
    Horizontal1DTrack.instances.push(this)
  }

  /// //////////////////////////////////////////////////////////////////////////
  //                                   Init                                  //
  /// //////////////////////////////////////////////////////////////////////////

  /**
   * Init function, could be rewrite
   *
   * @memberof Horizontal1DTrack
   */
  init () { }

  /**
   * Init the bounding box and offset of the track element
   *
   * @param {Document.Element} parentDOM
   * @param {*} margin
   * @memberof Horizontal1DTrack
   */
  initBBox (parentDOM, margin) {
    let parentBBox = parentDOM.getBoundingClientRect()
    let parentHeight = parentBBox.height
    let parentWidth = parentBBox.width
    this.margin = {
      top: margin.top * parentHeight > 20
        ? margin.top * parentHeight
        : 20,
      bottom: margin.bottom * parentHeight > 20
        ? margin.bottom * parentHeight
        : 20,
      right: margin.right * parentWidth > 20
        ? margin.right * parentWidth
        : 20,
      left: margin.left * parentWidth > 20
        ? margin.left * parentWidth
        : 20
    }
    this.width = parentWidth
      ? parentWidth - this.margin.left - this.margin.right
      : window.innerWidth - this.margin.left - this.margin.right
    this.height = parentHeight
      ? parentHeight - this.margin.top - this.margin.bottom
      : window.innerHeight - this.margin.top - this.margin.bottom
    let base = document.createElement('div')
    d3.select(base)
      .attr('id', uidv4())
      .style('position', 'absolute')
      .style('width', parentWidth + 'px')
      .style('height', parentHeight + 'px')
    this.baseDOM = base
    parentDOM.appendChild(this.baseDOM)
  }

  /**
   * Init the behaviour handler and behaviour relative settings
   *
   * @memberof Horizontal1DTrack
   */
  initBehaviourHandler () {
    this.zoom_handler = d3.zoom()
      .scaleExtent([1, 8])
      .on('zoom', this.zoomed)
    this.brush_handler = d3.brushX()
      .extent([[0, 0], [this.width, this.height]])
      .on('brush start', this.brushed)
      .on('end', this.brushended)
    this.drag_handler = d3.drag()
      .on('drag', this.dragedVertical)
    this.behaviour = undefined
  }

  /// //////////////////////////////////////////////////////////////////////////
  //                               Draw Content                              //
  /// //////////////////////////////////////////////////////////////////////////

  /**
   * Draw content
   *
   * @param {function} [fn=undefined] and external draw command function
   * @memberof Horizontal1DTrack
   */
  draw (fn = undefined) {
    if (fn !== undefined) {
      fn(this)
    }
    this.drawAxis()
    this.drawPath()
    this.drawPoints()
  }

  /**
   * Draw axis
   *
   * @memberof Horizontal1DTrack
   */
  drawAxis () {
    this.xAxis = d3.axisBottom(this.xScale)
      .ticks(Math.round(this.width / HORIZONTAL1D_X_AXIS_TICK_PIXEL))
    this.yAxis = d3.axisLeft(this.yScale)
      .ticks(Math.round(this.height / HORIZONTAL1D_Y_AXIS_TICK_PIXEL))
    this.gX = this.svgg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(this.xAxis)
    this.gY = this.svgg.append('g')
      .attr('class', 'y axis')
      .call(this.yAxis)
  }

  /**
   * Draw path
   *
   * @memberof Horizontal1DTrack
   */
  drawPath () {
    this.clip_mask = this.svgg.append('g')
      .attr('clip-path', 'url(#clip)')
    this.path = this.clip_mask.append('path')
      .datum(this.dataSet)
      .attr('class', 'line')
      .style('fill', 'none')
      .style('stroke', 'black')
      .style('stroke-width', this.options.line_stroke_width)
      .attr('d', this.line)
  }

  /**
   * Draw data points
   *
   * @memberof Horizontal1DTrack
   */
  drawPoints () {
    this.points = this.clip_mask.selectAll('.dot')
      .data(this.dataSet)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', d => { return this.xScale(d.x) })
      .attr('cy', d => { return this.yScale(d.y) })
      .attr('r', this.options.circle_radius)
      .on('mouseover', function (a, b, c) {
        this.attr('class', 'focus')
      })
      .on('mouseout', null)
  }

  /// //////////////////////////////////////////////////////////////////////////
  //                               Access Data                               //
  /// //////////////////////////////////////////////////////////////////////////

  /**
   * Get data set
   * @return {*} data set of the track
   * @memberof Horizontal1DTrack
   */
  get dataSet () {
    return this.data_set
  }

  /**
   * Set dataset
   *
   * @memberof Horizontal1DTrack
   */
  set dataSet (x) {
    this.data_set = x
  }

  /**
   * set x scale
   *
   * @memberof Horizontal1DTrack
   */
  set xScale (x) {
    this.x_scale = d3.scaleLinear()
      .domain(x.domain)
      .range(x.range)
  }
  get xScale () {
    return this.x_scale
  }
  set yScale (x) {
    this.y_scale = d3.scaleLinear()
      .domain(x.domain)
      .range(x.range)
  }
  get yScale () {
    return this.y_scale
  }

  /**
   * line generate function
   * @return {function} d3 line generater
   * @readonly
   * @memberof Horizontal1DTrack
   */
  get line () {
    return d3.line()
      .x(d => { return this.x_scale(d.x) })
      .y(d => { return this.y_scale(d.y) })
  }

  /// //////////////////////////////////////////////////////////////////////////
  //                                Behaviour                                //
  /// //////////////////////////////////////////////////////////////////////////

  /**
   * Apply a transform to track
   *
   * @param {*} transform includes {k, x, y}
   * @param {boolean} [transformXAxis=true] default transform has effect on x axis
   * @param {boolean} [transformYAxis=false] default transform has no effect on x axis
   * @param {boolean} [emitEvents=true] whether to emit a event
   * @memberof Horizontal1DTrack
   */
  applyTransform (transform,
    transformXAxis = true,
    transformYAxis = false,
    emitEvents = true) {
    let transformString
    transformString = 'translate(' + transform.x + ',' + '0) scale(' + transform.k + ',1)'
    this.path
      .attr('transform', transformString)
    this.points
      .attr('transform', transformString)
    this.svgg.selectAll('.dot').attr('r', this.options.circle_radius / transform.k)
    this.svgg.selectAll('.line').style('stroke-width', this.options.line_stroke_width)
    if (transformXAxis) {
      this.gX.call(this.xAxis.scale(transform.rescaleX(this.xScale)))
    }
    if (transformYAxis) {
      this.gY.call(this.yAxis.scale(transform.rescaleY(this.yScale)))
    }
    if (emitEvents) {
      let emitSubEvent = new HiCEvent()
      emitSubEvent.attr('transform', transform)
      emitSubEvent.attr('sourceEvent', 'transform')
      emitSubEvent.attr('sourceObject', this)
      this.emitSubs('transform', emitSubEvent)
    }
  }

  /**
   * respond to a HiCEvent if this is not the source of the event
   *
   * @param {HiCEvent} e
   * @memberof Horizontal1DTrack
   */
  respondEvents (e) {
    if (this !== e.sourceObject) {
      switch (e.sourceEvent) {
        case 'transform':
          this.applyTransform(e.transform, true, false, false)
          break
      case 'selection':
          if (this.behaviour === 'brush') {
            // 2D Situation
            if (Array.isArray(e.selection[0])) {
              const eSelection = [[e.selection[0][0] / e.context.width,
                e.selection[0][1] / e.context.height],
              [e.selection[1][0] / e.context.width,
                e.selection[1][1] / e.context.height]]
              let selection = [Math.round(eSelection[0][0] * this.width),
			     Math.round(eSelection[1][0] * this.width)]
	    d3.brushX().move(this.brush_g, selection)
            } else { // 1D Situation

            }
          }
          break
        default:
          break
      }
    }
  }

  /**
   * Zooming action callback
   *
   * @memberof Horizontal1DTrack
   */
  zoomed () {
    const track = Horizontal1DTrack.findInstanceBySvg(this)
    Horizontal1DTrack.applyTransform(track, d3.event.transform)

    let emitSubEvent = new HiCEvent()
    Object.keys(d3.event).forEach(key => {
      emitSubEvent
        .attr(key, d3.event[key])
    })
    emitSubEvent.attr('sourceEvent', 'h1dzoom')
    track.emitSubs('h1dzoom', emitSubEvent)
  }

  /**
   * Responding callback to other's triggered zoom event
   *
   * @param {HiCEvent} hicE
   * @memberof Horizontal1DTrack
   */
  zoomedCallback (hicE) {
    this.applyTransform(hicE.transform)
  }

  dragedVertical () {

  }
  brushed () {
    const track = Horizontal1DTrack.findInstanceByBrush(this)
    let emitSubEvent = new HiCEvent()
    emitSubEvent
      .attr('selection', d3.event.selection)
      .attr('selectionType', 'x')
      .attr('context', {
        width: track.width,
        height: track.height })
      .attr('sourceEvent', 'selection')
    //  track.setSpriteTransform(d3.event.transform)
    track.emitSubs('selection', emitSubEvent)
  }
  brushended () {
    const track = Horizontal1DTrack.findInstanceByBrush(this)
    let emitSubEvent = new HiCEvent()
    emitSubEvent
      .attr('selection', d3.event.selection)
      .attr('selectionType', 'x')
      .attr('context', {
        width: track.width,
        height: track.height })
      .attr('sourceEvent', 'selectionEnds')
    //  track.setSpriteTransform(d3.event.transform)
    track.emitSubs('selectionEnds', emitSubEvent)
  }
  brushedCallback (hicE) {
    d3.brush().move(this.brush_g, hicE.selection)
  }
  addZoomBehaviour () {
    this.removeBehaviour()
    this.behaviour = 'zoom'
    this.svg.call(this.zoom_handler)
  }
  addBrushBehaviour () {
    this.removeBehaviour()
    this.behaviour = 'brush'
    this.brush_g = this.svgg.append('g')
      .attr('class', HORIZONTAL1D_BRUSH_CLASS)
      .attr('id', uidv4())
    this.brush_g
      .call(this.brush_handler)
  }
  addZoomBrushBehaviour () {
    this.removeBehaviour()
    this.behaviour = 'zoom_brush'
    this.svg.call(this.zoom_handler)
      .on('mousedown.zoom', null)
      .on('touchstart.zoom', null)
      .on('touchcancel.zoom', null)
      .on('touchend.zoom', null)
    this.brush_g = this.svgg.append('g')
      .attr('class', HORIZONTAL1D_BRUSH_CLASS)
      .attr('id', uidv4())
    this.brush_g
      .call(this.brush_handler)
  }
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
      case 'zoom_brush':
        this.brush_g.on('.brush', null)
        d3.select(this.canvas)
          .on('.zoom', null)
        break
      default:
        console.log('Current behaviour is unknown\nCurrent type is:', this.behaviour)
        break
    }
  }
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
  emitSubs (type, ...args) {
    this.subscribers.forEach(sub => {
      if (sub.type === type) {
        sub.subscriber.emit(...[type].concat(args))
        // Above line is equal to below ES5 one
        // sub.subscriber.emit.apply(sub.subscriber, [type].concat(args))
      }
    })
  }
  destroy () {
    let i = 0
    while (Horizontal1DTrack.instances[i] !== this) { i++ }
    Horizontal1DTrack.instances.splice(i, 1)
  }
}

// Loop through horizontal1dtrack instances
Horizontal1DTrack.each = function (fn) {
  Horizontal1DTrack.instances.forEach(fn)
}

Horizontal1DTrack.findInstanceBySvg = function (svg) {
  let instance
  Horizontal1DTrack.each(ele => {
    if (ele.svg.node() === svg) {
      instance = ele
    }
  })
  return instance
}

Horizontal1DTrack.findInstanceByBrush = function (g) {
  let instance
  Horizontal1DTrack.each(ele => {
    if (ele.brush_g !== undefined && ele.brush_g.node() === g) {
      instance = ele
    }
  })
  return instance
}

Horizontal1DTrack.applyTransform = function (obj, transform) {
  obj.applyTransform(transform)
}

export { Horizontal1DTrack }
