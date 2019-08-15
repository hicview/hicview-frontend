'use strict'

export type EventDataType = any
export type EventInternalType = string | EventI<EventDataType> | EventDataType
export type TypeTransformation = {
    x: number,
    y: number,
    zoom: number,
    rotation: number
}

export interface EventI<T> {
    data: T
    callback: (...args: any[]) => void
    name: string,
    src?: any
    dest?: any
    tags?: string[]
}

/*
  Event System is a global events manager
  --------------------

  Event flows scheme
  ==========
  Src: event source object
  ES: Event System
  Dest: event destination object
  
  |------|  --register--->   |------|                 |------|
  |-Src -|  --trigger---->   |- ES -|  --dispatch-->  |-Dest-|
  |------|  --unregister->   |------|                 |------|


*/
export class EventSystem {
    private static eventSys: EventSystem;
    private _events: EventI<EventDataType>[]

    private constructor() {
        this.reset()
    }

    static get instance() {
        if (!EventSystem.eventSys) {
            EventSystem.eventSys = new EventSystem()
        }
        return EventSystem.eventSys
    }

    get events() {
        return EventSystem.eventSys._events
    }

    reset() {
        this._events = []
    }
    filterEventsByName(name: string) {
        return this.filterEventsByFunction((e: EventI<EventDataType>) => { return e.name === name })
    }
    filterEventsByTag(tag: string) {
        return this.filterEventsByFunction((e: EventI<EventDataType>) => { return e.tags.includes(tag) })
    }
    filterEventsByEvent(findEvent: EventI<EventDataType>) {
        return this.filterEventsByFunction((e: EventI<EventDataType>) => { return e === findEvent })
    }
    filterEventsByEventDataType(dataType: any) {
        return this.filterEventsByFunction((e: EventI<EventDataType>) => { return typeof e.data === typeof dataType })
    }
    filterEventsByFunction(func: (e: EventI<EventDataType>) => boolean) {
        return this._events.filter(e => func(e))
    }



    _operationOnFilteredEvents(e: EventInternalType, src: any, args: any[], opt: (d: any) => void, options?: { [index: string]: boolean }) {

        const { isTag, isName, isEventDataType } = Object.assign({
            isTag: false,
            isName: false,
            isEventDataType: false
        }, options)
        // Check the options are legal
        let checkSum = [isTag, isName, isEventDataType].map((b: boolean) => { if (b) { return 1 } else { return 0 } })
            .reduce((a, b) => { return a + b }, 0)
        if (checkSum > 1) {
            throw 'Only one filter method could be selected'
        }
        // Select events to operate on
        let eventsToOperate;
        eventsToOperate = this.filterEventsByFunction(
            (_e: EventI<EventDataType>) => {
                return _e === e
            }
        )
        if (isTag) {
            eventsToOperate = this.filterEventsByTag(e)
        }
        if (isName) {
            eventsToOperate = this.filterEventsByName(e)
        }
        if (isEventDataType) {
            eventsToOperate = this.filterEventsByEventDataType(e)
        }

        eventsToOperate.forEach(e => {
            opt(e)
        })
    }


    _dispatch(e: EventInternalType, src: any, args: any[], options?: { [index: string]: boolean }) {
        let dispatchOpt = function (e: EventI<EventDataType>) {
            let ctx = [{ src: src, args: args, e: e }]
            if (e.dest) {
                e.callback.apply(e.dest, ctx)
            } else {
                e.callback.apply(null, ctx)
            }
        }
        this._operationOnFilteredEvents(e, src, args, dispatchOpt, options)
    }


    _unregister(e: EventInternalType, src: any, options?: { [index: string]: boolean }) {
        let removeOpt = function (e: EventI<EventDataType>) {
            let events = EventSystem.instance._events
            let index: number = events.indexOf(e)
            if (index > -1) {
                events.splice(index, 1)
            }
        }
        this._operationOnFilteredEvents(e, src, [], removeOpt, options)
    }




    // Public functions/////////////////////////////////////////////////////////////
    public register(e: EventI<EventDataType>, src?: any) {
        let _registerSrc = Object.assign(e, { src: src })
        this._events.push(_registerSrc)
    }
    public unregister(e: EventInternalType, options?: { [index: string]: boolean }) {
        this._unregister(e, null, options)
    }
    public trigger(e: EventInternalType, src: any, args?: any[], options?: { [index: string]: boolean }) {
        this._dispatch(e, src, args, options)
    }

    public dispatch(e: EventInternalType, src: any, args: any[], options?: { [index: string]: boolean }) {
        this._dispatch(e, src, args, options)
    }

    public toString() {
        let eventsStr: string = ''
        this._events.forEach(e => {
            eventsStr += 'Event:--------------------\n'
            eventsStr += 'Name: ' + e.name + '\n'
            eventsStr += 'Tags: ' + e.tags.toString() + '\n'
            eventsStr += 'Src: ' + String(e.src) + '\n'
            eventsStr += 'Dest: ' + String(e.dest) + '\n'
        })
        return eventsStr
    }
}
