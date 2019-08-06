'use strict'

import * as nj from 'numjs'

import { Pipeline } from '../../../src/ts/types/pipelines'

describe('Test Pipeline Types', () => {
    test('PipelineTypes: Default Pipeline', () => {
        let a = [1, 2, 3]
        let pipeline = new Pipeline(a)
        pipeline.step(data => {
            return data.map((i: any) => { return i + 1 })
        }).step(data => {
            return data.map((i: any) => { return i + 3 })
        })
        expect(pipeline.execute()).toStrictEqual([5, 6, 7])

    })
})

