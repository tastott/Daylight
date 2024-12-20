﻿"use strict"

import {Transition, Transitions, Daylight, DaylightState} from './models';
import {Promise} from "es6-promise";
import d3 = require('d3');
import _ = require('underscore');


interface Area {
    Name: string;
    Bottom: (daylight: Daylight) => number;
    Top: (daylight: Daylight) => number;
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

export function InsertSvg(days: Daylight[],
    container: D3.Selection | string,
    width: number,
    height: number,
    title : string,
    includeMargin?: boolean,
    labelsOutside?: boolean
): Promise<boolean> {
    
    const d3Container = typeof container === "string"
        ? d3.select(container)
        : container;

    const baseWidth = 1024;
    const baseHeight = 768;

    const margin = includeMargin
        ? 8 * (width / baseWidth)
        : 0;

    const axisOffset = includeMargin && labelsOutside
        ? 0
        : 24 * (width / baseWidth);

    const _innerWidth = includeMargin
        ? Math.floor(width - (margin * 2))
        : width;

    const _innerHeight = includeMargin
        ? Math.floor(height - (margin * 2))
        : height;

    const axisLabelPaddingX = 16 * (height / baseHeight);
    const axisLabelPaddingY = 4 * (width / baseWidth);
    const titleMargin = 16 * (height/baseHeight);
    const titleSize = 64 * (width/baseWidth);
    const lineWidth = Math.max(1, Math.floor(width / baseWidth));
    const labelSize = 14 * Math.max(1, Math.floor(width/baseWidth));

    const colours: ColourSet = {};
    colours[Colour.Night] = d3.rgb('#0B0B3B');
    colours[Colour.Day] = d3.rgb('#F4FA58');
    colours[Colour.Title] = colours[Colour.Day];
    colours[Colour.Twilight] = d3.interpolateRgb(colours[Colour.Night], colours[Colour.Day])(0.5);
    colours[Colour.AxisTicks] = colours[Colour.Day];

    const svg = d3Container
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    const x = d3.time.scale()
        .domain([days[0].Date.toDate(), days[days.length - 1].Date.toDate()])
        .range([0, _innerWidth]);

    const y = d3.scale.linear()
        .domain([0, 24])
        .range([0, _innerHeight]);


    const yAxes = [
        d3.svg.axis()
            .orient('left')
            .tickSize(-_innerWidth, 0),
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

    const xAxes = [
        d3.svg.axis()
            .orient('top')
            .tickSize(0)
            .tickPadding(axisLabelPaddingY),
        d3.svg.axis()
            .orient('bottom')
            .tickSize(-_innerHeight, 0)
            .tickPadding(axisLabelPaddingX)
    ];

    xAxes.forEach(xAxis =>
        xAxis.scale(x)
            .ticks(12)
            .tickFormat(d3.time.format('%b'))
    );
        

    const group = svg.append("g")
        .attr('transform', 'translate(' + margin + ',' + margin + ')');

    //Background
    const background = group.append("rect")
        .attr("width", _innerWidth)
        .attr("height", _innerHeight)
        .style("fill", colours[Colour.Day]);

    const areas: Area[] = [
        { Name: 'NightAm', Bottom: d => 0, Top: d => d.Transitions[Transitions.Dawn.Name], Colour: colours[Colour.Night] },
        { Name: 'Dawn', Bottom: d => d.Transitions[Transitions.Dawn.Name], Top: d => d.Transitions[Transitions.Sunrise.Name], Colour: colours[Colour.Twilight] },
        { Name: 'Dusk', Bottom: d => d.Transitions[Transitions.Sunset.Name], Top: d => d.Transitions[Transitions.Dusk.Name], Colour: colours[Colour.Twilight] },
        { Name: 'NightPm', Bottom: d => d.Transitions[Transitions.Dusk.Name], Top: d => 24, Colour: colours[Colour.Night] },
    ];

    areas.forEach(area => {
        group.append("path")
            .attr("d", d3.svg.area()
                .x((d: Daylight) => x(d.Date.toDate()))
                .y0((d: Daylight) => y(area.Bottom(d)))
                .y1((d: Daylight) => y(area.Top(d)))
                .interpolate('linear')(days)
            )
            .attr("fill", area.Colour);
    });




    const axisGroup = svg.append("g")
        .attr('transform', `translate(${margin},${margin})`);


    const hourAxisGroup = axisGroup.append('g')
        .call(yAxes[0])
        .attr('transform', `translate(${axisOffset}, 0)`);

    axisGroup.append('g').call(yAxes[1])
        .attr('transform', `translate(${_innerWidth - axisOffset}, 0)`);

    axisGroup.append('g').call(xAxes[0])
        .attr('transform', `translate(0, ${axisOffset})`);

    const dateAxisGroup = axisGroup.append('g').call(xAxes[1])
        .attr('transform', `translate(0, ${_innerHeight - axisOffset})`);

    const defs = svg.append('defs');

   
    axisGroup
        .selectAll('line')
        //.style('stroke', colours[Colour.AxisTicks].toString())
        //.style('stroke', 'url(#line-gradient)')
        .style('stroke-width', `${lineWidth}px`)
     axisGroup
        .style('font-size', `${labelSize}px`)
        .attr('fill', colours[Colour.Twilight])


    const daylightByDate = _.indexBy(days, day => day.Date.valueOf());

    setDateLineGradients(defs, dateAxisGroup, colours, date => {
        return daylightByDate[date.valueOf()]
    });
    setHourLineGradients(defs, 
        hourAxisGroup, 
        colours, 
        days
    );
   
    
  //  setHourLineColors(defs, hourAxisGroup, colours);

    svg.append('text')
        .attr('x', margin + ((_innerWidth - (titleSize * 10)) / 2))
        .attr('y', margin + titleSize + ((_innerHeight - titleSize) / 2))
        .attr('fill', colours[Colour.Night])
        .attr('font-size', titleSize + 'px')
        .text(title);
        

    return Promise.resolve(true);
}

function *getIntersections(days: Daylight[], transition: Transition, hour: number){
        
    let previous: number = null;
    for(let i = 0; i < days.length; i++){
        let current = days[i].Transitions[transition.Name];
        if(previous != null){
            if(previous < hour && current >= hour) yield i;
            else if(previous > hour && current < hour) yield i;
        }
        previous = current;
    }
}

function *getAllIntersections(days: Daylight[], hour: number){
    for(let t of [
        Transitions.Dawn,
        Transitions.Sunrise,
        Transitions.Sunset,
        Transitions.Dusk
    ]){
        for(let i of getIntersections(days, t, hour)){
            yield {
                Day: i,
                Transition: t
            }
        }   
    }
}

interface DaylightIntersection {
    Transition: Transition;
    Day: number;
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

function getStateAtHour(day: Daylight, hour:number): DaylightState {
    if(hour < day.Transitions[Transitions.Dawn.Name]) return DaylightState.Night;
    else if(hour < day.Transitions[Transitions.Sunrise.Name]) return DaylightState.Twilight;
    else if(hour < day.Transitions[Transitions.Sunset.Name]) return DaylightState.Day;
    else if(hour < day.Transitions[Transitions.Dusk.Name]) return DaylightState.Twilight;
    else return DaylightState.Night;
}

function *getTwilights(sequence: IterableIterator<{Start: number; End: number; State: DaylightState}>, 
    margin: number,
    end: number) {
    let dict = new Map<number,DaylightState>();
    
    for(let item of sequence){
        if(item.State == DaylightState.Twilight){
            _.range(Math.max(0, item.Start-margin), Math.min(item.End+margin, end))
                .forEach(day => {
                    dict.set(day, item.State)
                })
        }
        else {
            _.range(item.Start, item.End)
                .forEach(day => {
                    if(!dict.has(day)) dict.set(day, item.State)
                })
        }
    }
    
    let previous = dict.get(0);
    let start = 0;
    let beforeTwilight: DaylightState;
    
    for(let day = 1; day <= end; day++){
        let current = dict.get(day);
        if(previous != current){
            if(current == DaylightState.Twilight){
                beforeTwilight = previous;
                start = day;
            }
            else if(previous == DaylightState.Twilight){
                yield {
                    Start: start,
                    End: day-1,
                    Before: beforeTwilight,
                    After: current
                }
            }
            previous = current;
        }
    }
    
    if(previous == DaylightState.Twilight){
        yield {
            Start: start,
            End: end,
            Before: beforeTwilight,
            After: null
        }
    }
}

function *getStateSequence(days: Daylight[], hour: number) {
    let state = getStateAtHour(days[0], hour);
    let start = 0;
    
    let intersections = Array.from(getAllIntersections(days, hour))
        .sort((a,b) => a.Day - b.Day);
        
    for(let x = 0; x < intersections.length;x++){
        let i = intersections[x];    
        let newState: DaylightState;
        if(i.Transition.From == state) {
            newState = i.Transition.To;
        }
        else if(i.Transition.To == state){
            newState = i.Transition.From;
        }
        else {
            //Fudge alert: this happens if intersections with more than one transition coincide (e.g. because of a "jump")
            //and the transitions are in the wrong orders#.
            //To account for this, we'll try to find a subsequent intersection at the same time and swap it with this one
            if(intersections[x+1] && intersections[x+1].Day == i.Day
                && (intersections[x+1].Transition.From == state
                 || intersections[x+1].Transition.To == state)){
                     let temp = intersections[x];
                     intersections[x] = intersections[x+1];
                     intersections[x+1] = temp;
                     --x;
                     continue;
                 }
                 else throw new Error(`Invalid transition for hour ${hour} at day ${i.Day}. Current state: ${DaylightState[state]}. Transition: ${i.Transition.Name}`);
        }
        
        yield {
            Start: start,
            End: i.Day - 1,
            State: state
        };
        
        state = newState;
        start = i.Day;
    }
    
    yield {
        Start: start,
        End: days.length -1,
        State: state
    }
    
    
}
// 
// function *getTwilights(days: Daylight[], hour: number) {
//     let start: number;
//     let fromDay: boolean;
//     let previous: DaylightState = null;
//     
//     for(let s of getStateSequence(days, hour)){
//         if(s.State == DaylightState.Twilight){
//             start = s.Day;
//             if(previous === null) {
//                 fromDay = false;
//             }
//             else if(previous === DaylightState.Night){
//                 fromDay = false;
//             }
//             else
//         }
//     }
// }

function setHourLineGradients(defs: D3.Selection,
    lines: D3.Selection,
    colours: ColourSet,
    days: Daylight[]){

    var margin = 25; //Show line within +/- this many days of intersection
    let dayToOffset = (day: number) => (day / 3.65).toFixed(0) + '%';
    
    var getStops = lineEl => {
        let hour: number = lineEl.__data__;
        let stops = [];
        let sequence = getStateSequence(days, hour);
       // console.log(Array.from(sequence));
        let twilights = getTwilights(sequence, margin, days.length-1);
        //console.log(Array.from(twilights))
        for(let t of twilights){
            if(t.Before === t.After){
                let endsColour = t.Before === DaylightState.Day
                    ? colours[Colour.Day]
                    : colours[Colour.Night];
                    
                let midColour = t.Before === DaylightState.Day
                    ? colours[Colour.Night]
                    : colours[Colour.Day];
                    
                stops.push({
                    offset: dayToOffset(t.Start),
                    color: endsColour.toString()
                })
                
                stops.push({
                    offset: dayToOffset(((t.End - t.Start) / 2) + t.Start),
                    color: midColour.toString()
                })
                
                stops.push({
                    offset: dayToOffset(t.End),
                    color: endsColour.toString()
                })
            }
            else {
                let startColour = t.Before === DaylightState.Day
                    ? colours[Colour.Day]
                    : colours[Colour.Night];
                    
                let endColour = t.After === DaylightState.Day
                    ? colours[Colour.Day]
                    : colours[Colour.Night];
                    
                stops.push({
                    offset: dayToOffset(t.Start),
                    color: startColour.toString()
                })
                stops.push({
                    offset: dayToOffset(t.End),
                    color: endColour.toString()
                })
            }
        }
        
        //console.log(stops);
        return stops;
    };

    setLineGradients(defs, lines, getStops, index => 'hour-line-gradient-' + index);    
        
}

function setDateLineGradients(defs: D3.Selection,
    lines: D3.Selection,
    colours : ColourSet,
    getDaylight: (date : Date) => Daylight) {

    var margin = 1.5; //Show line within +/- this many hours of dawn and dusk
    var getStops = lineEl => {
        var daylight = getDaylight(lineEl.__data__);
        return [
            { hour: daylight.Transitions[Transitions.Dusk.Name] + 1, color: colours[Colour.Night] },
            { hour: daylight.Transitions[Transitions.Sunset.Name] - 1, color: colours[Colour.Day] },
            { hour: daylight.Transitions[Transitions.Sunrise.Name] + 1, color: colours[Colour.Day] },
            { hour: daylight.Transitions[Transitions.Dawn.Name] - 1, color: colours[Colour.Night] },
        ].map(oh => {
            return {
                offset: ((24 - oh.hour) / 0.24) + '%',
                color: oh.color.toString()
            };
        });
    };

    setLineGradients(defs, lines, getStops, index => 'date-line-gradient-' + index);
}
