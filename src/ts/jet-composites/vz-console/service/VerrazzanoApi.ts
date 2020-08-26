// Copyright (c) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import {
  Instance,
  Cluster,
  Application,
  Model,
  Domain,
  CohCluster,
  HelidonApp,
  BindingComponent,
  Binding,
  VMI,
  Secret,
  Status, FetchApiSignature
} from "./types";
import {
  extractModelsFromApplications,
  extractDomains,
  extractCohClusters,
  extractHelidonApps,
  mockInstances,
  extractBindingsFromApplications,
  mockVmis
} from "./common";
import { KeycloakJet } from "vz-console/auth/KeycloakJet"

export const ServicePrefix = "instances";

export class VerrazzanoApi {
  private fetchApi: FetchApiSignature;

  private url: string = (window as any).vzApiUrl ? (window as any).vzApiUrl : "/api";

  public async listInstances(): Promise<Instance[]> {
      return mockInstances();
  }

  public async getInstance(instanceId: string): Promise<Instance> {
    // Currently API only supports instance id O
    console.log("Fetching instance details " + instanceId);
    return this.fetchApi(this.url + "/instance")
      .then((response: Response) => response.json())
      .then((data: Instance) => {
        return data;
      });
  }

  public async listClusters(): Promise<Cluster[]> {
    return this.fetchApi(this.url + "/clusters")
      .then((response: Response) => response.json())
      .then((data: Cluster[]) => {
        return data;
      });
  }

  public async listApplications(): Promise<Application[]> {
    return this.fetchApi(this.url + "/applications")
      .then((response: Response) => response.json())
      .then((data: Application[]) => {
        return data;
      });
  }

  public async getModel(modelId: string): Promise<Model> {
    // TODO Change this to real getModelById api
    console.log("Fetching model details " + modelId);
    return this.fetchApi(this.url + "/applications")
      .then((response: Response) => response.json())
      .then((data: Application[]) => {
        const applications: Application[] = data;
        const models = extractModelsFromApplications(applications);
        for (const model of models) {
          if (modelId && model.id === modelId) {
            return model;
          }
        }
      });
  }

  public async getBinding(
    bindingId: string
  ): Promise<Binding> {
    // TODO Change this to real getBindingById api
    console.log("Fetching binding details " + bindingId);
    return this.fetchApi(this.url + "/applications")
      .then((response: Response) => response.json())
      .then((data: Application[]) => {
        const applications: Application[] = data;
        const bindings = extractBindingsFromApplications(applications);
        for (const binding of bindings) {
          if (binding.id === bindingId) {
            return binding;
          }
        }
      });
  }

  public async getDomains(
    modelId: string
  ): Promise<Domain[]> {
    // TODO Change this to real getDomainsByModel api
    console.log("Fetching domains for model " + modelId);
    return this.fetchApi(this.url + "/domains")
      .then((response: Response) => response.json())
      .then((data: any[]) => {
        return extractDomains(data);
      });
  }

  public async getCohClusters(
    modelId: string
  ): Promise<CohCluster[]> {
    // TODO Change this to real getCohClustersByModel api
    console.log("Fetching Coherence clusters for model " + modelId);
    return this.fetchApi(this.url + "/grids")
      .then((response: Response) => response.json())
      .then((data: any[]) => {
        return extractCohClusters(data);
      });
  }

  public async getHelidonApps(
    modelId: string
  ): Promise<HelidonApp[]> {
    // TODO Change this to real getHelidonAppsByModel api
    console.log("Fetching Helidon applications for model " + modelId);
    return this.fetchApi(this.url + "/microservices")
      .then((response: Response) => response.json())
      .then((data: any[]) => {
        return extractHelidonApps(data);
      });
  }

  public async getComponentStatus(
    component: BindingComponent
  ): Promise<Status> {
    let status = Status.Unknown;
    if (component) {
      // TODO Change this to real getComponentStatus(componentType, componentId) api
      console.log(
        "Fetching Component status for " +
        component.type +
        " " +
        component.name
      );
      status = Status.Running;
    }
    return status;
  }

