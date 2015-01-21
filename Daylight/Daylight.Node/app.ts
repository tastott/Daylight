﻿var SunCalc = require('suncalc');
var Csv = require('csv-stringify');
import _ = require('underscore');
import moment = require('moment');
import fs = require('fs');

function hoursContinuous(date: moment.Moment) {
    return date.diff(date.clone().startOf('day'), 'hours', true);
}

var latitude = 51.606;
var longitude = -1.241;

var startDate = moment({ year: 2014, month: 11, day: 21 });
var dayCount = 365;

var csvFilePath = 'daylight.csv';

var days = _.range(dayCount - 1).map(day => {
    var date = startDate.clone().add(day, 'days');
    var times = SunCalc.getTimes(date, latitude, longitude);
    return {
        Date: date,
        Dawn: moment(times.dawn),
        Sunrise: moment(times.sunrise),
        Sunset: moment(times.sunset),
        Dusk: moment(times.dusk)
    };
});

var daysForCsv = days.map(d => {
    return {
        Date: d.Date.format('YYYYMMDD'),
        Dawn: hoursContinuous(d.Dawn),
        Sunrise: hoursContinuous(d.Sunrise),
        Sunset: hoursContinuous(d.Sunset),
        Dusk: hoursContinuous(d.Dusk)
    };
});

//var stringifier = Csv();
Csv(daysForCsv, { header: true, rowDelimiter: 'windows' }, (err, value) => {
    fs.writeFile(csvFilePath, value, err => {
        //console.log(value);
    }); 
});




