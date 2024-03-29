// Copyright (c) 2021, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import {
  ElementVComponent,
  customElement,
  listener,
  // eslint-disable-next-line no-unused-vars
  h,
} from "ojs/ojvcomponent-element";
import { ConsoleOamApplicationComponents } from "vz-console/oamapp-components/loader";
import * as Messages from "vz-console/utils/Messages";
import { OAMApplication } from "vz-console/service/types";
import { BreadcrumbType } from "vz-console/breadcrumb/loader";
import { filtersEqual, getDefaultRouter } from "vz-console/utils/utils";
import { ConsoleOamApplicationComponentTraits } from "vz-console/oamapp-component-traits/loader";
import { ConsoleOamApplicationComponentScopes } from "vz-console/oamapp-component-scopes/loader";
import { ConsoleOamApplicationComponentParams } from "vz-console/oamapp-component-params/loader";
import CoreRouter = require("ojs/ojcorerouter");
import UrlPathAdapter = require("ojs/ojurlpathadapter");

class State {
  selectedItem: string;
  filter?: Element;
  selectedComponent?: string;
}

class Props {
  oamApplication: OAMApplication;
  breadcrumbCallback: (breadcrumbs: BreadcrumbType[]) => void;
  selectedItem?: string;
  selectedComponent?: string;
  toggleComponentViewCallBack?: (
    selectedItem: string,
    selectedComponent: string,
    linkSelectionCallback: (
      selectedItem: string,
      selectedComponent: string
    ) => void
  ) => void;

  cluster?: string;
}

/**
 * @ojmetadata pack "vz-console"
 */
@customElement("vz-console-oamapp-resources")
export class ConsoleOAMApplicationResources extends ElementVComponent<
  Props,
  State
