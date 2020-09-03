// Copyright (c) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { VComponent, customElement, h, listener } from "ojs/ojvcomponent";
import { ConsoleConnectionList } from "vz-console/connection-list/loader";
import { ConsoleIngressList } from "vz-console/ingress-list/loader";
import { ConsoleSecretList } from "vz-console/secret-list/loader";
import { ConsoleBindingComponents } from "vz-console/binding-components/loader";
import * as Messages from "vz-console/utils/Messages";
import { Binding } from "vz-console/service/types";

class State {
  selectedItem: string;
  filter?: Element;
}

class Props {
  binding: Binding
}

/**
 * @ojmetadata pack "vz-console"
 */
@customElement("vz-console-binding-resources")
export class ConsoleBindingResources extends VComponent<Props, State> {
  state: State = {
    selectedItem: "components",
  };

  @listener({ capture: true, passive: true })
  private selectionChange(event: CustomEvent) {
    this.updateState({ selectedItem: event.detail.value });
  }

  filterCallback = (filter: Element): void => {
    this.updateState({filter: filter})
  };

  protected render() {
    let ResourceList: Element;
    switch (this.state.selectedItem) {
      case "components": {
        ResourceList = <ConsoleBindingComponents components={this.props.binding.components} filterCallback={this.filterCallback}/>;
        break;
      }

      case "connections": {
        ResourceList = <ConsoleConnectionList connections={this.props.binding.connections}/>;
        break;
      }

      case "ingresses": {
        ResourceList = <ConsoleIngressList ingresses={this.props.binding.ingresses} isBindingIngress={true}/>;
        break;
      }

      case "secrets": {
        ResourceList = <ConsoleSecretList secrets={this.props.binding.secrets}/>;
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
          <div id="filters">{this.state.filter ? this.state.filter : ""}</div>
        </div>
        <div class="oj-sm-1 oj-flex-item"></div>
        <div class="oj-sm-9 oj-flex-item">{ResourceList}</div>
      </div>
    );
  }
}
