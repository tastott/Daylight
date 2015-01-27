import dl = require('daylight');
import q = require('q');
import fs = require('fs');
import d3 = require('d3');

interface Area {
    Name: string;
    Bottom: (daylight: dl.Daylight) => number;
    Top: (daylight: dl.Daylight) => number;
    Colour: any
}

export function ExportToSvg(days: dl.Daylight[],
    width: number,
    height: number,
    filepath: string): Q.Promise<string> {

    var deferred = q.defer<string>();

    var margin = 32;
    var axisLabelPaddingX = 16;
    var axisLabelPaddingY = 4;

    var colours = {
        night: 'black',
        day: 'white',
        twilight: 'gray'
    };

    var svg = d3.select('body')
        .append('svg')
        .attr('width', width + (2 * margin))
        .attr('height', height + (2 * margin));

    var x = d3.time.scale()
        .domain([days[0].Date.toDate(), days[days.length - 1].Date.toDate()])
        .range([0, width]);

    var y = d3.scale.linear()
        .domain([0, 24])
        .range([0, height]);


    var yAxis = d3.svg.axis()
        .scale(y)
        .ticks(24)
        .tickSize(-width, 0)
        .tickFormat(v => {
            if (v < 5 || v > 22) return '';
            else return v.toString();
        })
        .tickPadding(axisLabelPaddingY)
        .orient('left');

    var xAxis = d3.svg.axis()
        .scale(x)
        .ticks(12)
        .tickSize(-height, 0)
        .tickPadding(axisLabelPaddingX)
        .tickFormat(d3.time.format('%b'))
        .orient('bottom');

    var group = svg.append("g")
        .attr('transform', 'translate(' + margin + ',' + margin + ')');

    //Background
    var background = group.append("rect")
        .attr("width", width)
        .attr("height", height)
        .style("fill", colours.day);

    var areas: Area[] = [
        { Name: 'NightAm', Bottom: d => 0, Top: d => d.DawnHour, Colour: colours.night },
        { Name: 'Dawn', Bottom: d => d.DawnHour, Top: d => d.SunriseHour, Colour: colours.twilight },
        { Name: 'Dusk',Bottom: d => d.SunsetHour, Top: d => d.DuskHour, Colour: colours.twilight },
        { Name: 'NightPm', Bottom: d => d.DuskHour, Top: d => 24, Colour: colours.night },
    ];

    //var layers = areas.map(area => {
    //    return {
    //        name: area.Name,
    //        values: days.map(day => {
    //            return {
    //                x: day.Date.toDate(),
    //                y: area.Top(day)
    //            };
    //        })
    //    };
    //});

    //var stack = d3.layout.stack()
    //    .x((d: Date) => x(d))
    //    .y((d: number) => y(d))
    //    .offset('zero');

    //group.data(stack(layers));

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


    axisGroup.append('g').call(yAxis);
    axisGroup.append('g').call(xAxis)
        .attr('transform', 'translate(0, ' + height + ')');

    axisGroup
        .selectAll('line')
        .style('stroke', 'lightgray')
        .style('stroke-width', '1px');



    fs.writeFile(filepath, d3.select('body').html(), error => {
        if (error) deferred.reject(error);
        else deferred.resolve(filepath);
    });

    return deferred.promise;
}
