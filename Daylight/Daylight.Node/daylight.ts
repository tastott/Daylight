import moment = require('moment');

export interface Daylight {
    Date: moment.Moment;
    DawnDate: moment.Moment;
    SunriseDate: moment.Moment;
    SunsetDate: moment.Moment;
    DuskDate: moment.Moment;
    DawnHour: number;
    SunriseHour: number;
    SunsetHour: number;
    DuskHour: number;
}