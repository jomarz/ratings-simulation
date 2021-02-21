// set the dimensions and margins of the graph
var margin = {
    top: 20,
    right: 50,
    bottom: 30,
    left: 50
},
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
var svgDiff = d3.select("#diff-plot")
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
const groups = ['top20M', 'top20SegF', 'top20TestF'];
var runs = {};

fractionsW.forEach(fractionW => {
    runs[fractionW] = {};
    segPreferences.forEach(segPreference => {
        runs[fractionW][segPreference] = {};
    });
});

// A color scale: one color for each group
var myColor = d3.scaleOrdinal()
    .domain(groups)
    .range(d3.schemeSet2);

// Add X axis --> simulation step
var x = d3.scaleLinear()
    .domain([0, lastStep])
    .range([0, width]);

svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));
svgDiff.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

// Add Y axis
var y = d3.scaleLinear()
    .domain([2200, 3200])
    .range([height, 0]);
svg.append("g")
    .call(d3.axisLeft(y));

y = d3.scaleLinear()
    .domain([-500, 3200])
    .range([height, 0]);
svgDiff.append("g")
    .call(d3.axisLeft(y));

d3.select('.legend-color-men')
    .style('background-color', myColor('top20M'));
d3.select('.legend-color-segregatedF')
    .style('background-color', myColor('top20SegF'));
d3.select('.legend-color-testF')
    .style('background-color', myColor('top20TestF'));


d3.csv("./SEGREGATION_W_FRACTION_2010_source.csv", function (data) {

  //Read the data
data.forEach(row => {
    if (runs[row['WOMEN_FRACTION']][row['SEGREGATION_PREFERENCE']][row['[run number]']] === undefined) {
        runs[row['WOMEN_FRACTION']][row['SEGREGATION_PREFERENCE']][row['[run number]']] = {
        name: 'fractionW: ' + row['WOMEN_FRACTION'] + ' segPref: ' + row['SEGREGATION_PREFERENCE'] + ' repetitionNbr: ' + row['[run number]'],
        values: []
        };
    }
    runs[row['WOMEN_FRACTION']][row['SEGREGATION_PREFERENCE']][row['[run number]']].values.push({
        step: row['[step]'],
        top20M: row['mean [rating] of max-n-of 20 turtles with [sex = "M"] [rating]'],
        top20SegF: row['mean [rating] of max-n-of 20 turtles with [group = "segregated"] [rating]'],
        top20TestF: row['mean [rating] of max-n-of 20 turtles with [group = "test"] [rating]'],
        MDiffSegF: row['mean [rating] of max-n-of 20 turtles with [sex = "M"] [rating]'] - row['mean [rating] of max-n-of 20 turtles with [group = "segregated"] [rating]'],
        MDiffTestF: row['mean [rating] of max-n-of 20 turtles with [sex = "M"] [rating]'] - row['mean [rating] of max-n-of 20 turtles with [group = "test"] [rating]'],
        TestFDiffSegF: row['mean [rating] of max-n-of 20 turtles with [group = "test"] [rating]'] - row['mean [rating] of max-n-of 20 turtles with [group = "segregated"] [rating]']

    });
});

});

var numGroupsTop20 = 0;
var numGroupsDiff = 0;
const plotGroup = function (fractionW, segregationPref, group) {
    var runsToChart = Object.values(runs[fractionW][segregationPref]);
    // Add the lines
    var newColor = getNewColor();
    var line = d3.line()
        .x(function (d) {            
            return x(+d.step)
        })
        .y(function (d) {
            return y(+d[group])
        })
    svg.selectAll("myLines")
        .data(runsToChart)
        .enter()
        .append("path")
        .attr("d", function (d) {
            return line(d.values)
        })
        .attr("stroke", function (d) {
            return newColor;
        })
        .style("stroke-width", 1)
        .style("fill", "none")
        .attr("class", "series");        
}
const plotDiffGroup = function (fractionW, segregationPref, group) {
    var runsToChart = Object.values(runs[fractionW][segregationPref]);
    // Add the lines
    var newColor = getNewDiffColor();
    var line = d3.line()
        .x(function (d) {            
            return x(+d.step)
        })
        .y(function (d) {
            return y(+d[group])
        })
    svgDiff.selectAll("myLines")
        .data(runsToChart)
        .enter()
        .append("path")
        .attr("d", function (d) {
            return line(d.values)
        })
        .attr("stroke", function (d) {
            return newColor;
        })
        .style("stroke-width", 1)
        .style("fill", "none")
        .attr("class", "series");        
}

const addNewSeries = function () 
{
    let fractionW = d3.select('.top20-dashboard input[name="fractionW"]:checked').node().value;
    let segPreference = d3.select('.top20-dashboard input[name="segPreference"]:checked').node().value;
    let groupToPlot = d3.select('.top20-dashboard input[name="groupToPlot"]:checked').node().value;
    plotGroup(fractionW, segPreference, groupToPlot);
    insertLegendItem("ratingTop20-legend", groupToPlot+" Part:"+fractionW+" Seg:"+segPreference,getNewColor());
    numGroupsTop20 ++;
}
const addNewDiffSeries = function () 
{
    let fractionW = d3.select('.diff-dashboard input[name="fractionW"]:checked').node().value;
    let segPreference = d3.select('.diff-dashboard input[name="segPreference"]:checked').node().value;
    let groupToPlot = d3.select('.diff-dashboard input[name="groupToPlot"]:checked').node().value;
    plotDiffGroup(fractionW, segPreference, groupToPlot);
    insertLegendItem("ratingDiff-legend", groupToPlot+" Part:"+fractionW+" Seg:"+segPreference,getNewDiffColor());
    numGroupsDiff ++;
}

const clearPlot = function (containerId)
{
    d3.selectAll("#"+containerId+" svg path.series").remove();
    d3.selectAll("#"+containerId+" .plot-legend .legend-item").remove();
}

const getNewColor = function ()
{
    const colors = d3.schemeTableau10.concat(d3.schemeSet2);
    index = numGroupsTop20 % colors.length;
    return colors[index];
}
const getNewDiffColor = function ()
{
    const colors = d3.schemeTableau10.concat(d3.schemeSet2);
    index = numGroupsDiff % colors.length;
    return colors[index];
}

const insertLegendItem = function(legendId, name, color) 
{
    const legendItem = d3.select("#"+legendId).append("div").attr("class", "legend-item");
    legendItem.append("div").attr("class", "legend-color").style('background-color', color)
    legendItem.append("div").attr("class", "legend-text").text(name);
}

const selectDashboard = function(dashboard)
{
    d3.selectAll(".dashboard:not(."+dashboard+")")
        .style("display", "none");
    d3.select(".dashboard."+dashboard)
        .style("display", "flex");
}
