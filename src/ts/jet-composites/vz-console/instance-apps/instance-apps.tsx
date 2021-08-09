// Copyright (c) 2021, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import {
  ElementVComponent,
  customElement,
  // eslint-disable-next-line no-unused-vars
  h,
  listener,
} from "ojs/ojvcomponent-element";
import { OAMApplication, Status } from "vz-console/service/loader";
import * as ArrayDataProvider from "ojs/ojarraydataprovider";
import * as Model from "ojs/ojmodel";
import "ojs/ojtable";
import "ojs/ojselectsingle";
import "ojs/ojpagingcontrol";
import * as ko from "knockout";
import { ConsoleFilter } from "vz-console/filter/loader";
import * as Messages from "vz-console/utils/Messages";
import PagingDataProviderView = require("ojs/ojpagingdataproviderview");
import CollectionDataProvider = require("ojs/ojcollectiondataprovider");

class Props {
  applications: Array<OAMApplication>;
  filterCallback?: (filter: Element) => void;
  selectedItem?: string;
}

class State {
  originalApplications?: Model.Collection;
  applications?: Model.Collection;
}

/**
 * @ojmetadata pack "vz-console"
 */
@customElement("vz-console-instance-apps")
export class ConsoleInstanceApps extends ElementVComponent<Props, State> {
  state: State = {};
  options = [
    {
      value: Messages.Labels.name().toLowerCase(),
      label: Messages.Labels.name(),
    },
    { value: Messages.Labels.ns().toLowerCase(), label: Messages.Labels.ns() },
    {
      value: Messages.Labels.status().toLowerCase(),
      label: Messages.Labels.status(),
    },
    {
      value: Messages.Labels.cluster().toLowerCase(),
      label: Messages.Labels.cluster(),
    },
    {
      value: Messages.Labels.project().toLowerCase(),
      label: Messages.Labels.project(),
    },
  ];

  optionsDataProvider = new ArrayDataProvider(this.options, {
    keyAttributes: "value",
  });

  dataProvider: ko.Observable = ko.observable();

  defaultSort = "default";

  currentSort = ko.observable(this.defaultSort);

  currentStatusFilter = ko.observable([Status.Any]);

  currentClusterFilter = ko.observable([""]);

  currentProjectFilter = ko.observable([""]);

  constructor() {
    super(new Props());
  }

  compare = (left: Model.Model, right: Model.Model): number => {
    let result = 0;
    const leftApplication = left.attributes as OAMApplication;
    const rightApplication = right.attributes as OAMApplication;
    switch (this.currentSort()) {
      case "default":
      case Messages.Labels.name().toLowerCase(): {
        result = leftApplication.name?.localeCompare(rightApplication.name);
        break;
      }

      case Messages.Labels.ns().toLowerCase(): {
        result = leftApplication.namespace?.localeCompare(
          rightApplication.namespace
        );
        break;
      }

      case Messages.Labels.status().toLowerCase(): {
        result = leftApplication.status?.localeCompare(rightApplication.status);
        break;
      }

      case Messages.Labels.cluster().toLowerCase(): {
        result = leftApplication.cluster.name?.localeCompare(
          rightApplication.cluster.name
        );
        break;
      }

      case Messages.Labels.project().toLowerCase(): {
        result = leftApplication.project?.name?.localeCompare(
          rightApplication.project?.name
        );
        break;
      }

      default: {
        break;
      }
    }
    return result;
  };

  executeSort = (applications: Model.Collection): Model.Collection => {
    if (applications) {
      applications.comparator = this.compare;
      applications.sort();
    }
    return applications;
  };

  executeFilters = (): Model.Collection => {
    let applications = this.state.originalApplications.clone();
    if (applications) {
      let models = applications.models;
      models = models.filter((model) => {
        const application = model.attributes as OAMApplication;
        const statusFilter = this.currentStatusFilter();
        const clusterFilter = this.currentClusterFilter();
        const projectFilter = this.currentProjectFilter();
        if (
          (statusFilter.includes(Status.Any) ||
            statusFilter.includes(application.status)) &&
          (clusterFilter.includes("") ||
            clusterFilter.includes(application.cluster.name)) &&
          (projectFilter.includes("") ||
            (application.project &&
              projectFilter.includes(application.project.name)))
        ) {
          return true;
        }
      });
      applications = new Model.Collection(models);
      if (this.currentSort() !== "default") {
        return this.executeSort(applications);
      }
    }
    return applications;
  };

