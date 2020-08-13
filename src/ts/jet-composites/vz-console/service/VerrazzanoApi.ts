// Copyright (C) 2020, Oracle and/or its affiliates.
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

export declare type ResponseWithData<T> = {
  response: Response;
  data: T;
};

const makeResponseWithData = <T>(t: T): ResponseWithData<T> => ({
  response: new Response(),
  data: t
});
const withDelay = <T>(
  cb: (reject: (e: Error) => void) => T,
  baseDelay?: number
) =>
  new Promise<T>((resolve, reject) => {
    setTimeout(
      () => resolve(cb(reject)),
      Math.random() * 1000 + (baseDelay || 500)
    );
  });

export const ServicePrefix = "instances";

export class VerrazzanoApi {
  private instances: Instance[];
  private fetchApi: FetchApiSignature;

  private url: string = (window as any).apiUrl ? (window as any).apiUrl : "/plugin/api";

  public async listInstances(): Promise<ResponseWithData<Instance[]>> {
    return withDelay(() => {
      return makeResponseWithData(mockInstances());
    });
  }

  getInstance(instanceId: string): Promise<ResponseWithData<Instance>> {
    // Currently API only supports instance id O
    console.log("Fetching instance details " + instanceId);
    return this.fetchApi(this.url + "/instance")
      .then(res => res.clone())
      .then((response: Response) => response.json())
      .then((data: Instance) => {
        return makeResponseWithData(data);
      });
  }

  public async listClusters(): Promise<ResponseWithData<Cluster[]>> {
    return this.fetchApi(this.url + "/clusters")
      .then(res => res.clone())
      .then((response: Response) => response.json())
      .then((data: Cluster[]) => {
        return makeResponseWithData(data);
      });
  }

  public async registerCluster(clusterId: string): Promise<Response> {
    // TODO Change this to real api call
    console.log("Register cluster " + clusterId);
    return new Response();
  }
  public async unregisterCluster(clusterId: string): Promise<Response> {
    // TODO Change this to real api call
    console.log("Unregister cluster " + clusterId);
    return new Response();
  }

  public async getCluster(clusterId: string): Promise<ResponseWithData<Cluster>> {
    console.log("Fetching cluster details " + clusterId);
    return this.fetchApi(this.url + "/clusters/" + clusterId)
      .then(res => res.clone())
      .then((response: Response) => response.json())
      .then((data: Cluster) => {
        return makeResponseWithData(data);
      });
  }

  public async listApplications(): Promise<ResponseWithData<Application[]>> {
    return this.fetchApi(this.url + "/applications")
      .then(res => res.clone())
      .then((response: Response) => response.json())
      .then((data: Application[]) => {
        return makeResponseWithData(data);
      });
  }

  public async getModel(modelId: string): Promise<ResponseWithData<Model>> {
    // TODO Change this to real getModelById api
    console.log("Fetching model details " + modelId);
    return this.fetchApi(this.url + "/applications")
      .then(res => res.clone())
      .then((response: Response) => response.json())
      .then((data: Application[]) => {
        const applications: Application[] = data;
        const models = extractModelsFromApplications(applications);
        for (const model of models) {
          if (modelId && model.id === modelId) {
            return makeResponseWithData(model);
          }
        }
        // This will only happen if there is a logic bug
        console.log("ERROR: unable to find model match in application list");
        return makeResponseWithData(null);
      });
  }

  public async getBinding(
    bindingId: string
  ): Promise<ResponseWithData<Binding>> {
    // TODO Change this to real getBindingById api
    console.log("Fetching binding details " + bindingId);
    return this.fetchApi(this.url + "/applications")
      .then(res => res.clone())
      .then((response: Response) => response.json())
      .then((data: Application[]) => {
        const applications: Application[] = data;
        const bindings = extractBindingsFromApplications(applications);
        for (const binding of bindings) {
          if (binding.id === bindingId) {
            return makeResponseWithData(binding);
          }
        }
        // This will only happen if there is a logic bug
        console.log("ERROR: unable to find binding match in application list");
        return makeResponseWithData(null);
      });
  }

  public async getDomains(
    modelId: string
  ): Promise<ResponseWithData<Domain[]>> {
    // TODO Change this to real getDomainsByModel api
    console.log("Fetching domains for model " + modelId);
    return this.fetchApi(this.url + "/domains")
      .then(res => res.clone())
      .then((response: Response) => response.json())
      .then((data: any[]) => {
        return makeResponseWithData(extractDomains(data));
      });
  }

  public async getCohClusters(
    modelId: string
  ): Promise<ResponseWithData<CohCluster[]>> {
    // TODO Change this to real getCohClustersByModel api
    console.log("Fetching Coherence clusters for model " + modelId);
    return this.fetchApi(this.url + "/grids")
      .then(res => res.clone())
      .then((response: Response) => response.json())
      .then((data: any[]) => {
        return makeResponseWithData(extractCohClusters(data));
      });
  }

  public async getHelidonApps(
    modelId: string
  ): Promise<ResponseWithData<HelidonApp[]>> {
    // TODO Change this to real getHelidonAppsByModel api
    console.log("Fetching Helidon applications for model " + modelId);
    return this.fetchApi(this.url + "/microservices")
      .then(res => res.clone())
      .then((response: Response) => response.json())
      .then((data: any[]) => {
        return makeResponseWithData(extractHelidonApps(data));
      });
  }

  public async getComponentStatus(
    component: BindingComponent
  ): Promise<ResponseWithData<Status>> {
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
    return makeResponseWithData(status);
  }

  public async getVMInstances(
    bindingId: string
  ): Promise<ResponseWithData<VMI[]>> {
    // TODO Change this to real getVMInstancesByBindingId api
    console.log("Fetching VMI details for binding" + bindingId);
    return this.getBinding(bindingId)
      .then((response: ResponseWithData<Binding>) => {
        const binding = response.data;
        const host = this.url.startsWith("/") ? location.host : new URL(this.url).host;
        const hostSuffix = this.url.startsWith("/") ? host.substring(host.indexOf("console.") + "console".length) :
             host.substring(host.indexOf("api.") + "api".length);
        return makeResponseWithData(mockVmis(binding.name, hostSuffix));
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

  public async listSecrets(): Promise<ResponseWithData<Secret[]>> {
    return this.fetchApi(this.url + "/secrets")
      .then(res => res.clone())
      .then((response: Response) => response.json())
      .then((data: Secret[]) => {
        return makeResponseWithData(data);
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

  // This must be called before using the API so that
  // the console plugin runtime fetch API can be used.
  public setFetch(api: FetchApiSignature): void {
    this.fetchApi = api;
  }

  public constructor() {
    this.fetchApi = window.fetch.bind(window);
    this.listInstances = this.listInstances.bind(this);
    this.listClusters = this.listClusters.bind(this);
    this.listApplications = this.listApplications.bind(this);
    this.getInstance = this.getInstance.bind(this);
    this.getCluster = this.getCluster.bind(this);
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
