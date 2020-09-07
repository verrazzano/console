// Copyright (c) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { VComponent, customElement, h } from "ojs/ojvcomponent";
import { VerrazzanoApi, Binding, Secret, extractSecretsForBindingComponents } from "vz-console/service/loader";
import { ConsoleMetadataItem } from "vz-console/metadata-item/loader";
import { ConsoleBindingResources } from "vz-console/binding-resources/loader";
import { ConsoleError } from "vz-console/error/loader";
import { ConsoleBindingVmiLinks } from "vz-console/binding-vmi-links/loader";
import * as Messages from "vz-console/utils/Messages"
import { ConsoleBreadcrumb } from "vz-console/breadcrumb/loader"

class Props {
  bindingId?: string;
  nav?: string;
  navId?: string;
}

class State {
  binding?: Binding;
  secrets?: Secret[]
  loading?: boolean;
  error?: string;
}

/**
 * @ojmetadata pack "vz-console"
 */
@customElement("vz-console-binding")
export class ConsoleBinding extends VComponent<Props, State> {
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
      this.updateState({ error: Messages.Error.errInvalidBindingId() });
      return;
    }

    this.getData();
  }

  async getData() {
    this.updateState({ loading: true });
    Promise.all([
      this.verrazzanoApi.getBinding(this.props.bindingId),
      this.verrazzanoApi.listSecrets(),
    ])
      .then(([binding, secrets]) => {
        binding.secrets = extractSecretsForBindingComponents(binding, secrets);
        this.updateState({ loading: false, binding });
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
          context={Messages.Error.errRenderBinding(this.props.bindingId)}
          error={this.state.error}
        />
      );
    }

    if (this.state.loading) {
      return <p>{Messages.Labels.loading()}</p>;
    }
    
    const breadcrumbItems : {label: string, href?: string}[] = [{label: "Home", href: "?ojr=instance"}];
    if (this.props.navId) {
      breadcrumbItems.push({label: Messages.Nav.modelDetails(), href: `?ojr=model&nav=home&modelId=${this.state.binding.model.id}`})
    }

    breadcrumbItems.push({label: Messages.Nav.bindingDetails(), href: "#"});
    breadcrumbItems.push({label: this.state.binding.name});

    return (
      <div>
        <ConsoleBreadcrumb items={breadcrumbItems} />
        <div class="oj-flex">
          <div class="oj-sm-2 oj-flex-item">
            <div class="status-badge-status-good status-badge-container">
              <svg
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 75 100"
                class="badge-stack"
              >
                <path d="M37.2,0C16.6,0,0,8.4,0,18.6v62.8C0,91.6,16.6,100,37.2,100c20.6,0,37.2-8.4,37.2-18.6V18.6C74.4,8.4,57.6,0,37.2,0z"></path>
                <text x="50%" y="50%" dy="0.67ex" class="badge-label">
                  B
                </text>
              </svg>
              <p class="status-badge-status-label">{Messages.Nav.binding()}</p>
            </div>
          </div>
          <div class="oj-sm-10 oj-flex-item">
            <div class="oj-sm-12 oj-flex">
              <div class="oj-sm-1 oj-flex-item"></div>
              <div class="oj-sm-11 oj-flex-item">
                <div class="oj-panel oj-flex metatdata-panel bg">
                  <div class="oj-flex">
                    <div class="oj-sm-12 oj-flex-item">
                      <h3>{Messages.Binding.heading()}</h3>
                    </div>
                    <div class="oj-sm-6 oj-flex-item">
                      <h3>{Messages.Labels.generalInfo()}</h3>
                      <ConsoleMetadataItem
                        label={Messages.Labels.name()}
                        value={this.state.binding.name}
                      />
                      <ConsoleMetadataItem
                        label={Messages.Labels.desc()}
                        value={this.state.binding.description}
                      />
                      <ConsoleMetadataItem
                        label={Messages.Labels.model()}
                        value={this.state.binding.model.name}
                        target={
                          "?ojr=model&nav=home&modelId=" +
                          this.state.binding.model.id
                        }
                        link={true}
                        replace={true}
                      />
                    </div>
                    <div class="oj-sm-6 oj-flex-item">
                      <h3>{Messages.Binding.telemetry()}</h3>
                      <ConsoleBindingVmiLinks
                        vmiInstances={this.state.binding.vmiInstances}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <ConsoleBindingResources binding={this.state.binding} />
      </div>
    );
  }
}
