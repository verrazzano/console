// Copyright (c) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { VComponent, customElement, h, listener } from "ojs/ojvcomponent";
import { ConsoleConnectionList } from "vz-console/connection-list/loader";
import { ConsoleIngressList } from "vz-console/ingress-list/loader";
import { ConsoleSecretList } from "vz-console/secret-list/loader";
import { ConsoleBindingComponents } from "vz-console/binding-components/loader";
import * as Messages from "vz-console/utils/Messages";
import { Binding } from "vz-console/service/types";
import { BreadcrumbType } from "vz-console/breadcrumb/loader"
import { getPathParamAt } from "vz-console/utils/utils";

class State {
  selectedItem: string;
  filter?: Element;
}

class Props {
  binding: Binding
  breadcrumbCallback: (breadcrumbs: BreadcrumbType[]) => {}
  selectedItem?: string;
}

/**
 * @ojmetadata pack "vz-console"
 */
@customElement("vz-console-binding-resources")
export class ConsoleBindingResources extends VComponent<Props, State> {
  baseBreadcrumbs: BreadcrumbType[] = [{ label: Messages.Nav.home(), href: "/"}, { label: Messages.Instance.appBindings(), href: "/bindings"}]
  labels = {
  "components":  Messages.Labels.components(),
  "connections": Messages.Labels.connections(),
  "ingresses": Messages.Labels.ingresses(),
  "secrets": Messages.Labels.secrets()
};

  state: State = {
    selectedItem: this.props.selectedItem ? this.props.selectedItem : "components",
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
      const bindingList = {page: "bindingList", nav: `/bindings}`};
      const bindingDetails = {page: "bindingDetails", nav: `/bindings/${this.props.binding.id}`};
      history.pushState(bindingList, bindingList.page, bindingList.nav);
      history.pushState(bindingDetails, bindingDetails.page, bindingDetails.nav);
    }
    if (path) {
      const label = this.labels[path];
      if (label) {
        const target = `/bindings/${this.props.binding.id}/${path}`;
        if (typeof (history.pushState) != "undefined") {
          const historyState = {page: "binding", nav: target};
          history.pushState(historyState, historyState.page, historyState.nav);
        }
        breadcrumbs.push({ label: Messages.Nav.bindingDetails(), href: "#", onclick: () => { this.updateState({selectedItem: "components"}); this.syncNavigation() }})
        breadcrumbs.push({label});
      }
    } else {
      breadcrumbs.push({label: Messages.Nav.bindingDetails()})
    }
    this.props.breadcrumbCallback(breadcrumbs);
  }

  protected render() {
    let ResourceList: Element;
    let Heading: Element;
    switch (this.state.selectedItem) {
      case "components": {
        ResourceList = <ConsoleBindingComponents components={this.props.binding.components} filterCallback={this.filterCallback}/>;
        Heading = <h1 class="resheader">{this.labels.components}</h1>;
        break;
      }

      case "connections": {
        ResourceList = <ConsoleConnectionList connections={this.props.binding.connections}/>;
        Heading = <h1 class="resheader">{this.labels.connections}</h1>;
        break;
      }

      case "ingresses": {
        ResourceList = <ConsoleIngressList ingresses={this.props.binding.ingresses} isBindingIngress={true}/>;
        Heading = <h1 class="resheader">{this.labels.ingresses}</h1>;
        break;
      }

      case "secrets": {
        ResourceList = <ConsoleSecretList secrets={this.props.binding.secrets}/>;
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
