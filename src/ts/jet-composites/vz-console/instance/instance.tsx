// Copyright (c) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { VComponent, customElement, h, listener } from "ojs/ojvcomponent";
import { VerrazzanoApi } from "vz-console/service/VerrazzanoApi";
import { Instance, Model, Binding , Status} from "vz-console/service/loader";
import { ConsoleMetadataItem } from "vz-console/metadata-item/loader"
import { ConsoleInstanceResources } from "vz-console/instance-resources/loader"
import { ConsoleError } from "vz-console/error/loader"
import * as Messages from "vz-console/utils/Messages"
import { extractModelsFromApplications, extractBindingsFromApplications } from "vz-console/service/common";
import { ConsoleBreadcrumb, BreadcrumbType } from "vz-console/breadcrumb/loader"
import { ConsoleStatusBadge } from "vz-console/status-badge/loader"

class Props {
  selectedItem?: string;
}

class State {
  instance?: Instance;
  models?: Model[]
  bindings?: Binding[]
  loading?: boolean;
  error?: string;
  breadcrumbs?: BreadcrumbType[]
}

/**
 * @ojmetadata pack "vz-console"
 */
@customElement("vz-console-instance")
export class ConsoleInstance extends VComponent<Props, State> {
  verrazzanoApi: VerrazzanoApi;
  state: State = {
    loading: true,
    breadcrumbs: []
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
    Promise.all([this.verrazzanoApi.getInstance("0"),this.verrazzanoApi.listApplications()])
    .then(([instance, applications]) => {
        this.updateState({ 
        loading: false, 
        instance: instance, 
        models: extractModelsFromApplications(applications ? applications : []), 
        bindings: extractBindingsFromApplications(applications ? applications : []) })
    })
    .catch((error) => {
      let errorMessage = error;
      if (error && error.message) {
          errorMessage = error.message;
      }
      this.updateState({ error: errorMessage });
    });
  }

  breadcrumbCallback = (breadcrumbs: BreadcrumbType[]): void => {
    this.updateState({breadcrumbs});
  };

  protected render() {
    if (this.state.error) {
      return <ConsoleError context={Messages.Error.errRenderInstance()} error={this.state.error}/>
    }

    if (this.state.loading) {
      return <p>Loading..</p>;
    }

    return (
      <div>
        <ConsoleBreadcrumb
          items={this.state.breadcrumbs}
        />
        <div class="oj-flex">
          <div class="oj-sm-2 oj-flex-item">
            <ConsoleStatusBadge status={Status.Running} type={"hexagon"} text={"V"} label={Messages.Nav.instance()}/>
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
                    />
                    <ConsoleMetadataItem
                      label={Messages.Labels.version()}
                      value={this.state.instance.version}
                    />
                    <ConsoleMetadataItem
                      label={Messages.Labels.mgmtCluster()}
                      value={this.state.instance.mgmtCluster}
                    />
                    <ConsoleMetadataItem
                      label={Messages.Labels.rancher()}
                      value={this.state.instance.rancherUrl}
                      link={true}
                    />
                    <ConsoleMetadataItem
                      label={Messages.Labels.keycloak()}
                      value={this.state.instance.keyCloakUrl}
                      link={true}
                    />
                  </div>
                  <div class="oj-sm-6 oj-flex-item">
                    <h3>System Telemetry</h3>
                    <ConsoleMetadataItem
                      label={Messages.Labels.kibana()}
                      value={this.state.instance.kibanaUrl}
                      link={true}
                    />
                    <ConsoleMetadataItem
                      label={Messages.Labels.grafana()}
                      value={this.state.instance.grafanaUrl}
                      link={true}
                    />
                    <ConsoleMetadataItem
                      label={Messages.Labels.prom()}
                      value={this.state.instance.prometheusUrl}
                      link={true}
                    />
                    <ConsoleMetadataItem
                      label={Messages.Labels.es()}
                      value={this.state.instance.elasticUrl}
                      link={true}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <ConsoleInstanceResources
          models={this.state.models}
          bindings={this.state.bindings}
          breadcrumbCallback={this.breadcrumbCallback}
          selectedItem={this.props.selectedItem}
        />
      </div>
    );
  }
}
