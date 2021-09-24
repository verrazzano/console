// Copyright (c) 2021, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import {
  ElementVComponent,
  customElement,
  // eslint-disable-next-line no-unused-vars
  h,
  listener,
} from "ojs/ojvcomponent-element";
import { VerrazzanoApi, Status, OAMComponent } from "vz-console/service/loader";
import { ConsoleMetadataItem } from "vz-console/metadata-item/loader";
import { ConsoleError } from "vz-console/error/loader";
import * as Messages from "vz-console/utils/Messages";
import {
  ConsoleBreadcrumb,
  BreadcrumbType,
} from "vz-console/breadcrumb/loader";
import { ConsoleStatusBadge } from "vz-console/status-badge/loader";
import { ConsoleOAMComponentResources } from "vz-console/oamcomp-resources/loader";
import "ojs/ojconveyorbelt";
import * as yaml from "js-yaml";

class Props {
  oamCompId?: string;
  selectedItem?: string;
  cluster?: string;
}

class State {
  oamComponent?: OAMComponent;
  loading?: boolean;
  error?: Error;
  breadcrumbs?: BreadcrumbType[];
  selectedTab?: string;
}

/**
 * @ojmetadata pack "vz-console"
 */
@customElement("vz-console-oamcomp")
export class ConsoleOAMComponent extends ElementVComponent<Props, State> {
  verrazzanoApi: VerrazzanoApi;
  state: State = {
    loading: true,
    breadcrumbs: [],
    selectedTab: "tabInfo",
  };

  props: Props = {
    oamCompId: "",
  };

  constructor() {
    super(new Props());
    this.verrazzanoApi = new VerrazzanoApi();
  }

  protected mounted() {
    if (!this.props.oamCompId) {
      this.updateState({ error: new Error(Messages.Error.errInvalidOamCompId()) });
      return;
    }

    this.getData();
  }

