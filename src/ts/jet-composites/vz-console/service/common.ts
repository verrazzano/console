// Copyright (c) 2020, 2021, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import {
  Instance,
  Status,
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

export const processOAMData = (
  applications: any[],
  components: any[],
  mcApplications: any[],
  mcComponents: any[]
): {
  oamApplications: Map<string, Map<string, OAMApplication>>;
  oamComponents: Map<string, Map<string, OAMComponent>>;
} => {
  const oamApplications = new Map<string, Map<string, OAMApplication>>();
  const oamComponents = new Map<string, Map<string, OAMComponent>>();
  const mcOamApplications = new  Map<string, Map<string, OAMApplication>>();
  const mcOamComponents = new  Map<string, Map<string, OAMComponent>>();
  mcApplications.forEach((mcApp) => {
    if (mcApp && mcApp.spec && mcApp.spec.template && mcApp.spec.template.spec &&  mcApp.spec.template.metadata && mcApp.spec.placement && mcApp.spec.placement.clusters && mcApp.spec.placement.clusters.length > 0) {
      applications.push({metadata: mcApp.spec.template.metadata, spec: mcApp.spec.template.spec, clusters: mcApp.spec.placement.clusters})
    }
  })
  mcComponents.forEach((mcComponent) => {
    if (mcComponent && mcComponent.spec && mcComponent.spec.template && mcComponent.spec.template.spec && mcComponent.spec.placement && mcComponent.spec.placement.clusters && mcComponent.spec.placement.clusters.length > 0) {
      components.push({metadata: mcComponent.metadata, spec: mcComponent.spec.template.spec, clusters: mcComponent.spec.placement.clusters})
    }
  })
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

      if(component.clusters) {
        oamComponent.clusters = component.clusters
        let mcOamComponentsForNS = mcOamComponents.get(component.metadata.namespace)
        if (!mcOamComponentsForNS) {
          mcOamComponentsForNS = new Map<string, OAMComponent>();
          mcOamComponents.set(component.metadata.namespace, mcOamComponentsForNS);
        }
        mcOamComponentsForNS.set(component.metadata.name, oamComponent);
      } else {
        oamComponent.clusters = [{name: "local"}]
        let oamComponentsForNS = oamComponents.get(component.metadata.namespace);
        if (!oamComponentsForNS) {
          oamComponentsForNS = new Map<string, OAMComponent>();
          oamComponents.set(component.metadata.namespace, oamComponentsForNS);
        }
        oamComponentsForNS.set(component.metadata.name, oamComponent);
      }
 
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
            const oamComponentsForApplicationNS = application.clusters? mcOamComponents.get(
              application.metadata.namespace
            ) : oamComponents.get(
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

      if(application.clusters) {
        oamApplication.clusters = application.clusters
        let mcOamApplicationsForNS = mcOamApplications.get(
          application.metadata.namespace
        );
        if (!mcOamApplicationsForNS) {
          mcOamApplicationsForNS = new Map<string, OAMApplication>();
          mcOamApplications.set(
            application.metadata.namespace,
            mcOamApplicationsForNS
          );
        }
        mcOamApplicationsForNS.set(application.metadata, oamApplication);
      } else {
        oamApplication.clusters = [{name: "local"}]
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
    }
  });

  const mergedOamApplications = new Map([...oamApplications, ...mcOamApplications])
  const mergedOamComponents = new Map([...oamComponents, ...mcOamComponents])
  return { oamApplications: mergedOamApplications, oamComponents: mergedOamComponents };
};

export const convertDate = (timestamps: string): string => {
  return new DateTimeConverter.IntlDateTimeConverter({
    pattern: "dd-MMM-yyyy HH:mm:ss.s",
  }).format(timestamps);
};
