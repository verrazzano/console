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
      const oamApplication = <OAMApplication>{
        name: application.metadata.name,
        namespace: application.metadata.namespace,
        data: application,
        status:
          application.status &&
          application.status.conditions &&
          application.status.conditions.length > 0
            ? getStatusForOAMResource(application.status.conditions[0].status)
            : Status.Pending,
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

export const convertDate = (timestamps: string): string => {
  return new DateTimeConverter.IntlDateTimeConverter({
    pattern: "dd-MMM-yyyy HH:mm:ss.s",
  }).format(timestamps);
};
