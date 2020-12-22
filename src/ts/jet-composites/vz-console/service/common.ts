// Copyright (c) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import {
  Instance,
  Cluster,
  Model,
  Binding,
  Application,
  Domain,
  CohCluster,
  HelidonApp,
  BindingComponent,
  ComponentType,
  Placement,
  VMI,
  VMIType,
  Secret,
  Connection,
  Ingress,
  Status,
  Component,
  ComponentSecret,
  PartialSecret,
  SecretUsage,
} from "../service/types";
import { load } from "js-yaml";
import * as DateTimeConverter from "ojs/ojconverter-datetime";

export const extractInstances = (instances: any[]): Instance[] => {
  const result: Instance[] = [];
  instances.forEach((instance) => {
    result.push({
      id: instance.id,
      name: instance.name,
      mgmtCluster: instance.mgmtCluster,
      mgmtPlatform: instance.mgmtPlatform,
      status: instance.status,
      version: instance.version,
      keyCloakUrl: instance.keyCloakUrl,
      rancherUrl: instance.rancherUrl,
      vzApiUri: instance.vzApiUri,
    });
  });
  return result;
};

export const extractClusters = (clusters: any[]): Cluster[] => {
  const result: Cluster[] = [];
  clusters.forEach((cluster) => {
    result.push({
      id: cluster.id,
      name: cluster.name,
      type: cluster.type,
      status: cluster.status,
      serverAddress: cluster.serverAddress,
    });
  });
  return result;
};

export const extractModelsFromApplications = (
  applications: Application[]
): Model[] => {
  const models: Model[] = [];
  const modelMap = processApplications(applications);
  for (const model of modelMap.values()) {
    model.modelComponents = extractModelComponentsFromApplications(
      applications,
      model.id
    );
    models.push(model);
  }
  return models;
};

export const extractModelComponentsFromApplications = (
  applications: Application[],
  modelId: string
): Component[] => {
  return processModelComponentFromApplications(applications, modelId);
};

// Extract the secrets used by components
export const extractSecretsForComponents = (
  components: Component[],
  secrets: Secret[]
): ComponentSecret[] => {
  const secretSet: Map<string, Secret> = new Map();
  for (const secret of secrets) {
    secretSet.set(secret.name, secret);
  }
  const componentSecrets: ComponentSecret[] = [];
  for (const component of components) {
    if (!component.secrets) {
      continue;
    }
    for (const componentSecret of component.secrets) {
      if (secretSet.has(componentSecret.name)) {
        const secret = secretSet.get(componentSecret.name);
        componentSecrets.push({
          id: secret.id,
          name: secret.name,
          type: secret.type,
          usage: componentSecret.usage,
          componentName: component.name,
          componentType: component.type,
        });
      }
    }
  }
  return componentSecrets;
};

// Extract the model component secrets
export const extractSecretsForModelComponents = (
  model: Model,
  secrets: Secret[]
): ComponentSecret[] => {
  return extractSecretsForComponents(model.modelComponents, secrets);
};

// Extract the binding component secrets
export const extractSecretsForBindingComponents = (
  binding: Binding,
  secrets: Secret[]
): ComponentSecret[] => {
  return extractSecretsForComponents(
    binding.model.modelComponents.filter((component) => {
      return isBindingUsingComponent(binding, component.name);
    }),
    secrets
  ).concat(extractSecretsForComponents(binding.components, secrets));
};

export const extractBindingsFromApplications = (
  applications: Application[],
  lifecycleState?: string,
  modelId?: string
): Binding[] => {
  const bindings: Binding[] = [];
  const modelMap = processApplications(applications);
  for (const model of modelMap.values()) {
    if (modelId && model.id !== modelId) {
      continue;
    }
    if (model.bindings) {
      model.bindings.forEach((binding) => {
        if (lifecycleState) {
          if (binding.state === lifecycleState) {
            bindings.push(binding);
          }
        } else {
          bindings.push(binding);
        }
      });
    }
  }
  return bindings;
};

export const extractBindingConnections = (
  modelConnections?: Connection[],
  binding?: Binding
): Connection[] => {
  return modelConnections.filter((connection) => {
    return isBindingUsingComponent(binding, connection.component);
  });
};

// Return true if the binding is using the specified component
export const isBindingUsingComponent = (
  binding: Binding,
  componentName?: string
): boolean => {
  for (const comp of binding.components) {
    if (componentName === comp.name) {
      return true;
    }
  }
  return false;
};

