// Copyright (c) 2020, 2021, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import {
  Cluster,
  FetchApiSignature,
  ImageBuildRequest,
  Instance,
  OAMApplication,
  OAMComponent,
  Project,
  ResourceType,
  ResourceTypeType,
  RoleBinding,
} from "./types";
import {
  processOAMData,
  processClusterData,
  processProjectsData,
  processRoleBindingsData,
} from "./common";
import * as Messages from "vz-console/utils/Messages";
import { VzError } from "vz-console/utils/error";

export const ServicePrefix = "instances";

export class VerrazzanoApi {
  private fetchApi: FetchApiSignature;

  private apiVersion: string = (window as any).vzApiVersion || "20210501";
  private defaultUrl: string;
  private url: string;
  private cluster: string = "local";

  public async getInstance(instanceId: string): Promise<Instance> {
    return Promise.all([this.getKubernetesResource(ResourceType.Verrazzano)])
      .then(([vzResponse]) => {
        return Promise.all([vzResponse.json()]);
      })
      .then(([vzs]) => {
        // There can be only one installed Verrazzano instance, but we don't know
        // the coordinates ahead of time; do a list and find the instance
        if (!vzs || !vzs.items || (vzs.items as Array<any>).length !== 1) {
          throw new Error(Messages.Error.errVzFetchError());
        }
        const vzArray = vzs.items as Array<any>;
        return this.populateInstance(vzArray[0], instanceId);
      })
      .catch((error) => {
        throw this.wrapWithVzError(error);
      });
  }

