import {
    TypeTransformation,
    EventSystem,
    EventI,
    EventDataType
} from '../../src/ts/event/event'


describe('Test EventSystem Instance', () => {
    test('EventSystem:Singelton', () => {
        let es = EventSystem.instance
        let es2 = EventSystem.instance
        // Singleton class's instance should be strictly equal
        expect(es).toStrictEqual(es2)
    })
})

let events: EventI<EventDataType>[]
let es: EventSystem
let counter: { [index: string]: any }

describe('Test EventSystem filter', () => {
    beforeEach(() => {
        events = []
        es = EventSystem.instance
        es.reset()
        counter = {}

        let data = ['data', 1, { a: 'a' }]
        let name = ['e1', 'e2', 'e3']
        let tags = [['t1'], ['t1', 't2'], ['t2', 't3']]
        let callback = (ctx: any) => {
            const { e } = ctx
            if (!counter.hasOwnProperty(e.name)) {
                counter[e.name] = 1
            } else {
                counter[e.name] += 1
            }
        }
        // prepare test events
        for (let i = 0; i < data.length; i++) {
            let event: EventI<EventDataType> = {
                data: data[i],
                name: name[i],
                callback: callback,
                tags: tags[i]
            }
            events.push(event)
        }
        // register events to eventsystem
        events.forEach(e => {
            es.register(e, null)
        })

    })


    test('EventSystem:FilterByName', () => {
        es.dispatch('e1', null, [], { isName: true })
        expect(counter).toStrictEqual(
            {
                e1: 1
            }
        )
    })

    test('EventSystem:FilterByTag', () => {
        es.dispatch('t2', null, [], { isTag: true })
        expect(counter).toStrictEqual(
            {
                e2: 1,
                e3: 1
            }
        )
    })

    test('EventSystem:FilterByInstance', () => {
        es.dispatch(events[0], null, [])
        expect(counter).toStrictEqual(
            {
                e1: 1,
            }
        )
    })

    test('EventSystem:UnregisterByInstance', () => {
        es._unregister(events[0], null)
        expect(es.events.map(e => e.name)).toStrictEqual(
            ['e2', 'e3']
        )
    })

})
