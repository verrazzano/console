// Copyright (c) 2020, 2021, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import {
  FetchApiSignature,
  Instance,
  OAMApplication,
  OAMComponent,
  ResourceType,
  ResourceTypeType,
} from "./types";
import { processOAMData } from "./common";
import { KeycloakJet } from "vz-console/auth/KeycloakJet";
import * as Messages from "vz-console/utils/Messages";

export const ServicePrefix = "instances";

const NamespaceVerrazzanoSystem = "verrazzano-system";

export class VerrazzanoApi {
  private fetchApi: FetchApiSignature;

  private apiVersion: string = (window as any).vzApiVersion || "20210501";
  private url: string = `${(window as any).vzApiUrl || ""}/${this.apiVersion}`;

  public async getInstance(instanceId: string): Promise<Instance> {
    return Promise.all([
      this.getKubernetesResource(ResourceType.Ingress),
      this.getKubernetesResource(ResourceType.Verrazzano),
    ])
      .then(([ingressResponse, vzResponse]) => {
        return Promise.all([ingressResponse.json(), vzResponse.json()]);
      })
      .then(([ingresses, vzs]) => {
        if (
          !ingresses ||
          !ingresses.items ||
          !((ingresses.items as Array<any>).length > 0)
        ) {
          throw new Error(Messages.Error.errIngressesFetchError());
        }

        // There can be only one installed Verrazzano instance
        if (!vzs || !vzs.items || (vzs.items as Array<any>).length !== 1) {
          throw new Error(Messages.Error.errIngressesFetchError());
        }
        const vzArray = vzs.items as Array<any>;
        return this.populateInstance(ingresses.items, vzArray[0], instanceId);
      })
      .catch((error) => {
        let errorMessage = error;
        if (error && error.message) {
          errorMessage = error.message;
        }
        throw new Error(errorMessage);
      });
  }

