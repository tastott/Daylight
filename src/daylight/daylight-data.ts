declare const require: any;
import {Daylight, DaylightParameters, Transitions} from "./models";
import _ = require("underscore");
const SunCalc = require("suncalc");

function SanitizeDates(params: DaylightParameters): DaylightParameters {
    return {
        latitude: params.latitude,
        longitude: params.longitude,
        startDate: params.startDate.clone().startOf("day"),
        endDate: params.endDate.clone().startOf("day")
    }
}


function hoursContinuous(date: Date): number {
    var mom = moment(date);
    return mom.diff(mom.clone().startOf('day'), 'hours', true);
}


export function GenerateDaylightData(params: DaylightParameters
): Daylight[] {

    params = SanitizeDates(params);
    const dayCount = params.endDate.diff(params.startDate, 'day')+1;


    const days: Daylight[] = _.range(dayCount - 1)
        .map(day => {
            var date = params.startDate.clone().add(day, 'days');
            var times = SunCalc.getTimes(date.toDate(), params.latitude, params.longitude);
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
    return days;
}