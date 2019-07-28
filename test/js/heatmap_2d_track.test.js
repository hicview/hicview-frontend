
import { Heatmap2DTrack } from  '../../src/graphics2d/heatmap2DTrack'

describe('HeatMap:test',  () => {
  beforeEach(() => {
    Element.prototype.getBoundingClientRect = jest.fn(() => {
      return {
        width: 120,
        height: 120,
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
      }
    });
  });
  it('should mock `getBoundingClientRect`', () => {
        const element = document.createElement('span');
        const rect = element.getBoundingClientRect();
        expect(rect.width).toEqual(120);
  });
  test('HeatMap:instance equal 1',() => {
    let parentDom = document.createElement('div')
    let a = new Heatmap2DTrack(parentDom);
    expect(Heatmap2DTrack.instances.length).toBe(1);
    
  })
})

