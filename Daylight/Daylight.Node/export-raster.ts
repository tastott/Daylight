import dl = require('./daylight');
var lwip = require('lwip');
import q = require('q');
import _ = require('underscore');

function GetColor(day: dl.Daylight, hour: number) {
    if (hour < day.DawnHour || hour > day.DuskHour) {
        return 'black';
    } else if (hour < day.SunriseHour || hour > day.SunsetHour) {
        return 'gray';
    } else {
        return 'white';
    }
}

export function ExportToImage(days: dl.Daylight[],
    imagePath: string,
    pixelsPerHour: number,
    pixelsPerDay : number): q.Promise<string> {

    var deferred = q.defer<string>();

    lwip.create(pixelsPerHour * 24, pixelsPerDay * days.length, (err, image) => {
        if (err) deferred.reject(err);
        else {

            var imageBatch = image.batch();

            for (var day = 0; day < days.length; day++) {
                for (var dayPixel = 0; dayPixel < pixelsPerDay; dayPixel++) {
                    for (var hour = 0; hour < 23; hour++) {
                        for (var hourPixel = 0; hourPixel < pixelsPerHour; hourPixel++) {

                            var partialHour = hour + (hourPixel / pixelsPerHour);
                            var color = GetColor(days[day], partialHour);
                            imageBatch = imageBatch.setPixel((hour * pixelsPerHour) + hourPixel,
                                            (day * pixelsPerDay) + dayPixel,
                                            color);
                                
                        }
                    }
                }
            }

            imageBatch = imageBatch.blur(2);

            imageBatch.writeFile(imagePath, err => {
                if (err) deferred.reject(err);
                else deferred.resolve(imagePath);
            });        
        }
    });


    return deferred.promise;
}
