var SunCalc = require('suncalc');
import _ = require('underscore');
import moment = require('moment');
import exCsv = require('./export-csv');
import exSvg = require('./export-vector');
import {Transition, Daylight} from './daylight';
import open = require('open');

function hoursContinuous(date: Date): number {
    var mom = moment(date);
    return mom.diff(mom.clone().startOf('day'), 'hours', true);
}

var latitude = 51.606;
var longitude = -1.241;

var startDate = moment({ year: 2014, month: 11, day: 21 });
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
                [Transition.Dawn]: hoursContinuous(times.dawn),
                [Transition.Sunrise]: hoursContinuous(times.sunrise),
                [Transition.Sunset]: hoursContinuous(times.sunset),
                [Transition.Dusk]: hoursContinuous(times.dusk)
            }
        };
    });


exSvg.ExportToSvg(days, 1024, 768, '51.606°N, 1.241°W', 'daylight.svg')
//exSvg.TestSvg('test.svg')
    .then(imagePath => {
        open(imagePath);
    })
    .fail(error => {
        console.log('Error while exporting to image: ' + error);
    });


