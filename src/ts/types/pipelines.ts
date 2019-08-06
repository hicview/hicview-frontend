'use strict'

// Pipelines //////////////////////////////////////////////////////////////////

/*
  Step Function for Pipelines, accept a required field `func` and an optional field `parameters`
  execute(): execute func on specific data and return the result
  
*/
export class StepFunction {
    func: (data: any, parameters?: object) => any
    parameters?: object
    constructor(func: (data: any, parameters?: object) => any, parameters?: object) {
        this.func = func
        if (parameters) {
            this.parameters = parameters
        }
    }
    execute(data: any) {
        if (this.parameters) {
            return this.func(data, this.parameters)
        } else {
            return this.func(data)
        }
    }
}
/*
  Pipelines definition
  --------------------
  Construct: let a = Pipelines(inData)
  Add a step: a.step((i) => {return i+1})
  Get output: let output = a.execute()


*/
export interface PipelineInterface {
    // Input data, or function that retrieve from entry data
    inData: any,
    isFromEntry?: boolean,
    // Calculating
    data: any,
    /* Steps is an array of processing functions and its parameters, it should be 
       [{
           func: (data, parameters) => any,
           parameters: {}
       },
       ...
       ]
     */
    steps: StepFunction[],
    step: (func: (data: any, parameters?: object) => any, parameters?: object) => this,
    execute: () => any,
}



/*
  Pipeline class
  --------------------
  inData: the data flow in the pipelines
  if the data is from data entry, first retrieve the true data from the entry.
  data: the result at each step
  step(): add a new processing step
  execute(): execute and output the final result

*/
export class Pipeline implements PipelineInterface {
    inData: any
    isFromEntry?: boolean
    data: any
    steps: StepFunction[]

    constructor(inData: any, isFromEntry?: boolean) {
        this.inData = inData
        this.isFromEntry = isFromEntry
        if (isFromEntry) {
            this.data = inData.get()
        } else {
            this.data = inData
        }
        this.steps = new Array<StepFunction>()
    }
    step(func: (data: any, parameters?: object) => any, parameters?: object) {
        if (parameters) {
            this.steps.push(new StepFunction(func, parameters))
        } else {
            this.steps.push(new StepFunction(func))
        }
        return this
    }
    execute() {
        this.steps.forEach(d => {
            let _result = d.execute(this.data)
            this.data = _result
        })
        this.steps = []
        return this.data
    }
    getData() {
        return this.data
    }
}
