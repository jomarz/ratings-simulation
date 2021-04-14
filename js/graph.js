const NUM_VALUES_RUNNING_AVG = 7;

// set the dimensions and margins of the graph
var margin = {
    top: 20,
    right: 50,
    bottom: 30,
    left: 50
},
width = 1060 - margin.left - margin.right,
height = 600 - margin.top - margin.bottom;

var plots = {
    top20: {
        numGroups: 0
    },
    diff: {
        numGroups: 0
    }
};
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
const groupNames = {
    top20M: 'M',
    top20SegF: 'W Segregated',
    top20TestF: 'W Test',
    MDiffSegF: 'M - W(Seg)',
    MDiffTestF: 'M - W(Test)',
    TestFDiffSegF: 'W(Test) - W(Seg)'
};
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
    .domain([2200, 3100])
    .range([height, 0]);
svg.append("g")
    .call(d3.axisLeft(y));

yDiff = d3.scaleLinear()
    .domain([-100, 500])
    .range([height, 0]);
svgDiff.append("g")
    .call(d3.axisLeft(yDiff));

d3.select('.legend-color-men')
    .style('background-color', myColor('top20M'));
d3.select('.legend-color-segregatedF')
    .style('background-color', myColor('top20SegF'));
d3.select('.legend-color-testF')
    .style('background-color', myColor('top20TestF'));

    
const addRunningAvgs = function (runsData, numToAvg) {
    (Object.values(runsData)).forEach(wFractionGroup => {
        (Object.values(wFractionGroup)).forEach(segPreferenceGroup => { 
            (Object.values(segPreferenceGroup)).forEach(run => { 
                let lastValues = {
                    'top20M': [], 
                    'top20SegF': [], 
                    'top20TestF': [], 
                    'MDiffSegF': [], 
                    'MDiffTestF': [], 
                    'TestFDiffSegF': [], 
                };
                for (i = 0; i < run.values.length; i++) {
                    lastValues.top20M.push(run.values[i].top20M)
                    lastValues.top20SegF.push(run.values[i].top20SegF)
                    lastValues.top20TestF.push(run.values[i].top20TestF)
                    lastValues.MDiffSegF.push(run.values[i].MDiffSegF)
                    lastValues.MDiffTestF.push(run.values[i].MDiffTestF)
                    lastValues.TestFDiffSegF.push(run.values[i].TestFDiffSegF)
                    if ( i >= numToAvg ) {
                        lastValues.top20M.shift();
                        lastValues.top20SegF.shift();
                        lastValues.top20TestF.shift();
                        lastValues.MDiffSegF.shift();
                        lastValues.MDiffTestF.shift();
                        lastValues.TestFDiffSegF.shift();
                    }
                    if (i==0) { console.log(i); }
                    run.values[i].top20MRunningAvg = d3.mean(lastValues.top20M);
                    run.values[i].top20SegFRunningAvg = d3.mean(lastValues.top20SegF);
                    run.values[i].top20TestFRunningAvg = d3.mean(lastValues.top20TestF);
                    run.values[i].MDiffSegFRunningAvg = d3.mean(lastValues.MDiffSegF);
                    run.values[i].MDiffTestFRunningAvg = d3.mean(lastValues.MDiffTestF);
                    run.values[i].TestFDiffSegFRunningAvg = d3.mean(lastValues.TestFDiffSegF);
                }
            });
        });
    });
};

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

addRunningAvgs(runs, NUM_VALUES_RUNNING_AVG);

});


var numGroupsTop20 = 0;
var numGroupsDiff = 0;

const plotGroup = function (fractionW, segregationPref, group, runningAvg = false) {
    var runsToChart = Object.values(runs[fractionW][segregationPref]);
    var groupToPlot = (runningAvg ? group+'RunningAvg' : group);
    // Add the lines
    var newColor = getNewColor("top20");
    var line = d3.line()
        .x(function (d) {            
            return x(+d.step)
        })
        .y(function (d) {
            return y(+d[groupToPlot])
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

const plotDiffGroup = function (fractionW, segregationPref, group, runningAvg = false) {
    var runsToChart = Object.values(runs[fractionW][segregationPref]);
    var groupToPlot = (runningAvg ? group+'RunningAvg' : group);
    // Add the lines
    var newColor = getNewColor("diff");
    var line = d3.line()
        .x(function (d) {            
            return x(+d.step)
        })
        .y(function (d) {
            return yDiff(+d[groupToPlot])
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

const addNewSeries = function (runningAvg = false) 
{
    let fractionW = d3.select('.top20-dashboard input[name="fractionW"]:checked').node().value;
    let segPreference = d3.select('.top20-dashboard input[name="segPreference"]:checked').node().value;
    let groupToPlot = d3.select('.top20-dashboard input[name="groupToPlot"]:checked').node().value;
    plotGroup(fractionW, segPreference, groupToPlot, runningAvg);
    insertLegendItem("ratingTop20-legend", groupNames[groupToPlot]+" Part:"+fractionW+" Seg:"+segPreference,getNewColor("top20"));
    plots.top20.numGroups ++;
}
const addNewDiffSeries = function (runningAvg = false) 
{
    let fractionW = d3.select('.diff-dashboard input[name="fractionW"]:checked').node().value;
    let segPreference = d3.select('.diff-dashboard input[name="segPreference"]:checked').node().value;
    let groupToPlot = d3.select('.diff-dashboard input[name="groupToPlot"]:checked').node().value;
    plotDiffGroup(fractionW, segPreference, groupToPlot, runningAvg);
    insertLegendItem("ratingDiff-legend", groupNames[groupToPlot]+" Part:"+fractionW+" Seg:"+segPreference,getNewColor("diff"));
    plots.diff.numGroups ++;
}

const clearPlot = function (plotName)
{
    d3.selectAll("#"+plotName+"-plot-container svg path.series").remove();
    d3.selectAll("#"+plotName+"-plot-container .plot-legend .legend-item").remove();
    plots[plotName].numGroups = 0;
}

const getNewColor = function (plotName)
{
    const colors = d3.schemeTableau10.concat(d3.schemeSet2);
    index = plots[plotName].numGroups % colors.length;
    return colors[index];
}

const insertLegendItem = function(legendId, name, color) 
{
    const legendItem = d3.select("#"+legendId).append("div").attr("class", "legend-item");
    legendItem.append("div").attr("class", "legend-color").style('background-color', color)
    legendItem.append("div").attr("class", "legend-text").text(name);
}

const selectDashboard = function(dashboardName)
{
    d3.selectAll(".dashboard:not(."+dashboardName+"-dashboard)")
        .style("display", "none");
    d3.selectAll(".dashboard-option:not(."+dashboardName+"-option)")
        .classed("active", false).classed("inactive", true);;
    /* d3.selectAll(".dashboard-option:not(."+dashboardName+"-option)")
        .classed("inactive", true); */
    d3.select(".dashboard."+dashboardName+"-dashboard")
        .style("display", "flex");
    d3.selectAll(".dashboard-option."+dashboardName+"-option")
        .classed("active", true).classed("inactive", false);
    /* d3.selectAll(".dashboard-option."+dashboardName+"-option")
        .classed("inactive", false) */
}
