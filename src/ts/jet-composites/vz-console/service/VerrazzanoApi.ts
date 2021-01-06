// Copyright (c) 2020, 2021, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import {
  Instance,
  Application,
  Model,
  Binding,
  Secret,
  Status,
  FetchApiSignature,
  OAMApplication,
  OAMComponent,
} from "./types";
import {
  extractModelsFromApplications,
  extractBindingsFromApplications,
  getVmiInstancesForBinding,
  processOAMData,
} from "./common";
import { KeycloakJet } from "vz-console/auth/KeycloakJet";
import * as Messages from "vz-console/utils/Messages";
import * as fakeApi from "./fakeApi";

export const ServicePrefix = "instances";

export class VerrazzanoApi {
  private fetchApi: FetchApiSignature;

  private apiVersion: string = (window as any).vzApiVersion || "20210501";
  private url: string = `${(window as any).vzApiUrl || ""}/${this.apiVersion}`;

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

  public async getBinding(bindingId: string): Promise<Binding> {
    console.log(Messages.Api.msgFetchBinding(bindingId));
    let binding: Binding;
    return this.fetchApi(this.url + "/applications")
      .then((response: Response) => response.json())
      .then((applications: Application[]) => {
        const bindings = extractBindingsFromApplications(applications);
        binding = bindings.find((binding) => {
          return binding.id === bindingId;
        });
        if (!binding) {
          throw Messages.Error.errBindingDoesNotExist(bindingId);
        }
      })
      .then(() => this.getInstance("0"))
      .then((instance) => {
        binding.vmiInstances = getVmiInstancesForBinding(
          binding.name,
          instance
        );
        binding.components.forEach((component) => {
          component.status = Status.Running;
        });
        return binding;
      });
  }

  public async listSecrets(): Promise<Secret[]> {
    return this.fetchApi(this.url + "/secrets")
      .then((response: Response) => response.json())
      .then((data: Secret[]) => {
        return data;
      });
  }

  public async listOAMAppsAndComponents(): Promise<{
    oamApplications: OAMApplication[];
    oamComponents: OAMComponent[];
  }> {
    return Promise.all([
      fakeApi.getOamApplications(),
      fakeApi.getOamComponents(),
    ])
      .then(([apps, comps]) => {
        const applications: OAMApplication[] = [];
        const components: OAMComponent[] = [];
        const { oamApplications, oamComponents } = processOAMData(
          JSON.parse(apps),
          JSON.parse(comps)
        );
        oamApplications.forEach((element) => {
          element.forEach((oamApplication) => {
            applications.push(oamApplication);
          });
        });
        oamComponents.forEach((element) => {
          element.forEach((oamComponent) => {
            components.push(oamComponent);
          });
        });
        return { oamApplications: applications, oamComponents: components };
      })
      .catch((error) => {
        let errorMessage = error;
        if (error && error.message) {
          errorMessage = error.message;
        }
        throw new Error(errorMessage);
      });
  }

  public async listOAMApplications(): Promise<OAMApplication[]> {
    return Promise.all([
      fakeApi.getOamApplications(),
      fakeApi.getOamComponents(),
    ])
      .then(([apps, comps]) => {
        const applications: OAMApplication[] = [];
        const { oamApplications } = processOAMData(
          JSON.parse(apps),
          JSON.parse(comps)
        );
        oamApplications.forEach((element) => {
          element.forEach((oamApplication) => {
            applications.push(oamApplication);
          });
        });
        return applications;
      })
      .catch((error) => {
        let errorMessage = error;
        if (error && error.message) {
          errorMessage = error.message;
        }
        throw new Error(errorMessage);
      });
  }

  public async listOAMComponents(): Promise<OAMComponent[]> {
    return Promise.all([
      fakeApi.getOamApplications(),
      fakeApi.getOamComponents(),
    ])
      .then(([apps, comps]) => {
        const components: OAMComponent[] = [];
        const { oamComponents } = processOAMData(
          JSON.parse(apps),
          JSON.parse(comps)
        );
        oamComponents.forEach((element) => {
          element.forEach((oamComponent) => {
            components.push(oamComponent);
          });
        });
        return components;
      })
      .catch((error) => {
        let errorMessage = error;
        if (error && error.message) {
          errorMessage = error.message;
        }
        throw new Error(errorMessage);
      });
  }

  public async getOAMApplication(oamAppId: string): Promise<OAMApplication> {
    let oamApp: OAMApplication;
    return Promise.all([
      fakeApi.getOamApplications(),
      fakeApi.getOamComponents(),
    ])
      .then(([apps, comps]) => {
        const { oamApplications } = processOAMData(
          JSON.parse(apps),
          JSON.parse(comps)
        );
        oamApplications.forEach((element) => {
          element.forEach((oamApplication) => {
            if (oamApplication.data.metadata.uid === oamAppId) {
              oamApp = oamApplication;
            }
          });
        });
        if (!oamApp) {
          throw Messages.Error.errOAMApplicationDoesNotExist(oamAppId);
        }
        return oamApp;
      })
      .catch((error) => {
        let errorMessage = error;
        if (error && error.message) {
          errorMessage = error.message;
        }
        throw new Error(errorMessage);
      });
  }

  public async getOAMComponent(oamCompId: string): Promise<OAMApplication> {
    let oamComp: OAMComponent;
    return Promise.all([
      fakeApi.getOamApplications(),
      fakeApi.getOamComponents(),
    ])
      .then(([apps, comps]) => {
        const { oamComponents } = processOAMData(
          JSON.parse(apps),
          JSON.parse(comps)
        );
        oamComponents.forEach((element) => {
          element.forEach((oamComponent) => {
            if (oamComponent.data.metadata.uid === oamCompId) {
              oamComp = oamComponent;
            }
          });
        });
        if (!oamComp) {
          throw Messages.Error.errOAMComponentDoesNotExist(oamCompId);
        }
        return oamComp;
      })
      .catch((error) => {
        let errorMessage = error;
        if (error && error.message) {
          errorMessage = error.message;
        }
        throw new Error(errorMessage);
      });
  }

  public async getKubernetesResource(
    name: string,
    kind: string,
    namespace: string
  ): Promise<string> {
    return Promise.resolve(fakeApi.getKubernetesResource(name, kind, namespace))
      .then((response) => {
        if (!response) {
          throw Messages.Error.errKubernetesResourceNotExists(
            kind,
            namespace,
            name
          );
        }
        return response;
      })
      .catch((error) => {
        let errorMessage = error;
        if (error && error.message) {
          errorMessage = error.message;
        }
        throw new Error(errorMessage);
      });
  }

  public constructor() {
    this.fetchApi = KeycloakJet.getInstance().getAuthenticatedFetchApi();
    this.listApplications = this.listApplications.bind(this);
    this.getInstance = this.getInstance.bind(this);
    this.getModel = this.getModel.bind(this);
    this.listSecrets = this.listSecrets.bind(this);
    this.getBinding = this.getBinding.bind(this);
    this.listOAMApplications = this.listApplications.bind(this);
    this.listOAMComponents = this.listOAMComponents.bind(this);
    this.getOAMApplication = this.getOAMApplication.bind(this);
    this.getOAMComponent = this.getOAMComponent.bind(this);
    this.getKubernetesResource = this.getKubernetesResource.bind(this);
  }
}
