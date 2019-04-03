const d3 = require('d3')

function createDOM (type, id, width, height, options = undefined) {
  let ele = document.createElement(type)
  ele.id = id
  let eleSel = d3.select(ele)
  eleSel
    .style('width', width + 'px')
    .style('height', height + 'px')
    .style('position', 'absolute')
    // ele.width = width + 'px';
    // ele.height = height + 'px';
  if (options !== undefined) {
    Object.keys(options).forEach((key) => {
      if (['top', 'bottom', 'left', 'right'].includes(key)) {
        if (typeof options[key] === 'number') {
          eleSel
            .style(key, options[key] + 'px')
        }
      }
    })
  }
  return ele
}
function shiftDOM (dom, top, left) {
  d3.select(dom)
    .style('position', 'absolute')
    .style('top', top + 'px')
    .style('left', left + 'px')
}
export { createDOM, shiftDOM }
