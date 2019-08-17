'use strict'
import axios from 'axios'
import * as nj from 'numjs'

export type DataEntrySourceType = 'url:text' | 'url:json'
export type DataEntryLocatorType = string
export interface DataEntryI {
    srcType: DataEntrySourceType,
    isAsync: boolean,
    locator: DataEntryLocatorType,
    fetchMethod: (...args: any[]) => any,
    fetch: (options: {
        [index: string]: boolean | ((...args: any[]) => void)
    }) => any
}

export class DataEntry implements DataEntryI {
    srcType: DataEntrySourceType
    isAsync: boolean
    locator: DataEntryLocatorType
    constructor(srcType: DataEntrySourceType, isAsync: boolean, locator: string) {
        this.srcType = srcType
        this.isAsync = isAsync
        this.locator = locator
    }
    get fetchMethod() {
        if (this.srcType === 'url:text') {
            let config = {}
            return function (url: string) {
                return axios.get(url, config)
            }
        }

        if (this.srcType === 'url:json') {
            let config = {}
            return function (url: string) {
                return axios.get(url, config)
            }
        }

    }
    async fetch(args: {
        [index: string]: boolean | ((...args: any[]) => void)
    }) {
        let options = Object.assign({ useAsync: this.isAsync }, args)
        if (options.useAsync) {
            return await this.fetchMethod(this.locator)
        } else {
            return this.fetchMethod(this.locator)
        }

    }

    result = async function () {
        return await this.fetch({})
    }
}
