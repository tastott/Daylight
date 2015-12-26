"use strict"

var SunCalc = require('suncalc');
import _ = require('underscore');
import moment = require('moment');
import exCsv = require('./export-csv');
import exSvg = require('./export-vector');
import {Transitions, Daylight} from './daylight';
import open = require('open');

function hoursContinuous(date: Date): number {
    var mom = moment(date);
    return mom.diff(mom.clone().startOf('day'), 'hours', true);
}

var latitude = 51.606;
var longitude = -1.241;

var startDate = moment({ year: 2015, month: 11, day: 21 });
var dayCount = 365;

var csvFilePath = 'daylight.csv';

var days: Daylight[] = _.range(dayCount - 1)
    .map(day => {
        var date = startDate.clone().add(day, 'days');
        var times = SunCalc.getTimes(date, latitude, longitude);
        return {
            Date: date,
            DawnDate: moment(times.dawn),
            SunriseDate: moment(times.sunrise),
            SunsetDate: moment(times.sunset),
            DuskDate: moment(times.dusk),
            Transitions: <any>{
                [Transitions.Dawn.Name]: hoursContinuous(times.dawn),
                [Transitions.Sunrise.Name]: hoursContinuous(times.sunrise),
                [Transitions.Sunset.Name]: hoursContinuous(times.sunset),
                [Transitions.Dusk.Name]: hoursContinuous(times.dusk)
            }
        };
    });

let title = `${Math.abs(latitude).toFixed(3)}°${latitude < 0 ? 'S' : 'N'}, ${Math.abs(longitude).toFixed(3)}°${longitude < 0 ? 'W' : 'E'}`;
exSvg.ExportToSvg(days, 1024, 768, title, 'daylight.svg')
//exSvg.TestSvg('test.svg')
    .then(imagePath => {
        open(imagePath);
    })
    .fail(error => {
        console.log('Error while exporting to image: ' + error);
    });