  protected mounted() {
    const models: Model.Model[] = [];
    for (const application of this.props.applications) {
      models.push(new Model.Model(application));
    }
    this.updateState({
      applications: new Model.Collection(models),
      originalApplications: new Model.Collection(models),
    });
  }

  @listener({ capture: true, passive: true })
  private handleStatusFilterChanged(event: CustomEvent) {
    if (
      event.detail.previousValue.length > 0 &&
      event.detail.value.length === 0
    ) {
      this.currentStatusFilter([Status.Any]);
    } else {
      this.currentStatusFilter(event.detail.value);
    }
    this.updateState({ applications: this.executeFilters() });
  }

  @listener({ capture: true, passive: true })
  private handleClusterFilterChanged(event: CustomEvent) {
    if (
      event.detail.previousValue.length > 0 &&
      event.detail.value.length === 0
    ) {
      this.currentClusterFilter([""]);
    } else {
      this.currentClusterFilter(event.detail.value);
    }
    this.updateState({ applications: this.executeFilters() });
  }

  @listener({ capture: true, passive: true })
  private handleProjectFilterChanged(event: CustomEvent) {
    if (
      event.detail.previousValue.length > 0 &&
      event.detail.value.length === 0
    ) {
      this.currentProjectFilter([""]);
    } else {
      this.currentProjectFilter(event.detail.value);
    }
    this.updateState({ applications: this.executeFilters() });
  }

  @listener({ capture: true, passive: true })
  private handleSortCriteriaChanged(event: CustomEvent) {
    if (event.detail.value) {
      this.currentSort(event.detail.value.toLowerCase());
      this.updateState({
        applications: this.executeSort(this.state.applications),
      });
    }
  }

