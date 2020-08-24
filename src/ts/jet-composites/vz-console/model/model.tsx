// Copyright (c) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { VComponent, customElement, h, listener } from "ojs/ojvcomponent";
import { VerrazzanoApi } from "service/VerrazzanoApi";
import { Model } from "service/types";
import { ConsoleMetadataItem } from "vz-console/metadata-item/loader"
import { ConsoleModelResources } from "vz-console/model-resources/loader"
import { ConsoleError } from "vz-console/error/loader"

class Props {
  modelId: string
}

class State {
  model?: Model;
  loading?: boolean;
  error?: string;
}

/**
 * @ojmetadata pack "vz-console"
 */
@customElement("vz-console-model")
export class ConsoleModel extends VComponent {
  verrazzanoApi: VerrazzanoApi;
  state: State = {
    loading: true,
  };

  props: Props = {
    modelId: ""
  }

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
      .getModel(this.props.modelId)
      .then((response) =>
        this.updateState({ loading: false, model: response })
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
      return <ConsoleError context={"Error displaying verrazzano model " + this.props.modelId + "."} error={this.state.error}/>
    }

    if (this.state.loading) {
      return <p>Loading..</p>;
    }

    return (
      <div>
        <div class="oj-flex">
          <div class="oj-sm-12 oj-flex-item">
            <h2>{this.state.model.name}</h2>
          </div>
        </div>
        <div class="oj-flex">
          <div class="oj-sm-12 oj-panel oj-flex-item">
            <div class="oj-flex">
              <div class="oj-sm-12 oj-flex-item">
                <h3>Application Model Details</h3>
                <ConsoleMetadataItem label="Name" value={this.state.model.name}/>
                <ConsoleMetadataItem label="Description" value={this.state.model.description}/>
              </div>
            </div>
          </div>
        </div>
        <ConsoleModelResources modelId={this.props.modelId}/>
      </div>
    );
  }
}
