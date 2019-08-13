'use strict'

import * as nj from 'numjs'

import {
    Pipeline,
    ContextPipeline
} from '../../../src/ts/types/pipelines'

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
    test('PipelineTypes: Default Pipeline With Parameters', () => {
        let a = [1, 2, 3]
        let pipeline = new Pipeline(a)
        pipeline.step((data, p) => {
            return data.map((i: any) => { return i + 1 + p })
        },
            1)
        expect(pipeline.execute()).toStrictEqual([3, 4, 5])

    })
})

describe('Test Context Pipeline', () => {
    test('ContextPipeline: Context Passing', () => {
        let a = [1, 3, 4]
        let pipe = new ContextPipeline(a, { additional: 1 })
        // !!! For Context Pipeline as ctx will be bounded to `this`, so you shouldn't use arrow function as it will automatically determine `this` and `this` could not be modified.
        pipe.step(function (data, p) {
            // Bypassing Typescript's type check, convert type `this` to type `object`
            let _this = Object.assign(this)
            return data.map((i: any) => { return i + p + _this['ctx'].additional })
        },
            1)
        expect(pipe.execute()).toStrictEqual([3, 5, 6])

    })
})
