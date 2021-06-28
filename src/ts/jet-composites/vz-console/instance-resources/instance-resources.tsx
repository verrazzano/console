// Copyright (c) 2020, 2021, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import {
  ElementVComponent,
  customElement,
  listener,
  // eslint-disable-next-line no-unused-vars
  h,
} from "ojs/ojvcomponent-element";
import * as Messages from "vz-console/utils/Messages";
import {
  OAMApplication,
  OAMComponent,
  Cluster,
  Project,
} from "vz-console/service/types";
import { BreadcrumbType } from "vz-console/breadcrumb/loader";
import { filtersEqual, getDefaultRouter } from "vz-console/utils/utils";
import { ConsoleInstanceClusters } from "vz-console/instance-clusters/loader";
import { ConsoleInstanceApps } from "vz-console/instance-apps/loader";
import { ConsoleInstanceComponents } from "vz-console/instance-components/loader";
import { ConsoleInstanceProjects } from "vz-console/instance-projects/loader";
import { ConsoleInstanceWeblogicImages } from "vz-console/instance-weblogic-images/loader";
import CoreRouter = require("ojs/ojcorerouter");
import UrlPathAdapter = require("ojs/ojurlpathadapter");

const vzWLSImagesEnabled = (window as any).vzWLSImagesEnabled;

class Props {
  breadcrumbCallback: (breadcrumbs: BreadcrumbType[]) => void;
  selectedItem?: string;
  oamApplications?: Array<OAMApplication>;
  oamComponents?: Array<OAMComponent>;
  clusters?: Array<Cluster>;
  projects: Array<Project>;
}

class State {
  selectedItem: string;
  filter?: Element;
}

/**
 * @ojmetadata pack "vz-console"
 */
@customElement("vz-console-instance-resources")
export class ConsoleInstanceResources extends ElementVComponent<Props, State> {
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
    clusters: Messages.Instance.clusters(),
    oamapps: Messages.Instance.oamApps(),
    oamcomps: Messages.Instance.oamCompoennts(),
    projects: Messages.Instance.projects(),
    weblogicimages: Messages.Instance.weblogicImages(),
  };

  state: State = {
    selectedItem: this.props.selectedItem ? this.props.selectedItem : "oamapps",
  };

  protected mounted() {
    getDefaultRouter().destroy();
    history.replaceState(null, "path", `/${this.props.selectedItem}`);
    this.router = new CoreRouter(
      [
        { path: "" },
        { path: "oamapps" },
        { path: "oamcomps" },
        { path: "clusters" },
        { path: "projects" },
        { path: "weblogicimages" },
      ],
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
    // check that the filter has changed, short circuit if it has not to prevent render loop
    if (!filtersEqual(this.state.filter, filter)) {
      this.updateState({ filter: filter });
    }
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

      case "clusters": {
        ResourceList = (
          <ConsoleInstanceClusters
            clusters={this.props.clusters}
            filterCallback={this.filterCallback}
          />
        );
        Heading = <h1 class="resheader">{this.labels.clusters}</h1>;
        break;
      }
      case "projects": {
        ResourceList = (
          <ConsoleInstanceProjects
            projects={this.props.projects}
            filterCallback={this.filterCallback}
          />
        );
        Heading = <h1 class="resheader">{this.labels.projects}</h1>;
        break;
      }

      case "weblogicimages": {
        ResourceList = (
          <ConsoleInstanceWeblogicImages filterCallback={this.filterCallback} />
        );
        Heading = <h1 class="resheader">{this.labels.weblogicimages}</h1>;
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
              <li id="clusters">
                <a href="#">{this.labels.clusters}</a>
              </li>
              <li id="projects">
                <a href="#">{this.labels.projects}</a>
              </li>
              {vzWLSImagesEnabled ? (
                <li id="weblogicimages">
                  <a href="#">{this.labels.weblogicimages}</a>
                </li>
              ) : (
                ""
              )}
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
