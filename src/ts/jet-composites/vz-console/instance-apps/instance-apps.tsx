// Copyright (c) 2021, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

// eslint-disable-next-line no-unused-vars
import { VComponent, customElement, h, listener } from "ojs/ojvcomponent";
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
  applications: [OAMApplication];
  filterCallback?: (filter: Element) => {};
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
export class ConsoleInstanceApps extends VComponent<Props, State> {
  state: State = {};
  options = [
    { value: "name", label: "Name" },
    { value: "namespace", label: "Namespace" },
    { value: "status", label: "Status" },
  ];

  optionsDataProvider = new ArrayDataProvider(this.options, {
    keyAttributes: "value",
  });

  dataProvider: ko.Observable = ko.observable();

  defaultSort = "default";

  currentSort = ko.observable(this.defaultSort);

  currentStatusFilter = ko.observable([Status.Any]);

  constructor() {
    super(new Props());
  }

  compare = (left: Model.Model, right: Model.Model): number => {
    let result = 0;
    const leftComponent = left.attributes as OAMApplication;
    const rightComponent = right.attributes as OAMApplication;
    switch (this.currentSort()) {
      case "default":
      case "name": {
        result = leftComponent.name?.localeCompare(rightComponent.name);
        break;
      }

      case "namespace": {
        result = leftComponent.namespace?.localeCompare(rightComponent.namespace);
        break;
      }

      case "status": {
        result = leftComponent.status?.localeCompare(rightComponent.status);
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
        if (
          statusFilter.includes(Status.Any) ||
          statusFilter.includes(application.status)
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
  private handleSortCriteriaChanged(event: CustomEvent) {
    this.currentSort(event.detail.value.toLowerCase());
    this.updateState({ applications: this.executeSort(this.state.applications) });
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
      this.props.filterCallback(
        <div>
          <h4 class="reslabel">{Messages.Labels.refineBy()}</h4>
          <ConsoleFilter
            label={Messages.Labels.state()}
            options={[
              { label: Status.Running, value: Status.Running },
              { label: Status.Creating, value: Status.Creating },
              { label: Status.Terminated, value: Status.Terminated },
            ]}
            onValueChanged={this.handleStatusFilterChanged}
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
        ariaLabel="oam applicationa"
        data={this.dataProvider()}
        selectionMode="single"
        class="oj-complete"
      >
        <template slot="itemTemplate" data-oj-as="item">
          <oj-list-item-layout class="oj-complete">
          <div class="oj-flex">
              <div class="oj-sm-10 oj-flex-item">

              <div class="oj-flex">
              <div class="oj-sm-12 oj-flex-item">
                <strong>
                  <span>{Messages.Labels.name()}:&nbsp;</span>
                </strong>
                <span>
                  <oj-bind-text value="[[item.data.name]]"></oj-bind-text>
                </span>
              </div>
              </div>

              <div class="oj-flex">
              <div class="oj-sm-12 oj-flex-item">
                <strong>
                  <span>{Messages.Labels.ns()}:&nbsp;</span>
                </strong>
                <span>
                  <oj-bind-text value="[[item.data.namespace]]"></oj-bind-text>
                </span>
              </div>
            </div>


            <div class="oj-flex">
              <div class="oj-sm-12 oj-flex-item compstatus">
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
                  <oj-bind-if test="[[item.data.status === 'Creating']]">
                    <span class="oj-icon-circle oj-icon-circle-sm oj-icon-circle-orange">
                      <span class="oj-icon-circle-inner status-icon"></span>
                    </span>
                  </oj-bind-if>
                  &nbsp;
                  <oj-bind-text value="[[item.data.status]]"></oj-bind-text>
                </span>
              </div>
            </div>

            <div class="oj-flex">
              <div class="oj-sm-12 oj-flex-item">
                <strong>
                  <span>{Messages.Labels.created()}:&nbsp;</span>
                </strong>
                <span>
                  <oj-bind-text value="[[item.data.createdOn]]"></oj-bind-text>
                </span>
              </div>
            </div>


                </div>
                <div class="oj-sm-2 oj-flex-item">
              <div class="oj-flex">
              <div class="oj-sm-12 oj-flex-item">
                <ul class="liststyle">
                  <li>
                  <strong>
                  <span>{Messages.Labels.clusters()}</span>

                </strong>
                  </li>
                  <oj-bind-for-each data="[[item.data.clusters]]">
  <template>
  <li>
   <oj-bind-text value="[[$current.data.name]]"></oj-bind-text>
   </li>
  </template>

</oj-bind-for-each>

                </ul>
              
                </div>
                </div>
               

              </div>

                </div>
  
      

 
          
     


          </oj-list-item-layout>
        </template>
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
}