  public async listOAMAppsAndComponents(): Promise<{
    oamApplications: OAMApplication[];
    oamComponents: OAMComponent[];
  }> {
    try {
      const [appsResponse, compsResponse] = await Promise.all([
        this.getKubernetesResource(ResourceType.ApplicationConfiguration),
        this.getKubernetesResource(ResourceType.Component),
      ]);

      let mcAppsResponse = <Response>{};
      let mcCompsResponse = <Response>{};

      if (this.cluster === "local") {
        [mcAppsResponse, mcCompsResponse] = await Promise.all([
          this.getKubernetesResource(
            ResourceType.MultiClusterApplicationConfiguration
          ),
          this.getKubernetesResource(ResourceType.MultiClusterComponent),
        ]);
      }

      const [
        appsObj,
        componentsObj,
        mcAppsObj,
        mcComponentsObj,
      ] = await Promise.all([
        appsResponse.json(),
        compsResponse.json(),
        mcAppsResponse.json ? mcAppsResponse.json() : {},
        mcCompsResponse.json ? mcCompsResponse.json() : {},
      ]);

      if (!appsObj) {
        throw new Error(Messages.Error.errOAMApplicationsFetchError());
      }

      if (!componentsObj) {
        throw new Error(Messages.Error.errOAMComponentsFetchError());
      }

      if (!mcAppsObj) {
        throw new Error(Messages.Error.errMCApplicationsFetchError());
      }

      if (!mcComponentsObj) {
        throw new Error(Messages.Error.errMCComponentsFetchError());
      }

      const mcApps = mcAppsObj.items || [];
      const mcComponents = mcComponentsObj.items || [];
      const apps = appsObj.items;
      const components = componentsObj.items;

      const mcApplicationsByClusterAndNamespace = this.collectMulticlusterAppsByClusterAndNamespace(
        mcApps
      );
      const mcComponentsByClusterAndNamespace = this.collectMulticlusterComponentsByClusterAndNamespace(
        mcComponents
      );

      await this.populateMCAppsAndComponents(
        mcApplicationsByClusterAndNamespace,
        mcComponentsByClusterAndNamespace,
        components
      );

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
      const allOamComponents = oamComponents;

      mcApplicationsByClusterAndNamespace.forEach(
        (mcAppsByNamespace, cluster) => {
          const mcApps: any[] = [];
          const mcComps: any[] = [];
          mcAppsByNamespace.forEach((mcAppsByName, namespace) => {
            mcAppsByName.forEach((mcApp) => {
              mcApps.push(mcApp);

              // Add to mcComps all the regular (i.e. non-MC) components, that correspond to this MC app config
              mcComps.push(...this.findComponentsForMcApp(mcApp, components));

              // Get the (legacy, pre v1.1) MultiClusterComponents if they exist for this app's
              // cluster and namespace.
              // eslint-disable-next-line chai-friendly/no-unused-expressions
              mcComponentsByClusterAndNamespace
                .get(cluster)
                ?.get(namespace)
                ?.forEach((mcComp) => {
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

      // Any OAM components that were not part of MC apps targeted at other clusters should be considered as part of
      // this VerrazzanoApi instance's cluster
      const oamCompsForThisCluster: OAMComponent[] = [];
      allOamComponents.forEach((mapOfOAMComps) => {
        mapOfOAMComps.forEach((oamComp) => {
          if (!oamComp.cluster || !oamComp.cluster.name) {
            oamComp.cluster = { name: this.cluster };
          }
          if (oamComp.cluster.name === this.cluster) {
            oamCompsForThisCluster.push(oamComp);
          }
        });
      });

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
      comps.push(...oamCompsForThisCluster);

      return { oamApplications: applications, oamComponents: comps };
    } catch (error) {
      throw this.wrapWithVzError(error);
    }
  }

  private async populateMCAppsAndComponents(
    mcApplicationsByClusterAndNamespace: Map<
      string,
      Map<string, Map<string, any>>
    >,
    mcComponentsByClusterAndNamespace: Map<
      string,
      Map<string, Map<string, any>>
    >,
    componentsArray: any[]
  ) {
    for (const [
      cluster,
      mcAppsByNamespace,
    ] of mcApplicationsByClusterAndNamespace) {
      const vmc = await this.getVMC(cluster);
      if (!vmc) {
        continue;
      }

      // Process any legacy MC component resources and retrieve the corresponding component from target cluster
      for (const [
        namespace,
        mcComponents,
      ] of mcComponentsByClusterAndNamespace.get(cluster) || []) {
        for (const [name] of mcComponents) {
          try {
            const resource = await new VerrazzanoApi(
              cluster
            ).getKubernetesResource(ResourceType.Component, namespace, name);
            const component = await resource.json();
            mcComponents.set(name, component);
          } catch (error) {
            console.log(
              `Failure retrieving component ${name} from cluster ${cluster}: ${error}`
            );
          }
        }
      }

      // Process MC Application configurations - if the corresponding component is not in the list of legacy
      // MC Components collected above, look for a non-MC component
      for (const [namespace, mcApps] of mcAppsByNamespace) {
        const appComponentsPerNS = [];
        for (const [name] of mcApps) {
          try {
            const vzApi = new VerrazzanoApi(cluster);
            const resource = await vzApi.getKubernetesResource(
              ResourceType.ApplicationConfiguration,
              namespace,
              name
            );
            const app = await resource.json();
            mcApps.set(name, app);
            const appComponents = this.findComponentsForMcApp(
              app,
              componentsArray
            );
            if (appComponents) {
              for (const appComp of appComponents) {
                const compResource = await vzApi.getKubernetesResource(
                  ResourceType.Component,
                  namespace,
                  appComp.metadata.name
                );
                const comp = await compResource?.json();
                appComponentsPerNS.push(comp);
              }
            }
          } catch (error) {
            console.log(
              `Failure retrieving app ${name} from cluster ${cluster}: ${error}`
            );
          }
        }
        // add these components to the mcComponents for the current cluster and namespace
        this.addComponentsForClusterAndNamespace(
          mcComponentsByClusterAndNamespace,
          cluster,
          namespace,
          appComponentsPerNS
        );
      }
    }

    return {
      mcApplicationsByClusterAndNamespace,
      mcComponentsByClusterAndNamespace,
    };
  }

  public async listClusters(): Promise<Cluster[]> {
    return this.getKubernetesResource(ResourceType.Cluster)
      .then((clusterResponse) => {
        return clusterResponse.json();
      })
      .then((clustersResponse) => {
        return processClusterData(clustersResponse.items);
      })
      .catch((error) => {
        throw this.wrapWithVzError(error);
      });
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

  public async getPromise(
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
        }${name ? `/${name}` : ""}${
          this.cluster && this.cluster !== "local"
            ? `?cluster=${this.cluster}`
            : ""
        }`,
        { credentials: "include" }
      )
    ).then((response) => {
      return response;
    });
  }

  public async getKubernetesResource(
    type: ResourceTypeType,
    namespace?: string,
    name?: string
  ): Promise<Response> {
    for (let i = 0; i < 5; i++) {
      let r1 = this.getPromise(type, namespace, name);
      if (!r1 || !(await r1).status || (await r1).status >= 400) {
        if (r1 && (await r1).status === 401) {
          // Display refresh page dialog
          this.showRefreshPageDialog();
          return r1;
        } else if (i === 4) {
          throw new VzError(
            Messages.Error.errFetchingKubernetesResource(
              `${type.ApiVersion}/${type.Kind}`,
              namespace,
              name,
              this.cluster === "local" ? "" : this.cluster
            ),
            (await r1)?.status
          );
        }
      } else {
        return r1;
      }
      r1 = null;
    }
  }

  public async postKubernetesResource(
    type: ResourceTypeType,
    data: any,
    namespace?: string
  ): Promise<Response> {
    const response = await this.fetchApi(
      `${this.url}/${type.ApiVersion}/${
        namespace
          ? `namespaces/${namespace}/${type.Kind.toLowerCase()}${
              type.Kind.endsWith("s") ? "es" : "s"
            }`
          : `${type.Kind.toLowerCase()}${type.Kind.endsWith("s") ? "es" : "s"}`
      }`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      }
    );
    if (!response || !response.status || response.status >= 400) {
      if (response && response.status === 401) {
        // Display refresh page dialog
        this.showRefreshPageDialog();
      } else {
        const jsonResponse = await response.json();
        throw new VzError(
          Messages.Error.errCreatingKubernetesResource(
            `${type.ApiVersion}/${type.Kind}`,
            namespace,
            data.metadata.name,
            jsonResponse.message
          ),
          response?.status
        );
      }
    }
    return response;
  }

  populateInstance(vzInstance, instanceId): Instance {
    const instance = <Instance>{
      id: instanceId,
      version: vzInstance.status?.version,
      mgmtCluster: "local",
      status: vzInstance.status?.state,
      name: vzInstance.spec.environmentName,
      profile: this.getInstallProfileValue(vzInstance.spec.profile),
      vzApiUri:
        vzInstance.status != null
          ? `${vzInstance.status.consoleUrl}/${this.apiVersion}`
          : "",
    };

    if (vzInstance.status != null) {
      const instanceURLs = vzInstance.status.instance;
      instance.rancherUrl = instanceURLs.rancherUrl;
      instance.keyCloakUrl = instanceURLs.keyCloakUrl;
      instance.elasticUrl = instanceURLs.elasticUrl;
      instance.kibanaUrl = instanceURLs.kibanaUrl;
      instance.prometheusUrl = instanceURLs.prometheusUrl;
      instance.grafanaUrl = instanceURLs.grafanaUrl;
      instance.kialiUrl = instanceURLs.kialiUrl;
      instance.jaegerUrl = instanceURLs.jaegerUrl;
    }
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

  public async getVMC(clusterName: string): Promise<string> {
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
          // the cluster for this VMC is likely not yet fully registered. Return an empty string
          // so that we don't try to fetch from the cluster
          return "";
        }

        return vmc.metadata.name;
      })
      .catch((error) => {
        if (
          error instanceof VzError &&
          (error as VzError).getCode() === VzError.HTTPNotFoundCode
        ) {
          return "";
        }
        throw this.wrapWithVzError(error);
      });
  }

  public async listProjects(): Promise<Project[]> {
    return this.getKubernetesResource(ResourceType.VerrazzanoProject)
      .then((projectsResponse) => {
        return projectsResponse.json();
      })
      .then((projects) => {
        if (!projects) {
          throw new Error(Messages.Error.errProjectsFetchError());
        }

        return processProjectsData(projects.items);
      })
      .catch((error) => {
        throw this.wrapWithVzError(error);
      });
  }

  public async listImageBuildRequests(): Promise<ImageBuildRequest[]> {
    return this.getKubernetesResource(ResourceType.VerrazzanoImageBuildRequest)
      .then((buildRequestResponse) => {
        return buildRequestResponse.json();
      })
      .then((imageBuildRequests) => {
        if (!imageBuildRequests) {
          throw new Error(Messages.Error.errImageBuildRequestsFetchError());
        }
        return imageBuildRequests.items;
      })
      .catch((error) => {
        throw this.wrapWithVzError(error);
      });
  }

  public async listRoleBindings(namespace: string): Promise<RoleBinding[]> {
    return this.getKubernetesResource(ResourceType.RoleBinding, namespace)
      .then((rbResponse) => {
        return rbResponse.json();
      })
      .then((roleBindings) => {
        if (!roleBindings) {
          throw new Error(Messages.Error.errRoleBindingsFetchError(namespace));
        }

        return processRoleBindingsData(roleBindings.items);
      })
      .catch((error) => {
        throw this.wrapWithVzError(error);
      });
  }

  public async getProject(projectId: string): Promise<Project> {
    const projects = await this.listProjects();
    const project = projects.find(
      (project) => project.data.metadata.uid === projectId
    );
    return project;
  }

  public constructor(
    cluster: string = "local",
    fetchApi: FetchApiSignature = null
  ) {
    this.defaultUrl = `${(window as any).vzApiUrl || ""}`;
    this.cluster = cluster;
    this.url = `${this.defaultUrl}/${this.apiVersion}`;
    this.fetchApi = fetchApi || window.fetch.bind(window);
    this.getInstance = this.getInstance.bind(this);
    this.listOAMComponents = this.listOAMComponents.bind(this);
    this.getOAMApplication = this.getOAMApplication.bind(this);
    this.getOAMComponent = this.getOAMComponent.bind(this);
    this.getKubernetesResource = this.getKubernetesResource.bind(this);
    this.getVMC = this.getVMC.bind(this);
    this.listProjects = this.listProjects.bind(this);
    this.getProject = this.getProject.bind(this);
    this.listImageBuildRequests = this.listImageBuildRequests.bind(this);
  }

  private collectMulticlusterAppsByClusterAndNamespace(
    mcApps: any
  ): Map<string, Map<string, Map<string, any>>> {
    const mcApplicationsByClusterAndNamespace = new Map<
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
        mcApp.spec.placement.clusters
          .filter((cluster) => cluster.name !== "local")
          .forEach((cluster) => {
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
              // Template might not have a name/namespace - set it from the top level
              if (mcApp?.spec?.template?.metadata) {
                mcApp.spec.template.metadata.name = mcApp.metadata.name;
                mcApp.spec.template.metadata.namespace =
                  mcApp.metadata.namespace;
                mcApp.spec.template.metadata.creationTimestamp =
                  mcApp.metadata.creationTimestamp;
              }
              mcAppsInNamespace.set(mcApp.metadata.name, mcApp.spec.template);
            }
          });
      }
    });
    return mcApplicationsByClusterAndNamespace;
  }

  private collectMulticlusterComponentsByClusterAndNamespace(
    mcComponents: any
  ) {
    const mcComponentsByClusterAndNamespace = new Map<
      string,
      Map<string, Map<string, any>>
    >();
    mcComponents.forEach((mcComponent) => {
      if (
        mcComponent &&
        mcComponent.spec &&
        mcComponent.spec.placement &&
        mcComponent.spec.placement.clusters &&
        mcComponent.spec.placement.clusters.length > 0
      ) {
        mcComponent.spec.placement.clusters
          .filter((cluster) => cluster.name !== "local")
          .forEach((cluster) => {
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
              // Template might not have a name/namespace - set it from the top level
              if (mcComponent?.spec?.template?.metadata) {
                mcComponent.spec.template.metadata.name =
                  mcComponent.metadata.name;
                mcComponent.spec.template.metadata.namespace =
                  mcComponent.metadata.namespace;
                mcComponent.spec.template.metadata.creationTimestamp =
                  mcComponent.metadata.creationTimestamp;
              }
              mcComponentsInNamespace.set(
                mcComponent.metadata.name,
                mcComponent.spec.template
              );
            }
          });
      }
    });
    return mcComponentsByClusterAndNamespace;
  }

  private findComponentsForMcApp(mcApp: any, components: any): any[] {
    const componentsForMcApp: any = [];
    if (mcApp.spec && mcApp.spec.components) {
      mcApp.spec.components.forEach((appComponent) => {
        if (appComponent.componentName) {
          const matchingComp = components.find(
            (comp) =>
              comp.metadata.name === appComponent.componentName &&
              comp.metadata.namespace === mcApp.metadata.namespace
          );
          if (matchingComp) {
            componentsForMcApp.push(matchingComp);
          }
        }
      });
    }
    return componentsForMcApp;
  }

  // add the given list of components to the given "by cluster and namespace" map of components
  private addComponentsForClusterAndNamespace(
    mcComponentsByClusterAndNamespace: Map<
      string,
      Map<string, Map<string, any>>
    >,
    cluster: string,
    namespace: string,
    compsToAdd: any[]
  ) {
    if (compsToAdd.length === 0) {
      return;
    }
    let mcCompsByCluster = mcComponentsByClusterAndNamespace.get(cluster);
    if (!mcCompsByCluster) {
      mcCompsByCluster = new Map<string, Map<string, any>>();
      mcComponentsByClusterAndNamespace.set(cluster, mcCompsByCluster);
    }
    let mcCompsForNS = mcCompsByCluster.get(namespace);
    if (!mcCompsForNS) {
      mcCompsForNS = new Map<string, any>();
      mcCompsByCluster.set(namespace, mcCompsForNS);
    }
    compsToAdd.forEach((appComp) => {
      mcCompsForNS.set(appComp.metadata.name, appComp);
    });
  }

  private wrapWithVzError = (error: Error): VzError => {
    return error instanceof VzError ? error : new VzError(error);
  };

  showRefreshPageDialog = () => {
    document.getElementById("showRefreshPageDialogButton").click();
  };
}
