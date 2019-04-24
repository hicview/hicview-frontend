'use strict'
// import * as THREE from 'three';
import 'babel-polyfill'
import * as PIXI from 'pixi.js'
import { PIXIBlock } from './graphics2d/pixiBlock'
// const {PIXIBlock, Block} = require('./graphics2d/block.js')
import React from 'react'
import ReactDOM from 'react-dom'

import { nameToHex,
	 hColor } from './utils/color'

import { HeatmapGrid } from './graphics2d/heatmapGrid'

import { Heatmap2DTrack } from './graphics2d/heatmap2DTrack'
import { Horizontal1DTrack } from './graphics2d/horizontal1DTrack'
import { Graphics2DApplication } from './graphics2d/graphics2DApplication'
import { Graphics3DApplication } from './graphics3d/graphics3DApplication'
import { createDOM, shiftDOM } from './utils/DOM.js'
import  TestApp  from './react/reactG2d'

const axios = require('axios')
const d3 = require('d3')
const ndarray = require('ndarray')
const uidv4 = require('uuid/v4')

// numjs seems deprecated
// const numjs = require('numjs');
const arrops = require('ndarray-ops')
const randomColor = require('randomcolor')



main()


async function main () {
  /// ////////////////////////////////////////////////////////////////////////////
  //                                Main Entries                               //
  /// ////////////////////////////////////////////////////////////////////////////


  // test_2d_headmap();
  // test2DHeatmapTrack();
  // testHorizontal1DTrack();
  
  //  const rootDiv = document.createElement('div')
  //  rootDiv.id = 'root'
  //  document.body.appendChild(rootDiv)
  //   console.log(document.getElementById("root"))
  //   ReactDOM.render(
  //     <TestApp />
  //     , rootDiv
  //   )
  let app2 = testGraphics2DApp()
  let app3 = await testGraphics3DApp()
  console.log(app3.genomeScene.respondEvents)
  app2.centerTrack.track.addSubs(app3.genomeScene, 'selectionEnds', app3.genomeScene.respondEvents)
  
}

async function testGraphics3DApp () {
  let app = new Graphics3DApplication(document.body)
  app.addTestSphere(0, 0, 0)
  //app.addTestGeneticElement()
//  await app.addTestLine()
  await app.addTestGenome()

  function f (time) {
   
    requestAnimationFrame(f)
    app.render(time)
    
  }
  f()
  return app
}

function testGraphics2DApp () {
  let div = document.createElement('div')
  div.id = uidv4()
  d3.select(div)
    .style('position', 'absolute')
    .style('top', '100px')
  div.width = 1000
  div.height = 1000
  document.body.appendChild(div)
  let app = new Graphics2DApplication(div)
  app.add1DTrack(
    'top',
    {
      drawFunction: (obj) => {
        let n = 210
        let dataset = d3.range(n).map(function (d) {
          return {
            x: d,
            y: d3.randomUniform(1)()
          }
        })

        obj.xScale = {
          domain: [0, n - 1],
          range: [0, obj.width]
        }
        obj.yScale = {
          domain: [0, 1],
          range: [0, obj.height]
        }
        obj.dataSet = dataset
      },
      behaviour: 'brush'
    })
  app.add1DTrack(
    'top',
    {
      drawFunction: (obj) => {
        let n = 210
        let dataset = d3.range(n).map(function (d) {
          return {
            x: d,
            y: d3.randomUniform(1)()
          }
        })

        obj.xScale = {
          domain: [0, n - 1],
          range: [0, obj.width]
        }
        obj.yScale = {
          domain: [0, 1],
          range: [0, obj.height]
        }
        obj.dataSet = dataset
      },
      behaviour: 'zoom',
      path_type: 'areaPath'
    })
  app.add1DTrack(
    'bottom',
    {
      drawFunction: (obj) => {
        let n = 210
        let dataset = d3.range(n).map(function (d) {
          return {
            x: d,
            y: d3.randomUniform(1)()
          }
        })

        obj.xScale = {
          domain: [0, n - 1],
          range: [0, obj.width]
        }
        obj.yScale = {
          domain: [0, 1],
          range: [0, obj.height]
        }
        obj.dataSet = dataset
      },
      behaviour: 'zoom'
    })
  app.add2DTrack({
    loadURL: 'http://localhost:8080/asset/test.png',
    behaviour: 'brush'
  })
  app.syncTrackAlignment()
  app.syncTrackTransformBehaviour()
  app.syncTrackBrushBehaviour()
  return app
}
function testHorizontal1DTrack () {
  let div = document.createElement('div')
  div.id = uidv4()
  div.width = 1000
  div.height = 1000
  document.body.appendChild(div)
  let track = new Horizontal1DTrack(div,{options:{
    path_type:'areaPath'
  }})
  let url =  "http://127.0.0.1:5000/test"
  const options = {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    data: {   
      "URL":"/Users/k/Repos/server_1d/test.bed",
      "range":[0.5,0.51]
    },
    url
  }
  axios(options)
    .then(function (response) {
      // handle success
      const data = response.data.data
      console.log(data);
       let dataset = response.data.data.data.map(xy=>{
	 return {
	   x:xy[0],
	   y:d3.randomUniform(1)()*1000
	 }
       })
      console.log(dataset)
      track.draw((obj) => {
	console.log(dataset)
	let n = dataset.length
	console.log(dataset)
	obj.xScale = {
	  domain: data.xRange,
	  range: [0, obj.width]
	}
	obj.yScale = {
	  domain: data.yRange,
	  range: [0, obj.height]
	}
	obj.dataSet = dataset
      })
      track.addZoomBehaviour()
      // track.remove_behaviour();
      console.log(track)
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    })
    .then(function () {
      // always executed
    });
  
  
}

