import VisualComponent from '../../src/ts/components/visualComponent'


describe('Test Visual Component  Class', () => {
    test('VisualComponent:Static Instances', () => {
        let c = new VisualComponent('three')
        expect(VisualComponent.instances.length).toBe(1)
        c.dispose()
    })
    test('VisualComponent:Init', () => {
        let c = new VisualComponent('three')
        expect(c.stateName).toBe('READY')

    })

})
