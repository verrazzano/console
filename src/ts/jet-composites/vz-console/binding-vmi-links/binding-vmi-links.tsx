// Copyright (c) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { VComponent, customElement, h } from "ojs/ojvcomponent";
import { VerrazzanoApi, VMI } from "vz-console/service/loader";
import "ojs/ojtable";
import { ConsoleError } from "vz-console/error/loader";
import { ConsoleMetadataItem } from "vz-console/metadata-item/loader";

class Props {
  bindingId: string;
}

class State {
  vmiLinks?: [VMI];
  loading?: boolean;
  error?: string;
}

/**
 * @ojmetadata pack "vz-console"
 */
@customElement("vz-console-binding-vmi-links")
export class ConsoleBindingVmiLinks extends VComponent<Props> {
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
      .getVMInstances(this.props.bindingId)
      .then((response) =>
        this.updateState({
          loading: false,
          vmiLinks: response,
        })
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
      return (
        <ConsoleError
          context={"Error displaying Binding telemetry links."}
          error={this.state.error}
        />
      );
    }

    if (this.state.loading) {
      return <p>Loading..</p>;
    }

    return (
      <div>
        <ConsoleMetadataItem
          label="Kibana"
          value={
            this.state.vmiLinks.find((link: VMI) => link.type === "Kibana").url
          }
          link={true}
        />
        <ConsoleMetadataItem
          label="Grafana"
          value={
            this.state.vmiLinks.find((link: VMI) => link.type === "Grafana").url
          }
          link={true}
        />
        <ConsoleMetadataItem
          label="Prometheus"
          value={
            this.state.vmiLinks.find((link: VMI) => link.type === "Prometheus")
              .url
          }
          link={true}
        />
        <ConsoleMetadataItem
          label="Elasticsearch"
          value={
            this.state.vmiLinks.find(
              (link: VMI) => link.type === "Elasticsearch"
            ).url
          }
          link={true}
        />
      </div>
    );
  }
}
