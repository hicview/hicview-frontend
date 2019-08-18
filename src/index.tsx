'use strict'

import * as React from 'react'
import * as ReactDom from 'react-dom'

import { mockHiCData } from './ts/dataEntry/mockData'
import Stage3D from './ts/stage/stage3D'
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

}