  public async getVMInstances(
    bindingId: string
  ): Promise<VMI[]> {
    // TODO Change this to real getVMInstancesByBindingId api
    console.log("Fetching VMI details for binding" + bindingId);
    return this.getBinding(bindingId)
      .then((binding: Binding) => {
        const host = this.url.startsWith("/") ? location.host : new URL(this.url).host;
        const hostSuffix = this.url.startsWith("/") ? host.substring(host.indexOf(".")) :
             host.substring(host.indexOf("api.") + "api".length);
        return mockVmis(binding.name, hostSuffix);
      });
  }

  public async deleteInstance(
    instanceId: string
  ): Promise<Response> {
    // TODO Change this to real deleteInstnace api
    console.log("Delete instance " + instanceId);
    return new Response();
  }

  public async deleteBinding(
    bindingId: string
  ): Promise<Response> {
    // TODO Change this to real deleteBindingById api
    console.log("Delete binding " + bindingId);
    return new Response();
  }

  public async deleteModel(
    modelId: string
  ): Promise<Response> {
    // TODO Change this to real deleteModelById api
    console.log("Delete model " + modelId);
    return new Response();
  }

  public async listSecrets(): Promise<Secret[]> {
    return this.fetchApi(this.url + "/secrets")
      .then((response: Response) => response.json())
      .then((data: Secret[]) => {
        return data;
      });
  }

  public async deleteBindingComponent(
    componentId: string
  ): Promise<Response> {
    // TODO Change this to real deleteBindingComponent api
    console.log("Delete binding component" + componentId);
    return new Response();
  }

  public async startBindingComponent(
    componentId: string
  ): Promise<Response> {
    // TODO Change this to real startBindingComponent api
    console.log("Starting binding component" + componentId);
    return new Response();
  }

  public async stopBindingComponent(
    componentId: string
  ): Promise<Response> {
    // TODO Change this to real stopBindingComponent api
    console.log("Stopping binding component" + componentId);
    return new Response();
  }

  public async restartBindingComponent(
    componentId: string
  ): Promise<Response> {
    // TODO Change this to real restartBindingComponent api
    console.log("Restarting binding component" + componentId);
    return new Response();
  }

  public async deleteModelComponent(
    componentId: string
  ): Promise<Response> {
    // TODO Change this to real deleteModelComponent api
    console.log("Delete model component" + componentId);
    return new Response();
  }

  public async startBinding(
    bindingId: string
  ): Promise<Response> {
    // TODO Change this to real startBinding api
    console.log("Start binding " + bindingId);
    return new Response();
  }

  public async stopBinding(
    bindingId: string
  ): Promise<Response> {
    // TODO Change this to real stopBinding api
    console.log("Stop binding " + bindingId);
    return new Response();
  }

  public async restartBinding(
    bindingId: string
  ): Promise<Response> {
    // TODO Change this to real restartBinding api
    console.log("Restarting binding " + bindingId);
    return new Response();
  }

  public constructor() {
    this.fetchApi = KeycloakJet.getInstance().getAuthenticatedFetchApi();
    this.listInstances = this.listInstances.bind(this);
    this.listClusters = this.listClusters.bind(this);
    this.listApplications = this.listApplications.bind(this);
    this.getInstance = this.getInstance.bind(this);
    this.getModel = this.getModel.bind(this);
    this.getDomains = this.getDomains.bind(this);
    this.getCohClusters = this.getCohClusters.bind(this);
    this.getHelidonApps = this.getHelidonApps.bind(this);
    this.getComponentStatus = this.getComponentStatus.bind(this);
    this.getVMInstances = this.getVMInstances.bind(this);
    this.deleteBinding = this.deleteBinding.bind(this);
    this.deleteModel = this.deleteModel.bind(this);
    this.deleteBindingComponent = this.deleteBindingComponent.bind(this);
    this.startBindingComponent = this.startBindingComponent.bind(this);
    this.stopBindingComponent = this.stopBindingComponent.bind(this);
    this.restartBindingComponent = this.restartBindingComponent.bind(this);
    this.deleteModelComponent = this.deleteModelComponent.bind(this);
    this.startBinding = this.startBinding.bind(this);
    this.stopBinding = this.stopBinding.bind(this);
    this.restartBinding = this.restartBinding.bind(this);
  }
}
