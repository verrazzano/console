// Copyright (c) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

// eslint-disable-next-line no-unused-vars
import { VComponent, customElement, listener, h } from "ojs/ojvcomponent";
import { ConsoleOamApplicationComponents } from "vz-console/oamapp-components/loader";
import * as Messages from "vz-console/utils/Messages";
import {
  OAMApplication,
  OAMScope,
  OAMTrait,
  OAMParam,
} from "vz-console/service/types";
import { BreadcrumbType } from "vz-console/breadcrumb/loader";
import { getDefaultRouter } from "vz-console/utils/utils";
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
  breadcrumbCallback: (breadcrumbs: BreadcrumbType[]) => {};
  selectedItem?: string;
  selectedComponent?: string;
}

/**
 * @ojmetadata pack "vz-console"
 */
@customElement("vz-console-oamapp-resources")
export class ConsoleOAMApplicationResources extends VComponent<Props, State> {
  router: CoreRouter;
  componentRouters: Map<string, CoreRouter> = new Map();
  baseBreadcrumbs: BreadcrumbType[] = [
    { label: Messages.Nav.home(), href: "/" },
    { label: Messages.Instance.oamApps(), href: "/oamapps" },
  ];

  labels = {
    components: Messages.Labels.components(),
  };

  componentConfigLabels = {
    traits: Messages.Labels.traits(),
    scopes: Messages.Labels.scopes(),
    params: Messages.Labels.params(),
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
      `oamapps/${this.props.oamApplication.data.metadata.uid}`
    );
    const parentRouter = new CoreRouter(
      [
        { path: "", redirect: this.props.oamApplication.data.metadata.uid },
        { path: this.props.oamApplication.data.metadata.uid },
      ],
      {
        urlAdapter: new UrlPathAdapter("/oamapps"),
      }
    );
    parentRouter
      .sync()
      .then(() => {
        this.router = new CoreRouter(
          [{ path: "" }, { path: `components` }],
          {
            urlAdapter: new UrlPathAdapter(
              `/oamapps/${this.props.oamApplication.data.metadata.uid}`
            ),
          },
          parentRouter
        );
        this.router.currentState.subscribe((args) => {
          if (args.state) {
            const label = this.labels[args.state.path];
            const breadcrumbs = [...this.baseBreadcrumbs];
            if (label) {
              breadcrumbs.push({
                label: Messages.Nav.oamAppDetails(),
                href: "#",
                onclick: () => {
                  this.router.go({
                    path: "",
                  });
                },
              });
              breadcrumbs.push({ label });
              this.updateState({ selectedItem: args.state.path, filter: null });
              this.props.breadcrumbCallback(breadcrumbs);
            } else {
              breadcrumbs.push({ label: Messages.Nav.oamAppDetails() });
              this.updateState({ selectedItem: "components", filter: null });
              this.props.breadcrumbCallback(breadcrumbs);
            }
          }
        });
        parentRouter.beforeStateChange.subscribe((args) => {
          this.router.go();
          args.accept(Promise.resolve(""));
        });
      })
      .then(() => {
        if (this.props.selectedComponent) {
          this.initializeComponentRouter();
        }
      })
      .then(() => {
        if (this.props.selectedComponent) {
          const componentInstanceRouter = this.componentRouters.get(
            this.props.selectedComponent
          );
          if (!componentInstanceRouter) {
            throw new Error("invalid component id");
          }
          if (this.props.selectedItem) {
            componentInstanceRouter.go({ path: this.props.selectedItem });
          } else {
            componentInstanceRouter.go({ path: "" });
          }
        } else if (this.props.selectedItem) {
          this.router.go({ path: this.props.selectedItem });
        }
      });
  }

  private initializeComponentRouter() {
    if (this.props.oamApplication.componentInstances) {
      this.props.oamApplication.componentInstances.forEach(
        (componentInstance) => {
          const parentRouter = new CoreRouter(
            [
              { path: "", redirect: componentInstance.id },
              { path: componentInstance.id },
            ],
            {
              urlAdapter: new UrlPathAdapter(
                `/oamapps/${this.props.oamApplication.data.metadata.uid}/components`
              ),
            },
            this.router
          );
          parentRouter.sync().then(() => {
            const componentInstanceRouter = new CoreRouter(
              [
                { path: "" },
                { path: `traits` },
                { path: `scopes` },
                { path: `params` },
              ],
              {
                urlAdapter: new UrlPathAdapter(
                  `/oamapps/${this.props.oamApplication.data.metadata.uid}/components/${componentInstance.id}`
                ),
              },
              parentRouter
            );

            componentInstanceRouter.currentState.subscribe((args) => {
              if (args.state) {
                const label = this.labels[args.state.path];
                const breadcrumbs = [...this.baseBreadcrumbs];
                breadcrumbs.push({
                  label: Messages.Nav.oamAppDetails(),
                  href: "#",
                  onclick: () => {
                    this.router.go({
                      path: "",
                    });
                  },
                });
                breadcrumbs.push({
                  label: Messages.Nav.compInstances(),
                  href: "#",
                  onclick: () => {
                    this.router.go({
                      path: "components",
                    });
                  },
                });
                if (label) {
                  breadcrumbs.push({
                    label: componentInstance.name,
                    href: "#",
                    onclick: () => {
                      componentInstanceRouter.go({
                        path: "",
                      });
                    },
                  });
                  breadcrumbs.push({ label });
                  this.updateState({
                    selectedComponent: componentInstance.id,
                    selectedItem: args.state.path,
                    filter: null,
                  });
                  this.props.breadcrumbCallback(breadcrumbs);
                } else {
                  breadcrumbs.push({ label: componentInstance.name });
                  this.updateState({
                    selectedItem: "components",
                    selectedComponent: componentInstance.id,
                    filter: null,
                  });
                  this.props.breadcrumbCallback(breadcrumbs);
                }
              }
            });

            parentRouter.beforeStateChange.subscribe((args) => {
              componentInstanceRouter.sync();
              args.accept(Promise.resolve(""));
            });
            this.componentRouters.set(
              componentInstance.id,
              componentInstanceRouter
            );
          });
        }
      );
    }
  }

  @listener({ capture: true, passive: true })
  private selectionChange(event: CustomEvent) {
    if (this.state.selectedComponent) {
      if (this.componentRouters.size === 0) {
        this.initializeComponentRouter();
      }
    }
    this.updateState({ selectedItem: event.detail.value });
    if (event.detail.originalEvent) {
      this.router.go({ path: event.detail.value });
    }

    /* if(event.detail.value in this.componentConfigLabels) {
        this.componentRouters.get(this.state.selectedComponent).go({ path: event.detail.value })
      } else {
        this.router.go({ path: event.detail.value });
      } */
  }

  filterCallback = (filter: Element): void => {
    this.updateState({ filter: filter });
  };

  linkSelectionCallback = (
    selectedItem: string,
    selectedComponent: string
  ): void => {
    this.updateState({ selectedItem, selectedComponent });
  };

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
        const traits: OAMTrait[] = [];
        if (selectedComponent.data.traits) {
          selectedComponent.data.traits.forEach((trait) => {
            const traitData = trait.trait ? trait.trait : trait;
            traits.push({
              name: traitData.metadata ? traitData.metadata.name : "",
              kind: traitData.kind,
              descriptor: traitData,
            });
          });
        }
        ResourceList = <ConsoleOamApplicationComponentTraits traits={traits} />;
        Heading = (
          <h1 class="resheader">{this.componentConfigLabels.traits}</h1>
        );

        break;
      }

      case "scopes": {
        const selectedComponent = this.props.oamApplication.componentInstances.filter(
          (element) => {
            return element.id === this.state.selectedComponent;
          }
        )[0];
        const scopes: OAMScope[] = [];
        if (selectedComponent.data.scopes) {
          selectedComponent.data.scopes.forEach((scope) => {
            const scopeData = scope.scopeRef ? scope.scopeRef : scope;
            scopes.push({
              name: scopeData.metdata ? scopeData.metdata.name : "",
              kind: scopeData.kind,
              descriptor: scopeData,
            });
          });
        }
        ResourceList = <ConsoleOamApplicationComponentScopes scopes={scopes} />;
        Heading = (
          <h1 class="resheader">{this.componentConfigLabels.scopes}</h1>
        );

        break;
      }

      case "params": {
        const selectedComponent = this.props.oamApplication.componentInstances.filter(
          (element) => {
            return element.id === this.state.selectedComponent;
          }
        )[0];
        const params: OAMParam[] = [];
        if (selectedComponent.data.parameterValues) {
          selectedComponent.data.parameterValues.forEach((param) => {
            params.push({
              name: param.name,
              value: param.value,
            });
          });
        }
        ResourceList = <ConsoleOamApplicationComponentParams params={params} />;
        Heading = (
          <h1 class="resheader">{this.componentConfigLabels.params}</h1>
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
          >
            <ul>
              <li id="components">
                <a href="#">{this.labels.components}</a>
              </li>
              <li
                id="traits"
                class={
                  this.state.selectedItem !== "traits"
                    ? "hide"
                    : "oj-navigationlist-item-element oj-navigationlist-item oj-selected"
                }
              >
                <a href="#">{this.componentConfigLabels.traits}</a>
              </li>

              <li
                id="scopes"
                class={
                  this.state.selectedItem !== "scopes"
                    ? "hide"
                    : "oj-navigationlist-item-element oj-navigationlist-item oj-selected oj-selected"
                }
              >
                <a href="#">{this.componentConfigLabels.scopes}</a>
              </li>

              <li
                id="params"
                class={
                  this.state.selectedItem !== "params"
                    ? "hide"
                    : "oj-navigationlist-item-element oj-navigationlist-item oj-selected oj-selected"
                }
              >
                <a href="#">{this.componentConfigLabels.params}</a>
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
