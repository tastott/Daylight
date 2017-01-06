"use strict"

import {Transition, Transitions, Daylight, DaylightState} from 'daylight/models';
import {InsertSvg} from "daylight/vector-chart";
import q = require('q');
import fs = require('fs');
import d3 = require('d3');
import _ = require('underscore');


export function ExportToSvgSafe(days: Daylight[],
    width: number,
    height: number,
    title : string,
    filepath: string,
    includeMargin: boolean
): Q.Promise<string> {

    return q(true)
        .then(() => ExportToSvg(days, width, height, title, filepath, includeMargin));
}

export function ExportToSvg(days: Daylight[],
    width: number,
    height: number,
    title : string,
    filepath: string,
    includeMargin?: boolean,
    labelsOutside?: boolean
): Q.Promise<string> {

    
    const document = require('jsdom').jsdom();
    
    return InsertSvg(days, d3.select(document.body), width, height, title, includeMargin, labelsOutside)
        .then(() => {
            return saveD3ToSvg(d3.select(document.body), filepath); 
        });
}


function saveD3ToSvg(selection: d3.Selection, filepath: string): Q.Promise<string> {

    var deferred = q.defer<string>();

    var html = selection.html();
    html = html.replace(/lineargradient/g, 'linearGradient');

    fs.writeFile(filepath, html, error => {
        if (error) deferred.reject(error);
        else deferred.resolve(filepath);
    });

    return deferred.promise;
}