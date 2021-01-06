// Copyright (c) 2021, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

// eslint-disable-next-line no-unused-vars
import { VComponent, customElement, h, listener } from "ojs/ojvcomponent";
import {
  VerrazzanoApi,
  Status,
  OAMApplication,
  OAMComponentInstance,
} from "vz-console/service/loader";
import { ConsoleMetadataItem } from "vz-console/metadata-item/loader";
import { ConsoleError } from "vz-console/error/loader";
import * as Messages from "vz-console/utils/Messages";
import {
  ConsoleBreadcrumb,
  BreadcrumbType,
} from "vz-console/breadcrumb/loader";
import { ConsoleStatusBadge } from "vz-console/status-badge/loader";
import { ConsoleOAMApplicationResources } from "vz-console/oamapp-resources/loader";
import { ConsoleOAMAppComponentView } from "vz-console/oamapp-component-view/loader";
import * as ko from "knockout";
import * as Model from "ojs/ojmodel";
import * as yaml from "js-yaml";
import CollectionDataProvider = require("ojs/ojcollectiondataprovider");

class Props {
  oamAppId?: string;
  selectedItem?: string;
  selectedComponent?: string;
}

class State {
  oamApplication?: OAMApplication;
  loading?: boolean;
  error?: string;
  breadcrumbs?: BreadcrumbType[];
  selectedTab?: string;
  selectedComponent?: string;
  selectedItem?: string;
  linkSelectionCallback?: (
    selectedItem: string,
    selectedComponent: string
  ) => {};
}

/**
 * @ojmetadata pack "vz-console"
 */
@customElement("vz-console-oamapp")
export class ConsoleOAMApplication extends VComponent<Props, State> {
  verrazzanoApi: VerrazzanoApi;
  state: State = {
    loading: true,
    breadcrumbs: [],
    selectedTab: "tabInfo",
  };

  props: Props = {
    oamAppId: "",
  };

  constructor() {
    super(new Props());
    this.verrazzanoApi = new VerrazzanoApi();
  }

  protected mounted() {
    if (!this.props.oamAppId) {
      this.updateState({ error: Messages.Error.errInvalidOamAppId() });
      return;
    }

    this.getData();
  }

  async getData() {
    this.updateState({ loading: true });
    this.verrazzanoApi
      .getOAMApplication(this.props.oamAppId)
      .then((oamApplication) => {
        this.updateState({
          loading: false,
          oamApplication,
          selectedItem: this.props.selectedItem,
          selectedComponent: this.props.selectedComponent,
        });
      })
      .catch((error) => {
        let errorMessage = error;
        if (error && error.message) {
          errorMessage = error.message;
        }
        this.updateState({ error: errorMessage });
      });
  }

  breadcrumbCallback = (breadcrumbs: BreadcrumbType[]): void => {
    this.updateState({ breadcrumbs });
  };

  toggleComponentViewCallBack = (
    selectedItem: string,
    selectedComponent: string,
    linkSelectionCallback: (
      selectedItem: string,
      selectedComponent: string
    ) => {}
  ): void => {
    this.updateState({
      selectedItem,
      selectedComponent,
      linkSelectionCallback,
    });
  };

  getTabClass(tabId: string): string {
    return this.state.selectedTab === tabId ? "tablistitem" : "borderbottom";
  }

  getBtnClass(tabId: string): string {
    return this.state.selectedTab === tabId ? "activebtn" : "tabbtn";
  }

  getTabTitle(): string {
    let tabTitle = "";
    switch (this.state.selectedTab) {
      case "tabInfo":
        tabTitle = Messages.Labels.generalInfo();
        break;
      case "tabLbl":
        tabTitle = Messages.Labels.labels();
        break;
      case "tabAnnotation":
        tabTitle = Messages.Labels.annotations();
        break;
    }
    return tabTitle;
  }

  async populateWorkload(component: OAMComponentInstance) {
    if (component.oamComponent) {
      const workload = component.oamComponent.data.spec.workload;
      const resource = await this.verrazzanoApi.getKubernetesResource(
        workload.metadata.name,
        workload.kind,
        workload.metadata.namespace
      );

      component.descriptor = yaml.dump(yaml.load(resource));
      component.workloadOpenEventHandler = () => {
        (document.getElementById(`popup_${component.id}`) as any).open(
          `#workload_${component.id}`
        );
      };
      component.workloadCloseEventHandler = () => {
        (document.getElementById(`popup_${component.id}`) as any).close();
      };
      return component;
    }
  }

