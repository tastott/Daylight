import moment = require('moment');

export enum Transition {
    Dawn,
    Sunrise,
    Sunset,
    Dusk
}

export interface Daylight {
    Date: moment.Moment;
    DawnDate: moment.Moment;
    SunriseDate: moment.Moment;
    SunsetDate: moment.Moment;
    DuskDate: moment.Moment;
    Transitions: {
        [key: number]: number
    };
}