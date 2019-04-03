
function  convertModelTxtToObj(content){

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


module.exports.convertModelTxtToObj=convertModelTxtToObj;
