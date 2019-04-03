const {Vector3} = require('three');

class Chrom3DModel {
  constructor(model_text){
    let data = convertModelTxtToObj(model_text);
    let chrom = {};
    Object.keys(data).forEach(function(key,index){
      chrom[key] = data[key];
    });
    this.chrom = chrom;
    this.data= data;
  }
  getChromPositions(chrom_id){
    let chrom_pos = [];
    for (let i = 0; i < this.chrom[chrom_id].length; i++){
      let _point = this.chrom[chrom_id][i].slice(1);
      chrom_pos.push(new Vector3(
	_point[0], //x
	_point[1], //y
	_point[2] //z
      ));
    }
    return chrom_pos;
  }
  getChrom(){
    return this.chrom;
  }
  getChromKeys(){
    return Object.keys(this.data);
  }
  
}
function convertModelTxtToObj(content){
  let lines = content.split(/\r?\n/);
  let data = lines.slice(1, -1);
  let model = {};
  for (let i = 0; i < data.length; i++){
    let line = data[i].split('\t');
    if (typeof model[line[0]] === 'undefined'){
      model[line[0]] = new Array();
    }
    let line_num = [];
    line_num.push(parseInt(line[1]));
    line.slice(2).forEach(function(element){
      line_num.push(parseFloat(element));
    });
    model[line[0]].push(line_num);
  }
  return model;
}

module.exports = {
  'Chrom3DModel': Chrom3DModel,
  'convertModelTxtToObj': convertModelTxtToObj,
};
