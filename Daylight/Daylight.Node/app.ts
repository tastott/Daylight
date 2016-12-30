"use strict"

var SunCalc = require('suncalc');
import _ = require('underscore');
import moment = require('moment');
import exCsv = require('./export-csv');
import exSvg = require('./export-vector');
import {Transitions, Daylight} from './daylight';
import open = require('open');
import yargs = require("yargs");

function WithDaylightOptions(args: yargs.Yargs): yargs.Yargs {
    return args
        .option("lat", {
                alias: "latitude",
                type: "number",
                required: true
            })
            .option("lng", {
                alias: "longitude",
                type: "number",
                required: true
            })
            .option("from", {
                alias: "fromDate",
                type: "string",
                desc: "First date for which to output daylight data in YYYYMMDD format. Defaults to today."
            })
            .option("to", {
                alias: "toDate",
                type: "string",
                desc: "Last date for which to output daylight data in YYYYMMDD format. Defaults to one year from From Date."
            });
}

function ParseDaylightParams(argv: yargs.Argv): DaylightParameters {
    const startDate = argv["from"]
        ? moment(argv["from"], "YYYYMMDD")
        : moment(); //today
    const endDate = argv["to"]
        ? moment(argv["to"], "YYYYMMDD")
        : startDate.clone().add({years: 1, days: -1});

    return {
        latitude: argv["lat"], 
        longitude: argv["lng"], 
        startDate: startDate, 
        endDate: endDate
    };
}

const argv = yargs
    .command("csv", "Create a csv file", 
        csvYargs => WithDaylightOptions(csvYargs)
             .option("out", {
                alias: "output",
                required: true
            }),
        csvArgv => {
            const daylightParams = ParseDaylightParams(csvArgv);
            ExportToCsv(daylightParams, csvArgv["out"]);
        }
    )
    .command("vector", "Create a vector image file", 
        vectorArgs => WithDaylightOptions(vectorArgs)
             .option("out", {
                alias: "output",
                required: true
            })
            .option("width", {
                type: "number",
                default: 1024
            })
            .option("height", {
                type: "number",
                default: 768
            })
            ,
        vectorArgs => {
            const daylightParams = ParseDaylightParams(vectorArgs);
            ExportToSvg(daylightParams, vectorArgs["width"], vectorArgs["height"], vectorArgs["out"]);
        }
    )
    .argv;

function hoursContinuous(date: Date): number {
    var mom = moment(date);
    return mom.diff(mom.clone().startOf('day'), 'hours', true);
}


interface DaylightParameters {
    startDate: moment.Moment, 
    endDate: moment.Moment, 
    latitude: number,
    longitude: number 
}

function SanitizeDates(params: DaylightParameters): DaylightParameters {
    return {
        latitude: params.latitude,
        longitude: params.longitude,
        startDate: params.startDate.clone().startOf("day"),
        endDate: params.endDate.clone().startOf("day")
    }
}

//var startDate = moment({ year: 2015, month: 9, day: 25 })
//var endDate = moment({year: 2016, month:2, day: 26});
function GenerateDaylightData(params: DaylightParameters
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

function ExportToCsv(daylightParams: DaylightParameters, outputFile: string): void{
    const data = GenerateDaylightData(daylightParams);
    exCsv.ExportToCsv(data, outputFile)
        .done();
}

function ExportToSvg(daylightParams: DaylightParameters, 
    width: number,
    height: number,
    outputFile: string
): void {
    const data = GenerateDaylightData(daylightParams);

    let title = `${Math.abs(daylightParams.latitude).toFixed(3)}°${daylightParams.latitude < 0 ? 'S' : 'N'}, ${Math.abs(daylightParams.longitude).toFixed(3)}°${daylightParams.longitude < 0 ? 'W' : 'E'}`;
    exSvg.ExportToSvg(data, width, height, title, outputFile)
    //exSvg.TestSvg('test.svg')
        .then(imagePath => {
            open(imagePath);
        })
        .fail(error => {
            console.log('Error while exporting to image: ' + error);
        })
        .done();


}

