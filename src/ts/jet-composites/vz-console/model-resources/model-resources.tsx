// Copyright (c) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { VComponent, customElement, h, listener } from "ojs/ojvcomponent";
import { ConsoleBindingList } from "vz-console/binding-list/loader";
import { ConsoleConnectionList } from "vz-console/connection-list/loader";
import { ConsoleIngressList } from "vz-console/ingress-list/loader";
import { ConsoleSecretList } from "vz-console/secret-list/loader";
import { ConsoleModelComponents } from "vz-console/model-components/loader";
import * as Messages from "vz-console/utils/Messages"
import { Model } from "vz-console/service/types";


class State {
  selectedItem: string;
  filter?: Element;
}

class Props {
  model?: Model;
}

/**
 * @ojmetadata pack "vz-console"
 */
@customElement("vz-console-model-resources")
export class ConsoleModelResources extends VComponent<Props, State> {
  state: State = {
    selectedItem: "bindings",
  };

  @listener({ capture: true, passive: true })
  private selectionChange(event: CustomEvent) {
    this.updateState({ selectedItem: event.detail.value, filter: null });
  }

  filterCallback = (filter: Element): void => {
    this.updateState({filter: filter})
  };

  protected render() {
    let ResourceList;
    switch (this.state.selectedItem) {
      case "bindings": {
        ResourceList = <ConsoleBindingList bindings={this.props.model.bindings} nav={"model"}/>;
        break;
      }

      case "components": {
        ResourceList = <ConsoleModelComponents components={this.props.model.modelComponents} filterCallback={this.filterCallback}/>;
        break;
      }

      case "connections": {
        ResourceList = <ConsoleConnectionList connections={this.props.model.connections}/>;
        break;
      }

      case "ingresses": {
        ResourceList = <ConsoleIngressList ingresses={this.props.model.ingresses}/>;
        break;
      }

      case "secrets": {
        ResourceList = <ConsoleSecretList secrets={this.props.model.secrets}/>;
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
          <div id="filters">{this.state.filter}</div>
        </div>
        <div class="oj-sm-10 oj-flex-item">
          <div class="oj-sm-12 oj-flex">
            <div class="oj-sm-1 oj-flex-item"></div>
            <div class="oj-sm-11 oj-flex-item">
              {ResourceList}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
