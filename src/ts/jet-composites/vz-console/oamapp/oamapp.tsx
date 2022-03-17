// Copyright (c) 2021, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import {
  ElementVComponent,
  customElement,
  // eslint-disable-next-line no-unused-vars
  h,
  listener,
} from "ojs/ojvcomponent-element";
import {
  VerrazzanoApi,
  Status,
  OAMApplication,
  OAMComponentInstance,
  OAMTrait,
  OAMScope,
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
  cluster?: string;
}

class State {
  oamApplication?: OAMApplication;
  loading?: boolean;
  error?: Error;
  breadcrumbs?: BreadcrumbType[];
  selectedTab?: string;
  selectedComponent?: string;
  selectedItem?: string;
  linkSelectionCallback?: (
    selectedItem: string,
    selectedComponent: string
  ) => void;
}

/**
 * @ojmetadata pack "vz-console"
 */
@customElement("vz-console-oamapp")
export class ConsoleOAMApplication extends ElementVComponent<Props, State> {
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
      this.updateState({
        error: new Error(Messages.Error.errInvalidOamAppId()),
      });
      return;
    }

    this.getData();
  }

  async getData() {
    this.updateState({ loading: true });
    try {
      const projects = await this.verrazzanoApi.listProjects();
      if (this.props.cluster) {
        const vmc = await this.verrazzanoApi.getVMC(this.props.cluster);
        if (!vmc) {
          this.updateState({
            error: new Error(
              Messages.Error.errVmcNotExists(this.props.cluster)
            ),
          });
        }

        this.verrazzanoApi = new VerrazzanoApi(this.props.cluster);
      }

      const oamApplication = await this.verrazzanoApi.getOAMApplication(
        this.props.oamAppId,
        this.props.cluster ? this.props.cluster : "local"
      );
      if (oamApplication.componentInstances) {
        for (const component of oamApplication.componentInstances) {
          await this.populateComponent(component);
        }
      }

      if (projects) {
        projects.forEach((project) => {
          if (
            project.namespaces &&
            project.namespaces.some(
              (namespace) =>
                oamApplication.namespace === namespace.metadata?.name
            ) &&
            project.clusters &&
            project.clusters.some(
              (cluster) => cluster.name === oamApplication.cluster.name
            )
          ) {
            oamApplication.project = project;
          }
        });
      }
      this.updateState({
        loading: false,
        oamApplication,
        selectedItem: this.props.selectedItem,
        selectedComponent: this.props.selectedComponent,
      });
    } catch (error) {
      this.updateState({ error: error });
    }
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
    ) => void
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

  async populateComponent(component: OAMComponentInstance) {
    await this.populateWorkload(component);
    await this.populateTraits(component);
    await this.populateScopes(component);
    this.populateParams(component);
  }

  async populateWorkload(component: OAMComponentInstance) {
    if (component.oamComponent) {
      const workload = component.oamComponent.data.spec.workload;
      const workloadMetadata: {
        name: string;
        namespace: string;
      } = this.getWorkloadMetadata(
        workload,
        component.oamComponent.data.metadata
      );
      try {
        const response = await this.verrazzanoApi.getKubernetesResource(
          {
            ApiVersion:
              workload.apiVersion === "v1"
                ? `api/${workload.apiVersion}`
                : `apis/${workload.apiVersion}`,
            Kind: workload.kind,
          },
          workloadMetadata.namespace,
          workloadMetadata.name
        );
        const resource = await response.json();

        component.descriptor = yaml.dump(yaml.load(JSON.stringify(resource)));
      } catch (error) {
        this.updateState({ error: error });
      }
      component.workloadOpenEventHandler = () => {
        (document.getElementById(`popup_${component.id}`) as any).open(
          `#workload_${component.id}`
        );
      };
      component.workloadCloseEventHandler = () => {
        (document.getElementById(`popup_${component.id}`) as any).close();
      };
    }
  }

  getWorkloadMetadata(
    workload: any,
    componentMetadata: any
  ): { name: string; namespace: string } {
    if (workload.kind.toLowerCase().startsWith("verrazzano")) {
      let name = "";
      let namespace = "";
      if (workload.metadata && workload.metadata.name) {
        name = workload.metadata.name;
      }
      if (workload.metadata && workload.metadata.namespace) {
        namespace = workload.metadata.namespace;
      }
      if (!name) {
        name = componentMetadata.name;
      }
      if (!namespace) {
        namespace = componentMetadata.namespace;
      }

      return {
        name,
        namespace,
      };
    }

    if (
      workload.spec &&
      workload.spec.template &&
      workload.spec.template.metadata &&
      workload.spec.template.metadata.name &&
      workload.spec.template.metadata.namespace
    ) {
      return {
        name: workload.spec.template.metadata.name,
        namespace: workload.spec.template.metadata.namespace,
      };
    }

    if (workload.metadata && workload.metadata.name) {
      return {
        name: workload.metadata.name,
        namespace: workload.metadata.namespace || componentMetadata.namespace,
      };
    }

    throw new Error(Messages.Error.errInvalidWorkload());
  }

  async populateTraits(component: OAMComponentInstance) {
    component.traits = [];
    if (component.data.traits) {
      try {
        for (const componentInstanceTrait of component.data.traits) {
          const traitData = componentInstanceTrait.trait
            ? componentInstanceTrait.trait
            : componentInstanceTrait;
          const trait: OAMTrait = {
            name: traitData.metadata ? traitData.metadata.name : "",
            kind: traitData.kind,
            apiVersion: traitData.apiVersion,
            descriptor: traitData,
            namespace:
              traitData.metadata && traitData.metadata.namespace
                ? traitData.metadata.namespace
                : component.oamComponent.namespace,
            id:
              traitData.metadata && traitData.metadata.uid
                ? traitData.metadata.uid
                : `${component.id}_trait_${traitData.kind}_${
                    traitData.metadata ? traitData.metadata.name : ""
                  }`,
          };
          console.log(`TRAITS: ${JSON.stringify(trait)}`);
          if (trait.name && trait.namespace && trait.kind) {
            const response = await this.verrazzanoApi.getKubernetesResource(
              {
                ApiVersion:
                  trait.apiVersion === "v1"
                    ? `api/${trait.apiVersion}`
                    : `apis/${trait.apiVersion}`,
                Kind: trait.kind,
              },
              trait.namespace,
              trait.name
            );
            const resource = await response.json();
            trait.descriptor = yaml.dump(yaml.load(JSON.stringify(resource)));
            trait.traitOpenEventHandler = () => {
              (document.getElementById(`popup_${trait.id}`) as any).open(
                `#trait_${trait.id}`
              );
            };
            trait.traitCloseEventHandler = () => {
              (document.getElementById(`popup_${trait.id}`) as any).close();
            };
            component.traits.push(trait);
          }
        }
      } catch (error) {
        this.updateState({ error: error });
      }
    }
  }

  async populateScopes(component: OAMComponentInstance) {
    component.scopes = [];
    if (component.data.scopes) {
      try {
        for (const componentInstanceScope of component.data.scopes) {
          const scopeData = componentInstanceScope.scopeRef
            ? componentInstanceScope.scopeRef
            : componentInstanceScope;
          const scope: OAMScope = {
            name: scopeData.name,
            kind: scopeData.kind,
            apiVersion: scopeData.apiVersion,
            descriptor: scopeData,
            namespace:
              scopeData.metadata && scopeData.metadata.namespace
                ? scopeData.metadata.namespace
                : component.oamComponent.namespace,
            id:
              scopeData.metadata && scopeData.metadata.uid
                ? scopeData.metadata.uid
                : `${component.id}_scope_${scopeData.kind}_${scopeData.name}`,
          };
          if (scope.name && scope.namespace && scope.kind) {
            const response = await this.verrazzanoApi.getKubernetesResource(
              {
                ApiVersion:
                  scope.apiVersion === "v1"
                    ? `api/${scope.apiVersion}`
                    : `apis/${scope.apiVersion}`,
                Kind: scope.kind,
              },
              scope.namespace,
              scope.name
            );
            const resource = await response.json();
            scope.descriptor = yaml.dump(yaml.load(JSON.stringify(resource)));
            scope.scopeOpenEventHandler = () => {
              (document.getElementById(`popup_${scope.id}`) as any).open(
                `#scope_${scope.id}`
              );
            };
            scope.scopeCloseEventHandler = () => {
              (document.getElementById(`popup_${scope.id}`) as any).close();
            };
            component.scopes.push(scope);
          }
        }
      } catch (error) {
        this.updateState({ error: error });
      }
    }
  }

  populateParams(component: OAMComponentInstance) {
    component.params = [];
    if (component.data.parameterValues) {
      component.data.parameterValues.forEach((param) => {
        component.params.push({
          name: param.name,
          value: param.value,
        });
      });
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
                    aria-label={Messages.Labels.oamCompInfo()}
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
            id={"app-name-metaitem"}
          />,
          <ConsoleMetadataItem
            label={Messages.Labels.ns()}
            value={this.state.oamApplication.namespace}
            id={"app-namespace-metaitem"}
          />,
          <ConsoleMetadataItem
            label={Messages.Labels.created()}
            value={this.state.oamApplication.createdOn}
            id={"app-created-metaitem"}
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
          case Status.Pending:
          default:
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
        }
        if (this.state.oamApplication.statusMessage) {
          tabContents.push(
            <ConsoleMetadataItem
              label={Messages.Labels.statusMessage()}
              value={this.state.oamApplication.statusMessage}
              id={"app-statusmessage-metaitem"}
            />
          );
        }
        if (
          this.state.oamApplication.cluster &&
          this.state.oamApplication.cluster.name !== "local"
        ) {
          tabContents.push(
            <ConsoleMetadataItem
              label={Messages.Labels.cluster()}
              value={this.state.oamApplication.cluster.name}
              id={"app-cluster-metaitem"}
            />
          );
        }
        if (this.state.oamApplication.project) {
          tabContents.push(
            <ConsoleMetadataItem
              label={Messages.Labels.project()}
              value={this.state.oamApplication.project.name}
              id={"app-project-metaitem"}
              link={true}
              target={`/projects/${this.state.oamApplication.project.data.metadata.uid}`}
            />
          );
        }
        break;
      case "tabLbl":
        if (this.state.oamApplication.data.metadata.labels) {
          for (const [key, value] of Object.entries(
            this.state.oamApplication.data.metadata.labels
          )) {
            tabContents.push(
              <ConsoleMetadataItem label={key} value={String(value)} />
            );
          }
        }
        break;
      case "tabAnnotation":
        if (this.state.oamApplication.data.metadata.annotations) {
          for (const [key, value] of Object.entries(
            this.state.oamApplication.data.metadata.annotations
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
          cluster={this.props.cluster}
        />
      </div>
    );
  }
}
