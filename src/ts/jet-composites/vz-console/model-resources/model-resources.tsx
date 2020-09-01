// Copyright (c) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { VComponent, customElement, h, listener } from "ojs/ojvcomponent";
import { ConsoleBindingList } from "vz-console/binding-list/loader";
import { ConsoleConnectionList } from "vz-console/connection-list/loader";
import { ConsoleIngressList } from "vz-console/ingress-list/loader";
import { ConsoleSecretList } from "vz-console/secret-list/loader";
import { ConsoleModelComponents } from "vz-console/model-components/loader";
import * as Messages from "vz-console/utils/Messages"


class State {
  selectedItem: string;
}

class Props {
  modelId: string;
}

/**
 * @ojmetadata pack "vz-console"
 */
@customElement("vz-console-model-resources")
export class ConsoleModelResources extends VComponent<Props> {
  state: State = {
    selectedItem: "bindings",
  };

  props: Props = {
    modelId: "",
  };

  @listener({ capture: true, passive: true })
  private selectionChange(event: CustomEvent) {
    this.updateState({ selectedItem: event.detail.value });
  }

  protected render() {
    let ResourceList;
    switch (this.state.selectedItem) {
      case "bindings": {
        ResourceList = <ConsoleBindingList modelId={this.props.modelId} />;
        break;
      }

      case "components": {
        ResourceList = <ConsoleModelComponents modelId={this.props.modelId} />;
        break;
      }

      case "connections": {
        ResourceList = <ConsoleConnectionList modelId={this.props.modelId}/>;
        break;
      }

      case "ingresses": {
        ResourceList = <ConsoleIngressList modelId={this.props.modelId}/>;
        break;
      }

      case "secrets": {
        ResourceList = <ConsoleSecretList modelId={this.props.modelId}/>;
        break;
      }

      default: {
        break;
      }
    }
    return (
      <div class="oj-flex">
        <div class="oj-sm-2 oj-flex-item">
          <h4 id="resources" class="res">
            {Messages.Labels.resources()}
          </h4>
          <div class="oj-navigationlist-category-divider"></div>
          <oj-navigation-list
            selection={this.state.selectedItem}
            onSelectionChanged={this.selectionChange}
            aria-labelledby="resources"
          >
            <ul>
              <li id="bindings">
                <a href="#">{Messages.Labels.modelBindings()}</a>
              </li>
              <li id="components">
                <a href="#">{Messages.Labels.components()}</a>
              </li>
              <li id="connections">
                <a href="#">{Messages.Labels.connections()}</a>
              </li>
              <li id="ingresses">
                <a href="#">{Messages.Labels.ingresses()}</a>
              </li>
              <li id="secrets">
                <a href="#">{Messages.Labels.secrets()}</a>
              </li>
            </ul>
          </oj-navigation-list>
        </div>
        <div class="oj-sm-1 oj-flex-item"></div>
        <div class="oj-sm-9 oj-flex-item">{ResourceList}</div>
      </div>
    );
  }
}
