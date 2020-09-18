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
import { getDefaultRouter } from "vz-console/utils/utils";
import CoreRouter = require("ojs/ojcorerouter");
import UrlPathAdapter = require("ojs/ojurlpathadapter");

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
  router: CoreRouter;
  baseBreadcrumbs: BreadcrumbType[] = [
    { label: Messages.Nav.home(), href: "/" },
    { label: Messages.Instance.appBindings(), href: "/bindings" },
  ];
  labels = {
    components: Messages.Labels.components(),
    connections: Messages.Labels.connections(),
    ingresses: Messages.Labels.ingresses(),
    secrets: Messages.Labels.secrets(),
  };

  state: State = {
    selectedItem: this.props.selectedItem
      ? this.props.selectedItem
      : "components",
  };

  protected mounted() {
    getDefaultRouter().destroy();
    history.replaceState(null, "path", `bindings/${this.props.binding.id}`);
    let parentRouter = new CoreRouter(
      [
        { path: "", redirect: this.props.binding.id },
        { path: this.props.binding.id}
      ],
      {
        urlAdapter: new UrlPathAdapter("/bindings"),
      }
    );
    parentRouter.go().then(() => {
      this.router = new CoreRouter(
        [
          { path: "" },
          { path: `components` },
          { path: `connections` },
          { path: `ingresses` },
          { path: `secrets` },
        ],
        {
          urlAdapter: new UrlPathAdapter(`/bindings/${this.props.binding.id}`),
        },
        parentRouter
      );
      this.router.currentState.subscribe((args) => {
        if (args.state) {
          const label = this.labels[args.state.path];
          let breadcrumbs = [...this.baseBreadcrumbs];
          if (label) {
            breadcrumbs.push({ label: Messages.Nav.bindingDetails(), href: "#",  onclick: () => {
              this.router.go({
                path: "" 
              });
            }, });
            breadcrumbs.push({ label });
            this.updateState({ selectedItem: args.state.path, filter: null });
            this.props.breadcrumbCallback(breadcrumbs); 
          } else {
            breadcrumbs.push({ label: Messages.Nav.bindingDetails() });
            this.updateState({ selectedItem: "components", filter: null });
            this.props.breadcrumbCallback(breadcrumbs);
          }
        }
      });
      parentRouter.beforeStateChange.subscribe((args) => {
        this.router.go();
        args.accept(Promise.resolve(''))
      });
    }).then(() => {
      this.router.go(
        {path: this.props.selectedItem}
      );
    });    
  }


  @listener({ capture: true, passive: true })
  private selectionChange(event: CustomEvent) {
    if (event.detail.originalEvent) {
      this.router.go({path: event.detail.value});
    }
  }

  filterCallback = (filter: Element): void => {
    this.updateState({ filter: filter });
  };

  protected render() {
    let ResourceList: Element;
    let Heading: Element;
    switch (this.state.selectedItem) {
      case "components": {
        ResourceList = (
          <ConsoleBindingComponents
            components={this.props.binding.components}
            filterCallback={this.filterCallback}
          />
        );
        Heading = <h1 class="resheader">{this.labels.components}</h1>;
        break;
      }

      case "connections": {
        ResourceList = (
          <ConsoleConnectionList connections={this.props.binding.connections} />
        );
        Heading = <h1 class="resheader">{this.labels.connections}</h1>;
        break;
      }

      case "ingresses": {
        ResourceList = (
          <ConsoleIngressList
            ingresses={this.props.binding.ingresses}
            isBindingIngress={true}
          />
        );
        Heading = <h1 class="resheader">{this.labels.ingresses}</h1>;
        break;
      }

      case "secrets": {
        ResourceList = (
          <ConsoleSecretList secrets={this.props.binding.secrets} />
        );
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
