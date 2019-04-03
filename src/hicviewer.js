'use strict'
// import * as THREE from 'three';
import 'babel-polyfill'
import * as PIXI from 'pixi.js'
import { PIXIBlock } from './graphics2d/pixiBlock'
// const {PIXIBlock, Block} = require('./graphics2d/block.js')

import { nameToHex,
  hColor } from './utils/color'

import { HeatmapGrid } from './graphics2d/heatmapGrid'

import { Heatmap2DTrack } from './graphics2d/heatmap2DTrack'
import { Horizontal1DTrack } from './graphics2d/horizontal1DTrack'
import { Graphics2DApplication } from './graphics2d/graphics2DApplication'
import { Graphics3DApplication } from './graphics3d/graphics3DApplication'
import { createDOM, shiftDOM } from './utils/DOM.js'
const axios = require('axios')
const d3 = require('d3')
const ndarray = require('ndarray')
const uidv4 = require('uuid/v4')

// numjs seems deprecated
// const numjs = require('numjs');
const arrops = require('ndarray-ops')
const randomColor = require('randomcolor')

const { initThree,
  threeAnimate } = require('./initThreeJS.js')
const { Vmanager } = require('./variableManager.js')

const { initD3 } = require('./initD3.js')

main()
// console.log(test_human_model)

async function main () {
  // Global Variable Manager
  let vm = new Vmanager()
  const testData = await axios.get('http://localhost:8080/Human/liberman_MDS.txt')
  vm.addVariable('test_model', testData.data)

  let a = document.createElement('div')
  a.id = 'hello'
  let b = document.createTextNode('Hello world')
  a.appendChild(b)

  document.body.append(a)

  /// ////////////////////////////////////////////////////////////////////////////
  //                                Main Entries                               //
  /// ////////////////////////////////////////////////////////////////////////////
  // initThree()
  // threeAnimate()

  // test_2d_headmap();
  // test2DHeatmapTrack();
  // testHorizontal1DTrack();
  let app2 = testGraphics2DApp()
  let app3 = await testGraphics3DApp()
  console.log(app3.genomeScene.respondEvents)
  app2.centerTrack.track.addSubs(app3.genomeScene, 'selectionEnds', app3.genomeScene.respondEvents)
  
  // initD3();
}

async function testGraphics3DApp () {
  let app = new Graphics3DApplication(document.body)
  app.addTestSphere(0, 0, 0)
  await app.addTestLine()
  await app.addTestGenome()
  const data = await app.getGenomeDataByURL('http://localhost:8080/Human/liberman_MDS.txt')
  
  console.log(data)
  function f () {
    requestAnimationFrame(f)
    app.render()
    app.controller.update()
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
        let n = 21
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
        let n = 21
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
  app.add1DTrack(
    'bottom',
    {
      drawFunction: (obj) => {
        let n = 21
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
  let track = new Horizontal1DTrack(div)
  track.draw((obj) => {
    let n = 21
    let dataset = d3.range(n).map(function (d) {
      return {
        x: d,
        y: d3.randomUniform(1)()
      }
    })

    console.log(dataset)
    obj.xScale = {
      domain: [0, n - 1],
      range: [0, obj.width]
    }
    obj.yScale = {
      domain: [0, 1],
      range: [0, obj.height]
    }
    obj.dataSet = dataset
  })
  track.addBrushBehaviour()
  // track.remove_behaviour();
  console.log(track)
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