// Return the ingresses from either the model or binding.
export const extractIngressesFromApplications = (
  applications: Application[],
  modelId?: string,
  bindingId?: string
): Ingress[] => {
  const ingresses: Ingress[] = [];
  const modelMap = processApplications(applications);
  for (const model of modelMap.values()) {
    if (modelId && model.id !== modelId) {
      continue;
    }
    const binding = getBindingFromModel(model, bindingId);
    if (binding) {
      return binding.ingresses;
    } else {
      return model.ingresses;
    }
  }
  return ingresses;
};

// Return the binding for the given binding Id.
export const getBindingFromModel = (
  model: Model,
  bindingId?: string
): Binding => {
  if (bindingId) {
    for (const binding of model.bindings) {
      if (bindingId === binding.id) {
        return binding;
      }
    }
  }
  return null;
};

export const extractPlacementsFromApplications = (
  applications: Application[],
  bindingId?: string
): Placement[] => {
  const placements: Placement[] = [];
  const modelMap = processApplications(applications);
  for (const model of modelMap.values()) {
    for (const binding of model.bindings) {
      if (bindingId && binding.id !== bindingId) {
        continue;
      }
      for (const component of binding.components.values()) {
        if (component.placement) {
          if (component.placement.namespace) {
            const p = <Placement>{};
            p.id = component.name;
            p.component = component.name;
            p.namespace = component.placement.namespace;
            p.cluster = component.placement.cluster;
            p.componentType = component.type;
            placements.push(p);
          }
        }
      }
    }
  }
  return placements;
};

export const processApplications = (
  applications: Application[]
): Map<string, Model> => {
  const models = new Map<string, Model>();
  applications.forEach((application) => {
    const model = application.model && load(application.model);
    const binding = application.binding && load(application.binding);
    if (model) {
      const modelKey = model.objectmeta.uid;
      if (!models.has(modelKey)) {
        models.set(modelKey, processModel(model));
      }
      const resultModel = models.get(modelKey);
      if (binding) {
        if (!resultModel.bindings) {
          resultModel.bindings = [];
        }
        resultModel.bindings.push(processBinding(binding, model, resultModel));
      }
    }
  });
  return models;
};

const processBinding = (binding, model, resultModel: Model): Binding => {
  const resultBinding: Binding = {
    id: binding.objectmeta.uid,
    model: resultModel,
    name: binding.objectmeta.name,
    description: binding.spec.description,
    state: Status.Running,
    components: processComponents(model, binding),
    ingresses: processBindingIngresses(binding, resultModel.ingresses),
    namespace: binding.objectmeta.namespace,
    createdOn: new DateTimeConverter.IntlDateTimeConverter({
      pattern: "dd-MMM-yyyy HH:mm:ss.s",
    }).format(binding.objectmeta.creationtimestamp),
  };
  resultBinding.connections = extractBindingConnections(
    resultModel.connections,
    resultBinding
  );
  return resultBinding;
};

const processModel = (model): Model => {
  const connectionArr: Connection[] = [];
  const ingressArr: Ingress[] = [];
  processModelConnections(model, connectionArr, ingressArr);
  return {
    id: model.objectmeta.uid,
    name: model.objectmeta.name,
    description: model.spec.description,
    modelComponents: processModelComponents(model),
    connections: connectionArr,
    ingresses: ingressArr,
    namespace: model.objectmeta.namespace,
    createdOn: new DateTimeConverter.IntlDateTimeConverter({
      pattern: "dd-MMM-yyyy HH:mm:ss.s",
    }).format(model.objectmeta.creationtimestamp),
  };
};

