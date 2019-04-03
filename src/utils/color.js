import {getColorTable} from './colorTable';
import {Color} from 'three';

const colorTable = getColorTable();

const nameToHex  = function(name){
  let hex;
  colorTable.forEach((tbl)=>{
    if (tbl[name]){
      hex=tbl[name];
    }
  });
  if (!hex){
    return false;
  }
  return hex;
};

class hColor extends Color {
  constructor(args){
    let color = nameToHex(args);
    let color3 = color ? color : args;
    super(color3);
    
  }

  get rgb(){
    return {
      r: this.r,
      g: this.g,
      b: this.b
    };
  }

  get hex(){
    return '0x'+this.getHexString();
  }

  get hsl(){
    return this.getHSL();
  }

  static toHex(_){
    let color = nameToHex(_);
    let color3 = color ? color : _;
    return '0x'+new Color(color3).getHexString();
  }
  
}

export {
  nameToHex,
  hColor
}

