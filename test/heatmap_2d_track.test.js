const expect = require('chai').expect;
const Heatmap2DTrack =require ('../src/graphics2d/heatmap2dtrack.js');

describe('heatmap test',()=>{
  it('heatmap instance delete', ()=>{
    let a = new Heatmap2DTrack('');
    expect(Heatmap2DTrack.instances.length).to.be.equal(1);
  })
})