export const processComponents = (
  model: any,
  binding: any
): BindingComponent[] => {
  const components: BindingComponent[] = [];
  if (model && binding) {
    const bindingId = binding.objectmeta.uid;
    const componentPlacements = processPlacements(binding);
    if (model.spec.weblogicDomains) {
      model.spec.weblogicDomains.forEach((wlsDomain: any) => {
        const placement = componentPlacements.get(wlsDomain.name);
        if (placement) {
          processConnections(
            componentPlacements,
            wlsDomain.connections,
            wlsDomain.name
          );
          components.push({
            ...processWebLogicDomainComponent(wlsDomain, bindingId),
            placement,
          });
        }
      });
    }

    if (model.spec.helidonApplications) {
      model.spec.helidonApplications.forEach((helidonApp: any) => {
        const placement = componentPlacements.get(helidonApp.name);
        if (placement) {
          processConnections(
            componentPlacements,
            helidonApp.connections,
            helidonApp.name
          );
          components.push({
            ...processHelidonApplicationComponent(helidonApp, bindingId),
            placement,
          });
        }
      });
    }

    if (model.spec.coherenceClusters) {
      model.spec.coherenceClusters.forEach((coherenceCluster: any) => {
        const placement = componentPlacements.get(coherenceCluster.name);
        if (placement) {
          processConnections(
            componentPlacements,
            coherenceCluster.connections,
            coherenceCluster.name
          );
          components.push({
            ...processCoherenceClusterComponent(coherenceCluster, bindingId),
            placement,
          });
        }
      });
    }

    if (model.spec.genericComponents) {
      model.spec.genericComponents.forEach((genericComponent: any) => {
        const placement = componentPlacements.get(genericComponent.name);
        if (placement) {
          processConnections(
            componentPlacements,
            genericComponent.connections,
            genericComponent.name
          );
          components.push({
            ...processGenericComponent(genericComponent, bindingId),
            placement,
          });
        }
      });
    }

    if (binding.spec.ingressBindings) {
      binding.spec.ingressBindings.forEach((ingress: any) => {
        let ingressPlacement: Placement = { cluster: "Unbound", namespace: "" };
        let ingressStatus = Status.Unbound;
        if (componentPlacements.has(ingress.name)) {
          ingressPlacement = componentPlacements.get(ingress.name);
          ingressStatus = Status.Bound;
        }
        components.push(
          processIngressBindingComponent(
            ingress,
            bindingId,
            ingressPlacement,
            ingressStatus
          )
        );
      });
    }

    if (binding.spec.databaseBindings) {
      binding.spec.databaseBindings.forEach((database: any) => {
        let dbPlacement: Placement = { cluster: "Unbound", namespace: "" };
        let dbStatus = Status.Unbound;
        if (componentPlacements.has(database.name)) {
          dbPlacement = componentPlacements.get(database.name);
          dbStatus = Status.Unknown;
        }
        components.push(
          processDatabaseBindingComponent(
            database,
            bindingId,
            dbPlacement,
            dbStatus
          )
        );
      });
    }
  }
  return components;
};

const processWebLogicDomainComponent = (
  wlsDomain,
  parentId: string
): Component => {
  const wlsDomainId = generateWlsNodeId(parentId, wlsDomain.name);
  return {
    id: wlsDomainId,
    name: wlsDomain.name,
    type: ComponentType.WLS,
    images:
      wlsDomain.domainCRValues && wlsDomain.domainCRValues.image
        ? [wlsDomain.domainCRValues.image]
        : null,
  };
};

const processHelidonApplicationComponent = (
  helidonApp,
  parentId: string
): Component => {
  const helidonAppId = generateHelidonNodeId(parentId, helidonApp.name);
  return {
    id: helidonAppId,
    name: helidonApp.name,
    type: ComponentType.MS,
    images: [helidonApp.image],
  };
};

const processCoherenceClusterComponent = (
  coherenceCluster,
  parentId: string
): Component => {
  const coherenceClusterId = generateCohNodeId(parentId, coherenceCluster.name);
  return {
    id: coherenceClusterId,
    name: coherenceCluster.name,
    type: ComponentType.COH,
    images: [coherenceCluster.image],
  };
};

const processGenericComponent = (
  genericComponent,
  parentId: string
): Component => {
  const images = [];
  if (genericComponent.deployment && genericComponent.deployment.containers) {
    genericComponent.deployment.containers.forEach((container) => {
      if (container.image) {
        images.push(container.image);
      }
    });
  }

  const genericComponentId = generateGenericComponentNodeId(
    parentId,
    genericComponent.name
  );
  return {
    id: genericComponentId,
    name: genericComponent.name,
    type: ComponentType.GEN,
    images,
  };
};

const processIngressBindingComponent = (
  ingress,
  bindingId: string,
  placement: Placement,
  status: Status
): BindingComponent => {
  const ingressId = generateIngressNodeId(bindingId, ingress.name);
  return {
    id: ingressId,
    name: ingress.name,
    type: ComponentType.ING,
    placement,
    status,
  };
};

