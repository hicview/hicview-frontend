
// p [x, y]; rect[minX, minY, maxX, maxY]
const containPoint = (p, rect)=>{
  return (rect.length===2)
  // 1-D situation
    ? (p[0] >= rect[0] && p[0] <= rect[1]) || (p[1] >= rect[0] && p[1] <= rect[1])
  // 2-D situation
    : (p[0] >= rect[0] && p[0] <= rect[2]) && (p[1] >= rect[1] && p[1] <= rect[3]);
};

const sumArray = (...arrs)=>{
  if (arrs.length === 0) throw Error('There must be at least one array ');
  const len = arrs[0].length;
  arrs.forEach((arr)=>{
    if (arr.length != len) throw Error('All arrays must be the same length');
  });
  let result = new Array(len).fill(0);
  arrs.map((arr)=>{
    arr.forEach((ele, idx)=>{
      result[idx] += ele;
    });
  });
  return result;
};


export {containPoint,
	sumArray};
