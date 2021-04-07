// Copyright (c) 2020, 2021, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

export enum VMIType {
  // eslint-disable-next-line no-unused-vars
  Kibana = "Kibana",
  // eslint-disable-next-line no-unused-vars
  Grafana = "Grafana",
  // eslint-disable-next-line no-unused-vars
  Prometheus = "Prometheus",
  // eslint-disable-next-line no-unused-vars
  ElasticSearch = "Elasticsearch",
}

export enum Status {
  // eslint-disable-next-line no-unused-vars
  Available = "Available",
  // eslint-disable-next-line no-unused-vars
  Ready = "Ready",
  // eslint-disable-next-line no-unused-vars
  Running = "Running",
  // eslint-disable-next-line no-unused-vars
  Terminated = "Terminated",
  // eslint-disable-next-line no-unused-vars
  Any = "Any State",
  // eslint-disable-next-line no-unused-vars
  Bound = "Bound",
  // eslint-disable-next-line no-unused-vars
  Unbound = "Unbound",
  // eslint-disable-next-line no-unused-vars
  Pending = "Pending",
}

export interface FetchApiSignature {
  // eslint-disable-next-line no-undef
  (input: string | Request, init?: RequestInit): Promise<Response>;
}

export interface Instance {
  id: string;
  name: string;
  mgmtCluster: string;
  mgmtPlatform: string;
  status: string;
  version: string;
  profile: string;
  vzApiUri: string;
  rancherUrl?: string;
  keyCloakUrl?: string;
  kibanaUrl?: string;
  grafanaUrl?: string;
  prometheusUrl?: string;
  elasticUrl?: string;
  isUsingSharedVMI?: boolean;
}

export interface VMI {
  id?: string;
  type?: VMIType;
  url?: string;
}

export interface OAMApplication {
  name?: string;
  namespace?: string;
  data?: any;
  status?: Status;
  // eslint-disable-next-line no-use-before-define
  componentInstances?: OAMComponentInstance[];
  createdOn?: string;
  cluster: { name: string };
}

export interface OAMComponent {
  name?: string;
  namespace?: string;
  workloadType?: string;
  latestRevision?: string;
  data?: any;
  applications?: OAMApplication[];
  createdOn?: string;
  cluster: { name: string };
}

export interface OAMTrait {
  name?: string;
  namespace?: string;
  apiVersion: string;
  kind?: string;
  descriptor?: any;
  id?: string;
  traitOpenEventHandler?: () => void;
  traitCloseEventHandler?: () => void;
}

export interface OAMScope {
  name?: string;
  namespace?: string;
  apiVersion: string;
  kind?: string;
  id?: string;
  descriptor?: any;
  scopeOpenEventHandler?: () => void;
  scopeCloseEventHandler?: () => void;
}

export interface OAMParam {
  name?: string;
  value?: string;
  id?: string;
}

export interface OAMComponentInstance {
  name: string;
  status: Status;
  creationDate?: string;
  oamComponent: OAMComponent;
  id?: string;
  eventHandler?: (selectedItem: string, selectedComponent: string) => void;
  data?: any;
  descriptor?: any;
  workloadOpenEventHandler?: () => void;
  workloadCloseEventHandler?: () => void;
  traits?: OAMTrait[];
  scopes?: OAMScope[];
  params?: OAMParam[];
}

export interface OAMComponentParam {
  name?: string;
  description?: string;
  required?: boolean;
  descriptor?: any;
}

export interface ResourceTypeType {
  ApiVersion?: string;
  Kind?: string;
}

export const ResourceType = {
  Deployment: <ResourceTypeType>{
    ApiVersion: "apis/apps/v1",
    Kind: "Deployment",
  },
  VerrazzanoMonitoringInstance: <ResourceTypeType>{
    ApiVersion: "apis/verrazzano.io/v1",
    Kind: "VerrazzanoMonitoringInstance",
  },
  Verrazzano: <ResourceTypeType>{
    ApiVersion: "apis/install.verrazzano.io/v1alpha1",
    Kind: "Verrazzano",
  },
  ApplicationConfiguration: <ResourceTypeType>{
    ApiVersion: "apis/core.oam.dev/v1alpha2",
    Kind: "ApplicationConfiguration",
  },
  Component: <ResourceTypeType>{
    ApiVersion: "apis/core.oam.dev/v1alpha2",
    Kind: "Component",
  },
  Domain: <ResourceTypeType>{
    ApiVersion: "apis/weblogic.oracle/v8",
    Kind: "Domain",
  },
  CohCluster: <ResourceTypeType>{
    ApiVersion: "apis/verrazzano.io/v1beta1",
    Kind: "CohCluster",
  },
  CoherenceCluster: <ResourceTypeType>{
    ApiVersion: "apis/coherence.oracle.com/v1",
    Kind: "CoherenceCluster",
  },
  IngressTrait: <ResourceTypeType>{
    ApiVersion: "apis/oam.verrazzano.io/v1alpha1",
    Kind: "IngressTrait",
  },
  HealthScope: <ResourceTypeType>{
    ApiVersion: "apis/core.oam.dev/v1alpha2",
    Kind: "HealthScope",
  },
  ContainerizedWorkload: <ResourceTypeType>{
    ApiVersion: "apis/core.oam.dev/v1alpha2",
    Kind: "ContainerizedWorkload",
  },
  Secret: <ResourceTypeType>{
    ApiVersion: "api/v1",
    Kind: "Secret",
  },
  Ingress: <ResourceTypeType>{
    ApiVersion: "apis/extensions/v1beta1",
    Kind: "Ingress",
  },
  MultiClusterApplicationConfiguration: <ResourceTypeType>{
    ApiVersion: "apis/clusters.verrazzano.io/v1alpha1",
    Kind: "MultiClusterApplicationConfiguration",
  },
  MultiClusterComponent: <ResourceTypeType>{
    ApiVersion: "apis/clusters.verrazzano.io/v1alpha1",
    Kind: "MultiClusterComponent",
  },
  VerrazzanoManagedCluster: <ResourceTypeType>{
    ApiVersion: "apis/clusters.verrazzano.io/v1alpha1",
    Kind: "VerrazzanoManagedCluster",
  },
};
