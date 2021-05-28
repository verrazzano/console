// Copyright (c) 2021, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import {
  ElementVComponent,
  customElement,
  listener,
  // eslint-disable-next-line no-unused-vars
  h,
} from "ojs/ojvcomponent-element";
import { ConsoleOAMCompParamsList } from "vz-console/oamcomp-params-list/loader";
import * as Messages from "vz-console/utils/Messages";
import { OAMComponent, OAMComponentParam } from "vz-console/service/types";
import { BreadcrumbType } from "vz-console/breadcrumb/loader";
import { getDefaultRouter } from "vz-console/utils/utils";
import CoreRouter = require("ojs/ojcorerouter");
import UrlPathAdapter = require("ojs/ojurlpathadapter");

class State {
  selectedItem: string;
}

class Props {
  oamComponent: OAMComponent;
  breadcrumbCallback: (breadcrumbs: BreadcrumbType[]) => void;
  selectedItem?: string;
  cluster?: string;
}

/**
 * @ojmetadata pack "vz-console"
 */
@customElement("vz-console-oamcomp-resources")
export class ConsoleOAMComponentResources extends ElementVComponent<
  Props,
  State
> {
  router: CoreRouter;

  baseBreadcrumbs: BreadcrumbType[] = [
    { label: Messages.Nav.home(), href: "/" },
    { label: Messages.Instance.oamCompoennts(), href: "/oamcomps" },
  ];

  labels = {
    params: Messages.Labels.params(),
  };

  state: State = {
    selectedItem: this.props.selectedItem ? this.props.selectedItem : "params",
  };

  protected mounted() {
    getDefaultRouter().destroy();
    history.replaceState(
      null,
      "path",
      `oamcomps/${this.props.oamComponent.data.metadata.uid}${
        this.props.cluster ? "?cluster=" + this.props.cluster : ""
      }`
    );
    const parentRouter = new CoreRouter(
      [
        { path: "", redirect: this.props.oamComponent.data.metadata.uid },
        { path: this.props.oamComponent.data.metadata.uid },
        {
          path: this.props.oamComponent.data.metadata.uid,
          redirect: `${this.props.oamComponent.data.metadata.uid}${
            this.props.cluster ? "?cluster=" + this.props.cluster : ""
          }`,
        },
      ],
      {
        urlAdapter: new UrlPathAdapter("/oamcomps"),
      }
    );
    parentRouter
      .sync()
      .then(() => {
        this.router = new CoreRouter(
          [{ path: "" }, { path: `params` }],
          {
            urlAdapter: new UrlPathAdapter(
              `/oamapps/${this.props.oamComponent.data.metadata.uid}`
            ),
          },
          parentRouter
        );
        this.router.currentState.subscribe((args) => {
          const breadcrumbs = [...this.baseBreadcrumbs];
          if (args.state) {
            if (args.state.path) {
              breadcrumbs.push({
                label: Messages.Nav.oamCompDetails(),
                href: "#",
                onclick: () => {
                  parentRouter.go().then(() => {
                    this.updateState({ selectedItem: "params" });
                    history.pushState(
                      null,
                      "path",
                      this.props.oamComponent.data.metadata.uid
                    );
                  });
                },
              });
              if (args.state.path in this.labels) {
                breadcrumbs.push({
                  label: Messages.Labels.params(),
                });
              }
              this.updateState({ selectedItem: args.state.path });
            } else {
              breadcrumbs.push({
                label: Messages.Nav.oamCompDetails(),
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
      case "params": {
        const params: OAMComponentParam[] = [];
        if (
          this.props.oamComponent &&
          this.props.oamComponent.data &&
          this.props.oamComponent.data.spec &&
          this.props.oamComponent.data.spec.parameters
        ) {
          this.props.oamComponent.data.spec.parameters.forEach((parameter) => {
            const parameterData = parameter.parameter
              ? parameter.parameter
              : parameter;
            params.push({
              name: parameterData.name,
              description: parameterData.description,
              required: parameterData.required,
            });
          });
        }
        ResourceList = <ConsoleOAMCompParamsList params={params} />;
        Heading = <h1 class="resheader">{this.labels.params}</h1>;

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
              <li id="params">
                <a href="#">{this.labels.params}</a>
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
