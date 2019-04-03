/*
 * @Description: 
 * @Author: Hongpeng Ma
 * @Github: gitlab.com/hongpengm
 * @Date: 2019-03-29 02:24:30
 * @LastEditTime: 2019-03-29 02:26:36
 */

import { scaleLinear } from 'd3-scale'
import * as PIXI from 'pixi.js'
import { PIXIBlock } from './pixiBlock'
import { hColor } from '../utils/color'


class HeatmapGrid extends PIXIBlock {
  constructor (ctx, options) {
    super(ctx, options)
    
    this.options = Object.assign(this.options, options)
    this.graphicsArray = []
    this.heatmap = new PIXI.Graphics()
    this.sparse = this.options.sparse
      ? this.options.sparse
      : false
    this.data = this.options.data
      ? this.options.data
      : false
    this.color = scaleLinear()
      .domain([0, 1])
      .range(['brown', 'steelblue'])
    this.initGraphics()
  }
  init () {
    console.log(this.data)
    this.rerender()
  }
  initGraphics () {
    if (!this.sparse) {
      for (let i = 0; i < ((x) => { return x[0] * x[1]})(this.data.shape); i++) {
        this.graphicsArray.push(new PIXI.Graphics())
      }
    }
  }
  draw () {
    if (!this.sparse) {
      const _w = this.width / this.data.shape[0]
      const _h = this.height / this.data.shape[1]
      const w = _w > 0 ? _w : 1
      const h = _h > 0 ? _h : 1
      const hm = this.heatmap
      hm.clear()
      //      for(let i = 0; i < ((x)=>{return x[0]*x[1];})(this.data.shape);i ++)
      for (let i = 0; i < 40000; i++) {
        let _y = Math.floor(i / this.data.shape[0])
	let _x = Math.floor(i - _y * this.data.shape[0])
	let color = hColor.toHex(this.color(this.data.get(_x, _y)))
	// console.log(_x, _y);
	hm.beginFill(color)	
	hm.drawRect(
	  _x * w,
	  _y * h,
	  w,
	  h
        )
	hm.endFill()
	// console.log(i, _x, _y, w, h, color);
      }
      //      hm.clear();
      hm.setParent(this.pBase)
//      this.graphicsArray.forEach((g, idx)=>{
//	g.clear();
//	let _y = Math.floor(idx / this.data.shape[0]);
//	let _x = Math.floor(idx - _y * this.data.shape[0]);
//	let color = hColor.toHex(this.color(this.data.get(_x, _y)));
//	g.beginFill(color);
//	g.drawRect(
//	  _x * w,
//	  _y * h,
//	  w,
//	  h
//	);
//	g.endFill();
//	g.setParent(this.pBase);
//      });
      console.log(w, h)
      console.log(hColor.toHex(this.color(this.data.get(0, 0))))
    }
  }
}

export { HeatmapGrid }
