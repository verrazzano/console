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
import { BreadcrumbType } from "vz-console/breadcrumb/loader"
import { getPathParamAt } from "vz-console/utils/utils";


class State {
  selectedItem: string;
  filter?: Element;
}

class Props {
  model?: Model;
  breadcrumbCallback: (breadcrumbs: BreadcrumbType[]) => {}
  selectedItem?: string;
}

/**
 * @ojmetadata pack "vz-console"
 */
@customElement("vz-console-model-resources")
export class ConsoleModelResources extends VComponent<Props, State> {
  baseBreadcrumbs: BreadcrumbType[] = [{ label: Messages.Nav.home(), href: "/"}, { label: Messages.Instance.appModels(), href: "/models"}]
  labels = {"bindings": Messages.Labels.modelBindings(), 
  "components":  Messages.Labels.components(),
  "connections": Messages.Labels.connections(),
  "ingresses": Messages.Labels.ingresses(),
  "secrets": Messages.Labels.secrets()
};
  state: State = {
    selectedItem: this.props.selectedItem ? this.props.selectedItem : "bindings",
  };

  @listener({ capture: true, passive: true })
  private selectionChange(event: CustomEvent) {
    if (event.detail.originalEvent) {
      this.updateState({ selectedItem: event.detail.value, filter: null });
      this.syncNavigation(event.detail.value);
    }
  }

  filterCallback = (filter: Element): void => {
    this.updateState({filter: filter})
  };

  protected mounted(){
    if(this.props.selectedItem) {
      this.updateState({selectedItem : this.props.selectedItem, filter: null})
      this.syncNavigation(this.props.selectedItem);
    } else {
      this.syncNavigation(getPathParamAt(2));
    }   
  }

  private syncNavigation(path?: string) {
    let breadcrumbs = [...this.baseBreadcrumbs]
    if (typeof (history.pushState) != "undefined") {
      const modelList = {page: "modelList", nav: `/models}`};
      const modelDetails = {page: "modelDetails", nav: `/models/${this.props.model.id}`};
      history.pushState(modelList, modelList.page, modelList.nav);
      history.pushState(modelDetails, modelDetails.page, modelDetails.nav);
    }
    if (path) {
      const label = this.labels[path];
      if (label) {
        const target = `/models/${this.props.model.id}/${path}`;
        if (typeof (history.pushState) != "undefined") {
          const historyState = {page: "model", nav: target};
          history.pushState(historyState, historyState.page, historyState.nav);
        }
        breadcrumbs.push({ label: Messages.Nav.modelDetails(), href: "#", onclick: () => { this.updateState({selectedItem: "bindings"}); this.syncNavigation() }})
        breadcrumbs.push({label});
      }
    } else {
      breadcrumbs.push({label: Messages.Nav.modelDetails()})
    }
    this.props.breadcrumbCallback(breadcrumbs);
  }

  protected render() {
    let ResourceList: Element;
    let Heading: Element;
    switch (this.state.selectedItem) {
      case "bindings": {
        ResourceList = <ConsoleBindingList bindings={this.props.model.bindings}/>;
        Heading = <h1 class="resheader">{this.labels.bindings}</h1>;
        break;
      }

      case "components": {
        ResourceList = <ConsoleModelComponents components={this.props.model.modelComponents} filterCallback={this.filterCallback}/>;
        Heading = <h1 class="resheader">{this.labels.components}</h1>;
        break;
      }

      case "connections": {
        ResourceList = <ConsoleConnectionList connections={this.props.model.connections}/>;
        Heading = <h1 class="resheader">{this.labels.connections}</h1>;
        break;
      }

      case "ingresses": {
        ResourceList = <ConsoleIngressList ingresses={this.props.model.ingresses}/>;
        Heading = <h1 class="resheader">{this.labels.ingresses}</h1>;
        break;
      }

      case "secrets": {
        ResourceList = <ConsoleSecretList secrets={this.props.model.secrets}/>;
        Heading = <h1 class="resheader">{this.labels.secrets}</h1>;
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
              <li id="bindings">
                <a href="#">{this.labels.bindings}</a>
              </li>
              <li id="components">
                <a href="#">{this.labels.components}</a>
              </li>
              <li id="connections">
                <a href="#">{this.labels.connections}</a>
              </li>
              <li id="ingresses">
                <a href="#">{this.labels.ingresses}</a>
              </li>
              <li id="secrets">
                <a href="#">{this.labels.secrets}</a>
              </li>
            </ul>
          </oj-navigation-list>
          <div id="filters">{this.state.filter}</div>
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
