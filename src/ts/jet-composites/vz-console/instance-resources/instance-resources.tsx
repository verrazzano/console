// Copyright (c) 2020, 2021, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

// eslint-disable-next-line no-unused-vars
import { VComponent, customElement, listener, h } from "ojs/ojvcomponent";
import * as Messages from "vz-console/utils/Messages";
import { OAMApplication, OAMComponent } from "vz-console/service/types";
import { BreadcrumbType } from "vz-console/breadcrumb/loader";
import { getDefaultRouter } from "vz-console/utils/utils";
import { ConsoleInstanceApps } from "vz-console/instance-apps/loader";
import { ConsoleInstanceComponents } from "vz-console/instance-components/loader";
import CoreRouter = require("ojs/ojcorerouter");
import UrlPathAdapter = require("ojs/ojurlpathadapter");

class Props {
  breadcrumbCallback: (breadcrumbs: BreadcrumbType[]) => {};
  selectedItem?: string;
  oamApplications?: [OAMApplication];
  oamComponents?: [OAMComponent];
}

class State {
  selectedItem: string;
  filter?: Element;
}

/**
 * @ojmetadata pack "vz-console"
 */
@customElement("vz-console-instance-resources")
export class ConsoleInstanceResources extends VComponent<Props, State> {
  router: CoreRouter;
  baseBreadcrumb: BreadcrumbType = {
    label: Messages.Nav.home(),
    href: "#",
    onclick: () => {
      this.router.go({
        path: "",
      });
    },
  };

  labels = {
    oamapps: Messages.Instance.oamApps(),
    oamcomps: Messages.Instance.oamCompoennts(),
  };

  state: State = {
    selectedItem: this.props.selectedItem ? this.props.selectedItem : "oamapps",
  };

  protected mounted() {
    getDefaultRouter().destroy();
    history.replaceState(null, "path", `/${this.props.selectedItem}`);
    this.router = new CoreRouter(
      [{ path: "" }, { path: "oamapps" }, { path: "oamcomps" }],
      {
        urlAdapter: new UrlPathAdapter("/"),
      }
    );
    this.router.currentState.subscribe((args) => {
      if (args.state) {
        const label = this.labels[args.state.path];
        if (label) {
          const breadcrumbs = [this.baseBreadcrumb];
          breadcrumbs.push({ label });
          this.updateState({ selectedItem: args.state.path });
          this.props.breadcrumbCallback(breadcrumbs);
        } else {
          this.updateState({ selectedItem: "oamapps" });
          this.props.breadcrumbCallback([this.baseBreadcrumb]);
        }
      }
    });

    this.router.go({
      path: this.props.selectedItem,
    });
  }

  @listener({ capture: true, passive: true })
  private selectionChange(event: CustomEvent) {
    if (event.detail.originalEvent) {
      this.router.go({ path: event.detail.value });
    }
  }

  filterCallback = (filter: Element): void => {
    this.updateState({ filter: filter });
  };

  protected render() {
    let ResourceList: Element;
    let Heading: Element;
    switch (this.state.selectedItem) {
      case "oamapps": {
        ResourceList = (
          <ConsoleInstanceApps
            applications={this.props.oamApplications}
            filterCallback={this.filterCallback}
          />
        );
        Heading = <h1 class="resheader">{this.labels.oamapps}</h1>;
        break;
      }

      case "oamcomps": {
        ResourceList = (
          <ConsoleInstanceComponents
            components={this.props.oamComponents}
            filterCallback={this.filterCallback}
          />
        );
        Heading = <h1 class="resheader">{this.labels.oamcomps}</h1>;
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
              <li id="oamapps">
                <a href="#">{this.labels.oamapps}</a>
              </li>
              <li id="oamcomps">
                <a href="#">{this.labels.oamcomps}</a>
              </li>
            </ul>
            <div id="filters">{this.state.filter}</div>
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
