'use strict'

import { GridSystem } from './hicEngine/grid'
import {Stage,
	Stage1D,
	Stage2D,
	Stage3D} from './hicEngine/stage'




main()

function main(){
  let g1 = GridSystem.instance
  let g2 = GridSystem.instance
  console.log(g1)
  console.log(g1 === g2)
  let dom1 = g1.createDom('id', {top:10}, { bottom:10}, {tag:'hello'})
  console.log(g1)
  g1.shiftDom(dom1, {top:0})
  document.body.appendChild(dom1)


  let s1 = new Stage()
  console.log(Stage.instances);
}