const processDatabaseBindingComponent = (
  database,
  bindingId: string,
  placement: Placement,
  status: Status
): BindingComponent => {
  const databaseId = generateDbNodeId(bindingId, database.name);

  const databaseComponent: BindingComponent = {
    id: databaseId,
    name: database.name,
    type: ComponentType.DB,
    placement,
    status,
  };
  if (database.credentials) {
    databaseComponent.secrets = [];
    databaseComponent.secrets.push({
      name: database.credentials,
      usage: SecretUsage.DatabaseSecret,
    });
  }
  return databaseComponent;
};

const processPlacements = (binding): Map<string, Placement> => {
  const componentPlacements: Map<string, Placement> = new Map();
  const clusters: string[] = [];
  if (binding.spec.placement) {
    binding.spec.placement.forEach((placement: any) => {
      clusters.push(placement.name);
      if (placement.namespaces) {
        placement.namespaces.forEach((namespace: any) => {
          if (namespace.components) {
            namespace.components.forEach((component: { name: string }) => {
              componentPlacements.set(component.name, {
                cluster: placement.name,
                namespace: namespace.name,
              });
            });
          }
        });
      }
    });
  }
  return componentPlacements;
};

// Find the model in the applicaiton list then return list of ModelComponents used for that model
export const processModelComponentFromApplications = (
  applications: Application[],
  modelId: string
): Component[] => {
  const components: Component[] = [];
  for (const app of applications) {
    const model = app.model && load(app.model);
    if (model && modelId === model.objectmeta.uid) {
      return processModelComponents(model);
    }
  }
  return components;
};

// Return the list of ModelComponents used for a specific model
export const processModelComponents = (model: any): Component[] => {
  const components: Component[] = [];

  if (model && model.spec) {
    if (model.spec.weblogicDomains) {
      model.spec.weblogicDomains.forEach((wlsDomain: any) => {
        const wlsDomainComponent = processWebLogicDomainComponent(
          wlsDomain,
          model.objectmeta.uid
        );
        components.push(wlsDomainComponent);
        wlsDomainComponent.secrets = [];
        if (wlsDomain.domainCRValues) {
          if (wlsDomain.domainCRValues.imagepullsecrets) {
            processModelSecrets(
              wlsDomain.domainCRValues.imagepullsecrets,
              SecretUsage.ImagePullSecret,
              wlsDomainComponent.secrets
            );
          }

          if (wlsDomain.domainCRValues.weblogiccredentialssecret) {
            processModelSecrets(
              [wlsDomain.domainCRValues.weblogiccredentialssecret],
              SecretUsage.WebLogicCredentialsSecret,
              wlsDomainComponent.secrets
            );
          }
        }
      });
    }

    if (model.spec.helidonApplications) {
      model.spec.helidonApplications.forEach((helidonApp: any) => {
        const helidonAppComponent = processHelidonApplicationComponent(
          helidonApp,
          model.objectmeta.uid
        );
        components.push(helidonAppComponent);
        helidonAppComponent.secrets = [];
        if (helidonApp.imagePullSecrets) {
          processModelSecrets(
            helidonApp.imagePullSecrets,
            SecretUsage.ImagePullSecret,
            helidonAppComponent.secrets
          );
        }
      });
    }

    if (model.spec.coherenceClusters) {
      model.spec.coherenceClusters.forEach((coherenceCluster: any) => {
        const cohClusterComponent = processCoherenceClusterComponent(
          coherenceCluster,
          model.objectmeta.uid
        );
        components.push(cohClusterComponent);
        cohClusterComponent.secrets = [];
        if (coherenceCluster.imagePullSecrets) {
          processModelSecrets(
            coherenceCluster.imagePullSecrets,
            SecretUsage.ImagePullSecret,
            cohClusterComponent.secrets
          );
        }
      });
    }

    if (model.spec.genericComponents) {
      model.spec.genericComponents.forEach((component: any) => {
        const genericComponent = processGenericComponent(
          component,
          model.objectmeta.uid
        );
        components.push(genericComponent);
        genericComponent.secrets = [];
        if (component.deployment && component.deployment.imagepullsecrets) {
          processModelSecrets(
            component.deployment.imagepullsecrets,
            SecretUsage.ImagePullSecret,
            genericComponent.secrets
          );
        }
      });
    }
  }
  return components;
};

const processModelSecrets = (
  modelSecrets: { name: string }[],
  usage: SecretUsage,
  secrets: PartialSecret[]
) => {
  for (const secret of modelSecrets) {
    const ps = <PartialSecret>{
      name: secret.name,
      usage,
    };
    secrets.push(ps);
  }
};

