import {InsertSvg} from "daylight/vector-chart"
import {GenerateDaylightData} from "daylight/daylight-data"
import moment = require("moment");

const daylightData = GenerateDaylightData({
    startDate: moment({year: 2016, month: 11, day: 21}),
    endDate: moment({year: 2017, month: 11, day: 20}),
    latitude: 50,
    longitude: 0
});
InsertSvg(daylightData, "#container", 600, 400, "Test");