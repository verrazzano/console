// Copyright (c) 2020, 2021, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import {
  Application,
  FetchApiSignature,
  Instance,
  OAMApplication,
  OAMComponent,
  ResourceType,
  ResourceTypeType,
  Secret,
  Status,
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
      this.getKubernetesResource(ResourceType.VerrazzanoManagedCluster),
      this.getKubernetesResource(
        ResourceType.VerrazzanoMonitoringInstance,
        NamespaceVerrazzanoSystem,
        "system"
      ),
    ])
      .then(
        ([ingressResponse, vmcResponse, vmiResponse]) => {
          return Promise.all([
            ingressResponse.json(),
            vmcResponse.json(),
            vmiResponse.json(),
          ]);
        }
      )
      .then(([ingresses, vmc, vmi]) => {
        if (
          !ingresses ||
          !ingresses.items ||
          !((ingresses.items as Array<any>).length > 0)
        ) {
          throw new Error(Messages.Error.errIngressesFetchError());
        }

        if (!vmc || !vmc.items || !((vmc.items as Array<any>).length > 0)) {
          throw new Error(Messages.Error.errVmcsFetchError());
        }

        if (!vmi) {
          throw new Error(Messages.Error.errVmiFetchError());
        }

        return this.populateInstance(
          ingresses.items,
          vmc.items,
          vmi,
          instanceId
        );
      })
      .catch((error) => {
        let errorMessage = error;
        if (error && error.message) {
          errorMessage = error.message;
        }
        throw new Error(errorMessage);
      });
  }

  public async listApplications(): Promise<Application[]> {
    return this.populateApplications();
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

  public async listSecrets(): Promise<Secret[]> {
    return this.populateSecrets();
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

  populateInstance(
    ingresses: Array<any>,
    clusters: Array<any>,
    vmi,
    instanceId
  ): Instance {
    const mgmtCluster = clusters.find(
      (cluster) => cluster.metadata.name === "local"
    );
    if (!mgmtCluster) {
      throw new Error(Messages.Error.errVmcFetchError("local"));
    }

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
      mgmtCluster: mgmtCluster.metadata.name,
      mgmtPlatform: mgmtCluster.spec.type,
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

  populateApplications(): Application[] {
    const applications: Application[] = [];
    return applications;
  }

  async populateSecrets(): Promise<Secret[]> {
    const secrets: Secret[] = [];
    return secrets;
  }

  async addSecret(
    secrets: Map<string, Map<string, Secret>>,
    namespace: string,
    name: string
  ) {
    let secretsInNS = secrets.get(namespace);
    if (!secretsInNS) {
      secretsInNS = new Map();
      secrets.set(namespace, secretsInNS);
    }

    if (secretsInNS.has(name)) {
      return;
    }

    try {
      const secret = await this.getKubernetesResource(
        ResourceType.Secret,
        namespace,
        name
      ).then((secretResponse) => secretResponse.json());
      if (secret.metadata) {
        secretsInNS.set(name, {
          id: secret.metadata.uid,
          name: secret.metadata.name,
          namespace: secret.metadata.namespace,
          type: secret.type,
          status: Status.Ready,
        });
      }
    } catch (error) {
      let errorMessage = error;
      if (error && error.message) {
        errorMessage = error.message;
      }
      throw new Error(errorMessage);
    }
  }

  public constructor() {
    this.fetchApi = KeycloakJet.getInstance().getAuthenticatedFetchApi();
    this.listApplications = this.listApplications.bind(this);
    this.getInstance = this.getInstance.bind(this);
    this.listSecrets = this.listSecrets.bind(this);
    this.listOAMApplications = this.listApplications.bind(this);
    this.listOAMComponents = this.listOAMComponents.bind(this);
    this.getOAMApplication = this.getOAMApplication.bind(this);
    this.getOAMComponent = this.getOAMComponent.bind(this);
    this.getKubernetesResource = this.getKubernetesResource.bind(this);
  }
}