// Return the list of ModelComponents used for a specific model
export const processBindingIngresses = (
  binding: any,
  modelIngresses: Ingress[]
): Ingress[] => {
  const ingresses: Ingress[] = [];

  if (binding && binding.spec) {
    if (binding.spec.ingressBindings) {
      binding.spec.ingressBindings.forEach((ib: any) => {
        const bindingIngress = <Ingress>{};
        bindingIngress.name = ib.name;
        bindingIngress.dnsName = ib.dnsName;

        // Add the port and prefix from the model ingress so
        // that they can be displayed in the binding ingress list UI.
        for (const modelIngress of modelIngresses) {
          if (modelIngress.name === bindingIngress.name) {
            const ingress = { ...bindingIngress };
            ingress.port = modelIngress.port;
            ingress.prefix = modelIngress.prefix;
            ingresses.push(ingress);
          }
        }
      });
    }
  }
  return ingresses;
};

function processConnections(
  componentPlacements: Map<string, Placement>,
  connections: any,
  componentName: string
): void {
  if (connections && componentPlacements) {
    connections.forEach((connection: any) => {
      if (connection.ingress) {
        connection.ingress.forEach((ingress: any) => {
          if (!componentPlacements.has(ingress.name)) {
            if (componentPlacements.has(componentName)) {
              componentPlacements.set(ingress.name, {
                cluster: componentPlacements.get(componentName).cluster,
              });
            }
          }
        });
      }

      if (connection.database) {
        connection.database.forEach((db: any) => {
          if (!componentPlacements.has(db.name)) {
            if (componentPlacements.has(componentName)) {
              componentPlacements.set(
                db.name,
                componentPlacements.get(componentName)
              );
            }
          }
        });
      }

      if (connection.coherence) {
        connection.coherence.forEach((coh: any) => {
          if (!componentPlacements.has(coh.name)) {
            if (componentPlacements.has(componentName)) {
              componentPlacements.set(
                coh.name,
                componentPlacements.get(componentName)
              );
            }
          }
        });
      }
    });
  }
}

function processModelConnections(
  model: any,
  connections: Connection[],
  ingresses: Ingress[]
): void {
  if (model) {
    if (model.spec.weblogicDomains) {
      model.spec.weblogicDomains.forEach((wlsDomain: any) => {
        if (wlsDomain.connections) {
          appendModelConnections(
            connections,
            ingresses,
            wlsDomain.connections,
            wlsDomain.name
          );
        }
      });
    }

    if (model.spec.helidonApplications) {
      model.spec.helidonApplications.forEach((helidonApp: any) => {
        if (helidonApp.connections) {
          appendModelConnections(
            connections,
            ingresses,
            helidonApp.connections,
            helidonApp.name
          );
        }
      });
    }

    if (model.spec.coherenceClusters) {
      model.spec.coherenceClusters.forEach((coherenceCluster: any) => {
        if (coherenceCluster.connections) {
          appendModelConnections(
            connections,
            ingresses,
            coherenceCluster.connections,
            coherenceCluster.name
          );
        }
      });
    }

    if (model.spec.genericComponents) {
      model.spec.genericComponents.forEach((genericComponent: any) => {
        if (genericComponent.connections) {
          appendModelConnections(
            connections,
            ingresses,
            genericComponent.connections,
            genericComponent.name
          );
        }
      });
    }
  }
}

function appendModelConnections(
  modelConnections: Connection[],
  ingresses: Ingress[],
  connections: any,
  componentName: string
): void {
  if (connections) {
    connections.forEach((connection: any) => {
      if (connection.ingress) {
        connection.ingress.forEach((ingress: any) => {
          const c = <Ingress>{};
          c.name = ingress.name;
          c.port = "80";
          c.component = componentName;
          if (ingress.match) {
            ingress.match.forEach((matchItem) => {
              if (matchItem.uri && matchItem.uri.prefix) {
                const ingressItem = { ...c };
                ingressItem.prefix = matchItem.uri.prefix;
                ingresses.push(ingressItem);
              }
            });
          } else {
            const ingressItem = { ...c };
            ingressItem.prefix = "/";
            ingresses.push(ingressItem);
          }
        });
      }

      if (connection.rest) {
        connection.rest.forEach((rest: any) => {
          const c = <Connection>{};
          c.type = "Rest";
          c.name = rest.target;
          c.component = componentName;
          c.target = rest.target;
          modelConnections.push(c);
        });
      }

      if (connection.database) {
        connection.database.forEach((db: any) => {
          const c = <Connection>{};
          c.type = "Database";
          c.name = db.name;
          c.component = componentName;
          c.target = "";
          modelConnections.push(c);
        });
      }

      if (connection.coherence) {
        connection.coherence.forEach((coh: any) => {
          const c = <Connection>{};
          c.type = "Coherence";
          c.name = coh.target;
          c.component = componentName;
          c.target = coh.target;
          modelConnections.push(c);
        });
      }
    });
  }
}

