// Copyright (c) 2021, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

// eslint-disable-next-line no-unused-vars
import { VComponent, customElement, h, listener } from "ojs/ojvcomponent";
import { Cluster } from "vz-console/service/loader";
import * as ArrayDataProvider from "ojs/ojarraydataprovider";
import * as Model from "ojs/ojmodel";
import "ojs/ojtable";
import * as Messages from "vz-console/utils/Messages";
import * as ko from "knockout";
import "ojs/ojpagingcontrol";
import PagingDataProviderView = require("ojs/ojpagingdataproviderview");

class Props {
  clusters?: [Cluster];
}

/**
 * @ojmetadata pack "vz-console"
 */
@customElement("vz-console-clusters-list")
export class ConsoleClustersList extends VComponent<Props> {
  columnArray = [
    {
      headerText: Messages.Labels.name(),
      sortable: "enabled",
      sortProperty: "name",
    },
    {
      headerText: Messages.Labels.ns(),
      sortable: "enabled",
      sortProperty: "namespace",
    },
    {
      headerText: Messages.Labels.desc(),
      sortable: "enabled",
      sortProperty: "status",
    },
    {
      headerText: Messages.Labels.created(),
      sortable: "enabled",
      sortProperty: "createdOn",
    },
  ];

  dataProvider: ko.Observable = ko.observable();

  defaultSort = "default";

  currentSort = ko.observable(this.defaultSort);

  options = [
    {
      value: Messages.Labels.name().toLowerCase(),
      label: Messages.Labels.name(),
    },
    { value: Messages.Labels.ns().toLowerCase(), label: Messages.Labels.ns() },
  ];

  optionsDataProvider = new ArrayDataProvider(this.options, {
    keyAttributes: "value",
  });

  compare = (left: Model.Model, right: Model.Model): number => {
    let result = 0;
    const leftApplication = left.attributes as Cluster;
    const rightApplication = right.attributes as Cluster;
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

      default: {
        break;
      }
    }
    return result;
  };

  executeSort = (clusters: Model.Collection): Model.Collection => {
    if (clusters) {
      clusters.comparator = this.compare;
      clusters.sort();
    }
    return clusters;
  };

  @listener({ capture: true, passive: true })
  private handleSortCriteriaChanged(event: CustomEvent) {
    this.currentSort(event.detail.value.toLowerCase());
    this.updateState({
      clusters: this.executeSort(this.state.clusters),
    });
  }

  protected render() {
    this.dataProvider(
      new PagingDataProviderView(
        new ArrayDataProvider(this.props.clusters ? this.props.clusters : [], {
          keyAttributes: "name",
          implicitSort: [{ attribute: "data.name", direction: "ascending" }],
        })
      )
    );
    return (
      <div id="clusters" class="oj-flex component-margin">
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
                ariaLabel="clusters"
                data={this.dataProvider()}
                selectionMode="single"
                class="oj-complete"
              >
                <template slot="itemTemplate" data-oj-as="item">
                  <oj-list-item-layout class="oj-complete">
                    <div class="oj-flex cardmargin">
                      <div class="oj-sm-10 oj-flex-item">
                        <div class="carditem">
                          <strong>
                            <span>{Messages.Labels.name()}:&nbsp;</span>
                          </strong>
                          <oj-bind-text value="[[item.data.name]]"></oj-bind-text>
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
                          <strong>
                            <span>{Messages.Labels.created()}:&nbsp;</span>
                          </strong>
                          <span>
                            <oj-bind-text value="[[item.data.createdOn]]"></oj-bind-text>
                          </span>
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
