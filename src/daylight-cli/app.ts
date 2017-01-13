"use strict"

import _ = require('underscore');
import moment = require('moment');
import exCsv = require('./export-csv');
import exSvg = require('./export-vector');
import {Transitions, Daylight, DaylightParameters} from 'daylight/models';
import open = require('open');
import yargs = require("yargs");
import {GenerateDaylightData} from "daylight/daylight-data";

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

console.log("Complete");

//var startDate = moment({ year: 2015, month: 9, day: 25 })
//var endDate = moment({year: 2016, month:2, day: 26});


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
    exSvg.ExportToSvgSafe(data, width, height, title, outputFile, true)
    //exSvg.TestSvg('test.svg')
        .then(imagePath => {
            open(imagePath);
        })
        .fail(error => {
            console.log('Error while exporting to image: ' + error);
        })
        .done();


}

