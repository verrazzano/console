// Copyright (c) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { VComponent, customElement, h, listener } from "ojs/ojvcomponent";
import { VerrazzanoApi, Binding } from "vz-console/service/loader";
import { ConsoleMetadataItem } from "vz-console/metadata-item/loader";
import { ConsoleBindingResources } from "vz-console/binding-resources/loader";
import { ConsoleError } from "vz-console/error/loader";
import { ConsoleBindingVmiLinks } from "vz-console/binding-vmi-links/loader";

class Props {
  bindingId?: string;
}

class State {
  binding?: Binding;
  loading?: boolean;
  error?: string;
}

/**
 * @ojmetadata pack "vz-console"
 */
@customElement("vz-console-binding")
export class ConsoleBinding extends VComponent<Props> {
  verrazzanoApi: VerrazzanoApi;
  state: State = {
    loading: true,
  };

  props: Props = {
    bindingId: "",
  };

  constructor() {
    super(new Props());
    this.verrazzanoApi = new VerrazzanoApi();
  }

  protected mounted() {
    if (!this.props.bindingId) {
      this.updateState({ error: "Invalid Binding Id." });
      return;
    }

    this.getData();
  }

  async getData() {
    this.updateState({ loading: true });
    this.verrazzanoApi
      .getBinding(this.props.bindingId)
      .then((response) => {
        this.updateState({ loading: false, binding: response });
      })
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
          context={
            "Error displaying verrazzano binding " + this.props.bindingId + "."
          }
          error={this.state.error}
        />
      );
    }

    if (this.state.loading) {
      return <p>Loading..</p>;
    }

    return (
      <div>
        <div class="oj-flex">
          <div class="oj-sm-12 oj-flex-item">
            <h2>{this.state.binding.name}</h2>
          </div>
        </div>
        <div class="oj-flex">
          <div class="oj-sm-12 oj-panel oj-flex-item metatdata-panel">
            <div class="oj-flex">
              <div class="oj-sm-12 oj-flex-item">
                  <h3>Application Binding Details</h3>
              </div>
              <div class="oj-sm-6 oj-flex-item">
                <h3>General Information</h3>
                <ConsoleMetadataItem
                  label="Name"
                  value={this.state.binding.name}
                />
                <ConsoleMetadataItem
                  label="Description"
                  value={this.state.binding.description}
                />
                <ConsoleMetadataItem
                  label="Model"
                  value={this.state.binding.model.name}
                  target={"?ojr=model&modelId=" + this.state.binding.model.id}
                  link={true}
                  replace={true}
                />
              </div>
              <div class="oj-sm-6 oj-flex-item">
                <h3>Application Telemetry</h3>
                <ConsoleBindingVmiLinks bindingId={this.props.bindingId}/>
              </div>
            </div>
          </div>
        </div>
        <ConsoleBindingResources bindingId={this.state.binding.id} modelId={this.state.binding.model.id}/>
      </div>
    );
  }
}
