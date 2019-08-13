'use strict'

import * as nj from 'numjs'
import { HiCArray } from './ts/types/array'
import { GridSystem } from './js/hicEngine/grid'
import getMockHumanHiC from './js/mock/mockHumanHiC'


main()

async function main() {
    let a: HiCArray = new HiCArray(
        nj.array([1, 2, 3]),
        1,
        false
    )
    let b = GridSystem.instance
    let mockHiC = new HiCArray((await getMockHumanHiC()).data,
        2,
        false)

    console.log(mockHiC)
    console.log(a)
    console.log(b)
}
