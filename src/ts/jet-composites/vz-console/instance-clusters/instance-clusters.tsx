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
import CollectionDataProvider = require("ojs/ojcollectiondataprovider");
class Props {
  clusters?: [Cluster];
  filterCallback?: (filter: Element) => {};
}

class State {
  clusters?: Model.Collection;
}

/**
 * @ojmetadata pack "vz-console"
 */
@customElement("vz-console-instance-clusters")
export class ConsoleInstanceClusters extends VComponent<Props, State> {
  state: State = {};

  dataProvider: ko.Observable = ko.observable();

  defaultSort = "default";

  currentSort = ko.observable(this.defaultSort);

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
  ];

  optionsDataProvider = new ArrayDataProvider(this.options, {
    keyAttributes: "value",
  });

  compare = (left: Model.Model, right: Model.Model): number => {
    let result = 0;
    const leftCluster = left.attributes as Cluster;
    const rightCluster = right.attributes as Cluster;
    switch (this.currentSort()) {
      case "default":
      case Messages.Labels.name().toLowerCase(): {
        result = leftCluster.name?.localeCompare(rightCluster.name);
        break;
      }

      case Messages.Labels.ns().toLowerCase(): {
        result = leftCluster.namespace?.localeCompare(rightCluster.namespace);
        break;
      }

      case Messages.Labels.status().toLowerCase(): {
        result = leftCluster.status?.localeCompare(rightCluster.status);
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

  protected mounted() {
    const models: Model.Model[] = [];
    for (const cluster of this.props.clusters) {
      models.push(new Model.Model(cluster));
    }
    this.updateState({
      clusters: new Model.Collection(models),
    });
  }

  protected render() {
    this.props.filterCallback(null);

    this.dataProvider(
      new PagingDataProviderView(
        new CollectionDataProvider(
          this.state.clusters ? this.state.clusters : new Model.Collection([])
        )
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
                item={{ focusable: false }}
              >
                <template slot="itemTemplate" data-oj-as="item">
                  <oj-list-item-layout class="oj-complete">
                    <div class="oj-flex cardmargin">
                      <div class="oj-sm-12 oj-flex-item">
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
                            <span>{Messages.Labels.apiUrl()}:&nbsp;</span>
                          </strong>
                          <span>
                            <oj-bind-text value="[[item.data.apiUrl]]"></oj-bind-text>
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
