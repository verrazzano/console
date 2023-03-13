// Copyright (c) 2020, 2021, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import {
  Cluster,
  Instance,
  Status,
  OAMApplication,
  OAMComponent,
  OAMComponentInstance,
  Project,
  RoleBinding,
  NetworkPolicy,
  LabelSelectorRequirement,
  IngressRule,
  EgressRule,
} from "../service/types";
import * as DateTimeConverter from "ojs/ojconverter-datetime";
import {
  getStatusForOAMApplication,
  getStatusStateForCluster,
} from "vz-console/utils/utils";

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
      profile: instance.profile,
      argoCDUrl: instance.argoCDUrl,
      keyCloakUrl: instance.keyCloakUrl,
      rancherUrl: instance.rancherUrl,
      vzApiUri: instance.vzApiUri,
      thanosQueryFrontendUrl: instance.thanosQueryFrontendUrl,
    });
  });
  return result;
};

export const processClusterData = (clustersData: any[]): Cluster[] => {
  const clusters = <Cluster[]>[];

  clustersData.forEach((clusterData) => {
    if (clusterData.metadata.name) {
      const cluster = <Cluster>{
        name: clusterData.metadata.name,
        namespace: clusterData.metadata.namespace,
        data: clusterData,
        apiUrl: clusterData.status ? clusterData.status.apiUrl : undefined,
        status:
          clusterData.status && clusterData.status.state
            ? getStatusStateForCluster(clusterData.status.state)
            : Status.Pending,
        lastAgentConnectTime: convertDate(
          clusterData.status.lastAgentConnectTime
        ),
        createdOn: convertDate(clusterData.metadata.creationTimestamp),
      };

      clusters.push(cluster);
    }
  });
  return clusters;
};

export const processOAMData = (
  applications: any[],
  components: any[],
  clusterName: string = "local"
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
        cluster: { name: clusterName },
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
      const appStatus = getStatusForOAMApplication(application);

      const oamApplication = <OAMApplication>{
        name: application.metadata.name,
        namespace: application.metadata.namespace,
        data: application,
        status: appStatus.status,
        statusMessage: appStatus.message,
        createdOn: convertDate(application.metadata.creationTimestamp),
        cluster: { name: clusterName },
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

const processProjectNetworkPolicies = (project: any): NetworkPolicy[] => {
  const networkPolicies: NetworkPolicy[] = [];
  const netPols = project.spec?.template?.networkPolicies;
  if (!netPols) {
    return networkPolicies;
  }
  netPols.forEach((netPol) => {
    const matchExps = netPol.spec?.podSelector?.matchExpressions?.map(
      (exp) =>
        <LabelSelectorRequirement>{
          key: exp.key,
          operator: exp.operator,
          values: exp.values,
        }
    );
    const ingRules = netPol?.spec?.ingress?.map(
      (ing) =>
        <IngressRule>{
          hasFrom: !!ing.from,
          ports: ing.ports.map((p) => p.port),
        }
    );
    const egRules = netPol?.spec?.egress?.map(
      (eg) => <EgressRule>{ hasTo: !!eg.to, ports: eg.ports.map((p) => p.port) }
    );

    networkPolicies.push(<NetworkPolicy>{
      name: netPol.metadata.name,
      policyTypes: netPol.spec?.policyTypes,
      labelPodSelectors: netPol.spec?.podSelector?.matchLabels,
      expressionPodSelectors: matchExps,
      ingressRules: ingRules,
      egressRules: egRules,
    });
  });
  return networkPolicies;
};

export const processProjectsData = (projects: any[]): Project[] => {
  const vps: Project[] = [];

  if (projects) {
    projects.forEach((project) => {
      const vp = <Project>{
        name: project.metadata?.name,
        namespace: project.metadata?.namespace,
        createdOn: convertDate(project.metadata.creationTimestamp),
        networkPolicies: processProjectNetworkPolicies(project),
        data: project,
      };
      if (project.spec.template) {
        vp.namespaces = project.spec.template.namespaces;
      }
      if (project.spec.placement) {
        vp.clusters = project.spec.placement.clusters;
      }
      vps.push(vp);
    });
  }
  return vps;
};

export const processRoleBindingsData = (rbs: any[]): RoleBinding[] => {
  const roleBindings: RoleBinding[] = [];
  if (rbs) {
    rbs.forEach((rb) => {
      const roleBinding = <RoleBinding>{
        name: rb.metadata?.name,
        namespace: rb.metadata?.namespace,
        clusterRole:
          rb.roleRef?.kind === "ClusterRole" ? rb.roleRef?.name : null,
        subjects: rb.subjects,
        createdOn: convertDate(rb.metadata.creationTimestamp),
      };
      roleBindings.push(roleBinding);
    });
  }
  return roleBindings;
};

export const convertDate = (timestamps: string): string => {
  return new DateTimeConverter.IntlDateTimeConverter({
    pattern: "dd-MMM-yyyy HH:mm:ss.s",
  }).format(timestamps);
};
