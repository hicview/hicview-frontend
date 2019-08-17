import { DataEntry } from '../../src/ts/dataEntry/dataEntry'

const sh = require("shelljs");
const fs = require('fs')
const http = require('http');

console.log('Path', sh.pwd())
const data = fs.readFileSync('Human/liberman_MDS.txt', 'utf8')

let mockRequest = jest.fn(function (url: string) {
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            url === './human'
                ? resolve(data)
                : reject({
                    error: 'Path found nothing'
                })

        })

    })
})

mockRequest('./human').then(d => {
    console.log(d)
})

describe('Test fetch local server data', () => {
    test('DataEntry:Fetch local data', async () => {
        let de = new DataEntry('url:text', true, 'http://localhost:8080/Human/liberman_MDS.txt')
        expect((await de.result()).data.split('\n').length).toBe(58783)
    })
})
