// Copyright (c) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import {
  Instance,
  Application,
  Model,
  Binding,
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
    const host = this.url.startsWith("/") ? location.host : new URL(this.url).host;
    const hostSuffix = this.url.startsWith("/") ? host.substring(host.indexOf(".")) :
         host.substring(host.indexOf("api.") + "api".length);

    return this.fetchApi(this.url + "/applications")
      .then((response: Response) => response.json())
      .then((data: Application[]) => {
        const applications: Application[] = data;
        const bindings = extractBindingsFromApplications(applications);
        for (const binding of bindings) {
          if (binding.id === bindingId) {
            binding.vmiInstances = getVmiInstancesForBinding(binding.name, hostSuffix);
            binding.components.forEach(component => {
              component.status = Status.Running;
            });
            return binding;
          }
        }
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
    this.listApplications = this.listApplications.bind(this);
    this.getInstance = this.getInstance.bind(this);
    this.getModel = this.getModel.bind(this);
    this.listSecrets = this.listSecrets.bind(this);
    this.getBinding = this.getBinding.bind(this);
  }
}
