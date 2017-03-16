import * as React from 'react';
import rfd = require("react-faux-dom");
import {InsertSvg} from "daylight/vector-chart"
import {GenerateDaylightData} from "daylight/daylight-data"
import moment = require("moment");
import d3 = require("d3");

interface IVizProps extends React.Props<any> {
    latitude: number;
    longitude: number;
};

export default function Viz({
  latitude,
  longitude
}: IVizProps) {

    const container = rfd.createElement('div');
    const daylightData = GenerateDaylightData({
        startDate: moment({year: 2016, month: 11, day: 21}),
        endDate: moment({year: 2017, month: 11, day: 20}),
        latitude: latitude,
        longitude: longitude
    });

    InsertSvg(daylightData, d3.select(container), 600, 400, "Test");

    return container.toReact();
}
