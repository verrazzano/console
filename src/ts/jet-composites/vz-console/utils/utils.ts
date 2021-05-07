// Copyright (c) 2020, 2021, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import * as ko from "knockout";
import { Status } from "vz-console/service/types";
import CoreRouter = require("ojs/ojcorerouter");
import Context = require("ojs/ojcontext");

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

/*
 * JET 9 does not set the aria-labelledby attribute on oj-paging-control properly.
 * Instead of "navigation_mypagingcontrolid_oj_pgCtrl_acc_label" it should be
 * "mypagingcontrolid_oj_pgCtrl_acc_label".
 *
 * As a workaround, iterate through oj-paging-controls and strip the leading
 * "navigation_" from the aria-labelledby attribute.
 */
export const cleanupPagingControl = () => {
  const pagingNodes = document.getElementsByTagName("oj-paging-control");
  [].forEach.call(pagingNodes, function (pagingNode) {
    console.log(pagingNode);
    const ARIA_LABELLEDBY = "aria-labelledby";

    var busyContext = Context.getContext(pagingNode).getBusyContext();

    busyContext.whenReady().then(function () {
      var node = pagingNode.querySelector("div.oj-pagingcontrol-content");
      var labelledBy = node.getAttribute(ARIA_LABELLEDBY);
      labelledBy = labelledBy.replace("navigation_", "");
      node.setAttribute(ARIA_LABELLEDBY, labelledBy);
    });
  });
};
