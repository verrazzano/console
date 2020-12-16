// Copyright (c) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

// eslint-disable-next-line import/no-webpack-loader-syntax
import * as allApps from "text!./apps.json";
// eslint-disable-next-line import/no-webpack-loader-syntax
import * as allComponents from "text!./components.json";

export const getOamApplications = (): string => {
  return JSON.stringify(JSON.parse(allApps).items);
};

export const getOamComponents = (): string => {
  return JSON.stringify(JSON.parse(allComponents).items);
};
