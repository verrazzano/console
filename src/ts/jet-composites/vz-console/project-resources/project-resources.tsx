// Copyright (c) 2021, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

// eslint-disable-next-line no-unused-vars
import { VComponent, customElement, listener, h } from "ojs/ojvcomponent";
import { ConsoleProjectClusters } from "vz-console/project-clusters/loader";
import { ConsoleProjectNamespaces } from "vz-console/project-namespaces/loader";
import * as Messages from "vz-console/utils/Messages";
import { Project } from "vz-console/service/types";
import { BreadcrumbType } from "vz-console/breadcrumb/loader";
import { getDefaultRouter } from "vz-console/utils/utils";
import CoreRouter = require("ojs/ojcorerouter");
import UrlPathAdapter = require("ojs/ojurlpathadapter");

class State {
  selectedItem: string;
}

class Props {
  project: Project;
  breadcrumbCallback: (breadcrumbs: BreadcrumbType[]) => {};
  selectedItem?: string;
}

/**
 * @ojmetadata pack "vz-console"
 */
@customElement("vz-console-project-resources")
export class ConsoleProjectResources extends VComponent<Props, State> {
  router: CoreRouter;

  baseBreadcrumbs: BreadcrumbType[] = [
    { label: Messages.Nav.home(), href: "/" },
    { label: Messages.Instance.projects(), href: "/projects" },
  ];

  labels = {
    namespaces: Messages.Labels.namespaces(),
    clusters: Messages.Labels.clusters(),
  };

  state: State = {
    selectedItem: this.props.selectedItem
      ? this.props.selectedItem
      : "clusters",
  };

  protected mounted() {
    getDefaultRouter().destroy();
    history.replaceState(
      null,
      "path",
      `projects/${this.props.project.data.metadata.uid}`
    );
    const parentRouter = new CoreRouter(
      [
        { path: "", redirect: this.props.project.data.metadata.uid },
        { path: this.props.project.data.metadata.uid },
      ],
      {
        urlAdapter: new UrlPathAdapter("/projects"),
      }
    );
    parentRouter
      .sync()
      .then(() => {
        this.router = new CoreRouter(
          [{ path: "" }, { path: `clusters` }, { path: `namespaces` }],
          {
            urlAdapter: new UrlPathAdapter(
              `/projects/${this.props.project.data.metadata.uid}`
            ),
          },
          parentRouter
        );
        this.router.currentState.subscribe((args) => {
          const breadcrumbs = [...this.baseBreadcrumbs];
          if (args.state) {
            if (args.state.path) {
              breadcrumbs.push({
                label: Messages.Labels.projectInfo(),
                href: "#",
                onclick: () => {
                  parentRouter.go().then(() => {
                    this.updateState({ selectedItem: "clusters" });
                    history.pushState(
                      null,
                      "path",
                      this.props.project.data.metadata.uid
                    );
                  });
                },
              });
              if (args.state.path in this.labels) {
                breadcrumbs.push({
                  label: this.labels[args.state.path],
                });
              }
              this.updateState({ selectedItem: args.state.path });
            } else {
              breadcrumbs.push({
                label: Messages.Labels.projectInfo(),
              });
            }
          }
          this.props.breadcrumbCallback(breadcrumbs);
        });

        parentRouter.beforeStateChange.subscribe((args) => {
          this.router.go();
          args.accept(Promise.resolve(""));
        });
      })
      .then(() => {
        if (this.props.selectedItem) {
          this.router.go({ path: this.props.selectedItem });
        }
      });
  }

  @listener({ capture: true, passive: true })
  private selectionChange(event: CustomEvent) {
    if (event.detail.originalEvent) {
      this.router.go({ path: event.detail.value });
    }
  }

  protected updated(oldprops: Readonly<Props>, oldState: Readonly<State>) {
    if (
      this.state.selectedItem &&
      this.state.selectedItem !== oldState.selectedItem
    ) {
      this.router.go({ path: this.state.selectedItem });
    }
  }

  protected render() {
    let ResourceList: Element;
    let Heading: Element;
    switch (this.state.selectedItem) {
      case "clusters": {
        const clusters: { name: string }[] = [];
        if (this.props.project && this.props.project.clusters) {
          this.props.project.clusters.forEach((cluster) => {
            clusters.push({
              name: cluster.name,
            });
          });
        }
        ResourceList = <ConsoleProjectClusters clusters={clusters} />;
        Heading = <h1 class="resheader">{this.labels.clusters}</h1>;

        break;
      }
      case "namespaces": {
        const namespaces: { name: string }[] = [];
        if (this.props.project && this.props.project.namespaces) {
          this.props.project.namespaces.forEach((namespace) => {
            namespaces.push({
              name: namespace.metadata?.name,
            });
          });
        }
        ResourceList = <ConsoleProjectNamespaces namespaces={namespaces} />;
        Heading = <h1 class="resheader">{this.labels.namespaces}</h1>;

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
              <li id="clusters">
                <a href="#">{this.labels.clusters}</a>
              </li>
              <li id="namespaces">
                <a href="#">{this.labels.namespaces}</a>
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