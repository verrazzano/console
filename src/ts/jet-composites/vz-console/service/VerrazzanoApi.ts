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
  ResourceTypeType,
  ResourceType,
} from "./types";
import {
  extractModelsFromApplications,
  extractBindingsFromApplications,
  getVmiInstancesForBinding,
  processOAMData,
} from "./common";
import { KeycloakJet } from "vz-console/auth/KeycloakJet";
import * as Messages from "vz-console/utils/Messages";
import * as yaml from "js-yaml";

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
      this.getKubernetesResource(
        ResourceType.Deployment,
        NamespaceVerrazzanoSystem,
        "verrazzano-operator"
      ),
    ])
      .then(
        ([ingressResponse, vmcResponse, vmiResponse, deploymentResponse]) => {
          return Promise.all([
            ingressResponse.json(),
            vmcResponse.json(),
            vmiResponse.json(),
            deploymentResponse.json(),
          ]);
        }
      )
      .then(([ingresses, vmc, vmi, operatorDeployment]) => {
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

        if (!operatorDeployment) {
          throw new Error(Messages.Error.errOperatorDeploymentFetchError());
        }
        return this.populateInstance(
          ingresses.items,
          vmc.items,
          vmi,
          operatorDeployment,
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
    return Promise.all([
      this.getKubernetesResource(ResourceType.VerrazzanoBinding),
      this.getKubernetesResource(ResourceType.VerrazzanoModel),
    ])
      .then(([bindingResponse, modelResponse]) => {
        return Promise.all([bindingResponse.json(), modelResponse.json()]);
      })
      .then(([bindings, models]) => {
        if (!bindings || !bindings.items) {
          throw new Error(Messages.Error.errBindingsFetchError());
        }

        if (!models || !models.items) {
          throw new Error(Messages.Error.errModelsFetchError());
        }
        return this.populateApplications(bindings.items, models.items);
      });
  }

  public async getModel(modelId: string): Promise<Model> {
    console.log(Messages.Api.msgFetchModel(modelId));
    return this.listApplications().then((data) => {
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
    return this.listApplications()
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
    return Promise.all([
      this.getKubernetesResource(ResourceType.VerrazzanoBinding),
      this.getKubernetesResource(ResourceType.VerrazzanoModel),
    ])
      .then(([bindingResponse, modelResponse]) => {
        return Promise.all([bindingResponse.json(), modelResponse.json()]);
      })
      .then(([bindings, models]) => {
        if (!bindings || !bindings.items) {
          throw new Error(Messages.Error.errBindingsFetchError());
        }

        if (!models || !models.items) {
          throw new Error(Messages.Error.errModelsFetchError());
        }
        return this.populateSecrets(bindings.items, models.items);
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

  populateInstance(
    ingresses: Array<any>,
    clusters: Array<any>,
    vmi,
    operatorDeployment,
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

    if (operatorDeployment && operatorDeployment.spec.containers) {
      const container = (operatorDeployment.spec.containers as Array<any>).find(
        (ct) => ct.name === "verrazzano-operator"
      );
      if (
        container &&
        container.env &&
        (container.env as Array<any>).length > 0
      ) {
        const useSystemVmi = (container.env as Array<any>).find(
          (envVar) => envVar.name === "USE_SYSTEM_VMI"
        );
        if (useSystemVmi) {
          instance.isUsingSharedVMI = Boolean(useSystemVmi.value);
        }
      }
    }

    return instance;
  }

  populateApplications(
    bindings: Array<any>,
    models: Array<any>
  ): Application[] {
    const applications: Application[] = [];
    while (models.length > 0) {
      const model = models.pop();
      const bindingsForModel = bindings.filter(
        (binding) =>
          binding.metadata.namespace === model.metadata.namespace &&
          binding.spec.modelName === model.metadata.name
      );
      if (bindingsForModel && bindingsForModel.length > 0) {
        bindingsForModel.forEach((binding) => {
          applications.push({
            id: `${binding.metadata.uid}-${model.metadata.uid}`,
            description: binding.spec.description,
            name: binding.metadata.name,
            model: yaml.dump(yaml.load(JSON.stringify(model))),
            binding: yaml.dump(yaml.load(JSON.stringify(binding))),
            status: "NYI",
          });
        });
      } else {
        applications.push({
          id: `app-${model.metadata.uid}`,
          description: "",
          name: "",
          model: yaml.dump(yaml.load(JSON.stringify(model))),
          binding: "",
          status: "NYI",
        });
      }
    }
    return applications;
  }

  async populateSecrets(
    bindings: Array<any>,
    models: Array<any>
  ): Promise<Secret[]> {
    const secretsMap: Map<string, Map<string, Secret>> = new Map();
    const secrets: Secret[] = [];
    try {
      for (const model of models) {
        if (model.spec.weblogicDomains) {
          for (const domain of model.spec.weblogicDomains as Array<any>) {
            if (domain.domainCRValues.imagePullSecrets) {
              for (const pullSecret of domain.domainCRValues
                .imagePullSecrets as Array<any>) {
                await this.addSecret(
                  secretsMap,
                  model.metadata.namespace,
                  pullSecret.name
                );
              }
            }

            if (domain.domainCRValues.configOverrideSecrets) {
              for (const configOverrideSecret of domain.domainCRValues
                .configOverrideSecrets as Array<any>) {
                await this.addSecret(
                  secretsMap,
                  model.metadata.namespace,
                  configOverrideSecret
                );
              }
            }

            if (domain.domainCRValues.webLogicCredentialsSecret) {
              await this.addSecret(
                secretsMap,
                model.metadata.namespace,
                domain.domainCRValues.webLogicCredentialsSecret.name
              );
            }
          }
        }

        if (model.spec.helidonApplications) {
          for (const helidonApp of model.spec.helidonApplications as Array<
            any
          >) {
            if (helidonApp.imagePullSecrets) {
              for (const pullSecret of helidonApp.imagePullSecrets as Array<
                any
              >) {
                await this.addSecret(
                  secretsMap,
                  model.metadata.namespace,
                  pullSecret.name
                );
              }
            }
          }
        }

        if (model.spec.coherenceClusters) {
          for (const coherenceCluster of model.spec.coherenceClusters as Array<
            any
          >) {
            if (coherenceCluster.imagePullSecrets) {
              for (const pullSecret of coherenceCluster.imagePullSecrets as Array<
                any
              >) {
                await this.addSecret(
                  secretsMap,
                  model.metadata.namespace,
                  pullSecret.name
                );
              }
            }
          }
        }
      }

      for (const binding of bindings) {
        if (binding.spec.databaseBindings) {
          for (const dbBinding of binding.spec.databaseBindings as Array<any>) {
            if (dbBinding.credentials) {
              await this.addSecret(
                secretsMap,
                binding.metadata.namespace,
                dbBinding.credentials
              );
            }
          }
        }
      }
    } catch (error) {
      let errorMessage = error;
      if (error && error.message) {
        errorMessage = error.message;
      }
      throw new Error(errorMessage);
    }

    secretsMap.forEach((secretNameToSecretMap) =>
      secretNameToSecretMap.forEach((secret) => secrets.push(secret))
    );
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
