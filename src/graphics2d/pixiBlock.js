/*
 * @Description: 
 * @Author: Hongpeng Ma
 * @Github: gitlab.com/hongpengm
 * @Date: 2019-03-29 02:24:30
 * @LastEditTime: 2019-03-29 02:26:57
 */

import { scaleLinear } from 'd3-scale'
import * as PIXI from 'pixi.js'
import { hColor } from '../utils/color'
import { Block } from './block'


class PIXIBlock extends Block {
  constructor (ctx, options) {
    super(ctx, options)
    
    const { scene } = ctx
    this.scene = scene
    this.options = Object.assign(this.options, options)


    this.positions = this.options.positions
      ? this.options.positions
      : (this.options.x && this.options.y
	 ? [this.opions.x, this.options.y]
	 : this.positions)
    this.dimensions = this.options.dimensions
      ? this.options.dimensions
      : (this.options.width && this.options.height
	 ? [this.options.width, this.options.height]
	 : this.dimensions)
    this.xScaleFactor = this.options.scale
      ? this.options.scale.x
      : 1
    this.yScaleFactor = this.options.scale
      ? this.options.scale.y
      : 1
      
    this.delayDraw = false

    this.pBase = new PIXI.Graphics()
    this.pMasked = new PIXI.Graphics()
    this.pMask = new PIXI.Graphics()
    this.pMain = new PIXI.Graphics()

    this.pBorder = new PIXI.Graphics()
    this.pLabel = new PIXI.Graphics()
    this.pBackground = new PIXI.Graphics()
    this.pForeground = new PIXI.Graphics()
    this.pMovable = new PIXI.Graphics()
    this.pAxis = new PIXI.Graphics()
    this.pMouseOver = new PIXI.Graphics()

    this.scene.addChild(this.pBase)
    this.pBase.addChild(this.pMasked)

    this.pMasked.addChild(this.pMask,
			  this.pMain,
			  this.pBorder,
			  this.pLabel,
			  this.pBackground,
			  this.pForeground,
			  this.pMovable,
			  this.pAxis,
			  this.pMouseOver)

    this.pMasked.mask = this.pMask

    this.renderText = this.options.textOptions
      ? this.options.textOptions.render
      : false
    
    this.init()
    
    console.log('Wow pixi block constructed!')
    return this
  }

  init () {
    this.initLabel()
    this.rerender(this.options)
  }

  initLabel () { }

  setTransforms () {
    this.pBase.position.x = this.x
    this.pBase.position.y = this.y
    this.pBase.scale.x = this.xScaleFactor
    this.pBase.scale.y = this.yScaleFactor
  }



  rerender (options) {
    if (options) {
      this.options = options
    }

    this.pBase.clear()
    
    this.setTransforms()
    this.drawBackground()
    this.drawLabel()
    this.draw()
    this.drawError()
    this.drawBorder()
//    console.log(this.pBase.toGlobal());
  }

  draw () {

  }

  drawBackground () {
    const g = this.pBackground
    g.clear()
    let opacity = 1;
	let color = this.options.backgroundColor
    
    if (!this.options || !this.options.backgroundColor) {
      return
    }
    if (this.options.bgTransparent) {
      opacity = 0,
      color = 'whitesmoke'      
    }
    g.beginFill(hColor.toHex(color))
    g.drawRect(
      0,
      0,
      this.width,
      this.height
    )
    g.endFill()

    this.pBackground.setParent(this.pBase)

  }


  drawLabel () {
    const g = this.pLabel
    g.clear()
    if (this.renderText) {
      this.lTextFont = this.options.textOptions.font || 'Arial'
      this.lTextSize = this.options.textOptions.size || 12

      // TODO set default content
      let lTextContent = (!this.options.textOptions.lPosition || !this.options.visible)
	  ? (this.options.textOptions.content || 'default')
	  : '' 

//      if (this.plText){ this.plText.clear();}
      this.plText = this.plText
        ? this.plText
        : new PIXI.Text(
	  lTextContent,
	  {
            fontSize: `${this.lTextSize}px`,
            fontFamily: this.lTextFont,
            fill: 'black'
	  }
        )

      this.plErrorText = this.plErrorText
        ? this.plErrorText
        : new PIXI.Text(
	  'Error',
	  {
	    fontSize: '12px',
	    fontFamily: 'Arial',
	    fill: 'red'
	  }
        )
      this.plText.setTransform(0, 0)
      this.plErrorText.setTransform(this.x, this.y)

      this.pLabel.addChild(this.plText)
      this.pLabel.setParent(this.pBase)
      console.log('hello',
		  this.plText,
		  this.plErrorText)
    }
    return this
  }

  drawError () {

  }

  drawBorder () {
    const g = this.pBorder
    g.clear()
    if (!this.options || !this.options.borderOptions) return
    const color = hColor.toHex(this.options.borderOptions.color
			       ? this.options.borderOptions.color
			       : 'white')
    g.lineStyle(this.options.borderOptions.width, color)
    g.drawRect(
      0,
      0,
      this.width,
      this.height
    )
    this.pBorder.setParent(this.pBase)
  }
}
export { PIXIBlock }
