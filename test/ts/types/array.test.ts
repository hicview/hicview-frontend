'use strict'

import {
    Array1D,
    Array2D,
    Array3D
} from '../../../src/ts/types/arrays'


describe('Test Array Types', () => {
    test('ArrayTypes:Array1D', () => {
        let a: Array1D = {
            data: [1, 2, 3],
            timeSeries: false
        }
        expect(a.data).toStrictEqual([1, 2, 3])
    })
    test('ArrayTypes:Array2D', () => {
        let a: Array2D = {
            data: [[1, 2, 3]],
            timeSeries: false
        }
        expect(a.data).toStrictEqual([[1, 2, 3]])
    })
    test('ArrayTypes:Array3D', () => {
        let a: Array3D = {
            data: [[[1, 2, 3]]],
            timeSeries: false
        }
        expect(a.data).toStrictEqual([[[1, 2, 3]]])
    })
})
