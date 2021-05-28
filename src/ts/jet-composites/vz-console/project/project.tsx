// Copyright (c) 2021, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import {
  ElementVComponent,
  customElement,
  // eslint-disable-next-line no-unused-vars
  h,
  listener,
} from "ojs/ojvcomponent-element";
import { VerrazzanoApi, Project, Status } from "vz-console/service/loader";
import { ConsoleMetadataItem } from "vz-console/metadata-item/loader";
import { ConsoleError } from "vz-console/error/loader";
import * as Messages from "vz-console/utils/Messages";
import {
  ConsoleBreadcrumb,
  BreadcrumbType,
} from "vz-console/breadcrumb/loader";
import { ConsoleStatusBadge } from "vz-console/status-badge/loader";
import { ConsoleProjectResources } from "vz-console/project-resources/loader";
import "ojs/ojconveyorbelt";
import * as yaml from "js-yaml";

class Props {
  projectId?: string;
  selectedItem?: string;
}

class State {
  project?: Project;
  loading?: boolean;
  error?: string;
  breadcrumbs?: BreadcrumbType[];
  selectedTab?: string;
}

/**
 * @ojmetadata pack "vz-console"
 */
@customElement("vz-console-project")
export class ConsoleProject extends ElementVComponent<Props, State> {
  verrazzanoApi: VerrazzanoApi;
  state: State = {
    loading: true,
    breadcrumbs: [],
    selectedTab: "tabInfo",
  };

  props: Props = {
    projectId: "",
  };

  constructor() {
    super(new Props());
    this.verrazzanoApi = new VerrazzanoApi();
  }

  protected mounted() {
    if (!this.props.projectId) {
      this.updateState({ error: Messages.Error.errInvalidProjectId() });
      return;
    }

    this.getData();
  }

  async getData() {
    this.updateState({ loading: true });
    this.verrazzanoApi
      .getProject(this.props.projectId)
      .then((project) => {
        this.updateState({ loading: false, project });
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

  getTabContents(): Element[] {
    let tabContents: Element[] = [];
    switch (this.state.selectedTab) {
      case "tabInfo":
        tabContents = [
          <div class="oj-flex">
            <div class="oj-sm-12 oj-flex-item">
              <h3>{Messages.Labels.generalInfo()}</h3>
              <ConsoleMetadataItem
                label={Messages.Labels.name()}
                value={this.state.project.name}
              />
              <ConsoleMetadataItem
                label={Messages.Labels.ns()}
                value={this.state.project.namespace}
              />
              <ConsoleMetadataItem
                label={Messages.Labels.created()}
                value={this.state.project.createdOn}
              />
              <ConsoleMetadataItem
                label={Messages.Labels.projectSpec()}
                value={this.state.project.name}
                link={true}
                onclick={() => {
                  (document.getElementById("projYamlPopup") as any).open(
                    "#tabMetaInfo"
                  );
                }}
                id="tabMetaInfo"
              />
              <oj-popup
                id="projYamlPopup"
                tail="none"
                modality="modal"
                {...{ "position.my.horizontal": "center" }}
                {...{ "position.my.vertical": "bottom" }}
                {...{ "position.at.horizontal": "center" }}
                {...{ "position.at.vertical": "bottom" }}
                {...{ "position.offset.y": "-10px" }}
                className="popup"
              >
                <div class="popupbody">
                  <div>
                    <a
                      onClick={() => {
                        (document.getElementById(
                          "projYamlPopup"
                        ) as any).close();
                      }}
                      class="closelink"
                    >
                      Close
                    </a>
                  </div>
                  <pre class="popupcontent">
                    {yaml.dump(
                      yaml.load(JSON.stringify(this.state.project.data))
                    )}
                  </pre>
                </div>
              </oj-popup>
            </div>
          </div>,
        ];
        break;
      case "tabLbl":
        if (this.state.project.data.metadata.labels) {
          for (const [key, value] of Object.entries(
            this.state.project.data.metadata.labels
          )) {
            tabContents.push(
              <ConsoleMetadataItem label={key} value={String(value)} />
            );
          }
        }
        break;
      case "tabAnnotation":
        if (this.state.project.data.metadata.annotations) {
          for (const [key, value] of Object.entries(
            this.state.project.data.metadata.annotations
          )) {
            tabContents.push(
              <ConsoleMetadataItem label={key} value={String(value)} />
            );
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
          context={Messages.Error.errRenderProject(this.props.projectId)}
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
              type={"square"}
              text={"C"}
              label={Messages.Nav.project()}
            />
          </div>
          <div class="oj-sm-10 oj-flex-item">
            <div class="oj-sm-12 oj-flex">
              <div class="oj-sm-1 oj-flex-item"></div>
              <div class="oj-sm-11 oj-flex-item">
                <h1 class="title">{this.state.project.name}</h1>
                <div class="oj-flex tablist">
                  <div
                    class={`oj-sm-2 oj-flex-item ${this.getTabClass(
                      "tabInfo"
                    )}`}
                  >
                    <button
                      aria-label={Messages.Labels.projectInfo()}
                      title={Messages.Labels.projectInfo()}
                      class={this.getBtnClass("tabInfo")}
                      id="tabInfo"
                      onClick={this.tabSwitch}
                      type="button"
                    >
                      {Messages.Labels.projectInfo()}
                    </button>
                  </div>
                  <div
                    class={`oj-sm-1 oj-flex-item ${this.getTabClass("tabLbl")}`}
                  >
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
                    {this.getTabContents()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <ConsoleProjectResources
          project={this.state.project}
          breadcrumbCallback={this.breadcrumbCallback}
          selectedItem={this.props.selectedItem}
        />
      </div>
    );
  }
}
