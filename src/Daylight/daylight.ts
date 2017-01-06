import moment = require('moment');

export enum DaylightState {
    Night,
    Twilight,
    Day
}

export interface Transition {
    Name: string;
    From: DaylightState;
    To: DaylightState;
}

export var Transitions = {
    Dawn: {Name: 'Dawn', From: DaylightState.Night, To: DaylightState.Twilight},
    Sunrise: {Name: 'Sunrise' ,From: DaylightState.Twilight, To: DaylightState.Day},
    Sunset: {Name: 'Sunset', From: DaylightState.Day, To: DaylightState.Twilight},
    Dusk: {Name: 'Dusk', From: DaylightState.Twilight, To: DaylightState.Night}
}


export interface Daylight {
    Date: moment.Moment;
    DawnDate: moment.Moment;
    SunriseDate: moment.Moment;
    SunsetDate: moment.Moment;
    DuskDate: moment.Moment;
    Transitions: {
        [key: string]: number
    };
}