  getPanelContents(): Element {
    if (this.state.selectedItem in Messages.ComponentConfigLabels) {
      const dataProvider: ko.Observable = ko.observable();
      const component = this.state.oamApplication.componentInstances.find(
        (componentInstance) =>
          componentInstance.id === this.state.selectedComponent
      );
      component.eventHandler = this.state.linkSelectionCallback;
      if (component.descriptor) {
        dataProvider(
          new CollectionDataProvider(
            new Model.Collection([new Model.Model(component)])
          )
        );
        return (
          <div class="oj-sm-12 oj-flex">
            <div class="oj-sm-1 oj-flex-item"></div>
            <div class="oj-sm-11 oj-flex-item">
              <h1 class="title">{component.name}</h1>
              <div class="oj-flex tablist">
                <div class={`oj-sm-3 oj-flex-item tablistitem`}>
                  <button
                    aria-label={Messages.Labels.oamAppInfo()}
                    title={Messages.Labels.oamCompInfo()}
                    class={"activebtn"}
                    id="tabComponents"
                    type="button"
                  >
                    {Messages.Labels.oamCompInfo()}
                  </button>
                </div>
                <div class="oj-sm-9 oj-flex-item borderbottom"></div>
              </div>
              <div class="oj-panel oj-flex metatdata-panel bg paneltabbed">
                <div class="oj-sm-12 oj-flex-item padleftunit">
                  <h3>{Messages.Labels.generalInfo()}</h3>
                  <ConsoleOAMAppComponentView
                    dataProvider={dataProvider()}
                    isRenderedOnPanel={true}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      } else {
        this.updateState({ loading: true });
        Promise.resolve(this.populateWorkload(component)).then(() => {
          this.updateState({ loading: false });
        });
      }
    } else {
      return (
        <div class="oj-sm-12 oj-flex">
          <div class="oj-sm-1 oj-flex-item"></div>
          <div class="oj-sm-11 oj-flex-item">
            <h1 class="title">{this.state.oamApplication.name}</h1>
            <div class="oj-flex tablist">
              <div
                class={`oj-sm-3 oj-flex-item ${this.getTabClass("tabInfo")}`}
              >
                <button
                  aria-label={Messages.Labels.oamAppInfo()}
                  title={Messages.Labels.oamAppInfo()}
                  class={this.getBtnClass("tabInfo")}
                  id="tabInfo"
                  onClick={this.tabSwitch}
                  type="button"
                >
                  {Messages.Labels.oamAppInfo()}
                </button>
              </div>
              <div class={`oj-sm-1 oj-flex-item ${this.getTabClass("tabLbl")}`}>
                <button
                  aria-label={Messages.Labels.labels()}
                  title={Messages.Labels.labels()}
                  class={this.getBtnClass("tabLbl")}
                  id="tabLbl"
                  onClick={this.tabSwitch}
                  type="button"
                >
                  {Messages.Labels.labels()}
                </button>
              </div>
              <div
                class={`oj-sm-2 oj-flex-item ${this.getTabClass(
                  "tabAnnotation"
                )}`}
              >
                <button
                  aria-label={Messages.Labels.annotations()}
                  title={Messages.Labels.annotations()}
                  class={this.getBtnClass("tabAnnotation")}
                  id="tabAnnotation"
                  onClick={this.tabSwitch}
                  type="button"
                >
                  {Messages.Labels.annotations()}
                </button>
              </div>
              <div class="oj-sm-7 oj-flex-item borderbottom"></div>
            </div>
            <div class="oj-panel oj-flex metatdata-panel bg paneltabbed">
              <div class="oj-sm-12 oj-flex-item">
                <h3>{this.getTabTitle()}</h3>
                {this.getTabContents()}
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  getTabContents(): Element[] {
    let tabContents: Element[] = [];
    switch (this.state.selectedTab) {
      case "tabInfo":
        tabContents = [
          <ConsoleMetadataItem
            label={Messages.Labels.name()}
            value={this.state.oamApplication.name}
          />,
          <ConsoleMetadataItem
            label={Messages.Labels.ns()}
            value={this.state.oamApplication.namespace}
          />,
          <ConsoleMetadataItem
            label={Messages.Labels.created()}
            value={this.state.oamApplication.createdOn}
          />,
        ];
        switch (this.state.oamApplication.status) {
          case Status.Running:
            tabContents.push(
              <div class="oj-flex">
                <div class="oj-sm-12 oj-flex-item metadata-item">
                  <strong>{Messages.Labels.status()}:&nbsp;</strong>
                  <span id="appStatus">
                    <span class="oj-icon-circle oj-icon-circle-sm oj-icon-circle-green">
                      <span class="oj-icon-circle-inner status-icon"></span>
                    </span>
                    &nbsp;{this.state.oamApplication.status}
                  </span>
                </div>
              </div>
            );
            break;
          case Status.Terminated:
            tabContents.push(
              <div class="oj-flex">
                <div class="oj-sm-12 oj-flex-item metadata-item">
                  <strong>{Messages.Labels.status()}:&nbsp;</strong>
                  <span id="appStatus">
                    <span class="oj-icon-circle oj-icon-circle-sm oj-icon-circle-red">
                      <span class="oj-icon-circle-inner status-icon"></span>
                    </span>
                    &nbsp;{this.state.oamApplication.status}
                  </span>
                </div>
              </div>
            );
            break;
          case Status.Creating:
            tabContents.push(
              <div class="oj-flex">
                <div class="oj-sm-12 oj-flex-item metadata-item">
                  <strong>{Messages.Labels.status()}:&nbsp;</strong>
                  <span id="appStatus">
                    <span class="oj-icon-circle oj-icon-circle-sm oj-icon-circle-orange">
                      <span class="oj-icon-circle-inner status-icon"></span>
                    </span>
                    &nbsp;{this.state.oamApplication.status}
                  </span>
                </div>
              </div>
            );
            break;
          default:
            tabContents.push(
              <div class="oj-flex">
                <div class="oj-sm-12 oj-flex-item compstatus">
                  <span id="appStatus">
                    <span class="oj-icon-circle oj-icon-circle-sm oj-icon-circle-mauve">
                      <span class="oj-icon-circle-inner status-icon"></span>
                    </span>
                    {this.state.oamApplication.status}
                  </span>
                </div>
              </div>
            );
            break;
        }
        break;
      case "tabLbl":
        if (this.state.oamApplication.data.metadata.labels) {
          for (const [key, value] of Object.entries(
            this.state.oamApplication.data.metadata.labels
          )) {
            tabContents.push(<ConsoleMetadataItem label={key} value={value} />);
          }
        }
        break;
      case "tabAnnotation":
        if (this.state.oamApplication.data.metadata.annotations) {
          for (const [key, value] of Object.entries(
            this.state.oamApplication.data.metadata.annotations
          )) {
            tabContents.push(<ConsoleMetadataItem label={key} value={value} />);
          }
        }
        break;
    }
    return tabContents;
  }

  @listener({ capture: true, passive: true })
  protected tabSwitch(event: CustomEvent) {
    this.updateState({ selectedTab: (event.target as Element).id });
  }

  protected render() {
    if (this.state.error) {
      return (
        <ConsoleError
          context={Messages.Error.errRenderOAMApplication(this.props.oamAppId)}
          error={this.state.error}
        />
      );
    }

    if (this.state.loading) {
      return <p>{Messages.Labels.loading()}</p>;
    }

    return (
      <div>
        <ConsoleBreadcrumb items={this.state.breadcrumbs} />
        <div class="oj-flex">
          <div class="oj-sm-2 oj-flex-item">
            <ConsoleStatusBadge
              status={Status.Running}
              type={"circle"}
              text={
                this.state.selectedItem in Messages.ComponentConfigLabels
                  ? "CI"
                  : "A"
              }
              label={
                this.state.selectedItem in Messages.ComponentConfigLabels
                  ? Messages.Nav.oamCompInstance()
                  : Messages.Nav.oamApp()
              }
            />
          </div>
          <div class="oj-sm-10 oj-flex-item">{this.getPanelContents()}</div>
        </div>
        <ConsoleOAMApplicationResources
          oamApplication={this.state.oamApplication}
          breadcrumbCallback={this.breadcrumbCallback}
          selectedItem={this.state.selectedItem}
          selectedComponent={this.state.selectedComponent}
          toggleComponentViewCallBack={this.toggleComponentViewCallBack}
        />
      </div>
    );
  }
}
