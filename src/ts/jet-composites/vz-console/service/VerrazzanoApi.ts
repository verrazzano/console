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
  private defaultUrl: string;
  private url: string;
  private cluster: string = "local";

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
        if (this.cluster === "local") {
          return Promise.all([
            appsResponse,
            compsResponse,
            this.getKubernetesResource(
              ResourceType.MultiClusterApplicationConfiguration
            ),
            this.getKubernetesResource(ResourceType.MultiClusterComponent),
          ]);
        } else {
          return Promise.all([
            appsResponse,
            compsResponse,
            <Response>{},
            <Response>{},
          ]);
        }
      })
      .then(
        ([appsResponse, compsResponse, mcAppsResponse, mcCompsResponse]) => {
          return Promise.all([
            appsResponse.json(),
            compsResponse.json(),
            mcAppsResponse.json ? mcAppsResponse.json() : {},
            mcCompsResponse.json ? mcCompsResponse.json() : {},
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
        return [
          apps.items,
          components.items,
          mcApps.items ? mcApps.items : [],
          mcComponents.items ? mcComponents.items : [],
        ];
      })
      .then(([apps, components, mcApps, mcComponents]) => {
        const mcApplicationsByClusterAndNamespace = new Map<
          string,
          Map<string, Map<string, any>>
        >();
        const mcComponentsByClusterAndNamespace = new Map<
          string,
          Map<string, Map<string, any>>
        >();
        mcApps.forEach((mcApp) => {
          if (
            mcApp &&
            mcApp.spec.placement &&
            mcApp.spec.placement.clusters &&
            mcApp.spec.placement.clusters.length > 0
          ) {
            mcApp.spec.placement.clusters.forEach((cluster) => {
              let mcAppsInCluster = mcApplicationsByClusterAndNamespace.get(
                cluster.name
              );
              if (!mcAppsInCluster) {
                mcAppsInCluster = new Map<string, Map<string, any>>();
                mcApplicationsByClusterAndNamespace.set(
                  cluster.name,
                  mcAppsInCluster
                );
              }
              if (
                mcApp.metadata &&
                mcApp.metadata.name &&
                mcApp.metadata.namespace
              ) {
                let mcAppsInNamespace = mcAppsInCluster.get(
                  mcApp.metadata.namespace
                );
                if (!mcAppsInNamespace) {
                  mcAppsInNamespace = new Map<string, any>();
                  mcAppsInCluster.set(
                    mcApp.metadata.namespace,
                    mcAppsInNamespace
                  );
                }
                mcAppsInNamespace.set(mcApp.metadata.name, {});
              }
            });
          }
        });
        mcComponents.forEach((mcComponent) => {
          if (
            mcComponent &&
            mcComponent.spec &&
            mcComponent.spec.placement &&
            mcComponent.spec.placement.clusters &&
            mcComponent.spec.placement.clusters.length > 0
          ) {
            mcComponent.spec.placement.clusters.forEach((cluster) => {
              let mcComponentsInCluster = mcComponentsByClusterAndNamespace.get(
                cluster.name
              );
              if (!mcComponentsInCluster) {
                mcComponentsInCluster = new Map<string, Map<string, any>>();
                mcComponentsByClusterAndNamespace.set(
                  cluster.name,
                  mcComponentsInCluster
                );
              }
              if (
                mcComponent.metadata &&
                mcComponent.metadata.name &&
                mcComponent.metadata.namespace
              ) {
                let mcComponentsInNamespace = mcComponentsInCluster.get(
                  mcComponent.metadata.namespace
                );
                if (!mcComponentsInNamespace) {
                  mcComponentsInNamespace = new Map<string, any>();
                  mcComponentsInCluster.set(
                    mcComponent.metadata.namespace,
                    mcComponentsInNamespace
                  );
                }
                mcComponentsInNamespace.set(mcComponent.metadata.name, {});
              }
            });
          }
        });
        return {
          apps,
          components,
          mcApplicationsByClusterAndNamespace,
          mcComponentsByClusterAndNamespace,
        };
      })
      .then(
        ({
          apps,
          components,
          mcApplicationsByClusterAndNamespace,
          mcComponentsByClusterAndNamespace,
        }) => {
          return this.populateMCAppsAndComponents(
            apps,
            components,
            mcApplicationsByClusterAndNamespace,
            mcComponentsByClusterAndNamespace
          );
        }
      )
      .then(
        ({
          apps,
          components,
          mcApplicationsByClusterAndNamespace,
          mcComponentsByClusterAndNamespace,
        }) => {
          const applicationsByClusterAndNamespace = new Map<
            string,
            Map<string, Map<string, any>>
          >();
          const componentsByClusterAndNamespace = new Map<
            string,
            Map<string, Map<string, any>>
          >();
          const { oamApplications, oamComponents } = processOAMData(
            apps,
            components,
            this.cluster
          );
          applicationsByClusterAndNamespace.set(this.cluster, oamApplications);
          componentsByClusterAndNamespace.set(this.cluster, oamComponents);
          mcApplicationsByClusterAndNamespace.forEach(
            (mcAppsByNamespace, cluster) => {
              const mcApps: any[] = [];
              const mcComps: any[] = [];
              mcAppsByNamespace.forEach((mcAppsByName, namespace) => {
                mcAppsByName.forEach((mcApp) => {
                  mcApps.push(mcApp);
                  mcComponentsByClusterAndNamespace
                    .get(cluster)
                    .get(namespace)
                    .forEach((mcComp) => {
                      mcComps.push(mcComp);
                    });
                });
              });

              const { oamApplications, oamComponents } = processOAMData(
                mcApps,
                mcComps,
                cluster
              );
              applicationsByClusterAndNamespace.set(cluster, oamApplications);
              componentsByClusterAndNamespace.set(cluster, oamComponents);
            }
          );
          return {
            applicationsByClusterAndNamespace,
            componentsByClusterAndNamespace,
          };
        }
      )
      .then(
        ({
          applicationsByClusterAndNamespace,
          componentsByClusterAndNamespace,
        }) => {
          const applications: OAMApplication[] = [];
          const comps: OAMComponent[] = [];
          applicationsByClusterAndNamespace.forEach((element) => {
            element.forEach((oamApplications) => {
              oamApplications.forEach((oamApplication) => {
                applications.push(oamApplication);
              });
            });
          });
          componentsByClusterAndNamespace.forEach((element) => {
            element.forEach((oamComponents) => {
              oamComponents.forEach((oamComponent) => {
                comps.push(oamComponent);
              });
            });
          });
          return { oamApplications: applications, oamComponents: comps };
        }
      )
      .catch((error) => {
        let errorMessage = error;
        if (error && error.message) {
          errorMessage = error.message;
        }
        throw new Error(errorMessage);
      });
  }

  private async populateMCAppsAndComponents(
    apps: any,
    components: any,
    mcApplicationsByClusterAndNamespace: Map<
      string,
      Map<string, Map<string, any>>
    >,
    mcComponentsByClusterAndNamespace: Map<
      string,
      Map<string, Map<string, any>>
    >
  ) {
    for (const [
      cluster,
      mcAppsByNamespace,
    ] of mcApplicationsByClusterAndNamespace) {
      const apiUrl = await this.getAPIUrl(cluster);
      for (const [namespace, mcApps] of mcAppsByNamespace) {
        for (const [name] of mcApps) {
          const resource = await new VerrazzanoApi(
            apiUrl,
            cluster
          ).getKubernetesResource(
            ResourceType.ApplicationConfiguration,
            namespace,
            name
          );
          const app = await resource.json();
          mcApps.set(name, app);
        }
      }

      for (const [
        namespace,
        mcComponents,
      ] of mcComponentsByClusterAndNamespace.get(cluster)) {
        for (const [name] of mcComponents) {
          const resource = await new VerrazzanoApi(
            apiUrl,
            cluster
          ).getKubernetesResource(ResourceType.Component, namespace, name);
          const component = await resource.json();
          mcComponents.set(name, component);
        }
      }
    }

    return {
      apps,
      components,
      mcApplicationsByClusterAndNamespace,
      mcComponentsByClusterAndNamespace,
    };
  }

  public async listOAMApplications(): Promise<OAMApplication[]> {
    const { oamApplications } = await this.listOAMAppsAndComponents();
    return oamApplications;
  }

  public async listOAMComponents(): Promise<OAMComponent[]> {
    const { oamComponents } = await this.listOAMAppsAndComponents();
    return oamComponents;
  }

  public async getOAMApplication(
    oamAppId: string,
    cluster: string
  ): Promise<OAMApplication> {
    const oamApplications = await this.listOAMApplications();
    const oamApplictaion = oamApplications.find(
      (oamApplication) =>
        oamApplication.data.metadata.uid === oamAppId &&
        oamApplication.cluster.name === cluster
    );
    return oamApplictaion;
  }

  public async getOAMComponent(
    oamCompId: string,
    cluster: string
  ): Promise<OAMComponent> {
    const oamComponents = await this.listOAMComponents();
    const oamComponent = oamComponents.find(
      (oamComponent) =>
        oamComponent.data.metadata.uid === oamCompId &&
        oamComponent.cluster.name === cluster
    );
    return oamComponent;
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


  public async getAPIUrl(clusterName: string): Promise<string> {
    return this.getKubernetesResource(
      ResourceType.VerrazzanoManagedCluster,
      "verrazzano-mc",
      clusterName
    )
      .then((vmcResponse) => {
        return vmcResponse.json();
      })
      .then((vmc) => {
        if (!vmc) {
          throw new Error(Messages.Error.errVmcFetchError(clusterName));
        }

        if (!vmc.status || !vmc.status.apiUrl) {
          throw new Error(
            Messages.Error.errFetchApiURLFromVMCError(clusterName)
          );
        }

        return vmc.status.apiUrl;
      })
      .catch((error) => {
        let errorMessage = error;
        if (error && error.message) {
          errorMessage = error.message;
        }
        throw new Error(errorMessage);
      });
  }

  public constructor(url: string = "", cluster: string = "local") {
    this.defaultUrl = `${(window as any).vzApiUrl || ""}`;
    this.cluster = cluster;
    this.url = `${url || this.defaultUrl}/${this.apiVersion}`;
    this.fetchApi = KeycloakJet.getInstance().getAuthenticatedFetchApi(!!url);
    this.getInstance = this.getInstance.bind(this);
    this.listOAMComponents = this.listOAMComponents.bind(this);
    this.getOAMApplication = this.getOAMApplication.bind(this);
    this.getOAMComponent = this.getOAMComponent.bind(this);
    this.getKubernetesResource = this.getKubernetesResource.bind(this);
    this.getAPIUrl = this.getAPIUrl.bind(this);
  }
}
