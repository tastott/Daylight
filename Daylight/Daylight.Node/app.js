var SunCalc = require('suncalc');
var _ = require('underscore');

var latitude = 51.606;
var longitude = -1.241;

var startDate = new Date(2014, 11, 21);
var dayCount = 365;

var days = _.range(dayCount - 1).map(function (day) {
    var date = new Date(startDate.getTime() + day * 24 * 60 * 60 * 1000);
    var times = SunCalc.getTimes(date, latitude, longitude);
    return {
        Date: date,
        Dawn: times.dawn,
        Sunrise: times.sunrise,
        Sunset: times.sunset,
        Dusk: times.dusk
    };
});

console.log(days);

console.log();
//# sourceMappingURL=app.js.map
