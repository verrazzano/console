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
  Status, Component, ComponentSecret, PartialSecret, SecretUsage
} from "../service/types";
import { load } from "js-yaml";

export const extractInstances = (instances: any[]): Instance[] => {
  const result: Instance[] = [];
  instances.forEach(instance => {
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
  clusters.forEach(cluster => {
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
    model.modelComponents = extractModelComponentsFromApplications(applications, model.id);
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
  secrets: Secret[],
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
          componentType: component.type
        });
      }
    }
  }
  return componentSecrets;
};

// Extract the model component secrets
export const extractSecretsForModelComponents = (
  model: Model,
  secrets: Secret[],
): ComponentSecret[] => {
  return extractSecretsForComponents(model.modelComponents, secrets);
};

// Extract the binding component secrets
export const extractSecretsForBindingComponents = (
  binding: Binding,
  secrets: Secret[],
): ComponentSecret[] => {
  return extractSecretsForComponents(binding.model.modelComponents.filter((component) => {
    return isBindingUsingComponent(binding, component.name)
  }), secrets).concat(extractSecretsForComponents(binding.components, secrets));
};


export const extractBindingsFromApplications = (
  applications: Application[],
  lifecycleState?: string,
  modelId?: string
): Binding[] => {
  const bindings: Binding[] = [];
  const modelMap = processApplications(applications);
  for (const model of modelMap.values()) {
    if (modelId && model.id !==  modelId) {
      continue;
    }
    if (model.bindings) {
      model.bindings.forEach(binding => {
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
    return isBindingUsingComponent(binding, connection.component)
  })
}

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
    if (modelId && model.id !==  modelId) {
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
  applications.forEach(application => {
    const model = application.model && load(application.model);
    const binding = application.binding && load(application.binding);
    if (model) {
      const modelKey = model.objectmeta.uid;
      if (!models.has(modelKey)) {
        const connectionArr: Connection[] = [];
        const ingressArr: Ingress[] = [];
        processModelConnections(model, connectionArr, ingressArr);
        models.set(modelKey, {
          id: model.objectmeta.uid,
          name: model.objectmeta.name,
          description: model.spec.description,
          modelComponents: processModelComponents(model),
          connections: connectionArr,
          ingresses: ingressArr
        });
      }

      const resultModel = models.get(modelKey);
      if (binding) {
        const resultBinding: Binding = {
          id: binding.objectmeta.uid,
          model: resultModel,
          name: binding.objectmeta.name,
          description: binding.spec.description,
          state: "Running",
          components: processComponents(model, binding),
          ingresses: processBindingIngresses(binding, resultModel.ingresses)
        };
        resultBinding.connections = extractBindingConnections(resultModel.connections, resultBinding)
        if (!resultModel.bindings) {
          resultModel.bindings = [];
        }
        resultModel.bindings.push(resultBinding);
      }
      models.set(modelKey, resultModel);
    }
  });
  return models;
};

export const processComponents = (
  model: any,
  binding: any
): BindingComponent[] => {
  const components: BindingComponent[] = [];
  const clusters: string[] = [];
  if (model && binding) {
    const bindingId = binding.objectmeta.uid;
    const componentPlacements: Map<string, Placement> = new Map();
    const componentImages: Map<string, string> = new Map();
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

    if (model.spec.weblogicDomains) {
      model.spec.weblogicDomains.forEach((wlsDomain: any) => {
        if (wlsDomain.domainCRValues && wlsDomain.domainCRValues.image) {
          componentImages.set(wlsDomain.name, wlsDomain.domainCRValues.image);
        }

        if (wlsDomain.connections) {
          processConnections(
            componentPlacements,

            wlsDomain.connections,
            wlsDomain.name
          );
        }
      });
    }

    if (model.spec.helidonApplications) {
      model.spec.helidonApplications.forEach((helidonApp: any) => {
        if (helidonApp.image) {
          componentImages.set(helidonApp.name, helidonApp.image);
        }

        if (helidonApp.connections) {
          processConnections(
            componentPlacements,
            helidonApp.connections,
            helidonApp.name
          );
        }
      });
    }

    if (model.spec.coherenceClusters) {
      model.spec.coherenceClusters.forEach((coherenceCluster: any) => {
        if (coherenceCluster.image) {
          componentImages.set(coherenceCluster.name, coherenceCluster.image);
        }


        if (coherenceCluster.connections) {
          processConnections(
            componentPlacements,
            coherenceCluster.connections,
            coherenceCluster.name
          );
        }
      });
    }

    if (binding.spec.weblogicBindings) {
      binding.spec.weblogicBindings.forEach((weblogicBinding: any) => {
        const wlsDomainId = generateWlsNodeId(bindingId, weblogicBinding.name);
        const wlsDomainComponent: BindingComponent = {
          id: wlsDomainId,
          name: weblogicBinding.name,
          type: ComponentType.WLS,
          placement: componentPlacements.get(weblogicBinding.name),
          image: componentImages.get(weblogicBinding.name)
        };
        components.push(wlsDomainComponent);
      });
    }

    if (binding.spec.coherenceBindings) {
      binding.spec.coherenceBindings.forEach((coherenceBinding: any) => {
        const coherenceClusterId = generateCohNodeId(
          bindingId,
          coherenceBinding.name
        );
        const coherenceClusterComponent: BindingComponent = {
          id: coherenceClusterId,
          name: coherenceBinding.name,
          type: ComponentType.COH,
          placement: componentPlacements.get(coherenceBinding.name),
          image: componentImages.get(coherenceBinding.name)
        };
        components.push(coherenceClusterComponent);
      });
    }

    if (binding.spec.helidonBindings) {
      binding.spec.helidonBindings.forEach((helidonBinding: any) => {
        const helidonAppId = generateHelidonNodeId(
          bindingId,
          helidonBinding.name
        );
        const helidonAppComponent: BindingComponent = {
          id: helidonAppId,
          name: helidonBinding.name,
          type: ComponentType.MS,
          placement: componentPlacements.get(helidonBinding.name),
          image: componentImages.get(helidonBinding.name)
        };
        components.push(helidonAppComponent);
      });
    }

    if (binding.spec.ingressBindings) {
      binding.spec.ingressBindings.forEach((ingress: any) => {
        const ingressId = generateIngressNodeId(bindingId, ingress.name);
        let ingressPlacement: Placement = { cluster: "Unbound", namespace: "" };
        let ingressStatus = Status.Unbound;
        if (componentPlacements.has(ingress.name)) {
          ingressPlacement = componentPlacements.get(ingress.name);
          ingressStatus = Status.Bound;
        }
        const ingressComponent: BindingComponent = {
          id: ingressId,
          name: ingress.name,
          type: ComponentType.ING,
          placement: ingressPlacement,
          status: ingressStatus
        };
        components.push(ingressComponent);
      });
    }

    if (binding.spec.atpBindings) {
      binding.spec.atpBindings.forEach((atp: any) => {
        const atpId = generateAtpNodeId(bindingId, atp.name);
        let atpPlacement: Placement = { cluster: "Unbound", namespace: "" };
        let atpStatus = Status.Unbound;
        if (componentPlacements.has(atp.name)) {
          atpPlacement = componentPlacements.get(atp.name);
          atpStatus = Status.Unknown;
        }
        const atpComponent: BindingComponent = {
          id: atpId,
          name: atp.name,
          type: ComponentType.ATP,
          placement: atpPlacement,
          status: atpStatus
        };
        components.push(atpComponent);
      });
    }

    if (binding.spec.databaseBindings) {
      binding.spec.databaseBindings.forEach((database: any) => {
        const databaseId = generateDbNodeId(bindingId, database.name);
        let dbPlacement: Placement = { cluster: "Unbound", namespace: "" };
        let dbStatus = Status.Unbound;
        if (componentPlacements.has(database.name)) {
          dbPlacement = componentPlacements.get(database.name);
          dbStatus = Status.Unknown;
        }
        const databaseComponent: BindingComponent = {
          id: databaseId,
          name: database.name,
          type: ComponentType.DB,
          placement: dbPlacement,
          status: dbStatus
        };
        if (database.credentials) {
          databaseComponent.secrets = [];
          databaseComponent.secrets.push({ 
            name: database.credentials, 
            usage: SecretUsage.DatabaseSecret 
          });
        }
        components.push(databaseComponent);
      });
    }
  }
  return components;
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
export const processModelComponents = (
    model: any
): Component[] => {
  const components: Component[] = [];

  if (model && model.spec) {
    if (model.spec.weblogicDomains) {
      model.spec.weblogicDomains.forEach((wlsDomain: any) => {
        const c = <Component>{ id: generateWlsNodeId(model.objectmeta.id, wlsDomain.name) };
        components.push(c);
        c.secrets = [];
        c.type = ComponentType.WLS;
        c.name = wlsDomain.name;
        if (wlsDomain.domainCRValues) {
          if (wlsDomain.domainCRValues.image) {
            c.image = wlsDomain.domainCRValues.image;
          }
          if (wlsDomain.domainCRValues.imagepullsecrets) {
            for (const s of wlsDomain.domainCRValues.imagepullsecrets) {
              const ps = <PartialSecret>{ name: s.name, usage: SecretUsage.ImagePullSecret };
              c.secrets.push(ps);
            }
          }
          if (wlsDomain.domainCRValues.weblogiccredentialssecret
              && wlsDomain.domainCRValues.weblogiccredentialssecret.name) {
            const n = wlsDomain.domainCRValues.weblogiccredentialssecret.name;
            const ps = <PartialSecret>{ name: n, usage: SecretUsage.WebLogicCredentialsSecret };
            c.secrets.push(ps);
          }
        }
      });
    }

    if (model.spec.helidonApplications) {
      model.spec.helidonApplications.forEach((helidonApp: any) => {
        const c = <Component>{ id: generateHelidonNodeId(model.objectmeta.id, helidonApp.name) };
        components.push(c);
        c.secrets = [];
        c.type = ComponentType.MS;
        c.name = helidonApp.name;
        c.image = helidonApp.image;
        if (helidonApp.imagePullSecrets) {
          for (const s of helidonApp.imagePullSecrets) {
            const ps = <PartialSecret> { name: s.name, usage: SecretUsage.ImagePullSecret };
            c.secrets.push(ps);
          }
        }
      });
    }

    if (model.spec.coherenceClusters) {
      model.spec.coherenceClusters.forEach((coherenceCluster: any) => {
        const c = <Component>{ id: generateCohNodeId(model.objectmeta.id, coherenceCluster.name) };
        components.push(c);
        c.secrets = [];
        c.type = ComponentType.COH;
        c.name = coherenceCluster.name;
        c.image = coherenceCluster.image;
        if (coherenceCluster.imagePullSecrets) {
          for (const s of coherenceCluster.imagePullSecrets) {
            const ps = <PartialSecret> { name: s.name, usage: SecretUsage.ImagePullSecret };
            c.secrets.push(ps);
          }
        }
      });
    }
  }
  return components;
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
        const ing = <Ingress>{};
        ingresses.push(ing);
        ing.name = ib.name;
        ing.dnsName = ib.dnsName;

        // Add the port and prefix from the model ingress so
        // that they can be displayed in the binding ingress list UI.
        for (const modelIng of modelIngresses) {
          if (modelIng.name === ing.name) {
            ing.port = modelIng.port;
            ing.prefix = modelIng.prefix;
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
                cluster: componentPlacements.get(componentName).cluster
              });
            }
          }
        });
      }

      if (connection.atp) {
        connection.atp.forEach((atp: any) => {
          if (!componentPlacements.has(atp.name)) {
            if (componentPlacements.has(componentName)) {
              componentPlacements.set(
                  atp.name,
                  componentPlacements.get(componentName)
              );
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
    ingresses: Ingress[],
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

  }
}

function appendModelConnections(
    modelConnections: Connection[],
    Ingress: Ingress[],
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
          if (ingress.match) {
            c.prefix = ingress.match[0].uri.prefix;
          } else {
            c.prefix = "/";
          }
          c.component = componentName;
          Ingress.push(c);
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

      if (connection.atp) {
        connection.atp.forEach((atp: any) => {
          const c = <Connection>{};
          c.type = "ATP";
          c.name = atp.name === "" ? atp.target : atp.name;
          c.component = componentName;
          c.target = atp.target;
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
  domains.forEach(domain => {
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
  cohClusters.forEach(cohCluster => {
    result.push({
      id: cohCluster.id,
      name: cohCluster.name,
      cluster: cohCluster.cluster,
      image: cohCluster.image,
      namespace: cohCluster.namespace,
      podName: cohCluster.podName,
      role: cohCluster.role,
      status: cohCluster.status
    });
  });
  return result;
};

export const extractHelidonApps = (helidonApps: any[]): HelidonApp[] => {
  const result: HelidonApp[] = [];
  helidonApps.forEach(helidonApp => {
    result.push({
      id: helidonApp.name,
      name: helidonApp.name,
      cluster: helidonApp.cluster,
      namespace: helidonApp.namespace,
      type: helidonApp.type,
      status: helidonApp.status
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

function generateAtpNodeId(parentId: string, atpName: string): string {
  return generateId(parentId, "atp", atpName);
}

function generateDbNodeId(parentId: string, dbName: string): string {
  return generateId(parentId, "db", dbName);
}

function generateId(...args: string[]): string {
  return args
    .join("-")
    .replace(/\s+/g, "-")
    .toLowerCase();
}

export const getVmiInstancesForBinding = (bindingName: string, hostSuffix: string): VMI[] => {
  const vmis: VMI[] = [];
  vmis.push({
    id: bindingName+"-kibana",
    type: VMIType.Kibana,
    url:
      "https://" +
      VMIType.Kibana.charAt(0).toLowerCase() +
      VMIType.Kibana.slice(1).toLowerCase() +
      ".vmi." +
      bindingName.toLowerCase().replace(" ","") +
      hostSuffix
  },{
    id: bindingName+"-grafana",
    type: VMIType.Grafana,
    url:
      "https://" +
      VMIType.Grafana.charAt(0).toLowerCase() +
      VMIType.Grafana.slice(1).toLowerCase() +
      ".vmi." +
      bindingName.toLowerCase().replace(" ","") +
      hostSuffix
  },{
    id: bindingName+"-prom",
    type: VMIType.Prometheus,
    url:
      "https://" +
      VMIType.Prometheus.charAt(0).toLowerCase() +
      VMIType.Prometheus.slice(1).toLowerCase() +
      ".vmi." +
      bindingName.toLowerCase().replace(" ","") +
      hostSuffix
  },{
    id: bindingName+"-es",
    type: VMIType.ElasticSearch,
    url:
      "https://" +
      VMIType.ElasticSearch.charAt(0).toLowerCase() +
      VMIType.ElasticSearch.slice(1).toLowerCase() +
      ".vmi." +
      bindingName.toLowerCase().replace(" ","") +
      hostSuffix
  });
  return vmis;
};
