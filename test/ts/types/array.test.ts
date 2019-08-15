'use strict'

import * as nj from 'numjs'
import { HiCArray } from '../../../src/ts/types/array'


describe('Test Array Types', () => {
    test('ArrayTypes:Array1D', () => {
        let a = new HiCArray(
            nj.array([1, 2, 3]),
            1,
            false
        )
        expect(a.data).toStrictEqual(nj.array([1, 2, 3]))
    })

    test('ArrayTypes:Array1D with dimension', () => {
        let a = new HiCArray(
            nj.array([[1, 2, 3],
            [2, 3, 4]]),
            1,
            false,
            [0, 1]
        )
        expect(a.getDataAtTime(0)).toStrictEqual(nj.array([1, 2, 3]))
    })
})
