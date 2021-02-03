// set the dimensions and margins of the graph
var margin = {top: 20, right: 50, bottom: 30, left: 50},
width = 1060 - margin.left - margin.right,
height = 600 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
.append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");


lastStep = 500; // Steps start at 0
const fractionsW = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7];
const segPreferences = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];
const repetitions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
const groups = ['top20M', 'top20SegF', 'top20TestF']
var runs = {};

fractionsW.forEach(fractionW =>{
    runs[fractionW] = {};
    segPreferences.forEach(segPreference => {
        runs[fractionW][segPreference] = {};
    });
});

    // A color scale: one color for each group
    var myColor = d3.scaleOrdinal()
      .domain(groups)
      .range(d3.schemeSet2);
    
    // Add X axis --> it is a date format
    var x = d3.scaleLinear()
      .domain([0,lastStep])
      .range([ 0, width ]);
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));
    
    // Add Y axis
    var y = d3.scaleLinear()
      .domain( [2200,3300])
      .range([ height, 0 ]);
    svg.append("g")
      .call(d3.axisLeft(y));


d3.csv("./SEGREGATION_W_FRACTION_2010_source.csv", function(data) {

    //Read the data
    data.forEach( row => {
        if(runs[row['WOMEN_FRACTION']][row['SEGREGATION_PREFERENCE']][row['[run number]']] === undefined) {
            runs[row['WOMEN_FRACTION']][row['SEGREGATION_PREFERENCE']][row['[run number]']] = {
                name: 'fractionW: '+row['WOMEN_FRACTION']+' segPref: '+row['SEGREGATION_PREFERENCE']+' repetitionNbr: '+row['[run number]'],
                values: []
            };
        }
        runs[row['WOMEN_FRACTION']][row['SEGREGATION_PREFERENCE']][row['[run number]']].values.push(
            {
                step: row['[step]'],
                top20M: row['mean [rating] of max-n-of 20 turtles with [sex = "M"] [rating]'],
                top20SegF: row['mean [rating] of max-n-of 20 turtles with [group = "segregated"] [rating]'],
                top20TestF: row['mean [rating] of max-n-of 20 turtles with [group = "test"] [rating]']
            }
        );
    });
       
      plotGroup('0.5', '0.4', 'top20TestF');
      plotGroup('0.5', '0.4', 'top20SegF');
      plotGroup('0.5', '0.4', 'top20M');


});

const plotGroup = function(fractionW, segregationPref, group)
{
    var runsToChart = Object.values(runs[fractionW][segregationPref]);
    // Add the lines
    var line = d3.line()
    .x(function(d) { return x(+d.step) })
    .y(function(d) { return y(+d[group]) })
    svg.selectAll("myLines")
    .data(runsToChart)
    .enter()
    .append("path")
      .attr("d", function(d){ 
        return line(d.values) } )
      .attr("stroke", function(d){ return myColor(group) })
      //.attr("stroke", "red")
      .style("stroke-width", 1)
      .style("fill", "none");
}

const addNewSeries = function()
{
    let fractionW = d3.select('input[name="fractionW"]:checked').node().value;
    let segPreference = d3.select('input[name="segPreference"]:checked').node().value;
    let groupToPlot = d3.select('input[name="groupToPlot"]:checked').node().value;
    plotGroup(fractionW, segPreference, groupToPlot);
}

