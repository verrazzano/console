// Copyright (c) 2020, 2021, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import {
  Instance,
  Cluster,
  Domain,
  CohCluster,
  HelidonApp,
  Secret,
  Status,
  Component,
  ComponentSecret,
  OAMApplication,
  OAMComponent,
  OAMComponentInstance,
} from "../service/types";
import * as DateTimeConverter from "ojs/ojconverter-datetime";
import { getStatusForOAMResource } from "vz-console/utils/utils";

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

export const processOAMData = (
  applications: any[],
  components: any[]
): {
  oamApplications: Map<string, Map<string, OAMApplication>>;
  oamComponents: Map<string, Map<string, OAMComponent>>;
} => {
  const oamApplications = new Map<string, Map<string, OAMApplication>>();
  const oamComponents = new Map<string, Map<string, OAMComponent>>();
  components.forEach((component) => {
    if (
      component.metadata &&
      component.metadata.namespace &&
      component.metadata.name
    ) {
      const oamComponent = <OAMComponent>{
        name: component.metadata.name,
        namespace: component.metadata.namespace,
        workloadType:
          component.spec &&
          component.spec.workload &&
          component.spec.workload.kind
            ? component.spec.workload.kind
            : "",
        latestRevision:
          component.status &&
          component.status.latestRevision &&
          component.status.latestRevision.name,
        data: component,
        applications: [],
        createdOn: convertDate(component.metadata.creationTimestamp),
      };
      let oamComponentsForNS = oamComponents.get(component.metadata.namespace);
      if (!oamComponentsForNS) {
        oamComponentsForNS = new Map<string, OAMComponent>();
        oamComponents.set(component.metadata.namespace, oamComponentsForNS);
      }
      oamComponentsForNS.set(component.metadata.name, oamComponent);
    }
  });
  applications.forEach((application) => {
    if (
      application.metadata &&
      application.metadata.namespace &&
      application.metadata.name
    ) {
      const oamApplication = <OAMApplication>{
        name: application.metadata.name,
        namespace: application.metadata.namespace,
        data: application,
        status:
          application.status &&
          application.status.conditions &&
          application.status.conditions.length > 0
            ? getStatusForOAMResource(application.status.conditions[0].status)
            : Status.Unknown,
        createdOn: convertDate(application.metadata.creationTimestamp),
      };

      if (application.spec && application.spec.components) {
        oamApplication.componentInstances = [];
        let idx = 0;
        application.spec.components.forEach((appComponent) => {
          if (appComponent.componentName) {
            const oamComponentsForApplicationNS = oamComponents.get(
              application.metadata.namespace
            );
            if (oamComponentsForApplicationNS) {
              const oamComponentForApplicationComponent = oamComponentsForApplicationNS.get(
                appComponent.componentName
              );
              if (oamComponentForApplicationComponent) {
                if (
                  oamComponentForApplicationComponent.applications.findIndex(
                    (oamApplicationForComponent) => {
                      if (
                        application.metadata.name ===
                        oamApplicationForComponent.name
                      ) {
                        return oamApplicationForComponent;
                      }
                    }
                  ) < 0
                ) {
                  oamComponentForApplicationComponent.applications.push(
                    oamApplication
                  );
                }
                oamApplication.componentInstances.push(<OAMComponentInstance>{
                  name: appComponent.componentName,
                  oamComponent: oamComponentForApplicationComponent,
                  status: oamApplication.status,
                  id: `${application.metadata.uid}-${appComponent.componentName}-${idx}`,
                  data: appComponent,
                  creationDate: oamApplication.createdOn,
                });
                idx++;
              }
            }
          }
        });
      }

      let oamApplicationsForNS = oamApplications.get(
        application.metadata.namespace
      );
      if (!oamApplicationsForNS) {
        oamApplicationsForNS = new Map<string, OAMApplication>();
        oamApplications.set(
          application.metadata.namespace,
          oamApplicationsForNS
        );
      }
      oamApplicationsForNS.set(application.metadata, oamApplication);
    }
  });

  return { oamApplications, oamComponents };
};

export const convertDate = (timestamps: string): string => {
  return new DateTimeConverter.IntlDateTimeConverter({
    pattern: "dd-MMM-yyyy HH:mm:ss.s",
  }).format(timestamps);
};
