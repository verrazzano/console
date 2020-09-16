// Copyright (c) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { VComponent, customElement, h, listener } from "ojs/ojvcomponent";
import { ConsoleBindingList } from "vz-console/binding-list/loader";
import { ConsoleModelList } from "vz-console/model-list/loader";
import * as Messages from "vz-console/utils/Messages"
import { Model, Binding } from "vz-console/service/types";
import { BreadcrumbType } from "vz-console/breadcrumb/loader"
import { getPathParamAt } from "vz-console/utils/utils";

class Props {
  models?: [Model]
  bindings?: [Binding]
  breadcrumbCallback: (breadcrumbs: BreadcrumbType[]) => {}
}

class State {
  selectedItem: string;
}

/**
 * @ojmetadata pack "vz-console"
 */
@customElement("vz-console-instance-resources")
export class ConsoleInstanceResources extends VComponent<Props, State> {
  baseBreadcrumb: BreadcrumbType = {
    label: Messages.Nav.home(),
    href: "#",
    onclick: () => {
      this.updateState({ selectedItem: "models" });
      this.syncNavigation();
    },
  };
  labels = {
    models: Messages.Instance.appModels(),
    bindings: Messages.Instance.appBindings(),
  };
  state: State = {
    selectedItem: "models",
  };

  protected mounted() {
    this.syncNavigation(getPathParamAt(0));
  }

  @listener({ capture: true, passive: true })
  private selectionChange(event: CustomEvent) {
    if (event.detail.originalEvent) {
      this.updateState({ selectedItem: event.detail.value });
      this.syncNavigation(event.detail.value);
    }
  }

  private syncNavigation(path?: string) {
    let breadcrumbs = [this.baseBreadcrumb];
    if (path) {
      const label = this.labels[path];
      if (label) {
        const target = `/${path}`;
        if (typeof history.pushState != "undefined") {
          const historyState = { page: "instance", nav: target };
          history.pushState(historyState, historyState.page, historyState.nav);
        }
        breadcrumbs.push({ label });
      }
    }
    this.props.breadcrumbCallback(breadcrumbs);
  }

  protected render() {
    let ResourceList: Element;
    let Heading: Element;
    switch (this.state.selectedItem) {
      case "models": {
        ResourceList = <ConsoleModelList models={this.props.models} />;
        Heading = <h1 class="resheader">{this.labels.models}</h1>;
        break;
      }

      case "bindings": {
        ResourceList = <ConsoleBindingList bindings={this.props.bindings} />;
        Heading = <h1 class="resheader">{this.labels.bindings}</h1>;
        break;
      }

      default: {
        break;
      }
    }

    return (
      <div class="oj-flex resourcepadding">
        <div class="oj-sm-2 oj-flex-item">
          <h4 id="resources" class="reslabel">
            {Messages.Labels.resources()}
          </h4>
          <div class="oj-navigationlist-category-divider"></div>
          <oj-navigation-list
            selection={this.state.selectedItem}
            onSelectionChanged={this.selectionChange}
            aria-labelledby="resources"
          >
            <ul>
              <li id="models">
                <a href="#">{this.labels.models}</a>
              </li>
              <li id="bindings">
                <a href="#">{this.labels.bindings}</a>
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
