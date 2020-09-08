// Copyright (c) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { VComponent, customElement, h, listener } from "ojs/ojvcomponent";
import { ConsoleBindingList } from "vz-console/binding-list/loader";
import { ConsoleModelList } from "vz-console/model-list/loader";
import * as Messages from "vz-console/utils/Messages"
import { Model, Binding } from "vz-console/service/types";

class Props {
  models?: [Model]
  bindings?: [Binding]
}

class State {
  selectedItem: string;
}

/**
 * @ojmetadata pack "vz-console"
 */
@customElement("vz-console-instance-resources")
export class ConsoleInstanceResources extends VComponent<Props, State> {
  state: State = {
    selectedItem: "models",
  };

  @listener({ capture: true, passive: true })
  private selectionChange(event: CustomEvent) {
    this.updateState({ selectedItem: event.detail.value });
  }

  protected render() {
    let ResourceList: Element;
    let Heading: Element;
    switch (this.state.selectedItem) {
      case "models": {
        ResourceList = <ConsoleModelList models={this.props.models}/>;
        Heading = <h3>{Messages.Instance.appModels()}</h3>;
        break;
      }

      case "bindings": {
        ResourceList = <ConsoleBindingList bindings={this.props.bindings} nav={"home"}/>;
        Heading = <h3>{Messages.Instance.appBindings()}</h3>;
        break;
      }

      default: {
        break;
      }
    }

    return (
      <div class="oj-flex resourcepadding">
        <div class="oj-sm-2 oj-flex-item">
          <h4 id="resources" class="res">{Messages.Labels.resources()}</h4>
          <div class="oj-navigationlist-category-divider"></div>
          <oj-navigation-list
            selection={this.state.selectedItem}
            onSelectionChanged={this.selectionChange}
            aria-labelledby="resources"      
          >
            <ul>
              <li id="models">
                <a href="#">{Messages.Instance.appModels()}</a>
              </li>
              <li id="bindings">
                <a href="#">{Messages.Instance.appBindings()}</a>
              </li>
            </ul>
          </oj-navigation-list>
        </div>
        <div class="oj-sm-10 oj-flex-item">
          <div class="oj-sm-12 oj-flex">
            <div class="oj-sm-1 oj-flex-item"></div>
            <div class="oj-sm-11 oj-flex-item">
              {Heading}
              {ResourceList}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
