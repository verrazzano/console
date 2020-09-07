// Copyright (c) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { VComponent, customElement, h, listener } from "ojs/ojvcomponent";
import { VerrazzanoApi, Model, extractSecretsForModelComponents } from "vz-console/service/loader";
import { ConsoleMetadataItem } from "vz-console/metadata-item/loader";
import { ConsoleModelResources } from "vz-console/model-resources/loader";
import { ConsoleError } from "vz-console/error/loader";
import * as Messages from "vz-console/utils/Messages";
import { ConsoleBreadcrumb } from "vz-console/breadcrumb/loader";

class Props {
  modelId?: string;
  nav?: string;
  navId?: string;
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
export class ConsoleModel extends VComponent<Props, State> {
  verrazzanoApi: VerrazzanoApi;
  state: State = {
    loading: true,
  };

  props: Props = {
    modelId: "",
  };

  constructor() {
    super(new Props());
    this.verrazzanoApi = new VerrazzanoApi();
  }

  protected mounted() {
    if (!this.props.modelId) {
      this.updateState({ error: Messages.Error.errInvalidModelId() });
      return;
    }

    this.getData();
  }

  async getData() {
    this.updateState({ loading: true });
    Promise.all([
      this.verrazzanoApi.getModel(this.props.modelId),
      this.verrazzanoApi.listSecrets(),
    ])
      .then(([model, secrets]) => {
        model.secrets = extractSecretsForModelComponents(model, secrets);
        this.updateState({ loading: false, model });
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
          context={Messages.Error.errRenderModel(this.props.modelId)}
          error={this.state.error}
        />
      );
    }

    if (this.state.loading) {
      return <p>{Messages.Labels.loading()}</p>;
    }

    const breadcrumbItems : {label: string, href?: string}[] = [{label: "Home", href: "?ojr=instance"}];
    breadcrumbItems.push({label: Messages.Nav.modelDetails(), href: "#"});
    breadcrumbItems.push({label: this.state.model.name});

    return (
      <div>
        <ConsoleBreadcrumb items={breadcrumbItems} />
        <div class="oj-flex">
          <div class="oj-sm-2 oj-flex-item">
            <div class="status-badge-status-good status-badge-container">
              <svg
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 100 100"
                class="badge-square"
              >
                <rect width="100" height="100"></rect>
                <text x="50%" y="50%" dy="0.67ex" class="badge-label">
                  M
                </text>
              </svg>
              <p class="status-badge-status-label">{Messages.Nav.model()}</p>
            </div>
          </div>
          <div class="oj-sm-10 oj-flex-item">
            <div class="oj-sm-12 oj-flex">
              <div class="oj-sm-1 oj-flex-item"></div>
              <div class="oj-sm-11 oj-flex-item">
                <div class="oj-panel oj-flex metatdata-panel bg">
                  <div class="oj-flex">
                    <div class="oj-sm-12 oj-flex-item">
                      <h3>{Messages.Model.heading()}</h3>
                    </div>
                    <div class="oj-sm-12 oj-flex-item">
                      <h3>{Messages.Labels.generalInfo()}</h3>
                      <ConsoleMetadataItem
                        label={Messages.Labels.name()}
                        value={this.state.model.name}
                      />
                      <ConsoleMetadataItem
                        label={Messages.Labels.desc()}
                        value={this.state.model.description}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <ConsoleModelResources model={this.state.model} />
      </div>
    );
  }
}