export const extractDomains = (domains: any[]): Domain[] => {
  const result: Domain[] = [];
  domains.forEach((domain) => {
    let t3Port = "";
    if (domain.t3Address) {
      const split = domain.t3Address.split(":", 3);
      if (split.length >= 3 && split[2]) {
        t3Port = split[2];
      }
    }

    let adminPort = "";
    if (domain.adminServerAddress) {
      const split = domain.adminServerAddress.split(":", 3);
      if (split.length >= 3 && split[2]) {
        adminPort = split[2];
      }
    }
    const id = domain.id;
    const name = domain.id;
    result.push({ id, name, adminPort, t3Port });
  });
  return result;
};

export const extractCohClusters = (cohClusters: any[]): CohCluster[] => {
  const result: CohCluster[] = [];
  cohClusters.forEach((cohCluster) => {
    result.push({
      id: cohCluster.id,
      name: cohCluster.name,
      cluster: cohCluster.cluster,
      image: cohCluster.image,
      namespace: cohCluster.namespace,
      podName: cohCluster.podName,
      role: cohCluster.role,
      status: cohCluster.status,
    });
  });
  return result;
};

export const extractHelidonApps = (helidonApps: any[]): HelidonApp[] => {
  const result: HelidonApp[] = [];
  helidonApps.forEach((helidonApp) => {
    result.push({
      id: helidonApp.name,
      name: helidonApp.name,
      cluster: helidonApp.cluster,
      namespace: helidonApp.namespace,
      type: helidonApp.type,
      status: helidonApp.status,
    });
  });
  return result;
};

function generateCohNodeId(parentId: string, cohName: string): string {
  return generateId(parentId, "coh", cohName);
}

function generateHelidonNodeId(parentId: string, helidonName: string): string {
  return generateId(parentId, "helidon", helidonName);
}

function generateWlsNodeId(parentId: string, wlsName: string): string {
  return generateId(parentId, "wls", wlsName);
}

function generateIngressNodeId(parentId: string, ingName: string): string {
  return generateId(parentId, "ingress", ingName);
}

function generateDbNodeId(parentId: string, dbName: string): string {
  return generateId(parentId, "db", dbName);
}

function generateGenericComponentNodeId(
  parentId: string,
  genName: string
): string {
  return generateId(parentId, "gen", genName);
}

function generateId(...args: string[]): string {
  return args.join("-").replace(/\s+/g, "-").toLowerCase();
}

export const getVmiInstancesForBinding = (
  bindingName: string,
  instance: Instance
): VMI[] => {
  const vmis: VMI[] = [];
  const bindingNameSuffix = bindingName.toLowerCase().replace(" ", "");
  const useSystemVMI = !(
    typeof instance.isUsingSharedVMI === "undefined" ||
    !instance.isUsingSharedVMI
  );
  vmis.push(
    {
      id: bindingName + "-kibana",
      type: VMIType.Kibana,
      url: useSystemVMI
        ? instance.kibanaUrl
        : instance.kibanaUrl.replace(
            ".vmi.system.",
            `.vmi.${bindingNameSuffix}.`
          ),
    },
    {
      id: bindingName + "-grafana",
      type: VMIType.Grafana,
      url: useSystemVMI
        ? instance.grafanaUrl
        : instance.grafanaUrl.replace(
            ".vmi.system.",
            `.vmi.${bindingNameSuffix}.`
          ),
    },
    {
      id: bindingName + "-prom",
      type: VMIType.Prometheus,
      url: useSystemVMI
        ? instance.prometheusUrl
        : instance.prometheusUrl.replace(
            ".vmi.system.",
            `.vmi.${bindingNameSuffix}.`
          ),
    },
    {
      id: bindingName + "-es",
      type: VMIType.ElasticSearch,
      url: useSystemVMI
        ? instance.elasticUrl
        : instance.elasticUrl.replace(
            ".vmi.system.",
            `.vmi.${bindingNameSuffix}.`
          ),
    }
  );
  return vmis;
};
