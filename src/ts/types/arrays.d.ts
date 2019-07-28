'use strict'



// Default Data Types /////////////////////////////////////////////////////////

// Arrays /////////////////////////////////////////////////////////////////////

export interface TimeInfo {

}
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
export interface Array1D {
    data: Array<number> | Array<Array<number>>,
    timeSeries: boolean,
    timeInfo?: TimeInfo
}


export interface Array2D {
    data: Array<Array<number>> | Array<Array<Array<number>>>,
    timeSeries: boolean,
    timeInfo?: TimeInfo
}

export interface Array3D {
    data: Array<Array<Array<number>>> | Array<Array<Array<Array<number>>>>,
    timeSeries: boolean,
    timeInfo?: TimeInfo
}


