// Copyright (c) 2020, 2022, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

// eslint-disable-next-line no-unused-vars
import { ElementVComponent, customElement, h } from "ojs/ojvcomponent-element";
import { VerrazzanoApi } from "vz-console/service/VerrazzanoApi";
import {
  Cluster,
  Instance,
  Status,
  VMIType,
  OAMApplication,
  OAMComponent,
  Project,
} from "vz-console/service/loader";
import { ConsoleMetadataItem } from "vz-console/metadata-item/loader";
import { ConsoleInstanceResources } from "vz-console/instance-resources/loader";
import { ConsoleError } from "vz-console/error/loader";
import * as Messages from "vz-console/utils/Messages";
import {
  ConsoleBreadcrumb,
  BreadcrumbType,
} from "vz-console/breadcrumb/loader";
import { ConsoleStatusBadge } from "vz-console/status-badge/loader";

class Props {
  selectedItem?: string;
}

class State {
  instance?: Instance;
  loading?: boolean;
  error?: Error;
  breadcrumbs?: BreadcrumbType[];
  clusters?: Cluster[];
  oamApplications?: OAMApplication[];
  oamComponents?: OAMComponent[];
  projects?: Project[];
}

/**
 * @ojmetadata pack "vz-console"
 */
@customElement("vz-console-instance")
export class ConsoleInstance extends ElementVComponent<Props, State> {
  verrazzanoApi: VerrazzanoApi;
  state: State = {
    loading: true,
    breadcrumbs: [],
  };

  constructor() {
    super(new Props());

    this.verrazzanoApi = new VerrazzanoApi();
  }

  protected mounted() {
    this.getData();
  }

  async getData() {
    this.updateState({ loading: true });
    Promise.all([
      this.verrazzanoApi.getInstance("0"),
      this.verrazzanoApi.listOAMAppsAndComponents(),
      this.verrazzanoApi.listClusters(),
      this.verrazzanoApi.listProjects(),
    ])
      .then(
        ([
          instance,
          { oamApplications, oamComponents },
          clusters,
          projects,
        ]) => {
          if (oamApplications && projects) {
            oamApplications.forEach((application) => {
              projects.forEach((project) => {
                if (
                  project.namespaces &&
                  project.namespaces.some(
                    (namespace) =>
                      application.namespace === namespace.metadata?.name
                  ) &&
                  project.clusters &&
                  project.clusters.some(
                    (cluster) => cluster.name === application.cluster.name
                  )
                ) {
                  application.project = project;
                }
              });
            });
          }

          if (oamComponents && projects) {
            oamComponents.forEach((component) => {
              projects.forEach((project) => {
                if (
                  project.namespaces &&
                  project.namespaces.some(
                    (namespace) =>
                      component.namespace === namespace.metadata?.name
                  ) &&
                  project.clusters &&
                  project.clusters.some(
                    (cluster) => cluster.name === component.cluster.name
                  )
                ) {
                  component.project = project;
                }
              });
            });
          }

          this.updateState({
            loading: false,
            instance: instance,
            oamApplications,
            oamComponents,
            clusters,
            projects,
          });
        }
      )
      .catch((error) => {
        this.updateState({ error: error });
      });
  }

  breadcrumbCallback = (breadcrumbs: BreadcrumbType[]): void => {
    this.updateState({ breadcrumbs });
  };

  renderInstanceLinkElement(id, label, url) {
    if (url) {
      return (
        <ConsoleMetadataItem id={id} label={label} value={url} link={true} />
      );
    }
  }

  protected render() {
    if (this.state.error) {
      return (
        <ConsoleError
          context={Messages.Error.errRenderInstance()}
          error={this.state.error}
        />
      );
    }

    if (this.state.loading) {
      return <p>Loading..</p>;
    }

    return (
      <div>
        <ConsoleBreadcrumb items={this.state.breadcrumbs} />
        <div class="oj-flex">
          <div class="oj-sm-2 oj-flex-item">
            <ConsoleStatusBadge
              status={Status.Running}
              type={"hexagon"}
              text={"V"}
              label={Messages.Nav.instance()}
            />
          </div>
          <div class="oj-sm-10 oj-flex-item">
            <div class="oj-sm-12 oj-flex">
              <div class="oj-sm-1 oj-flex-item"></div>
              <div class="oj-sm-11 oj-flex-item">
                <div class="oj-panel oj-flex metatdata-panel bg">
                  <div class="oj-sm-6 oj-flex-item">
                    <h3>{Messages.Labels.generalInfo()}</h3>
                    <ConsoleMetadataItem
                      label={Messages.Labels.status()}
                      value={this.state.instance.status}
                      id={"instance-status-metaitem"}
                    />
                    <ConsoleMetadataItem
                      label={Messages.Labels.version()}
                      value={this.state.instance.version}
                      id={"instance-version-metaitem"}
                    />
                    <ConsoleMetadataItem
                      label={Messages.Labels.profile()}
                      value={this.state.instance.profile}
                      id={"instance-profile-metaitem"}
                    />
                    <ConsoleMetadataItem
                      label={Messages.Labels.mgmtCluster()}
                      value={this.state.instance.mgmtCluster}
                      id={"instance-mgmtcluster-metaitem"}
                    />
                    {this.renderInstanceLinkElement(
                      "instance-rancher-link",
                      Messages.Labels.rancher(),
                      this.state.instance.rancherUrl
                    )}
                    {this.renderInstanceLinkElement(
                        "instance-keycloak-link",
                        Messages.Labels.keycloak(),
                        this.state.instance.keyCloakUrl
                    )}
                    {this.renderInstanceLinkElement(
                        "instance-argocd-link",
                        Messages.Labels.argoCD(),
                        this.state.instance.argoCDUrl
                    )}
                  </div>
                  <div class="oj-sm-6 oj-flex-item">
                    <h3>System Telemetry</h3>
                    {this.renderInstanceLinkElement(
                      "instance-vmi-link-" +
                        VMIType.OpensearchDashboards.toLocaleLowerCase(),
                      Messages.Labels.kibana(),
                      this.state.instance.kibanaUrl
                    )}
                    {this.renderInstanceLinkElement(
                      "instance-vmi-link-" +
                        VMIType.Grafana.toLocaleLowerCase(),
                      Messages.Labels.grafana(),
                      this.state.instance.grafanaUrl
                    )}
                    {this.renderInstanceLinkElement(
                      "instance-vmi-link-" +
                        VMIType.Prometheus.toLocaleLowerCase(),
                      Messages.Labels.prom(),
                      this.state.instance.prometheusUrl
                    )}
                    {this.renderInstanceLinkElement(
                      "instance-vmi-link-" +
                        VMIType.Opensearch.toLocaleLowerCase(),
                      Messages.Labels.es(),
                      this.state.instance.elasticUrl
                    )}
                    {this.renderInstanceLinkElement(
                      "instance-vmi-link-" + VMIType.Kiali.toLocaleLowerCase(),
                      Messages.Labels.kiali(),
                      this.state.instance.kialiUrl
                    )}
                    {this.renderInstanceLinkElement(
                      "instance-jaeger-link",
                      Messages.Labels.jaeger(),
                      this.state.instance.jaegerUrl
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <ConsoleInstanceResources
          breadcrumbCallback={this.breadcrumbCallback}
          selectedItem={this.props.selectedItem}
          oamApplications={this.state.oamApplications}
          oamComponents={this.state.oamComponents}
          clusters={this.state.clusters}
          projects={this.state.projects}
        />
      </div>
    );
  }
}
