'use strict'

import * as nj from 'numjs'
import * as React from 'react'
import * as ReactDom from 'react-dom'
import { HiCArray } from './ts/types/array'
import { GridSystem } from './js/hicEngine/grid'
import getMockHumanHiC from './js/mock/mockHumanHiC'
import App from './ts/UI/app'

main()

async function main() {
    let a: HiCArray = new HiCArray(
        nj.array([1, 2, 3]),
        1,
        false
    )
    let b = GridSystem.instance
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
    let mockHiC = new HiCArray((await getMockHumanHiC()).data,
        2,
        false)


    console.log(mockHiC)
    console.log(a)
    console.log(b)
}
