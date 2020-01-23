'use strict'


import * as uuidv4 from 'uuid/v4'
import * as _ from 'lodash'

import { EventSystem } from '../event/event'
import { deepCopy } from '../utils/functions'

export type componentStateName = 'NONE' | 'INIT' | 'READY' | 'UPDATE' | 'DISPOSE'
export type componentState = 0 | 1 | 2 | 3 | 4;

export default class ComponentBase {
    static instances: ComponentBase[]
    public id: string
    public STATE: { [index: string]: componentState }
    public stateTable: { [index: number]: any }
    protected _data: any
    protected _prevData: any
    private _state: componentState
    private _esManager: EventSystem

    constructor() {
        this.id = uuidv4()
        this.STATE = {
            NONE: 0,
            INIT: 1,
            READY: 2,
            UPDATE: 3,
            DISPOSE: 4
        }
        this._state = 0
        this.stateTable = {
            0: { INIT: 1 },
            1: { READY: 2 },
            2: { UPDATE: 3, DISPOSE: 4 },
            3: { READY: 2 },
            4: { NONE: 0 }
        }
        this._esManager = EventSystem.instance

        this.cycle('INIT')
        if (!ComponentBase.instances) {
            ComponentBase.instances = []
        }
        ComponentBase.instances.push(this)
        this.cycle('READY')
    }
    init() { this.cycle('INIT') }
    protected _init() { }
    update() {
        this.cycle('UPDATE')
        this._update()
        this.cycle('READY')
    }
    protected _update() {

    }
    dispose() {
        this.cycle('DISPOSE')
        this._dispose()
    }
    protected _dispose() {
        _.remove(ComponentBase.instances, c => c === this)
    }
    cycle(msg: componentStateName) {
        const currentState = this._state
        this._state = this.stateTable[currentState][msg]
    }
    render?() { }

    get stateName() {
        //        return this._state
        return _.invert(this.STATE)[this._state]
    }
    public setData(d: any) {
        this.cycle('UPDATE')
        this._prevData = deepCopy(this._data)
        this._data = d
        this.cycle('READY')
    }
    public get data() {
        if (this._state === 3) { // in ready state
            return this._prevData
        } else {
            return this._data
        }
    }
}
