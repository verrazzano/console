// eslint-disable-next-line import/no-webpack-loader-syntax
import * as allApps from "text!./apps.json";
// eslint-disable-next-line import/no-webpack-loader-syntax
import * as allComponents from "text!./components.json";

export const getOamApplications = (): string => {
  console.log(JSON.stringify(JSON.parse(allApps).items));
  return JSON.stringify(JSON.parse(allApps).items);
};

export const getOamComponents = (): string => {
  console.log(JSON.stringify(JSON.parse(allComponents).items));
  return JSON.stringify(JSON.parse(allComponents).items);
};
