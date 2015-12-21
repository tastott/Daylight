"use strict"

import dl = require('./daylight');
import q = require('q');
import fs = require('fs');
import d3 = require('d3');
import _ = require('underscore');


interface Area {
    Name: string;
    Bottom: (daylight: dl.Daylight) => number;
    Top: (daylight: dl.Daylight) => number;
    Colour: any
}

enum Colour {
    Night,
    Day,
    Twilight,
    AxisTicks,
    Title
}

interface ColourSet {
    [index: number]: D3.Color.RGBColor
}

export function TestSvg(filepath: string): Q.Promise<string> {

    var deferred = q.defer<string>();

    var width = 400;
    var height = 300;

    var svg = d3.select('body').append('svg')
        .attr('width', width)
        .attr('height', height);

    var defs = svg.append('defs');

    var lineGradient = defs.append('linearGradient')
        .attr("id", "line-gradient")
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", width)
        .attr("y2", height)
        .selectAll("stop")
        .data([
            { offset: "0%", color: "white" },
            { offset: "100%", color: "black" }
        ])
        .enter().append("stop")
        .attr("offset", function (d) { return d.offset; })
        .attr("stop-color", function (d) { return d.color; });

    var line = svg.append('line')
        .attr('x', 100)
        .attr('y0', 0)
        .attr('y1', 300)
        .style('stroke', 'url(#line-gradient)')
        .style('stroke-width', '5px');

    fs.writeFile(filepath, d3.select('body').html(), error => {
        if (error) deferred.reject(error);
        else deferred.resolve(filepath);
    });

    return deferred.promise;
}

export function ExportToSvg(days: dl.Daylight[],
    width: number,
    height: number,
    title : string,
    filepath: string): Q.Promise<string> {

    var margin = 32;
    var axisLabelPaddingX = 16;
    var axisLabelPaddingY = 4;
    var titleMargin = 16;
    var titleSize = 64;

    var colours: ColourSet = {};
    colours[Colour.Night] = d3.rgb('#0B0B3B');
    colours[Colour.Day] = d3.rgb('#F4FA58');
    colours[Colour.Title] = colours[Colour.Day];
    colours[Colour.Twilight] = d3.interpolateRgb(colours[Colour.Night], colours[Colour.Day])(0.5);
    colours[Colour.AxisTicks] = colours[Colour.Day];

    var document = require('jsdom').jsdom();
    
    var svg = d3.select(document.body)
        .append('svg')
        .attr('width', width + (2 * margin))
        .attr('height', height + (2 * margin));

    var x = d3.time.scale()
        .domain([days[0].Date.toDate(), days[days.length - 1].Date.toDate()])
        .range([0, width]);

    var y = d3.scale.linear()
        .domain([0, 24])
        .range([0, height]);


    var yAxes = [
        d3.svg.axis()
            .orient('left')
            .tickSize(-width, 0),
        d3.svg.axis()
            .orient('right')
            .tickSize(0)
    ];

    yAxes.forEach(yAxis =>
        yAxis.scale(y)
            .ticks(24)
            .tickFormat(v => {
                if (v < 1 || v > 23) return '';
                else return v.toString();
            })
            .tickPadding(axisLabelPaddingY)
    );

    var xAxes = [
        d3.svg.axis()
            .orient('top')
            .tickSize(0)
            .tickPadding(axisLabelPaddingY),
        d3.svg.axis()
            .orient('bottom')
            .tickSize(-height, 0)
            .tickPadding(axisLabelPaddingX)
    ];

    xAxes.forEach(xAxis =>
        xAxis.scale(x)
            .ticks(12)
            .tickFormat(d3.time.format('%b'))
    );
        

    var group = svg.append("g")
        .attr('transform', 'translate(' + margin + ',' + margin + ')');

    //Background
    var background = group.append("rect")
        .attr("width", width)
        .attr("height", height)
        .style("fill", colours[Colour.Day]);

    var areas: Area[] = [
        { Name: 'NightAm', Bottom: d => 0, Top: d => d.DawnHour, Colour: colours[Colour.Night] },
        { Name: 'Dawn', Bottom: d => d.DawnHour, Top: d => d.SunriseHour, Colour: colours[Colour.Twilight] },
        { Name: 'Dusk', Bottom: d => d.SunsetHour, Top: d => d.DuskHour, Colour: colours[Colour.Twilight] },
        { Name: 'NightPm', Bottom: d => d.DuskHour, Top: d => 24, Colour: colours[Colour.Night] },
    ];

    areas.forEach(area => {
        group.append("path")
            .attr("d", d3.svg.area()
                .x((d: dl.Daylight) => x(d.Date.toDate()))
                .y0((d: dl.Daylight) => y(area.Bottom(d)))
                .y1((d: dl.Daylight) => y(area.Top(d)))
                .interpolate('linear')(days)
            )
            .attr("fill", area.Colour);
    });




    var axisGroup = svg.append("g")
        .attr('transform', 'translate(' + margin + ',' + margin + ')');


    var hourAxisGroup = axisGroup.append('g').call(yAxes[0]);
    axisGroup.append('g').call(yAxes[1])
        .attr('transform', 'translate(' + width + ', 0)');

    axisGroup.append('g').call(xAxes[0]);
    var dateAxisGroup = axisGroup.append('g').call(xAxes[1])
        .attr('transform', 'translate(0, ' + height + ')');

    var defs = svg.append('defs');

   
    axisGroup
        .selectAll('line')
        //.style('stroke', colours[Colour.AxisTicks].toString())
        //.style('stroke', 'url(#line-gradient)')
        .style('stroke-width', '1px');


    setDateLineGradients(defs, dateAxisGroup, colours, date => _.find(days, dl => dl.Date.toDate().getTime() == date.getTime()));
    setHourLineGradients(defs, 
        hourAxisGroup, 
        colours, 
        (getDaylightHour, hour) => getIntersections(days, getDaylightHour, hour)
    );
   
    
  //  setHourLineColors(defs, hourAxisGroup, colours);

    svg.append('text')
        .attr('x', margin + titleMargin)
        .attr('y', margin + titleMargin + titleSize)
        .attr('fill', colours[Colour.Day])
        .attr('font-size', titleSize + 'px')
        .text(title);
        

    return saveD3ToSvg(d3.select(document.body), filepath); 
}

