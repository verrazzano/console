// Copyright (c) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import {
  Instance,
  Cluster,
  Application,
  Model,
  BindingComponent,
  Binding,
  VMI,
  Secret,
  Status, FetchApiSignature
} from "./types";
import {
  extractModelsFromApplications,
  extractBindingsFromApplications,
  getVmiInstancesForBinding
} from "./common";
import { KeycloakJet } from "vz-console/auth/KeycloakJet"
import * as Messages from "vz-console/utils/Messages"

export const ServicePrefix = "instances";

export class VerrazzanoApi {
  private fetchApi: FetchApiSignature;

  private url: string = (window as any).vzApiUrl ? (window as any).vzApiUrl : "/api";

  public async getInstance(instanceId: string): Promise<Instance> {
    // Currently API only supports instance id O
    console.log(Messages.Api.msgFetchInstance(instanceId));
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
    console.log(Messages.Api.msgFetchModel(modelId));
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
    console.log(Messages.Api.msgFetchBinding(bindingId));
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

  public async getComponentStatus(
    component: BindingComponent
  ): Promise<Status> {
    let status = Status.Unknown;
    if (component) {
      console.log(
        Messages.Api.msgFetchComponent(component.type,component.name)
      );
      status = Status.Running;
    }
    return status;
  }

  public async getVMInstances(
    bindingId: string
  ): Promise<VMI[]> {
    console.log(Messages.Api.msgFetchVmi(bindingId));
    return this.getBinding(bindingId)
      .then((binding: Binding) => {
        const host = this.url.startsWith("/") ? location.host : new URL(this.url).host;
        const hostSuffix = this.url.startsWith("/") ? host.substring(host.indexOf(".")) :
             host.substring(host.indexOf("api.") + "api".length);
        return getVmiInstancesForBinding(binding.name, hostSuffix);
      });
  }

  public async listSecrets(): Promise<Secret[]> {
    return this.fetchApi(this.url + "/secrets")
      .then((response: Response) => response.json())
      .then((data: Secret[]) => {
        return data;
      });
  }

  public constructor() {
    this.fetchApi = KeycloakJet.getInstance().getAuthenticatedFetchApi();
    this.listClusters = this.listClusters.bind(this);
    this.listApplications = this.listApplications.bind(this);
    this.getInstance = this.getInstance.bind(this);
    this.getModel = this.getModel.bind(this);
    this.getComponentStatus = this.getComponentStatus.bind(this);
    this.getVMInstances = this.getVMInstances.bind(this);
  }
}
