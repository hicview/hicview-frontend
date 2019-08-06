'use strict'

/// <reference path="ts/types/arrays"/>
import { Array1D } from 'hic-array.js'
import { GridSystem } from './js/hicEngine/grid'

main()

async function main() {
    let a: Array1D = {
        data: [1, 2, 3],
        timeSeries: false
    }
    let b = GridSystem.instance
    console.log(a)
    console.log(b)
}