> {
  router: CoreRouter;

  baseBreadcrumbs: BreadcrumbType[] = [
    { label: Messages.Nav.home(), href: "/" },
    { label: Messages.Instance.oamApps(), href: "/oamapps" },
  ];

  labels = {
    components: Messages.Labels.components(),
  };

  state: State = {
    selectedItem: this.props.selectedItem
      ? this.props.selectedItem
      : "components",
    selectedComponent: this.props.selectedComponent,
  };

  protected mounted() {
    getDefaultRouter().destroy();
    history.replaceState(
      null,
      "path",
      `oamapps/${this.props.oamApplication.data.metadata.uid}${
        this.props.cluster ? "?cluster=" + this.props.cluster : ""
      }`
    );
    window.addEventListener("popstate", (event) => {
      const pathArray = document.location.pathname.split("/");
      if (pathArray[pathArray.length - 1] in Messages.ComponentConfigLabels) {
        this.updateState({
          selectedItem: pathArray[pathArray.length - 1],
          selectedComponent: pathArray[pathArray.length - 2],
        });
      }
    });
    const parentRouter = new CoreRouter(
      [
        { path: "", redirect: this.props.oamApplication.data.metadata.uid },
        { path: this.props.oamApplication.data.metadata.uid },
        {
          path: this.props.oamApplication.data.metadata.uid,
          redirect: `${this.props.oamApplication.data.metadata.uid}${
            this.props.cluster ? "?cluster=" + this.props.cluster : ""
          }`,
        },
        {
          path: `${this.props.oamApplication.data.metadata.uid}${
            this.props.cluster ? "?cluster=" + this.props.cluster : ""
          }`,
        },
      ],
      {
        urlAdapter: new UrlPathAdapter("/oamapps"),
      }
    );
    parentRouter
      .sync()
      .then(() => {
        this.router = new CoreRouter(
          [
            { path: "" },
            { path: "components" },
            {
              path: "components",
              redirect: `components${
                this.props.cluster ? "?cluster=" + this.props.cluster : ""
              }`,
            },
            {
              path: `components${
                this.props.cluster ? "?cluster=" + this.props.cluster : ""
              }`,
            },
            { path: "traits" },
            {
              path: "traits",
              redirect: `traits${
                this.props.cluster ? "?cluster=" + this.props.cluster : ""
              }`,
            },
            {
              path: `traits${
                this.props.cluster ? "?cluster=" + this.props.cluster : ""
              }`,
            },
            { path: "scopes" },
            {
              path: "scopes",
              redirect: `scopes${
                this.props.cluster ? "?cluster=" + this.props.cluster : ""
              }`,
            },
            {
              path: `scopes${
                this.props.cluster ? "?cluster=" + this.props.cluster : ""
              }`,
            },
            { path: "params" },
            {
              path: "params",
              redirect: `params${
                this.props.cluster ? "?cluster=" + this.props.cluster : ""
              }`,
            },
            {
              path: `params${
                this.props.cluster ? "?cluster=" + this.props.cluster : ""
              }`,
            },
          ],
          {
            urlAdapter: new UrlPathAdapter(
              `/oamapps/${this.props.oamApplication.data.metadata.uid}`
            ),
          },
          parentRouter
        );
        this.router.currentState.subscribe((args) => {
          const breadcrumbs = [...this.baseBreadcrumbs];
          if (args.state) {
            if (args.state.path) {
              breadcrumbs.push({
                label: Messages.Nav.oamAppDetails(),
                href: "#",
                onclick: () => {
                  parentRouter.go().then(() => {
                    this.updateState({
                      selectedItem: `components`,
                      selectedComponent: "",
                      filter: null,
                    });
                    history.pushState(
                      null,
                      "path",
                      `${this.props.oamApplication.data.metadata.uid}${
                        this.props.cluster
                          ? "?cluster=" + this.props.cluster
                          : ""
                      }`
                    );
                  });
                },
              });

              if (args.state.path in this.labels) {
                breadcrumbs.push({ label: this.labels[args.state.path] });
              } else if (args.state.path in Messages.ComponentConfigLabels) {
                breadcrumbs.push({
                  label: Messages.Labels.components(),
                  href: "#",
                  onclick: () => {
                    this.router.go({ path: `components` }).then(() => {
                      this.updateState({ selectedComponent: "" });
                    });
                  },
                });

                if (this.state.selectedComponent) {
                  const selectedComponentInstance = this.props.oamApplication.componentInstances.find(
                    (component) => component.id === this.state.selectedComponent
                  );
                  if (selectedComponentInstance) {
                    breadcrumbs.push({ label: selectedComponentInstance.name });
                  }
                  breadcrumbs.push({
                    label: Messages.ComponentConfigLabels[args.state.path],
                  });
                  history.replaceState(
                    null,
                    "path",
                    `components/${this.state.selectedComponent}/${
                      args.state.path
                    }${
                      this.props.cluster ? "?cluster=" + this.props.cluster : ""
                    }`
                  );
                }
              }
              this.updateState({ selectedItem: args.state.path, filter: null });
            } else {
              breadcrumbs.push({
                label: Messages.Nav.oamAppDetails(),
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
    this.props.toggleComponentViewCallBack(
      this.props.selectedItem,
      this.props.selectedComponent,
      this.linkSelectionCallback
    );
  }

  @listener({ capture: true, passive: true })
  private selectionChange(event: CustomEvent) {
    if (event.detail.originalEvent) {
      this.updateState({
        selectedItem: event.detail.value,
        selectedComponent: this.state.selectedComponent,
        filter:
          event.detail.value in Messages.ComponentConfigLabels
            ? null
            : this.state.filter,
      });
    }
  }

  filterCallback = (filter: Element): void => {
    if (!filtersEqual(this.state.filter, filter)) {
      this.updateState({ filter: filter });
    }
  };

  linkSelectionCallback = (
    selectedItem: string,
    selectedComponent: string
  ): void => {
    this.updateState({ selectedItem, selectedComponent, filter: null });
    this.props.toggleComponentViewCallBack(
      selectedItem,
      selectedComponent,
      this.linkSelectionCallback
    );
  };

  protected updated(oldprops: Readonly<Props>, oldState: Readonly<State>) {
    if (
      this.state.selectedItem &&
      this.state.selectedItem !== oldState.selectedItem
    ) {
      this.router.go({ path: this.state.selectedItem });
      this.props.toggleComponentViewCallBack(
        this.state.selectedItem,
        this.state.selectedComponent,
        this.linkSelectionCallback
      );
    }
  }

  protected render() {
    let ResourceList: Element;
    let Heading: Element;
    switch (this.state.selectedItem) {
      case "components": {
        ResourceList = (
          <ConsoleOamApplicationComponents
            components={this.props.oamApplication.componentInstances}
            filterCallback={this.filterCallback}
            linkSelectionCallback={this.linkSelectionCallback}
            selectedComponent={this.state.selectedComponent}
          />
        );
        Heading = <h1 class="resheader">{this.labels.components}</h1>;
        break;
      }

      case "traits": {
        const selectedComponent = this.props.oamApplication.componentInstances.filter(
          (element) => {
            return element.id === this.state.selectedComponent;
          }
        )[0];

        ResourceList = (
          <ConsoleOamApplicationComponentTraits
            traits={selectedComponent.traits}
          />
        );
        Heading = (
          <h1 class="resheader">{Messages.ComponentConfigLabels.traits}</h1>
        );

        break;
      }

      case "scopes": {
        const selectedComponent = this.props.oamApplication.componentInstances.filter(
          (element) => {
            return element.id === this.state.selectedComponent;
          }
        )[0];

        ResourceList = (
          <ConsoleOamApplicationComponentScopes
            scopes={selectedComponent.scopes}
          />
        );
        Heading = (
          <h1 class="resheader">{Messages.ComponentConfigLabels.scopes}</h1>
        );

        break;
      }

      case "params": {
        const selectedComponent = this.props.oamApplication.componentInstances.filter(
          (element) => {
            return element.id === this.state.selectedComponent;
          }
        )[0];
        ResourceList = (
          <ConsoleOamApplicationComponentParams
            params={selectedComponent.params}
          />
        );
        Heading = (
          <h1 class="resheader">{Messages.ComponentConfigLabels.params}</h1>
        );

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
            item={{ selectable: true }}
          >
            <ul>
              <li id="components">
                <a href="#">{this.labels.components}</a>
              </li>
              <li
                id="traits"
                class={
                  !(this.state.selectedItem in Messages.ComponentConfigLabels)
                    ? "hide"
                    : `oj-navigationlist-item-element oj-navigationlist-item ${
                        this.state.selectedItem === "traits"
                          ? "oj-selected"
                          : ""
                      }`
                }
              >
                <a href="#">{Messages.ComponentConfigLabels.traits}</a>
              </li>

              <li
                id="scopes"
                class={
                  !(this.state.selectedItem in Messages.ComponentConfigLabels)
                    ? "hide"
                    : `oj-navigationlist-item-element oj-navigationlist-item ${
                        this.state.selectedItem === "scopes"
                          ? "oj-selected"
                          : ""
                      }`
                }
              >
                <a href="#">{Messages.ComponentConfigLabels.scopes}</a>
              </li>

              <li
                id="params"
                class={
                  !(this.state.selectedItem in Messages.ComponentConfigLabels)
                    ? "hide"
                    : `oj-navigationlist-item-element oj-navigationlist-item ${
                        this.state.selectedItem === "params"
                          ? "oj-selected"
                          : ""
                      }`
                }
              >
                <a href="#">{Messages.ComponentConfigLabels.params}</a>
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
