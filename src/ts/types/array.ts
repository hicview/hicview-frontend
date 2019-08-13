import { NdArray } from 'numjs'
import * as nj from 'numjs'

// Default Data Types /////////////////////////////////////////////////////////

// Arrays /////////////////////////////////////////////////////////////////////
export type ArrayDimension = 1 | 2 | 3;

/*
  TimeInfo is the timestamp of time series array
  eg: ['Stage 1', 'Stage 2']
      [1, 2, 3]
      or ['Jul-2019',... ]
*/
export type TimeInfo = Array<string | number | Date>
/*
  Array may goes with a timestamp
  --------------------
  If the array is a timeSeries object, eg timed Array1D
  its content should be 
  {
  //     t1         t2
  data: [[number], [number], ...],
  timeSeries: true,
  // the array in timeInfo matches those arrays in `data` property
  timeInfo: {
  data: [{time: , tags: ,comment:, }]
  }
  }
*/
// Interface for Engine default data types
export interface HiCArrayInterface {
    data: NdArray<any>,
    dimension: ArrayDimension,
    timeSeries: boolean,
    timeInfo?: TimeInfo,
    getDataAtTime: (time: string | number | Date) => any
}


/*
  Implemention of HiC Array

*/
export class HiCArray implements HiCArrayInterface {
    data: NdArray<any>
    dimension: ArrayDimension
    timeSeries: boolean
    timeInfo?: TimeInfo
    constructor(array: NdArray<any>, dimension: ArrayDimension, timeSeries: boolean, timeInfo?: TimeInfo) {
        if (typeof array == typeof []) {
            this.data = nj.array(array)
        } else {
            this.data = array
        }

        this.dimension = dimension
        this.timeSeries = timeSeries
        this.timeInfo = timeInfo
    }

    getDataAtTime(time: string | number | Date) {
        if (!this.timeInfo) {
            throw 'No Time Info for this HiCArray'
        }
        let idx = this.timeInfo.indexOf(time)
        // equal to numpy this.data[idx, :]
        return nj.array((this.data.pick(idx, null) as NdArray<any>).tolist())
    }

}