function test2DHeatmapTrack () {
  let div = createDOM('div', uidv4(), 1000, 1000)
  document.body.appendChild(div)
  let track = new Heatmap2DTrack(div)
  track.loadImgURL('http://localhost:8080/asset/test.png')
  track.addBrushBehaviour()
  d3.brush().move(track.brush_g, [[0,0], [100,100]])
}

function test_2d_headmap () {
  // Random 100 x 100 contact matrix
  let test_arr = new ndarray(new Float32Array(200 * 200), [200, 200])
  arrops.random(test_arr)
  console.log(test_arr)
  // pixi graphics
  let app = new PIXI.Application(1000, 1000, { backgroundColor: 0xffffff })
  document.body.appendChild(app.view)
  // draw a rectangle & nested it into a bigger one
  app.view.id = 'pixiCanvas'
  console.log(app.view)
  console.log(PIXI.Sprite)
  let dot = PIXI.Sprite.from('http://localhost:8080/asset/test.png')
  dot.x = 0
  dot.y = 0
  dot.interactive = true
  dot.buttonMode = true
  let zoom_handler = d3.zoom().scaleExtent([1, 8]).on('zoom', zoom_actions)
  let brush_handler = d3.brush().extent([[0, 0], [1000, 1000]]).on('brush start', brushed)
  let pixiCanvas = d3.select('#pixiCanvas')
  //  let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  let svg = d3.select('body').append('svg')
      .attr('width', 1000)
      .attr('height', 1000)

  let svg_d = d3.select('svg')
  //  pixiCanvas.append(svg);
  svg_d.append('g')
    .attr('class', 'brush')
    .call(brush_handler)
    .call(brush_handler.move, [[100, 100], [200, 200]])

  console.log('Canvas', pixiCanvas)
  pixiCanvas.call(zoom_handler)
  //  pixiCanvas.call(brush_handler)
  //  dot
  //    .on('pointerdown', onDragStart)
  //    .on('pointerup', onDragEnd)
  //    .on('pointerupoutside', onDragEnd)
  //    .on('pointermove', onDragMove);
  app.stage.addChild(dot)
  //  let test_hm = new HeatmapGrid({
  //    scene: app.stage
  //  },{
  //    positions: [200, 90],
  //    dimensions: [500,500],
  //    backgroundColor: 'blue',
  //    data: test_arr,
  //
  //    textOptions : {
  //      render: true,
  //    },
  //    borderOptions: {
  //      width: 2,
  //      color: 'black'
  //    }
  //  });

  //  test_hm.rerender();

  console.log(app.stage)
}
