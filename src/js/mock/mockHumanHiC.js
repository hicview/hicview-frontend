import axios from 'axios'
import * as nj from 'numjs'


function linesDataToArray(content){
  return content.split(/\r?\n/)
}
function parseHiCData( hicData,...options){
  let columns, data, index;
  if (options.firstLineColumns !== false ){
    columns = hicData.slice(0, 1)
    data = hicData.slice(1, -1)
  } else {
    data = hicData
  }// End first line columns extraction
  
  // data = data.filter(d=>{if(d !== undefined){return true} else {return false}})

  data = nj.array(data.map(line => {
    return line.split('\t').map(d=>{return parseFloat(d)})
  }))
  console.log(data)
  return {
    columns: columns,
    data: data,
    index: index
  }
}

export default async function getMockHumanHiC(){
  let data =  (await axios.get('http://localhost:8080/Human/liberman_MDS.txt')).data
  let dataLines = linesDataToArray(data)
  return parseHiCData(dataLines)
}
