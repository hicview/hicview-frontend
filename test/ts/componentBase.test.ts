import ComponentBase from '../../src/ts/components/component'


describe('Test Component Base Class', () => {
    test('ComponentBase:Static Instances', () => {
        let c = new ComponentBase()
        expect(ComponentBase.instances.length).toBe(1)
        c.dispose()
    })
    test('ComponentBase:Init', () => {
        let c = new ComponentBase()
        expect(c.stateName).toBe('READY')

    })

})