  async getData() {
    this.updateState({ loading: true });
    const projects = await this.verrazzanoApi.listProjects();
    if (this.props.cluster) {
      const vmc = await this.verrazzanoApi.getVMC(this.props.cluster);
      if (!vmc) {
        this.updateState({
          error: new Error(Messages.Error.errVmcNotExists(this.props.cluster)),
        });
      }

      this.verrazzanoApi = new VerrazzanoApi(this.props.cluster);
    }
    this.verrazzanoApi
      .getOAMComponent(
        this.props.oamCompId,
        this.props.cluster ? this.props.cluster : "local"
      )
      .then((oamComponent) => {
        if (projects) {
          projects.forEach((project) => {
            if (
              project.namespaces &&
              project.namespaces.some(
                (namespace) =>
                  oamComponent.namespace === namespace.metadata?.name
              ) &&
              project.clusters &&
              project.clusters.some(
                (cluster) => cluster.name === oamComponent.cluster.name
              )
            ) {
              oamComponent.project = project;
            }
          });
        }
        this.updateState({ loading: false, oamComponent });
      })
      .catch((error) => {
        this.updateState({ error: error });
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
    let metadataItems: Element[] = [];
    const links: Element[] = [];
    switch (this.state.selectedTab) {
      case "tabInfo":
        this.state.oamComponent.applications.forEach((application) => {
          links.push(
            <div class="oj-panel applistitem bg">
              <a
                onClick={() => {
                  window.open(
                    `/oamapps/${application.data.metadata.uid}${
                      application.cluster &&
                      application.cluster.name !== "local"
                        ? "?cluster=" + application.cluster.name
                        : ""
                    }`,
                    "_blank"
                  );
                }}
                href={`/oamapps/${application.data.metadata.uid}${
                  application.cluster && application.cluster.name !== "local"
                    ? "?cluster=" + application.cluster.name
                    : ""
                }`}
              >
                {application.name}
              </a>
            </div>
          );
        });
        metadataItems = [
          <ConsoleMetadataItem
            label={Messages.Labels.name()}
            value={this.state.oamComponent.name}
          />,
          <ConsoleMetadataItem
            label={Messages.Labels.ns()}
            value={this.state.oamComponent.namespace}
          />,
          <ConsoleMetadataItem
            label={Messages.Labels.latestRevision()}
            value={this.state.oamComponent.latestRevision}
          />,
          <ConsoleMetadataItem
            label={Messages.Labels.created()}
            value={this.state.oamComponent.createdOn}
          />,
          <ConsoleMetadataItem
            label={Messages.Labels.workloadType()}
            value={this.state.oamComponent.workloadType}
          />,
          <ConsoleMetadataItem
            label={Messages.Labels.workloadSpec()}
            value={this.state.oamComponent.name}
            link={true}
            onclick={() => {
              (document.getElementById("popup") as any).open("#tabMetaInfo");
            }}
            id="tabMetaInfo"
          />,
        ];
        if (
          this.state.oamComponent.cluster &&
          this.state.oamComponent.cluster.name !== "local"
        ) {
          metadataItems.push(
            <ConsoleMetadataItem
              label={Messages.Labels.cluster()}
              value={this.state.oamComponent.cluster.name}
            />
          );
        }

        if (this.state.oamComponent.project) {
          metadataItems.push(
            <ConsoleMetadataItem
              label={Messages.Labels.project()}
              value={this.state.oamComponent.project.name}
              link={true}
              target={`/projects/${this.state.oamComponent.project.data.metadata.uid}`}
            />
          );
        }

        tabContents = [
          <div class="oj-flex">
            <div class="oj-sm-8 oj-flex-item">
              <h3>{Messages.Labels.generalInfo()}</h3>
              {metadataItems}
            </div>
            <oj-popup
              id="popup"
              tail="none"
              modality="modal"
              {...{ "position.my.horizontal": "center" }}
              {...{ "position.my.vertical": "bottom" }}
              {...{ "position.at.horizontal": "center" }}
              {...{ "position.at.vertical": "bottom" }}
              {...{ "position.offset.y": "-10px" }}
              class="popup"
            >
              <div class="popupbody">
                <div>
                  <a
                    onClick={() => {
                      (document.getElementById("popup") as any).close();
                    }}
                    class="closelink"
                  >
                    Close
                  </a>
                </div>
                <pre class="popupcontent">
                  {yaml.dump(
                    yaml.load(JSON.stringify(this.state.oamComponent.data))
                  )}
                </pre>
              </div>
            </oj-popup>
            <div class="oj-sm-4 oj-flex-item">
              <h3>{Messages.Labels.applications()}</h3>
              <oj-conveyor-belt
                orientation="vertical"
                contentParent="#contentParentDiv"
                class="applist"
                arrowVisibility="visible"
              >
                <div id="contentParentDiv">{links}</div>
              </oj-conveyor-belt>
            </div>
          </div>,
        ];

        break;
      case "tabLbl":
        if (this.state.oamComponent.data.metadata.labels) {
          for (const [key, value] of Object.entries(
            this.state.oamComponent.data.metadata.labels
          )) {
            tabContents.push(
              <ConsoleMetadataItem label={key} value={String(value)} />
            );
          }
        }
        break;
      case "tabAnnotation":
        if (this.state.oamComponent.data.metadata.annotations) {
          for (const [key, value] of Object.entries(
            this.state.oamComponent.data.metadata.annotations
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
          context={Messages.Error.errRenderOAMApplication(this.props.oamCompId)}
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
              text={"C"}
              label={Messages.Nav.oamComp()}
            />
          </div>
          <div class="oj-sm-10 oj-flex-item">
            <div class="oj-sm-12 oj-flex">
              <div class="oj-sm-1 oj-flex-item"></div>
              <div class="oj-sm-11 oj-flex-item">
                <h1 class="title">{this.state.oamComponent.name}</h1>
                <div class="oj-flex tablist">
                  <div
                    class={`oj-sm-2 oj-flex-item ${this.getTabClass(
                      "tabInfo"
                    )}`}
                  >
                    <button
                      aria-label={Messages.Labels.componentInfo()}
                      title={Messages.Labels.componentInfo()}
                      class={this.getBtnClass("tabInfo")}
                      id="tabInfo"
                      onClick={this.tabSwitch}
                      type="button"
                    >
                      {Messages.Labels.componentInfo()}
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
        <ConsoleOAMComponentResources
          oamComponent={this.state.oamComponent}
          breadcrumbCallback={this.breadcrumbCallback}
          selectedItem={this.props.selectedItem}
          cluster={this.props.cluster}
        />
      </div>
    );
  }
}
