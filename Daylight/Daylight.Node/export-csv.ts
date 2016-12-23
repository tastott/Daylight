import fs = require('fs');
var Csv = require('csv-stringify');
import dl = require('./daylight');
import q = require('q');

export function ExportToCsv(days: dl.Daylight[], csvFilePath: string): q.Promise<string> {

    var deferred = q.defer<string>();

    const data = days.map(day => ({
        Date: day.Date.format("YYYY-MM-DD"),
        CivilSunrise: day.DawnDate.format("HH:mm:ss"),
        Sunrise: day.SunriseDate.format("HH:mm:ss"),
        Sunset: day.SunsetDate.format("HH:mm:ss"),
        CivilSunset: day.DuskDate.format("HH:mm:ss")
    }));

    Csv(data, { header: true, rowDelimiter: 'windows' }, (err, value) => {
        if (err) deferred.reject(err);
        else {
            fs.writeFile(csvFilePath, value, err => {
                if (err) deferred.reject(err);
                else deferred.resolve(csvFilePath);
            });
        }
    });

    return deferred.promise;
}