// Copyright (c) 2021, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

// kubectl get applicationconfigurations --all-namespaces -o json > ./src/ts/jet-composites/vz-console/service/apps.json
// eslint-disable-next-line import/no-webpack-loader-syntax
import * as allApps from "text!./apps.json";

// kubectl get components --all-namespaces -o json > ./src/ts/jet-composites/vz-console/service/components.json
// eslint-disable-next-line import/no-webpack-loader-syntax
import * as allComponents from "text!./components.json";

// kubectl get containerizedworkloads --all-namespaces -o json > src/ts/jet-composites/vz-console/service/containerizedworkloads.json
// eslint-disable-next-line import/no-webpack-loader-syntax
import * as allContainerizedWorkloads from "text!./containerizedworkloads.json";

// kubectl get deployments --all-namespaces -o json > src/ts/jet-composites/vz-console/service/deployments.json
// eslint-disable-next-line import/no-webpack-loader-syntax
import * as allDeployments from "text!./deployments.json";

// kubectl get domains --all-namespaces -o json > src/ts/jet-composites/vz-console/service/domains.json
// eslint-disable-next-line import/no-webpack-loader-syntax
import * as allDomains from "text!./domains.json";

// kubectl get healthscopes --all-namespaces -o json > src/ts/jet-composites/vz-console/service/healthscopes.json
// eslint-disable-next-line import/no-webpack-loader-syntax
import * as allHealthScopes from "text!./healthscopes.json";

// kubectl get ingresstraits --all-namespaces -o json > src/ts/jet-composites/vz-console/service/ingresstraits.json
// eslint-disable-next-line import/no-webpack-loader-syntax
import * as allIngressTraits from "text!./ingresstraits.json";

/* 
const allApps = '{"items": []}';
const allComponents = '{"items": []}';
const allContainerizedWorkloads = '{"items": []}';
const allDeployments = '{"items": []}';
const allDomains = '{"items": []}';
const allHealthScopes = '{"items": []}';
const allIngressTraits = '{"items": []}';
*/

export const getOamApplications = (): string => {
  return JSON.stringify(JSON.parse(allApps).items);
};

export const getOamComponents = (): string => {
  return JSON.stringify(JSON.parse(allComponents).items);
};

export const getKubernetesResource = (
  name: string,
  kind: string,
  namespace: string
): string => {
  switch (kind) {
    case "ContainerizedWorkload":
      for (const element of JSON.parse(allContainerizedWorkloads).items) {
        if (
          element.metadata &&
          element.metadata.name === name &&
          element.metadata.namespace === namespace
        ) {
          return JSON.stringify(element);
        }
      }
      break;
    case "Deployment":
      for (const element of JSON.parse(allDeployments).items) {
        if (
          element.metadata &&
          element.metadata.name === name &&
          element.metadata.namespace === namespace
        ) {
          return JSON.stringify(element);
        }
      }
      break;
    case "Domain":
      for (const element of JSON.parse(allDomains).items) {
        if (
          element.metadata &&
          element.metadata.name === name &&
          element.metadata.namespace === namespace
        ) {
          return JSON.stringify(element);
        }
      }
      break;
    case "HealthScope":
      for (const element of JSON.parse(allHealthScopes).items) {
        if (
          element.metadata &&
          element.metadata.name === name &&
          element.metadata.namespace === namespace
        ) {
          return JSON.stringify(element);
        }
      }
      break;
    case "IngressTrait":
      for (const element of JSON.parse(allIngressTraits).items) {
        if (
          element.metadata &&
          element.metadata.name === name &&
          element.metadata.namespace === namespace
        ) {
          return JSON.stringify(element);
        }
      }
      break;
    default:
      return "";
  }
};
