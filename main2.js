(function() {
    'use strict'

        // SVG Setup //    
  var width = 500,
    height = 500,
      margin = {top:50,bottom:50,left:50,right:50}
  
     var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.left + margin.right)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")  
    
  // Spiral Setup //
  var start = 0,
    end = 2.25,
    numSpirals = 8

  var theta = function(r) {
    return numSpirals * Math.PI * r
  };

  // used to assign nodes color by group
  var color = d3.scaleOrdinal(d3.schemeCategory10)

  var r = d3.min([width, height]) / 2 - 40

  var radius = d3.scaleLinear()
    .domain([start, end])
    .range([40, r])

  var points = d3.range(start, end + 0.001, (end - start) / 1000)

  var spiral = d3.radialLine()
    .curve(d3.curveCardinal)
    .angle(theta)
    .radius(radius)

  var path = svg.append("path")
    .datum(points)
    .attr("id", "spiral")
    .attr("d", spiral)
    .style("fill", "none")
    .style("stroke", "lightGray")

  // Circle Placement //
  var dot = svg.append("circle")
    .attr("class", "dot")
    .attr("fill", "#38d3fe")
    .attr("cx", path.node().getPointAtLength(0).x)
    .attr("cy", path.node().getPointAtLength(0).y)
    .attr("r", 8)

  // Time Scales and Animation //
  var spiralLength = path.node().getTotalLength()
  
  var timeScale = d3.scaleLinear()
      .domain([0,60])
      .range([0, spiralLength])
  
  function render(time){
    var l = timeScale(time)
      svg.selectAll(".dot")
        .attr("cx", path.node().getPointAtLength(l).x)
          .attr("cy", path.node().getPointAtLength(l).y)
  }

  var p = 0
  
  function tick() {
    p = p + 0.015
    if (p > 60) { p = 0 }
    render(p)
  }

  d3.timer(tick)
    })()
