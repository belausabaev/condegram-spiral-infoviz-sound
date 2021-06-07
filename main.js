    // ---------- Audio Context ------------------//

    //create audio context for all theremin voices
    ctx = new (AudioContext || webkitAudioContext)();
    ctx.suspend();
    var contour = ctx.createGain();
    //initialize audio context for grainsynth

    init(ctx);
    grainSample = 0; // 0 = synthetic sound, 2 = guitar sound, 3 = piano with echo sound
    bufferSwitch(grainSample);
    grainPlaying = false;

    // initialize default theremin sound
    oscillator = null;
    gainNode = ctx.createGain();
    gainNode.gain.value = 0.5;
    var soundPlaying = false;


   // posY = map(poses.leftWrist.y, 0, video.height, 0, window.innerHeight);
   //         posX = map(poses.rightWrist.x, 0, video.width, 0, window.innerWidth);
   //         grains(posX, posY);





var width = 500,
    height = 500,
    start = 0,
    end = 2.25,
    numSpirals = 2
    margin = {top:50,bottom:50,left:50,right:50};

var theta = function(r) {
    return numSpirals * Math.PI * r;
};

// used to assign nodes color by group
var color = d3.scaleOrdinal(d3.schemeCategory10);

var r = d3.min([width, height]) / 2 - 40;

var radius = d3.scaleLinear()
    .domain([start, end])
    .range([40, r]);

var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.left + margin.right)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var points = d3.range(start, end + 0.001, (end - start) / 1000);

var spiral = d3.radialLine()
    .curve(d3.curveCardinal)
    .angle(theta)
    .radius(radius);

var path = svg.append("path")
    .datum(points)
    .attr("id", "spiral")
    .attr("d", spiral)
    .style("fill", "none")
    .style("stroke", "steelblue");

var spiralLength = path.node().getTotalLength(),
    N = 365,
    barWidth = (spiralLength / N) - 1;
var someData = [];
for (var i = 0; i < N; i++) {
    var currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + i);
    someData.push({
    date: currentDate,
    value: Math.random(),
    group: currentDate.getMonth()
    });
}

path.attr("stroke-dasharray", spiralLength + " " + spiralLength)
    .attr("stroke-dashoffset", spiralLength)
    .transition()
    .duration(60000)
    .ease(d3.easeLinear)
    .attr("stroke-dashoffset", 0);

var timeScale = d3.scaleTime()
    .domain(d3.extent(someData, function(d){
    return d.date;
    }))
    .range([0, spiralLength]);

// yScale for the bar height
var yScale = d3.scaleLinear()
    .domain([0, d3.max(someData, function(d){
    return d.value;
    })])
    .range([0, (r / numSpirals) - 30]);

svg.selectAll("rect")
    .data(someData)
    .enter()
    .append("rect")
    .attr("x", function(d,i){
    
    var linePer = timeScale(d.date),
        posOnLine = path.node().getPointAtLength(linePer),
        angleOnLine = path.node().getPointAtLength(linePer - barWidth);
    
    d.linePer = linePer; // % distance are on the spiral
    d.x = posOnLine.x; // x position on the spiral
    d.y = posOnLine.y; // y position on the spiral
    
    d.a = (Math.atan2(angleOnLine.y, angleOnLine.x) * 180 / Math.PI) - 90; //angle at the spiral position

    return d.x;
    })
    .attr("y", function(d){
    return d.y;
    })
    .attr("width", function(d){
    return barWidth;
    })
    .attr("height", function(d){
    return yScale(0);
    })
    .style("fill", function(d){return color(d.group);})
    .style("stroke", "none")
    .attr("transform", function(d){
    return "rotate(" + d.a + "," + d.x  + "," + d.y + ")"; // rotate the bar
    });

svg.selectAll("rect")
    .transition()
    .duration(800)
    .attr("height", function(d){
        return yScale(d.value);
    })
    .delay(function(d,i){console.log(i); return(i*165);});


// add date labels
var tF = d3.timeFormat("%b %Y"),
    firstInMonth = {};

svg.selectAll("text")
    .data(someData)
    .enter()
    .append("text")
    .attr("dy", 10)
    .style("text-anchor", "start")
    .style("font", "10px arial")
    .append("textPath")
    // only add for the first of each month
    .filter(function(d){
    var sd = tF(d.date);
    if (!firstInMonth[sd]){
        firstInMonth[sd] = 1;
        return true;
    }
    return false;
    })
    .transition()
    .duration(0)
    .text(function(d){
    return tF(d.date);
    })
    // place text along spiral
    .attr("xlink:href", "#spiral")
    .style("fill", "grey")
    .attr("startOffset", function(d){
    return ((d.linePer / spiralLength) * 100) + "%";
    })
    .delay(function(d,i){return((i-1)*5000+1000);});


