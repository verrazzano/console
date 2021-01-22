// Copyright (c) 2020, 2021, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

export enum ComponentType {
  // eslint-disable-next-line no-unused-vars
  ING = "Ingress",
  // eslint-disable-next-line no-unused-vars
  ATP = "ATP",
  // eslint-disable-next-line no-unused-vars
  DB = "Database",
  // eslint-disable-next-line no-unused-vars
  WLS = "WebLogic Domain",
  // eslint-disable-next-line no-unused-vars
  MS = "Helidon Microservice",
  // eslint-disable-next-line no-unused-vars
  COH = "Coherence cluster",
  // eslint-disable-next-line no-unused-vars
  ANY = "Any",
  // eslint-disable-next-line no-unused-vars
  GEN = "Generic Component",
}

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
  Creating = "Creating",
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
  Unknown = "Unknown",
}

export enum SecretUsage {
  // eslint-disable-next-line no-unused-vars
  ImagePullSecret = "ImagePullSecret",
  // eslint-disable-next-line no-unused-vars
  WebLogicCredentialsSecret = "WebLogicCredentialsSecret",
  // eslint-disable-next-line no-unused-vars
  DatabaseSecret = "DatabaseSecret",
}

// This is the secret info we have returned in the model/binding
export interface PartialSecret {
  name: string;
  usage: string;
}

export interface Component {
  id?: string;
  name?: string;
  type?: ComponentType;
  images?: string[];
  secrets?: PartialSecret[];
}

export interface Placement {
  id?: string;
  cluster?: string;
  namespace?: string;
  component?: string;
  componentType?: string;
}

export interface BindingComponent extends Component {
  placement?: Placement;
  status?: Status;
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
  vzApiUri: string;
  rancherUrl?: string;
  keyCloakUrl?: string;
  kibanaUrl?: string;
  grafanaUrl?: string;
  prometheusUrl?: string;
  elasticUrl?: string;
  isUsingSharedVMI?: boolean;
}

export interface Cluster {
  id: string;
  name: string;
  type: string;
  status: string;
  serverAddress: string;
}

export interface Connection {
  id: string;
  name: string;
  source: string;
  target: string;
  component: string;
  type: string;
}

export interface Ingress {
  id: string;
  name: string;
  path: string;
  port: string;
  component: string;
  prefix: string;
  dnsName: string;
}

export interface ComponentSecret {
  id: string;
  name: string;
  type: string;
  componentName: string;
  componentType: string;
  usage: string;
}

export interface VMI {
  id?: string;
  type?: VMIType;
  url?: string;
}

export interface Domain {
  id: string;
  name: string;
  adminPort: string;
  t3Port: string;
}

export interface CohCluster {
  id: string;
  cluster: string;
  name: string;
  podName: string;
  role: string;
  image: string;
  namespace: string;
  status: string;
}

export interface HelidonApp {
  id: string;
  cluster: string;
  name: string;
  type: string;
  namespace: string;
  status: string;
}

export interface Secret {
  id: string;
  name: string;
  namespace: string;
  status: string;
  type: string;
}

export interface Binding {
  id: string;
  name: string;
  description: string;
  state?: string;
  // eslint-disable-next-line no-use-before-define
  model: Model;
  components?: BindingComponent[];
  connections?: Connection[];
  ingresses?: Ingress[];
  vmiInstances?: VMI[];
  secrets?: ComponentSecret[];
  namespace?: string;
  createdOn?: string;
}

export interface Model {
  id: string;
  name: string;
  description: string;
  bindings?: Binding[];
  modelComponents?: Component[];
  connections?: Connection[];
  ingresses?: Ingress[];
  secrets?: ComponentSecret[];
  namespace?: string;
  createdOn?: string;
}

export interface Application {
  id: string;
  name: string;
  description: string;
  model: string;
  binding: string;
  status: string;
}

export interface OAMApplication {
  name?: string;
  namespace?: string;
  data?: any;
  status?: string;
  // eslint-disable-next-line no-use-before-define
  componentInstances?: OAMComponentInstance[];
  createdOn?: string;
}

export interface OAMComponent {
  name?: string;
  namespace?: string;
  workloadType?: string;
  latestRevision?: string;
  data?: any;
  applications?: OAMApplication[];
  createdOn?: string;
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
    ApiVersion: "apps/v1",
    Kind: "Deployment",
  },
  VerrazzanoManagedCluster: <ResourceTypeType>{
    ApiVersion: "verrazzano.io/v1beta1",
    Kind: "VerrazzanoManagedCluster",
  },
  VerrazzanoBinding: <ResourceTypeType>{
    ApiVersion: "verrazzano.io/v1beta1",
    Kind: "VerrazzanoBinding",
  },
  VerrazzanoModel: <ResourceTypeType>{
    ApiVersion: "verrazzano.io/v1beta1",
    Kind: "VerrazzanoModel",
  },
  VerrazzanoMonitoringInstance: <ResourceTypeType>{
    ApiVersion: "verrazzano.io/v1",
    Kind: "VerrazzanoMonitoringInstance",
  },
  ApplicationConfiguration: <ResourceTypeType>{
    ApiVersion: "core.oam.dev/v1alpha2",
    Kind: "ApplicationConfiguration",
  },
  Component: <ResourceTypeType>{
    ApiVersion: "core.oam.dev/v1alpha2",
    Kind: "Component",
  },
  Domain: <ResourceTypeType>{
    ApiVersion: "weblogic.oracle/v8",
    Kind: "Domain",
  },
  CohCluster: <ResourceTypeType>{
    ApiVersion: "verrazzano.io/v1beta1",
    Kind: "CohCluster",
  },
  CoherenceCluster: <ResourceTypeType>{
    ApiVersion: "coherence.oracle.com/v1",
    Kind: "CoherenceCluster",
  },
  IngressTrait: <ResourceTypeType>{
    ApiVersion: "oam.verrazzano.io/v1alpha1",
    Kind: "IngressTrait",
  },
  HealthScope: <ResourceTypeType>{
    ApiVersion: "core.oam.dev/v1alpha2",
    Kind: "HealthScope",
  },
  ContainerizedWorkload: <ResourceTypeType>{
    ApiVersion: "core.oam.dev/v1alpha2",
    Kind: "ContainerizedWorkload",
  },
  Secret: <ResourceTypeType>{
    ApiVersion: "v1",
    Kind: "Secret",
  },
  Ingress: <ResourceTypeType>{
    ApiVersion: "extensions/v1beta1",
    Kind: "Ingress",
  },
};