  public async listOAMAppsAndComponents(): Promise<{
    oamApplications: OAMApplication[];
    oamComponents: OAMComponent[];
  }> {
    return Promise.all([
      this.getKubernetesResource(ResourceType.ApplicationConfiguration),
      this.getKubernetesResource(ResourceType.Component),
    ])
      .then(([appsResponse, compsResponse]) => {
        return Promise.all([appsResponse.json(), compsResponse.json()]);
      })
      .then(([apps, components]) => {
        if (!apps) {
          throw new Error(Messages.Error.errOAMApplicationsFetchError());
        }

        if (!components) {
          throw new Error(Messages.Error.errOAMComponentsFetchError());
        }

        const applications: OAMApplication[] = [];
        const comps: OAMComponent[] = [];
        const { oamApplications, oamComponents } = processOAMData(
          apps.items,
          components.items
        );
        oamApplications.forEach((element) => {
          element.forEach((oamApplication) => {
            applications.push(oamApplication);
          });
        });
        oamComponents.forEach((element) => {
          element.forEach((oamComponent) => {
            comps.push(oamComponent);
          });
        });
        return { oamApplications: applications, oamComponents: comps };
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
      this.getKubernetesResource(ResourceType.ApplicationConfiguration),
      this.getKubernetesResource(ResourceType.Component),
    ])
      .then(([appsResponse, compsResponse]) => {
        return Promise.all([appsResponse.json(), compsResponse.json()]);
      })
      .then(([apps, components]) => {
        const applications: OAMApplication[] = [];
        if (!apps) {
          throw new Error(Messages.Error.errOAMApplicationsFetchError());
        }

        if (!components) {
          throw new Error(Messages.Error.errOAMComponentsFetchError());
        }

        const { oamApplications } = processOAMData(
          apps.items,
          components.items
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
      this.getKubernetesResource(ResourceType.ApplicationConfiguration),
      this.getKubernetesResource(ResourceType.Component),
    ])
      .then(([appsResponse, compsResponse]) => {
        return Promise.all([appsResponse.json(), compsResponse.json()]);
      })
      .then(([apps, components]) => {
        const comps: OAMComponent[] = [];
        if (!apps) {
          throw new Error(Messages.Error.errOAMApplicationsFetchError());
        }

        if (!components) {
          throw new Error(Messages.Error.errOAMComponentsFetchError());
        }

        const { oamComponents } = processOAMData(apps.items, components.items);
        oamComponents.forEach((element) => {
          element.forEach((oamComponent) => {
            comps.push(oamComponent);
          });
        });
        return comps;
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
    return Promise.all([
      this.getKubernetesResource(ResourceType.ApplicationConfiguration),
      this.getKubernetesResource(ResourceType.Component),
    ])
      .then(([appsResponse, compsResponse]) => {
        return Promise.all([appsResponse.json(), compsResponse.json()]);
      })
      .then(([apps, components]) => {
        let oamApp: OAMApplication;
        if (!apps) {
          throw new Error(Messages.Error.errOAMApplicationsFetchError());
        }

        if (!components) {
          throw new Error(Messages.Error.errOAMComponentsFetchError());
        }

        const { oamApplications } = processOAMData(
          apps.items,
          components.items
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

  public async getOAMComponent(oamCompId: string): Promise<OAMComponent> {
    return Promise.all([
      this.getKubernetesResource(ResourceType.ApplicationConfiguration),
      this.getKubernetesResource(ResourceType.Component),
    ])
      .then(([appsResponse, compsResponse]) => {
        return Promise.all([appsResponse.json(), compsResponse.json()]);
      })
      .then(([apps, components]) => {
        let oamComp: OAMComponent;
        if (!apps) {
          throw new Error(Messages.Error.errOAMApplicationsFetchError());
        }

        if (!components) {
          throw new Error(Messages.Error.errOAMComponentsFetchError());
        }

        const { oamComponents } = processOAMData(apps.items, components.items);
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
    type: ResourceTypeType,
    namespace?: string,
    name?: string
  ): Promise<Response> {
    return Promise.resolve(
      this.fetchApi(
        `${this.url}/${type.ApiVersion}/${
          namespace
            ? `namespaces/${namespace}/${type.Kind.toLowerCase()}${
                type.Kind.endsWith("s") ? "es" : "s"
              }`
            : `${type.Kind.toLowerCase()}${
                type.Kind.endsWith("s") ? "es" : "s"
              }`
        }${name ? `/${name}` : ""}`
      )
    )
      .then((response) => {
        if (!response || !response.status || response.status >= 400) {
          throw Messages.Error.errFetchingKubernetesResource(
            `${type.ApiVersion}/${type.Kind}`,
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

  populateInstance(ingresses: Array<any>, vzInstance, instanceId): Instance {
    const instanceURLs = vzInstance.status.instance;

    const consoleIngress = ingresses.find(
      (ingress) =>
        ingress.metadata.name === "verrazzano-console-ingress" &&
        ingress.metadata.namespace === NamespaceVerrazzanoSystem
    );
    if (!consoleIngress) {
      throw new Error(
        Messages.Error.errIngressFetchError(
          "verrazzano-system",
          "verrazzano-console-ingress"
        )
      );
    }

    const consoleHost = ((consoleIngress.spec.tls as Array<any>)[0]
      .hosts as Array<string>)[0];

    const instance = <Instance>{
      id: instanceId,
      version: vzInstance.status.version,
      mgmtCluster: "local",
      status: vzInstance.status.state,
      name: consoleHost.split(".")[1],
      profile: this.getInstallProfileValue(vzInstance.spec.profile),
      vzApiUri: `${vzInstance.status.consoleUrl}/${this.apiVersion}`,
    };

    instance.rancherUrl = instanceURLs.rancherUrl;
    instance.keyCloakUrl = instanceURLs.keyCloakUrl;
    instance.elasticUrl = instanceURLs.elasticUrl;
    instance.kibanaUrl = instanceURLs.kibanaUrl;
    instance.prometheusUrl = instanceURLs.prometheusUrl;
    instance.grafanaUrl = instanceURLs.grafanaUrl;

    instance.isUsingSharedVMI = true;
    return instance;
  }

  getInstallProfileValue(profileName): String {
    let profileString = Messages.Labels.prodProfile();
    switch (profileName) {
      case "dev":
        profileString = Messages.Labels.devProfile();
        break;
      case "managed-cluster":
        profileString = Messages.Labels.mgdClusterProfile();
    }
    return profileString;
  }

  public constructor() {
    this.fetchApi = KeycloakJet.getInstance().getAuthenticatedFetchApi();
    this.getInstance = this.getInstance.bind(this);
    this.listOAMComponents = this.listOAMComponents.bind(this);
    this.getOAMApplication = this.getOAMApplication.bind(this);
    this.getOAMComponent = this.getOAMComponent.bind(this);
    this.getKubernetesResource = this.getKubernetesResource.bind(this);
  }
}
