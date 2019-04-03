const { LineScene,
  ExtrudeLine } = require('./line3DModel.js')
const { Color, Object3D, Vector3 } = require('three')

class GenomeScene {
  constructor (chrom3DModel) {
    let color = new Color()
    let highlightColor = new Color()
    let chroms = {}
    let chromsObject = new Object3D()

    for (let i = 0, l = chrom3DModel.getChromKeys().length; i < l; i++) {
      let _chrom_key = chrom3DModel.getChromKeys()[i]

      color.setHSL(i / l, 0.8, 0.7)
      var chr_ = new LineScene(chrom3DModel.getChromPositions(_chrom_key), color)
      chroms[_chrom_key] = {
        line: chr_,
        color: color,
        highlight: false
      }
      chromsObject.add(chr_.getLine())
    }
    // chromsObject.add(chroms['1'].getLine());

    this.chromsObject = chromsObject
    this.chroms = chroms
    this.data = chrom3DModel
    this.moveToCenter()
  }
  addToScene (scene) {
    const chroms_ = this.chroms
    scene.add(this.chromsObject)
  }
  moveToCenter () {
    // Calculate the avg center of genome and move the genome object to center
    const data = this.data
    let len = 0
    let x = new Vector3()
    Object.values(data.data).forEach((e) => {
      len += e.length
      e.forEach((e_) => {
        let point_ = e_.slice(1)
        x.add(new Vector3(point_[0],
          point_[1],
          point_[2]))
      })
    })
    x.divideScalar(len)
    this.chromsObject.position.sub(x)
    this.offset = x
  }
  setChromHighlight (chrom_key, start, end, color) {
    let chrom_positions = this.getChromPositions(chrom_key, start, end)
    let highlightLine = new ExtrudeLine(chrom_positions, color)
    this.chroms[chrom_key].highlight = highlightLine
    this.chromsObject.add(highlightLine.mesh)
  }
  getChromPositions (chrom_key, start = 0, end = 1) {
    let chrom = this.chroms[chrom_key]
    let len = chrom.line.length
    return chrom.line.points.slice(Math.round(start * len),
				   Math.round(end * len))
  }
}

module.exports = {
  GenomeScene
}
