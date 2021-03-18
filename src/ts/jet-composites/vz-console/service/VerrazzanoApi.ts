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
      this.getKubernetesResource(
        ResourceType.VerrazzanoMonitoringInstance,
        NamespaceVerrazzanoSystem,
        "system"
      ),
    ])
      .then(([ingressResponse, vmiResponse]) => {
        return Promise.all([ingressResponse.json(), vmiResponse.json()]);
      })
      .then(([ingresses, vmi]) => {
        if (
          !ingresses ||
          !ingresses.items ||
          !((ingresses.items as Array<any>).length > 0)
        ) {
          throw new Error(Messages.Error.errIngressesFetchError());
        }

        if (!vmi) {
          throw new Error(Messages.Error.errVmiFetchError());
        }

        return this.populateInstance(ingresses.items, vmi, instanceId);
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
      this.getKubernetesResource(
        ResourceType.MultiClusterApplicationConfiguration
      ),
      this.getKubernetesResource(ResourceType.MultiClusterComponent),
    ])
      .then(
        ([appsResponse, compsResponse, mcAppsResponse, mcCompsResponse]) => {
          return Promise.all([
            appsResponse.json(),
            compsResponse.json(),
            mcAppsResponse.json(),
            mcCompsResponse.json(),
          ]);
        }
      )
      .then(([apps, components, mcApps, mcComponents]) => {
        if (!apps) {
          throw new Error(Messages.Error.errOAMApplicationsFetchError());
        }

        if (!components) {
          throw new Error(Messages.Error.errOAMComponentsFetchError());
        }

        if (!mcApps) {
          throw new Error(Messages.Error.errMCApplicationsFetchError());
        }

        if (!mcComponents) {
          throw new Error(Messages.Error.errMCComponentsFetchError());
        }

        const applications: OAMApplication[] = [];
        const comps: OAMComponent[] = [];
        const { oamApplications, oamComponents } = processOAMData(
          apps.items,
          components.items,
          mcApps.items,
          mcComponents.items
        );
        oamApplications.forEach((element) => {
          element.forEach((oamApplications) => {
            oamApplications.forEach((oamApplication) => {
              applications.push(oamApplication);
            });
          });
        });
        oamComponents.forEach((element) => {
          element.forEach((oamComponents) => {
            oamComponents.forEach((oamComponent) => {
              comps.push(oamComponent);
            });
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
      this.getKubernetesResource(
        ResourceType.MultiClusterApplicationConfiguration
      ),
      this.getKubernetesResource(ResourceType.MultiClusterComponent),
    ])
      .then(
        ([appsResponse, compsResponse, mcAppsResponse, mcCompsResponse]) => {
          return Promise.all([
            appsResponse.json(),
            compsResponse.json(),
            mcAppsResponse.json(),
            mcCompsResponse.json(),
          ]);
        }
      )
      .then(([apps, components, mcApps, mcComponents]) => {
        const applications: OAMApplication[] = [];
        if (!apps) {
          throw new Error(Messages.Error.errOAMApplicationsFetchError());
        }

        if (!components) {
          throw new Error(Messages.Error.errOAMComponentsFetchError());
        }

        if (!mcApps) {
          throw new Error(Messages.Error.errMCApplicationsFetchError());
        }

        if (!mcComponents) {
          throw new Error(Messages.Error.errMCComponentsFetchError());
        }

        const { oamApplications } = processOAMData(
          apps.items,
          components.items,
          mcApps.items,
          mcComponents.items
        );
        oamApplications.forEach((element) => {
          element.forEach((oamApplications) => {
            oamApplications.forEach((oamApplication) => {
              applications.push(oamApplication);
            });
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
      this.getKubernetesResource(
        ResourceType.MultiClusterApplicationConfiguration
      ),
      this.getKubernetesResource(ResourceType.MultiClusterComponent),
    ])
      .then(
        ([appsResponse, compsResponse, mcAppsResponse, mcCompsResponse]) => {
          return Promise.all([
            appsResponse.json(),
            compsResponse.json(),
            mcAppsResponse.json(),
            mcCompsResponse.json(),
          ]);
        }
      )
      .then(([apps, components, mcApps, mcComponents]) => {
        const comps: OAMComponent[] = [];
        if (!apps) {
          throw new Error(Messages.Error.errOAMApplicationsFetchError());
        }

        if (!components) {
          throw new Error(Messages.Error.errOAMComponentsFetchError());
        }

        if (!mcApps) {
          throw new Error(Messages.Error.errMCApplicationsFetchError());
        }

        if (!mcComponents) {
          throw new Error(Messages.Error.errMCComponentsFetchError());
        }

        const { oamComponents } = processOAMData(
          apps.items,
          components.items,
          mcApps.items,
          mcComponents.items
        );
        oamComponents.forEach((element) => {
          element.forEach((oamComponents) => {
            oamComponents.forEach((oamComponent) => {
              comps.push(oamComponent);
            });
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

  public async getOAMApplication(
    oamAppId: string,
    cluster: string
  ): Promise<OAMApplication> {
    return Promise.all([
      this.getKubernetesResource(ResourceType.ApplicationConfiguration),
      this.getKubernetesResource(ResourceType.Component),
      this.getKubernetesResource(
        ResourceType.MultiClusterApplicationConfiguration
      ),
      this.getKubernetesResource(ResourceType.MultiClusterComponent),
    ])
      .then(
        ([appsResponse, compsResponse, mcAppsResponse, mcCompsResponse]) => {
          return Promise.all([
            appsResponse.json(),
            compsResponse.json(),
            mcAppsResponse.json(),
            mcCompsResponse.json(),
          ]);
        }
      )
      .then(([apps, components, mcApps, mcComponents]) => {
        let oamApp: OAMApplication;
        if (!apps) {
          throw new Error(Messages.Error.errOAMApplicationsFetchError());
        }

        if (!components) {
          throw new Error(Messages.Error.errOAMComponentsFetchError());
        }

        if (!mcApps) {
          throw new Error(Messages.Error.errMCApplicationsFetchError());
        }

        if (!mcComponents) {
          throw new Error(Messages.Error.errMCComponentsFetchError());
        }

        const { oamApplications } = processOAMData(
          apps.items,
          components.items,
          mcApps.items,
          mcComponents.items
        );
        oamApplications.forEach((element) => {
          element.forEach((oamApplications) => {
            oamApplications.forEach((oamApplication) => {
              if (
                oamApplication.data.metadata.uid === oamAppId &&
                oamApplication.cluster.name === cluster
              ) {
                oamApp = oamApplication;
              }
            });
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

  public async getOAMComponent(
    oamCompId: string,
    cluster: string
  ): Promise<OAMComponent> {
    return Promise.all([
      this.getKubernetesResource(ResourceType.ApplicationConfiguration),
      this.getKubernetesResource(ResourceType.Component),
      this.getKubernetesResource(
        ResourceType.MultiClusterApplicationConfiguration
      ),
      this.getKubernetesResource(ResourceType.MultiClusterComponent),
    ])
      .then(
        ([appsResponse, compsResponse, mcAppsResponse, mcCompsResponse]) => {
          return Promise.all([
            appsResponse.json(),
            compsResponse.json(),
            mcAppsResponse.json(),
            mcCompsResponse.json(),
          ]);
        }
      )
      .then(([apps, components, mcApps, mcComponents]) => {
        let oamComp: OAMComponent;
        if (!apps) {
          throw new Error(Messages.Error.errOAMApplicationsFetchError());
        }

        if (!components) {
          throw new Error(Messages.Error.errOAMComponentsFetchError());
        }

        if (!mcApps) {
          throw new Error(Messages.Error.errMCApplicationsFetchError());
        }

        if (!mcComponents) {
          throw new Error(Messages.Error.errMCComponentsFetchError());
        }

        const { oamComponents } = processOAMData(
          apps.items,
          components.items,
          mcApps.items,
          mcComponents.items
        );
        oamComponents.forEach((element) => {
          element.forEach((oamComponents) => {
            oamComponents.forEach((oamComponent) => {
              if (
                oamComponent.data.metadata.uid === oamCompId &&
                oamComponent.cluster.name === cluster
              ) {
                oamComp = oamComponent;
              }
            });
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

  populateInstance(ingresses: Array<any>, vmi, instanceId): Instance {
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
      version: "0.1.0",
      mgmtCluster: "local",
      status: "OK",
      name: consoleHost.split(".")[1],
      vzApiUri: `https://${consoleHost}/${this.apiVersion}`,
    };

    const rancherIngress = ingresses.find(
      (ingress) =>
        ingress.metadata.name === "rancher" &&
        ingress.metadata.namespace === "cattle-system"
    );
    if (rancherIngress) {
      instance.rancherUrl = `https://${
        ((rancherIngress.spec.tls as Array<any>)[0].hosts as Array<string>)[0]
      }`;
    }

    const keycloakIngress = ingresses.find(
      (ingress) =>
        ingress.metadata.name === "keycloak" &&
        ingress.metadata.namespace === "keycloak"
    );
    if (keycloakIngress) {
      instance.keyCloakUrl = `https://${
        ((keycloakIngress.spec.tls as Array<any>)[0].hosts as Array<string>)[0]
      }`;
    }

    if (vmi.spec.elasticsearch && Boolean(vmi.spec.elasticsearch.enabled)) {
      const esIngress = ingresses.find(
        (ingress) =>
          ingress.metadata.name === "vmi-system-es-ingest" &&
          ingress.metadata.namespace === NamespaceVerrazzanoSystem
      );
      if (esIngress) {
        instance.elasticUrl = `https://${
          ((esIngress.spec.tls as Array<any>)[0].hosts as Array<string>)[0]
        }`;
      }
    }

    if (vmi.spec.kibana && Boolean(vmi.spec.kibana.enabled)) {
      const kibanaIngress = ingresses.find(
        (ingress) =>
          ingress.metadata.name === "vmi-system-kibana" &&
          ingress.metadata.namespace === NamespaceVerrazzanoSystem
      );
      if (kibanaIngress) {
        instance.kibanaUrl = `https://${
          ((kibanaIngress.spec.tls as Array<any>)[0].hosts as Array<string>)[0]
        }`;
      }
    }

    if (vmi.spec.prometheus && Boolean(vmi.spec.prometheus.enabled)) {
      const prometheusIngress = ingresses.find(
        (ingress) =>
          ingress.metadata.name === "vmi-system-prometheus" &&
          ingress.metadata.namespace === NamespaceVerrazzanoSystem
      );
      if (prometheusIngress) {
        instance.prometheusUrl = `https://${
          ((prometheusIngress.spec.tls as Array<any>)[0].hosts as Array<
            string
          >)[0]
        }`;
      }
    }

    if (vmi.spec.grafana && Boolean(vmi.spec.grafana.enabled)) {
      const grafanaIngress = ingresses.find(
        (ingress) =>
          ingress.metadata.name === "vmi-system-grafana" &&
          ingress.metadata.namespace === NamespaceVerrazzanoSystem
      );
      if (grafanaIngress) {
        instance.grafanaUrl = `https://${
          ((grafanaIngress.spec.tls as Array<any>)[0].hosts as Array<string>)[0]
        }`;
      }
    }

    instance.isUsingSharedVMI = true;
    return instance;
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
