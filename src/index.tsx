'use strict'

import * as React from 'react'
import * as ReactDom from 'react-dom'
import * as THREE from 'three'
import * as nj from 'numjs'
import { mockHiCData } from './ts/dataEntry/mockData'
import Stage3D from './ts/stage/stage3D'
import Chromosome from './ts/components/chromosomeComponent'
import App from './ts/UI/app'

main()

async function main() {

    // create Root Element
    const rootElement = document.getElementById('root')
        ? document.getElementById('root')
        : function () {
            let root: Element = document.createElement('div')
            root.id = 'root'
            document.body.appendChild(root)
            return root
        }()

    ReactDom.render(<App />, rootElement)
    let hicData = await mockHiCData()
    console.log(hicData)


    let s3d = new Stage3D()
    // data[data[:,0]===1] select chr1
    let chr1Data = hicData.data.tolist().filter((d: Array<number>) => d[0] === 1)

    console.log(chr1Data)
    let color = new THREE.Color()
    color.setHSL(.5, .8, .7)
    let chr1 = new Chromosome(nj.array(chr1Data).slice(null, 2), color)

    console.log(chr1)
    s3d.addComponents(chr1)
}
