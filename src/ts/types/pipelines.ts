
// Pipelines //////////////////////////////////////////////////////////////////

/*
  Step Function for Pipelines, accept a required field `func` and an optional field `parameters`
  execute(): execute func on specific data and return the result
  
*/
export class StepFunction {
    func: (data: any, ...parameters: any[]) => any
    parameters: any[]
    // Here the parameters is passed from Pipeline, which is the rest parameters of Pipeline.step function
    constructor(func: (data: any, parameters?: any[]) => any,
        parameters?: any[]) {
        this.func = func
        if (parameters) {
            this.parameters = parameters
        }
    }
    _execute = (data: any, ctx?: object): any => {
        // Bind ctx to this.func's `this`
        let _ctx = ctx ? ctx : null
        let _newThis = Object.assign(this)
        _newThis.ctx = _ctx
        let res
        if (this.parameters) {
            res = this.func.call(ctx !== null ? _newThis : this, data, ...this.parameters)
        } else {
            res = this.func.call(ctx !== null ? _newThis : this, data)
        }
        return res
    }
    execute(data: any) {
        return this._execute(data)
    }

    executeWithCtx(data: any, ctx: object) {

        return this._execute(data, ctx)
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
    step(func: (data: any, parameters: any[]) => any,
        ...parameters: any[]) {
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


export class ContextPipeline extends Pipeline {
    // If context could be modified, it should move to inData's properties, `ctx` should remain the same during the procession of pipeline
    readonly ctx: object
    constructor(inData: any, ctx: object, isFromEntry?: boolean) {
        if (isFromEntry) {
            super(inData, isFromEntry)
        } else {
            super(inData)
        }
        this.ctx = ctx
    }
    step(func: (data: any, ...parameters: any[]) => any, ...parameters: any[]) {
        if (parameters) {
            this.steps.push(new StepFunction(func, parameters))
        } else {
            this.steps.push(new StepFunction(func))
        }
        return this
    }
    execute() {
        this.steps.forEach(d => {
            let _result = d.executeWithCtx(this.data, this.ctx)
            this.data = _result
        })
        this.steps = []
        return this.data
    }
    getData() {
        return this.data
    }
}


