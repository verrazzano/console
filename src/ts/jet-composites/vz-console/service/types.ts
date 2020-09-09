// Copyright (c) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

export interface FetchApiSignature {
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
  rancherUrl: string;
  keyCloakUrl: string;
  kibanaUrl?: string;
  grafanaUrl?: string;
  prometheusUrl?: string;
  elasticUrl?: string;
}

export interface Cluster {
  id: string;
  name: string;
  type: string;
  status: string;
  serverAddress: string;
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

export interface Binding {
  id: string;
  name: string;
  description: string;
  state?: string;
  model: Model;
  components?: BindingComponent[];
  connections?: Connection[];
  ingresses?: Ingress[];
  vmiInstances?: VMI[];
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

export interface ComponentSecret {
  id: string;
  name: string;
  type: string;
  componentName: string;
  componentType: string;
  usage: string;
}

// This is the secret info we have returned in the model/binding
export interface PartialSecret {
  name: string;
  usage: string;
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

export interface Placement {
  id?: string;
  cluster? : string;
  namespace? : string;
  component? : string;
  componentType? : string;
}

export interface Component {
  id?: string;
  name?: string;
  type?: ComponentType;
  image?: string;
  secrets?: PartialSecret[];
}

export interface BindingComponent extends Component{
  placement?: Placement;
  status?: Status;
}

export enum ComponentType {
  ING = "Ingress",
  ATP = "ATP",
  DB = "Database",
  WLS = "WebLogic Domain",
  MS = "Helidon Microservice",
  COH = "Coherence cluster",
  ANY = "Any"
}

export enum VMIType {
  Kibana = "Kibana",
  Grafana = "Grafana",
  Prometheus = "Prometheus",
  ElasticSearch = "Elasticsearch"
}

export interface VMI {
  id?: string;
  type?: VMIType;
  url?: string;
}

export enum Status {
  Creating = "Creating",
  Available = "Available",
  Ready = "Ready",
  Running = "Running",
  Terminated = "Terminated",
  Any = "Any State",
  Bound = "Bound",
  Unbound = "Unbound",
  Unknown = "Unknown"
}

export enum SecretUsage {
  ImagePullSecret = "ImagePullSecret",
  WebLogicCredentialsSecret = "WebLogicCredentialsSecret",
  DatabaseSecret = "DatabaseSecret"
}
