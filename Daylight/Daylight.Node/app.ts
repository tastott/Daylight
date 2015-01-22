var SunCalc = require('suncalc');
import _ = require('underscore');
import moment = require('moment');
import exCsv = require('./export-csv');
import exImg = require('./export-image');
var lwip = require('lwip');
import dl = require('./daylight');
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

var days: dl.Daylight[] = _.range(dayCount - 1)
    .map(day => {
        var date = startDate.clone().add(day, 'days');
        var times = SunCalc.getTimes(date, latitude, longitude);
        return {
            Date: date,
            DawnDate: moment(times.dawn),
            SunriseDate: moment(times.sunrise),
            SunsetDate: moment(times.sunset),
            DuskDate: moment(times.dusk),
            DawnHour: hoursContinuous(times.dawn),
            SunriseHour: hoursContinuous(times.sunrise),
            SunsetHour: hoursContinuous(times.sunset),
            DuskHour: hoursContinuous(times.dusk)
        };
    });


exImg.ExportToImage(days, 'daylight.png', 8, 2)
    .then(imagePath => {
        open(imagePath);
    })
    .fail(error => {
        console.log('Error while exporting to image: ' + error);
    });


