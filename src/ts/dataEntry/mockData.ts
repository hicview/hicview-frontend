import * as nj from 'numjs'
import { DataEntry } from './dataEntry'
import { Pipeline } from '../pipelines/pipelines'

export async function mockHiCData() {
    let hicEntry = new DataEntry('url:text', true, 'http://localhost:8080/Human/liberman_MDS.txt')
    return await (new Pipeline(hicEntry, true))
        .step((inData: { [index: string]: any }) => inData.data)
        .step((data: string) => linesDataToArray(data))
        .step((data: string[]) => parseHiCData(data))
        .execute()
}


function linesDataToArray(content: string) {
    return content.split(/\r?\n/)
}
function parseHiCData(hicData: string[], options?: { [index: string]: any }) {
    let columns, data, index;
    let _options = Object.assign({ firstLineColumns: true }, options)
    if (_options.firstLineColumns !== false) {
        columns = hicData.slice(0, 1)
        columns = columns[0].split('\t')
        data = hicData.slice(1, -1)
    } else {
        data = hicData
    }// End first line columns extraction

    // data = data.filter(d=>{if(d !== undefined){return true} else {return false}})

    data = nj.array(data.map(line => {
        return line.split('\t').map(d => { return parseFloat(d) })
    }))
    return {
        columns: columns,
        data: data,
        index: index
    }
}