var tooltip = d3.select("#chart")
.append('div')
.attr('class', 'tooltip');

tooltip.append('div')
.attr('class', 'date');
tooltip.append('div')
.attr('class', 'value');

svg.selectAll("rect")
.on('mouseover', function(d) {

    tooltip.select('.date').html("Date: <b>" + d.date.toDateString() + "</b>");
    tooltip.select('.value').html("Value: <b>" + Math.round(d.value*100)/100 + "<b>");

    // load random sound sample of available (4) samples and granulate according to mouse/data bar coordinates
    loadSample(randSample());
    grains(event.clientX,event.clientY);

    d3.select(this)
    .style("fill","#FFFFFF")
    .style("stroke","#000000")
    .style("stroke-width","2px");

    tooltip.style('display', 'block');
    tooltip.style('opacity',2);

})
.on('mousemove', function(d) {
    tooltip.style('top', (d3.event.layerY + 10) + 'px')
    .style('left', (d3.event.layerX - 25) + 'px');

    grains(event.clientX,event.clientY);
})
.on('mouseout', function(d) {
    d3.selectAll("rect")
    .style("fill", function(d){return color(d.group);})
    .style("stroke", "none")

    tooltip.style('display', 'none');
    tooltip.style('opacity',0);
});



    // GUI for grain params
    // Documentation: https://cocopon.github.io/tweakpane/input.html

    const PARAMS = {
        source: 0,
        attack: 0.8,
        decay: 0.8,
        density: 35,
        start: 0,
        end: 0,
    };

    const pane = new Tweakpane({
        title: 'VIRTUAL THEREMIN SOUNDS',
        expanded: true,
    });

    pane.addSeparator();

    const gs = pane.addFolder({
        title: 'THEREMIN GRANULAR SYNTHESIS',
        expanded: true,
    });

    const btn = gs.addButton({
        title: '► | ◼︎',
        label: 'sound',
    });

    btn.on('click', () => {
        console.log(ctx.state);
        if (ctx.state === 'running') {
                ctx.suspend();
                if (grainPlaying) {
                    grainGain.disconnect();
                    grainPlaying = false;
                }
        } else if (ctx.state === 'suspended') {
            ctx.resume().then(function () {
                // start grains so some sound is coming when sound on button is clicked
                grainGain = ctx.createGain();
                grainGain.connect(ctx.destination);
                bufferSwitch(grainSample);
                grainPlaying = true;
            });
        }
    });

 //   const SourceInput = gs.addInput(PARAMS, 'source', { options: { Synthetic_Sound: 0, Guitar: 1, Piano: 2 , Orchestra_Tuning: 3} });
 //   SourceInput.on('change', function (ev) {
 //       grainSample = ev.value;
 //       bufferSwitch(grainSample);
 //   });

    const f = gs.addFolder({
        title: 'GRAIN SETTINGS',
        expanded: true,
    });

    const attackInput = f.addInput(PARAMS, 'attack', { min: 0.01, max: 1, step: 0.01 });
    attackInput.on('change', function (ev) {
        // change something
        //console.log(ev.value.toFixed(2));
        att = parseFloat(ev.value.toFixed(2)); // parse incoming value for grainmachine.js
    });

    const decayInput = f.addInput(PARAMS, 'decay', { min: 0.01, max: 1, step: 0.01 });
    decayInput.on('change', function (ev) {
        // change something
        dec = parseFloat(ev.value.toFixed(2)); // parse incoming value for grainmachine.js
    });
/*
    const densityInput = f.addInput(PARAMS, 'density', { min: 10, max: 500, step: 5 });
    densityInput.on('change', function (ev) {
        // change something
        rate = parseFloat(ev.value.toFixed());
    });
*/
    pane.addSeparator();

    const instr = pane.addFolder({
        title: 'THEREMIN CLASSIC',
    });



function randSample() {
    const rndInt = Math.floor(Math.random() * 4);
    console.log("rand int " + rndInt);
    return rndInt; 
}

function loadSample(s) {
   // if(grainPlaying){
        bufferSwitch(s);
   // }
}