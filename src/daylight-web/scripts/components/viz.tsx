import * as React from 'react';
import rfd = require("react-faux-dom");
import {InsertSvg} from "daylight/vector-chart"
import {GenerateDaylightData} from "daylight/daylight-data"
import moment = require("moment");
import d3 = require("d3");
import {Parameters} from "../shared/models/parameter";

interface IVizProps extends React.Props<any> {
    DataParameters: Readonly<Parameters>;
};

export default function Viz({
  DataParameters
}: IVizProps) {

    const container = rfd.createElement('div');
    const daylightData = GenerateDaylightData({
        startDate: moment({year: 2016, month: 11, day: 21}),
        endDate: moment({year: 2017, month: 11, day: 20}),
        latitude: DataParameters["Latitude"].value,
        longitude: DataParameters["Longitude"].value
    });

    InsertSvg(daylightData, d3.select(container), 800, 600, "Test");

    return container.toReact();
}
