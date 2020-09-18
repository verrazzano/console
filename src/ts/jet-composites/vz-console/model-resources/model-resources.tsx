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
import { getDefaultRouter } from "vz-console/utils/utils";
import CoreRouter = require("ojs/ojcorerouter");
import UrlPathAdapter = require("ojs/ojurlpathadapter");


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
  router: CoreRouter;
  baseBreadcrumbs: BreadcrumbType[] = [
    { label: Messages.Nav.home(), href: "/" },
    { label: Messages.Instance.appModels(), href: "/models" },
  ];
  labels = {
    bindings: Messages.Labels.modelBindings(),
    components: Messages.Labels.components(),
    connections: Messages.Labels.connections(),
    ingresses: Messages.Labels.ingresses(),
    secrets: Messages.Labels.secrets(),
  };
  state: State = {
    selectedItem: this.props.selectedItem
      ? this.props.selectedItem
      : `bindings`,
  };

  protected mounted() {
    getDefaultRouter().destroy();
    history.replaceState(null, "path", `models/${this.props.model.id}`);
    let parentRouter = new CoreRouter(
      [
        { path: "", redirect: this.props.model.id },
        { path: this.props.model.id}
      ],
      {
        urlAdapter: new UrlPathAdapter("/models"),
      }
    );
    parentRouter.go().then(() => {
      this.router = new CoreRouter(
        [
          { path: "" },
          { path: `bindings` },
          { path: `components` },
          { path: `connections` },
          { path: `ingresses` },
          { path: `secrets` },
        ],
        {
          urlAdapter: new UrlPathAdapter(`/models/${this.props.model.id}`),
        },
        parentRouter
      );
      this.router.currentState.subscribe((args) => {
        if (args.state) {
          const label = this.labels[args.state.path];
          let breadcrumbs = [...this.baseBreadcrumbs];
          if (label) {
            breadcrumbs.push({ label: Messages.Nav.modelDetails(), href: "#",  onclick: () => {
              this.router.go({
                path: "" 
              });
            }, });
            breadcrumbs.push({ label });
            this.updateState({ selectedItem: args.state.path, filter: null });
            this.props.breadcrumbCallback(breadcrumbs);
          } else {
            breadcrumbs.push({ label: Messages.Nav.modelDetails() });
            this.updateState({ selectedItem: "bindings", filter: null });
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
      case "bindings": {
        ResourceList = (
          <ConsoleBindingList bindings={this.props.model.bindings} />
        );
        Heading = <h1 class="resheader">{this.labels.bindings}</h1>;
        break;
      }

      case "components": {
        ResourceList = (
          <ConsoleModelComponents
            components={this.props.model.modelComponents}
            filterCallback={this.filterCallback}
          />
        );
        Heading = <h1 class="resheader">{this.labels.components}</h1>;
        break;
      }

      case "connections": {
        ResourceList = (
          <ConsoleConnectionList connections={this.props.model.connections} />
        );
        Heading = <h1 class="resheader">{this.labels.connections}</h1>;
        break;
      }

      case "ingresses": {
        ResourceList = (
          <ConsoleIngressList ingresses={this.props.model.ingresses} />
        );
        Heading = <h1 class="resheader">{this.labels.ingresses}</h1>;
        break;
      }

      case "secrets": {
        ResourceList = <ConsoleSecretList secrets={this.props.model.secrets} />;
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
