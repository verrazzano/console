// Copyright (c) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { VComponent, customElement, h, listener } from "ojs/ojvcomponent";
import { ConsoleConnectionList } from "vz-console/connection-list/loader";
import { ConsoleIngressList } from "vz-console/ingress-list/loader";
import { ConsoleSecretList } from "vz-console/secret-list/loader";
import { ConsoleBindingComponents } from "vz-console/binding-components/loader";

class State {
  selectedItem: string;
}

class Props {
  bindingId: string;
  modelId: string;
}

/**
 * @ojmetadata pack "vz-console"
 */
@customElement("vz-console-binding-resources")
export class ConsoleBindingResources extends VComponent<Props> {
  state: State = {
    selectedItem: "components",
  };

  @listener({ capture: true, passive: true })
  private selectionChange(event: CustomEvent) {
    this.updateState({ selectedItem: event.detail.value });
  }

  protected render() {
    let ResourceList: Element;
    switch (this.state.selectedItem) {
      case "components": {
        ResourceList = <ConsoleBindingComponents bindingId={this.props.bindingId}/>;
        break;
      }

      case "connections": {
        ResourceList = <ConsoleConnectionList modelId={this.props.modelId} bindingId={this.props.bindingId}/>;
        break;
      }

      case "ingresses": {
        ResourceList = <ConsoleIngressList modelId={this.props.modelId} bindingId={this.props.bindingId}/>;
        break;
      }

      case "secrets": {
        ResourceList = <ConsoleSecretList modelId={this.props.modelId} bindingId={this.props.bindingId}/>;
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
            Resources
          </h4>
          <div class="oj-navigationlist-category-divider"></div>
          <oj-navigation-list
            selection={this.state.selectedItem}
            onSelectionChanged={this.selectionChange}
            aria-labelledby="resources"
          >
            <ul>
              <li id="components">
                <a href="#">Components</a>
              </li>
              <li id="connections">
                <a href="#">Connections</a>
              </li>
              <li id="ingresses">
                <a href="#">Ingresses</a>
              </li>
              <li id="secrets">
                <a href="#">Secrets</a>
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
