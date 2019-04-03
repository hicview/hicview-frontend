const d3 = require('d3');

/**
 * init d3 part
 */
function initD3(){
//  let imgHeight = 1025, imgWidth = 1538,      // Image dimensions (don't change these)
//      width =  960, height = 650,             // Dimensions of cropped region
//      translate0 = [-290, -180], scale0 = 1;  // Initial offset & scale
//
//  let svg = d3.select("body").append("svg")
//    .attr("width",  width + "px")
//    .attr("height", height + "px");
//
//  svg.append("rect")
//    .attr("class", "overlay")
//    .attr("width", width + "px")
//    .attr("height", height + "px");
//
//  svg = svg.append("g")
//    .attr("transform", "translate(" + translate0 + ")scale(" + scale0 + ")")
//    .call(d3.zoom().scaleExtent([1, 8]).on("zoom", zoom))
//    .append("g");
//
//  svg.append("image")
//    .attr("width",  imgWidth + "px")
//    .attr("height", imgHeight + "px")
//    .attr("xlink:href", "http://bl.ocks.org/pbogden/raw/7363519/Base.png");
//
//  function zoom() {
//    svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
//    console.log("translate: " + d3.event.translate + ", scale: " + d3.event.scale);
//  }

  let width = 960, height = 600;
  let svg_dom = document.createElement('svg');
  svg_dom.setAttribute('width','900 px');
  svg_dom.setAttribute('height', '600 px');

  let svg = d3.select("body").append("svg")
    .attr("width",  width + "px")
    .attr("height", height + "px");
//
//  let svg = d3.select("svg"),
//      width = svg.attr("width"),
//      height = svg.attr("height");

  let randomX = d3.randomNormal(width / 2, 80),
      randomY = d3.randomNormal(height / 2, 80),
      data = d3.range(2000).map(function() { return [randomX(), randomY()]; });

  let g = svg.append("g");

  let circle = g.selectAll("circle")
      .data(data)
      .enter().append("circle")
      .attr("r", 2.5)
      .attr("transform", function(d) { return "translate(" + d + ")"; });

  svg.append("rect")
    .attr("fill", "none")
    .attr("pointer-events", "all")
    .attr("width", width)
    .attr("height", height)
    .call(d3.zoom()
          .scaleExtent([1, 8])
          .on("zoom", zoom));

  function zoom() {
    g.attr("transform", d3.event.transform);
    console.log("translate: " + d3.event + ", scale: " + d3.event.scale);
    console.log(d3.event.transform);

//    Object.keys(d3.event).forEach((keys)=>{
//      console.log()
//    })
  }
  
}




module.exports = {
  'initD3': initD3
};
