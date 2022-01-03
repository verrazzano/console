// Copyright (c) 2020, 2021, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import * as ko from "knockout";
import { Status } from "vz-console/service/types";
import CoreRouter = require("ojs/ojcorerouter");

export const getQueryParam = (paramName: string): string => {
  let paramValue = "";
  const search = document.location.search
    ? document.location.search.substring(1)
    : "";
  search.split("&").forEach(function (param) {
    var pair = param.split("=");
    if (pair[0] === paramName) {
      paramValue = pair[1];
    }
  });
  return paramValue;
};

export const getDefaultRouter = (): CoreRouter => {
  return ko.dataFor(document.getElementById("globalBody")).router;
};

export const isIterable = (object) =>
  object != null && typeof object[Symbol.iterator] === "function";

export const getStatusForOAMResource = (resourceStatus: string): string => {
  let status = Status.Pending;
  switch (resourceStatus) {
    case "True":
      status = Status.Running;
      break;
    case "False":
      status = Status.Terminated;
      break;
  }
  return status;
};

export const getStatusStateForCluster = (resourceStatus: string): string => {
  let status = Status.Pending;
  switch (resourceStatus) {
    case "Active":
      status = Status.Active;
      break;
    case "Inactive":
      status = Status.Inactive;
      break;
  }
  return status;
};

export const filtersEqual = (
  leftFilter: Element,
  rightFilter: Element
): boolean => {
  interface KeyedElement<T = any> {
    [key: string]: T;
  }

  if (leftFilter && rightFilter) {
    var leftKey = leftFilter !== null ? (leftFilter as KeyedElement).key : null;
    var rightKey =
      rightFilter !== null ? (rightFilter as KeyedElement).key : null;

    return leftKey === rightKey;
  }

  return false;
};
