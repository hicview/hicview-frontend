/*
 * @Description: 
 * @Author: Hongpeng Ma
 * @Github: gitlab.com/hongpengm
 * @Date: 2019-03-29 02:24:30
 * @LastEditTime: 2019-03-29 02:25:52
 */
import { scaleLinear } from 'd3-scale'
// import * as PIXI from 'pixi.js'
// import { hColor } from '../utils/color'
import {// sumArray,
  containPoint } from '../utils/utils'

const uuid = require('uuid/v4')

class Block {
  constructor ({ id, sub }) {
    this.uid = uuid()
    this.subscribes = []

    this._xScale = scaleLinear()
    this._yScale = scaleLinear()

    // reference scales used for tracks that can translate and scale
    // their graphics
    // They will draw their graphics on the reference scales and then translate
    // and pan them as needed
    this._refXScale = scaleLinear()
    this._refYScale = scaleLinear()

    this._positions = [0, 0]
    this._dimensions = [1, 1]
    this.options = {}
    this.sub = sub

    if (sub) {
      this.subscribes.push(
        this.sub.subscribe(
          'app.mouseMove', this.defaultMouseMoveHandler.bind(this)
        )
      )
    }
  }// End Constructor //////////////////////////////////////////////////////////////

  defaultMouseMoveHandler () {

  }

  contains (point) {
    let rect = this.positions.slice().concat(this.positions, this.dimensions)
    if ((point.length === 1) || (point.length === 2)) {
      return containPoint(point, rect)
    } else {
      throw Error('Invalid point format')
    }
  }

  set dimensions (x) { this._dimensions = x }
  set positions (x) { this._positions = x }
  set x (_) { this.positions[0] = _ }
  set y (_) { this.positions[1] = _ }
  set width (_) { this.dimensions[0] = _ }
  set height (_) { this.dimensions[1] = _ }
  set XScale (x) { this._xScale = x }
  set YScale (x) { this._yScale = x }
  set refXScale (x) { this._refXScale = x }
  set refYScale (x) { this._refYScale = x }
  set Scale (x) { this._xScale = x[0]; this._yScale = x[1] }
  set refScale (x) { this._xRefScale = x[0]; this._yRefScale = x[1] }

  get dimensions () { return this._dimensions }
  get positions () { return this._positions }
  get x () { return this.positions[0] }
  get y () { return this.positions[1] }
  get width () { return this.dimensions[0] }
  get height () { return this.dimensions[1] }
  get XScale () { return this._xScale }
  get YScale () { return this._yScale }
  get refXScale () { return this._refXScale }
  get refYScale () { return this._refYScale }
  get Scale () { return [this._xScale, this._yScale] }
  get refScale () { return [this._xRefScale, this._yRefScale] }

  rerender () { console.log('this rerender function need to be overwritten') }

  draw () { console.log('this draw function need to be overwritten') }

  remove () {
    // Clear all pubSub subscriptions
    this.subscribes.forEach(subscription => this.pubSub.unsubscribe(subscription))
    this.subscribes = []
  }
}

export { Block }