function getIntersections(days: dl.Daylight[], getDaylightHour: (day: dl.Daylight) => number, hour: number) :
    DaylightIntersection[] {
        
    let intersections : DaylightIntersection[] = [];
    let previous: number = null;
    for(var i = 0; i < days.length; i++){
        let current = getDaylightHour(days[i]);
        if(previous != null){
            if(previous < hour && current >= hour) intersections.push({Up: true, Hour: i});
            else if(previous > hour && current < hour) intersections.push({Up: false, Hour: i});
        }
        previous = current;
    }
    return intersections;
}

interface DaylightIntersection {
    Up: boolean;
    Hour: number;
}

function setLineGradients(defs: D3.Selection,
    lines: D3.Selection,
    getStops: (lineEl: any) => any[],
    getId: (index: number) => string) {

    lines.selectAll('line')[0]
        .forEach((lineEl, index: number) => {
            var line = d3.select(lineEl);
            var gradientId = getId(index);
            var stops = getStops(lineEl);

            defs.append("linearGradient")
                .attr("id", gradientId)
                .attr("gradientUnits", "userSpaceOnUse")
                .attr("x1", 0)
                .attr("y1", 0)
                .attr("x2", line.attr('x2'))
                .attr("y2", line.attr('y2'))
                .selectAll("stop")
                .data(stops)
                .enter().append("stop")
                .attr("offset", function (d) { return d.offset; })
                .attr("stop-color", function (d) { return d.color; });

            line.style('stroke', 'url(#' + gradientId + ')');
        });
}

function setHourLineColors(defs: D3.Selection,
    lines: D3.Selection,
    colours: ColourSet) {

    var showFromAm = 4;
    var showToAm = 10;
    var showFromPm = 3;
    var showToPm = 23;

    var interpolateAm = d3.interpolateRgb(colours[Colour.Night], colours[Colour.Day]);
    var interpolatePm = d3.interpolateRgb(colours[Colour.Day], colours[Colour.Night]);

    lines.selectAll('line')[0]
        .forEach((lineEl, index: number) => {
            var color: D3.Color.RGBColor;

            if (index >= showFromAm && index <= showToAm) {
                var colorPosition = (index - showFromAm) / (showToAm - showFromAm);
                color = interpolateAm(colorPosition);
            } else if(index >= showFromPm && index <= showToPm){
                var colorPosition = (index - showFromPm) / (showToPm - showFromPm);
                color = interpolatePm(colorPosition);
            }

                
            if(color) d3.select(lineEl).style('stroke', color.toString());
        });

}

function setHourLineGradients(defs: D3.Selection,
    lines: D3.Selection,
    colours: ColourSet,
    getIntersections: (getDaylightHour: (day: dl.Daylight) => number, hour: number) => DaylightIntersection[]){

    var margin = 20; //Show line within +/- this many days of intersection
    var getStops = lineEl => {
        let hour: number = lineEl.__data__;
        
        return _.chain([
            {GetHour: (day: dl.Daylight):number => day.DawnHour, Colour: colours[Colour.Night], Offset: -margin},
            {GetHour: (day: dl.Daylight):number => day.SunriseHour, Colour: colours[Colour.Day], Offset: margin},
            {GetHour: (day: dl.Daylight):number => day.SunsetHour, Colour: colours[Colour.Day], Offset: -margin},
            {GetHour: (day: dl.Daylight):number => day.DuskHour, Colour: colours[Colour.Night], Offset: margin}
        ])
        .map(entry => {
            let intersections = getIntersections(entry.GetHour, hour);
            return intersections.map(intersection => {
                return {
                    offset: ((365 - intersection.Hour + (intersection.Up ? -entry.Offset: entry.Offset)) / 0.365) + '%',
                    color: entry.Colour.toString()
                };
            })
        })
        .flatten()
        .value();
        
    };

    setLineGradients(defs, lines, getStops, index => 'hour-line-gradient-' + index);    
        
}

function setDateLineGradients(defs: D3.Selection,
    lines: D3.Selection,
    colours : ColourSet,
    getDaylight: (date : Date) => dl.Daylight) {

    var margin = 1; //Show line within +/- this many hours of dawn and dusk
    var getStops = lineEl => {
        var daylight = getDaylight(lineEl.__data__);
        return [
            { hour: daylight.DuskHour + 1, color: colours[Colour.Night] },
            { hour: daylight.SunsetHour - 1, color: colours[Colour.Day] },
            { hour: daylight.SunriseHour + 1, color: colours[Colour.Day] },
            { hour: daylight.DawnHour - 1, color: colours[Colour.Night] },
        ].map(oh => {
            return {
                offset: ((24 - oh.hour) / 0.24) + '%',
                color: oh.color.toString()
            };
        });
    };

    setLineGradients(defs, lines, getStops, index => 'date-line-gradient-' + index);
}

function saveD3ToSvg(selection: D3.Selection, filepath: string): Q.Promise<string> {

    var deferred = q.defer<string>();

    var html = selection.html();
    html = html.replace(/lineargradient/g, 'linearGradient');

    fs.writeFile(filepath, html, error => {
        if (error) deferred.reject(error);
        else deferred.resolve(filepath);
    });

    return deferred.promise;
}