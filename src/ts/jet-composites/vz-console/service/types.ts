// Copyright (c) 2020, 2022, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

export enum VMIType {
  // eslint-disable-next-line no-unused-vars
  OpensearchDashboards = "OpenSearch-Dashboards",
  // eslint-disable-next-line no-unused-vars
  Grafana = "Grafana",
  // eslint-disable-next-line no-unused-vars
  Prometheus = "Prometheus",
  // eslint-disable-next-line no-unused-vars
  Opensearch = "OpenSearch",
  // eslint-disable-next-line no-unused-vars
  Kiali = "Kiali",
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
  // eslint-disable-next-line no-unused-vars
  Active = "Active",
  // eslint-disable-next-line no-unused-vars
  Inactive = "Inactive",
}

export interface OAMAppStatusInfo {
  status: string;
  message?: string;
}

export interface FetchApiSignature {
  // eslint-disable-next-line no-undef
  (input: string | Request, init?: RequestInit): Promise<Response>;
}

export interface Cluster {
  name?: string;
  namespace?: string;
  status?: string;
  apiUrl?: string;
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
  argoCDUrl: string;
  rancherUrl?: string;
  keyCloakUrl?: string;
  kibanaUrl?: string;
  grafanaUrl?: string;
  prometheusUrl?: string;
  elasticUrl?: string;
  kialiUrl?: string;
  isUsingSharedVMI?: boolean;
  jaegerUrl?: string;
}

export interface VMI {
  id?: string;
  type?: VMIType;
  url?: string;
}

export interface LabelSelectorRequirement {
  key: string;
  operator: string;
  values?: Array<string>;
}

export interface IngressRule {
  hasFrom: boolean;
  ports?: Array<string>;
}

export interface EgressRule {
  hasTo: boolean;
  ports?: Array<string>;
}

export interface NetworkPolicy {
  name: string;
  policyTypes?: Array<string>;
  labelPodSelectors?: { [key: string]: string };
  expressionPodSelectors?: Array<LabelSelectorRequirement>;
  ingressRules?: Array<IngressRule>;
  egressRules?: Array<EgressRule>;
}

export interface Project {
  name?: string;
  namespace?: string;
  namespaces?: any[];
  clusters?: any[];
  data?: any;
  networkPolicies?: NetworkPolicy[];
  createdOn?: string;
}

export interface Metadata {
  name?: string;
  namespace?: string;
}

export interface Image {
  name?: string;
  registry?: string;
  repository?: string;
  tag?: string;
}

export interface Spec {
  baseImage?: string;
  image?: Image;
  jdkInstaller?: string;
  jdkInstallerVersion?: string;
  webLogicInstaller?: string;
  webLogicInstallerVersion?: string;
  latestPSU?: boolean;
  recommendedPatches?: boolean;
}

export interface ImageBuildRequestStatus {
  state: string;
}

export interface ImageBuildRequest {
  apiVersion?: string;
  kind?: string;
  metadata?: Metadata;
  spec?: Spec;
  status?: ImageBuildRequestStatus;
}

export interface OAMApplication {
  name?: string;
  namespace?: string;
  data?: any;
  status?: Status;
  statusMessage: string;
  // eslint-disable-next-line no-use-before-define
  componentInstances?: OAMComponentInstance[];
  createdOn?: string;
  cluster: { name: string };
  project?: Project;
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
  project?: Project;
}

export interface OAMTrait {
  name?: string;
  namespace?: string;
  apiVersion: string;
  kind?: string;
  descriptor?: any;
  id?: string;
  error?: string;
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

export interface Subject {
  apiGroup: string;
  kind: string;
  name: string;
}

export interface RoleBinding {
  name?: string;
  namespace?: string;
  clusterRole?: string;
  subjects?: Subject[];
  createdOn?: string;
}

export interface UserInfoCookie {
  username?: string;
}

export const ResourceType = {
  Cluster: <ResourceTypeType>{
    ApiVersion: "apis/clusters.verrazzano.io/v1alpha1",
    Kind: "VerrazzanoManagedCluster",
  },
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
  RoleBinding: <ResourceTypeType>{
    ApiVersion: "apis/rbac.authorization.k8s.io/v1",
    Kind: "RoleBinding",
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
  VerrazzanoProject: <ResourceTypeType>{
    ApiVersion: "apis/clusters.verrazzano.io/v1alpha1",
    Kind: "VerrazzanoProject",
  },
  VerrazzanoImageBuildRequest: <ResourceTypeType>{
    ApiVersion: "apis/images.verrazzano.io/v1alpha1",
    Kind: "ImageBuildRequest",
  },
};
