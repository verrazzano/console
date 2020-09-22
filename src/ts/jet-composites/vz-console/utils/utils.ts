// Copyright (c) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import CoreRouter = require('ojs/ojcorerouter');
import * as ko from "knockout";

export const getQueryParam = (paramName: string): string => {
    let paramValue = ""
    const search = document.location.search
    ? document.location.search.substring(1)
    : "";
    search.split("&").forEach(function(param) {
        var pair = param.split("=");
        if(pair[0] === paramName) {
            paramValue = pair[1]
        }
    });
    return paramValue;
};

export const getDefaultRouter = (): CoreRouter => {
    return ko.dataFor(document.getElementById("globalBody")).router;
};

export const isIterable = object =>
  object != null && typeof object[Symbol.iterator] === 'function'
