import dl = require('daylight');
import q = require('q');
import jsdom = require('jsdom');
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

    var colours = {
        night: 'black',
        day: 'white',
        twilight: 'gray'
    };

    var svg = d3.select('body')
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    var x = d3.time.scale()
        .domain([days[0].Date.toDate(), days[days.length - 1].Date.toDate()])
        .range([0, width]);

    var y = d3.scale.linear()
        .domain([0, 24])
        .range([0, height]);

    var group = svg.append("g");

    //Background
    var background = group.append("rect")
        .attr("width", width)
        .attr("height", height)
        .style("fill", colours.day);

    var areas: Area[] = [
        { Name: 'MorningNight', Bottom: d => 0, Top: d => d.DawnHour, Colour: colours.night },
        { Name: 'Dawn', Bottom: d => d.DawnHour, Top: d => d.SunriseHour, Colour: colours.twilight },
        //{ Bottom: d => d.SunsetHour, Top: d => d.DuskHour, Colour: colours.twilight },
        //{ Bottom: d => d.DuskHour, Top: d => height, Colour: colours.night },
    ];

    var layers = areas.map(area => {
        return {
            name: area.Name,
            values: days.map(day => {
                return {
                    x: day.Date.toDate(),
                    y: area.Top(day)
                };
            })
        };
    });

    var stack = d3.layout.stack()
        .x((d: Date) => x(d))
        .y((d: number) => y(d))
        .offset('zero');

    group.data(stack(layers));

    //areas.forEach(area => {
    //    group.append("path")
    //        .attr("d", d3.svg.area()
    //            .x((d: dl.Daylight) => x(d.Date.toDate()))
    //            .y0((d: dl.Daylight) => x(area.Bottom(d)))
    //            .y1((d: dl.Daylight) => y(area.Top(d)))
    //            .interpolate('linear')(days)
    //        )
    //        .attr("fill", area.Colour);
    //});


    fs.writeFile(filepath, d3.select('body').html(), error => {
        if (error) deferred.reject(error);
        else deferred.resolve(filepath);
    });

    return deferred.promise;
}
