import { Vector3 } from 'three'

// Chrome 3D Model Data Format
// --------------------
// {
//   chrome name: [
//     [bin, x, y, z],
//     ...
//   ]
// }
class Chrom3DModel {
  constructor (modelText) {
    let data = convertModelTxtToObj(modelText)
    this.data = data
  }
  getChromPositions (chromId) {
    let chromPos = []
    for (let i = 0; i < this.data[chromId].length; i++) {
      let _point = this.data[chromId][i].slice(1)
      chromPos.push(new Vector3(
        _point[0], // x
        _point[1], // y
        _point[2] // z
      ))
    }
    return chromPos
  }
  getChrom () {
    return this.data
  }
  getChromKeys () {
    return Object.keys(this.data)
  }
}
function convertModelTxtToObj (content) {
  let lines = content.split(/\r?\n/)
  let data = lines.slice(1, -1)
  let model = {}
  for (let i = 0; i < data.length; i++) {
    let line = data[i].split('\t')
    if (typeof model[line[0]] === 'undefined') {
      model[line[0]] = []
    }
    let lineNum = []
    lineNum.push(parseInt(line[1]))
    line.slice(2).forEach(function (element) {
      lineNum.push(parseFloat(element))
    })
    model[line[0]].push(lineNum)
  }
  return model
}
export { Chrom3DModel, convertModelTxtToObj }
