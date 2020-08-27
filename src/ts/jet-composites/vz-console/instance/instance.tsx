// Copyright (c) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { VComponent, customElement, h, listener } from "ojs/ojvcomponent";
import { VerrazzanoApi } from "vz-console/service/VerrazzanoApi";
import { Instance } from "vz-console/service/types";
import { ConsoleMetadataItem } from "vz-console/metadata-item/loader"
import { ConsoleInstanceResources } from "vz-console/instance-resources/loader"
import { ConsoleError } from "vz-console/error/loader"

class Props {}

class State {
  instance?: Instance;
  loading?: boolean;
  error?: string;
}

/**
 * @ojmetadata pack "vz-console"
 */
@customElement("vz-console-instance")
export class ConsoleInstance extends VComponent<Props> {
  verrazzanoApi: VerrazzanoApi;
  state: State = {
    loading: true,
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
    this.verrazzanoApi
      .getInstance("0")
      .then((response) =>
        this.updateState({ loading: false, instance: response })
      )
      .catch((error) => {
        let errorMessage = error;
        if (error && error.message) {
            errorMessage = error.message;
        }
        this.updateState({ error: errorMessage });
      });
  }

  protected render() {
    if (this.state.error) {
      return <ConsoleError context={"Error displaying verrazzano instance"} error={this.state.error}/>
    }

    if (this.state.loading) {
      return <p>Loading..</p>;
    }

    return (
      <div>
        <div class="oj-flex">
          <div class="oj-sm-12 oj-flex-item">
            <h2>{this.state.instance.name}</h2>
          </div>
        </div>
        <div class="oj-flex">
          <div class="oj-sm-12 oj-panel oj-flex-item metatdata-panel">
            <div class="oj-flex">
              <div class="oj-sm-12 oj-flex-item">
                <h4>Instance Details</h4>
              </div>
              <div class="oj-sm-6 oj-flex-item">
                <h3>General Information</h3>
                <ConsoleMetadataItem label="Status" value={this.state.instance.status}/>
                <ConsoleMetadataItem label="Version" value={this.state.instance.version}/>
                <ConsoleMetadataItem label="Management Cluster" value={this.state.instance.mgmtCluster}/>
                <ConsoleMetadataItem label="Rancher" value={this.state.instance.rancherUrl} link={true}/>
                <ConsoleMetadataItem label="Keycloak" value={this.state.instance.keyCloakUrl} link={true}/>
              </div>
              <div class="oj-sm-6 oj-flex-item">
                <h3>System Telemetry</h3>
                <ConsoleMetadataItem label="Kibana" value={this.state.instance.kibanaUrl} link={true}/>
                <ConsoleMetadataItem label="Grafana" value={this.state.instance.grafanaUrl} link={true}/>
                <ConsoleMetadataItem label="Prometheus" value={this.state.instance.prometheusUrl} link={true}/>
                <ConsoleMetadataItem label="Elasticsearch" value={this.state.instance.elasticUrl} link={true}/>
              </div>
            </div>
          </div>
        </div>
        <ConsoleInstanceResources/>
      </div>
    );
  }
}