  protected render() {
    this.dataProvider(
      new PagingDataProviderView(
        new CollectionDataProvider(
          this.state.applications
            ? this.state.applications
            : new Model.Collection([])
        )
      )
    );

    if (this.props.filterCallback) {
      const clusterOptions: Map<
        string,
        { label: string; value: string }
      > = new Map();
      const projectOptions: Map<
        string,
        { label: string; value: string }
      > = new Map();
      if (this.props.applications) {
        this.props.applications.forEach((application) => {
          if (application.cluster) {
            clusterOptions.set(application.cluster.name, {
              label: application.cluster.name,
              value: application.cluster.name,
            });
          }
          if (application.project) {
            projectOptions.set(application.project.name, {
              label: application.project.name,
              value: application.project.name,
            });
          }
        });
      }
      this.props.filterCallback(
        <div key="appfilter">
          <h4 class="reslabel">{Messages.Labels.refineBy()}</h4>
          <ConsoleFilter
            label={Messages.Labels.state()}
            options={[
              { label: Status.Running, value: Status.Running },
              { label: Status.Pending, value: Status.Pending },
              { label: Status.Terminated, value: Status.Terminated },
            ]}
            onValueChanged={this.handleStatusFilterChanged}
          />
          <ConsoleFilter
            label={Messages.Labels.cluster()}
            options={Array.from(clusterOptions.values())}
            onValueChanged={this.handleClusterFilterChanged}
          />
          <ConsoleFilter
            label={Messages.Labels.project()}
            options={Array.from(projectOptions.values())}
            onValueChanged={this.handleProjectFilterChanged}
          />
        </div>
      );
    }
    return (
      <div id="applications" class="oj-flex component-margin">
        <div class="oj-lg-12 oj-md-12 oj-sm-12 oj-flex-item">
          <div class="oj-flex">
            <div class="oj-sm-12 oj-flex-item res">
              <div class="oj-flex card-border">
                <div class="oj-sm-1 oj-flex-item">
                  <oj-label for="sortBy" class="oj-label-inline sortby">
                    {Messages.Labels.sortBy()}
                  </oj-label>
                </div>
                <div class="oj-sm-3 oj-flex-item">
                  <oj-select-single
                    id="sortBy"
                    data={this.optionsDataProvider}
                    value={this.currentSort}
                    onValueChanged={this.handleSortCriteriaChanged}
                    class="oj-complete sortselect"
                    placeholder={Messages.Labels.selectOption()}
                  ></oj-select-single>
                </div>
                <div class="oj-sm-3 oj-flex-item"></div>
                <div class="oj-sm-5 oj-flex-item">
                  <div class="oj-flex">
                    <div class="oj-sm-1 oj-flex-item"></div>
                    <div class="oj-sm-11 oj-flex-item">
                      <oj-paging-control
                        data={this.dataProvider()}
                        pageSize={10}
                        class="oj-complete pagination"
                        pageOptions={{
                          layout: ["nav", "pages", "rangeText"],
                          type: "numbers",
                        }}
                        translations={{
                          fullMsgItemRange: Messages.Pagination.msgItemRange(),
                          fullMsgItem: Messages.Pagination.msgItem(),
                        }}
                      ></oj-paging-control>
                    </div>
                  </div>
                </div>
              </div>

              <oj-list-view
                id="listview"
                aria-label="oam applications"
                data={this.dataProvider()}
                selectionMode="single"
                class="oj-complete"
                item={{ selectable: true }}
              >
                <template
                  slot="itemTemplate"
                  data-oj-as="item"
                  render={this.renderOneApp}
                ></template>
              </oj-list-view>

              <div class="oj-flex card-border">
                <div class="oj-sm-7 oj-flex-item"></div>
                <div class="oj-sm-5 oj-flex-item">
                  <div class="oj-flex">
                    <div class="oj-sm-1 oj-flex-item"></div>
                    <div class="oj-sm-11 oj-flex-item">
                      <oj-paging-control
                        data={this.dataProvider()}
                        pageSize={10}
                        class="oj-complete pagination"
                        pageOptions={{
                          layout: ["nav", "pages", "rangeText"],
                          type: "numbers",
                        }}
                        translations={{
                          fullMsgItemRange: Messages.Pagination.msgItemRange(),
                          fullMsgItem: Messages.Pagination.msgItem(),
                        }}
                      ></oj-paging-control>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  renderOneApp = (item: any) => {
    return (
      <oj-list-item-layout class="oj-complete">
        <div class="oj-flex cardmargin">
          <div class="oj-sm-10 oj-flex-item">
            <div class="carditem">
              <strong>
                <span>{Messages.Labels.name()}:&nbsp;</span>
              </strong>

              <a
                data-bind={`attr: {href: '/oamapps/' + item.data.data.metadata.uid + (item.data.cluster && item.data.cluster.name !== 'local' ? ('?cluster=' + item.data.cluster.name) : '')}`}
                tabindex="0"
              >
                <oj-bind-text value="[[item.data.name]]"></oj-bind-text>
              </a>
            </div>

            <div class="carditem">
              <strong>
                <span>{Messages.Labels.ns()}:&nbsp;</span>
              </strong>
              <span>
                <oj-bind-text value="[[item.data.namespace]]"></oj-bind-text>
              </span>
            </div>

            <div class="carditem">
              <strong>{Messages.Labels.status()}:&nbsp;</strong>
              <span>
                <oj-bind-if test="[[item.data.status === 'Running']]">
                  <span class="oj-icon-circle oj-icon-circle-sm oj-icon-circle-green">
                    <span class="oj-icon-circle-inner status-icon"></span>
                  </span>
                </oj-bind-if>
                <oj-bind-if test="[[item.data.status === 'Terminated']]">
                  <span class="oj-icon-circle oj-icon-circle-sm oj-icon-circle-red">
                    <span class="oj-icon-circle-inner status-icon"></span>
                  </span>
                </oj-bind-if>
                <oj-bind-if test="[[item.data.status === 'Pending']]">
                  <span class="oj-icon-circle oj-icon-circle-sm oj-icon-circle-orange">
                    <span class="oj-icon-circle-inner status-icon"></span>
                  </span>
                </oj-bind-if>
                &nbsp;
                <oj-bind-text value="[[item.data.status]]"></oj-bind-text>
              </span>
            </div>

            <div class="carditem">
              <strong>
                <span>{Messages.Labels.created()}:&nbsp;</span>
              </strong>
              <span>
                <oj-bind-text value="[[item.data.createdOn]]"></oj-bind-text>
              </span>
            </div>
          </div>

          <div class="oj-sm-2 oj-flex-item">
            <div class="carditem">
              <strong>
                <span>{Messages.Labels.cluster()}:&nbsp;</span>
              </strong>
              <span>
                <oj-bind-text value="[[item.data.cluster.name]]"></oj-bind-text>
              </span>
            </div>
            <oj-bind-if test="[[item.data.project]]">
              <div class="carditem">
                <strong>
                  <span>{Messages.Labels.project()}:&nbsp;</span>
                </strong>

                <a
                  data-bind={`attr: {href: '/projects/' + item.data.project.data.metadata.uid }`}
                  tabindex="0"
                >
                  <oj-bind-text value="[[item.data.project.name]]"></oj-bind-text>
                </a>
              </div>
            </oj-bind-if>
          </div>
        </div>
      </oj-list-item-layout>
    );
  };
}
