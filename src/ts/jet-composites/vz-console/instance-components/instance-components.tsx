// Copyright (c) 2021, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import {
  ElementVComponent,
  customElement,
  // eslint-disable-next-line no-unused-vars
  h,
  listener,
} from "ojs/ojvcomponent-element";
import { OAMComponent } from "vz-console/service/loader";
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
  components: Array<OAMComponent>;
  filterCallback?: (filter: Element) => void;
  selectedItem?: string;
}

class State {
  originalComponents?: Model.Collection;
  components?: Model.Collection;
}

/**
 * @ojmetadata pack "vz-console"
 */
@customElement("vz-console-instance-components")
export class ConsoleInstanceComponents extends ElementVComponent<Props, State> {
  state: State = {};
  options = [
    {
      value: Messages.Labels.name().toLowerCase(),
      label: Messages.Labels.name(),
    },
    { value: Messages.Labels.ns().toLowerCase(), label: Messages.Labels.ns() },
    {
      value: Messages.Labels.workloadType().toLowerCase(),
      label: Messages.Labels.workloadType(),
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

  currentClusterFilter = ko.observable([""]);

  currentProjectFilter = ko.observable([""]);

  constructor() {
    super(new Props());
  }

  compare = (left: Model.Model, right: Model.Model): number => {
    let result = 0;
    const leftComponent = left.attributes as OAMComponent;
    const rightComponent = right.attributes as OAMComponent;
    switch (this.currentSort()) {
      case "default":
      case Messages.Labels.name().toLowerCase(): {
        result = leftComponent.name?.localeCompare(rightComponent.name);
        break;
      }

      case Messages.Labels.ns().toLowerCase(): {
        result = leftComponent.namespace?.localeCompare(
          rightComponent.namespace
        );
        break;
      }

      case Messages.Labels.cluster().toLowerCase(): {
        result = leftComponent.cluster.name?.localeCompare(
          rightComponent.cluster.name
        );
        break;
      }

      case Messages.Labels.workloadType().toLowerCase(): {
        result = leftComponent.workloadType?.localeCompare(
          rightComponent.workloadType
        );
        break;
      }

      case Messages.Labels.project().toLowerCase(): {
        result = leftComponent.project?.name?.localeCompare(
          rightComponent.project?.name
        );
        break;
      }

      default: {
        break;
      }
    }
    return result;
  };

  executeSort = (components: Model.Collection): Model.Collection => {
    if (components) {
      components.comparator = this.compare;
      components.sort();
    }
    return components;
  };

  executeFilters = (): Model.Collection => {
    let components = this.state.originalComponents.clone();
    if (components) {
      let models = components.models;
      models = models.filter((model) => {
        const component = model.attributes as OAMComponent;
        const clusterFilter = this.currentClusterFilter();
        const projectFilter = this.currentProjectFilter();
        if (
          (clusterFilter.includes("") ||
            clusterFilter.includes(component.cluster.name)) &&
          (projectFilter.includes("") ||
            (component.project &&
              projectFilter.includes(component.project.name)))
        ) {
          return true;
        }
      });
      components = new Model.Collection(models);
      if (this.currentSort() !== "default") {
        return this.executeSort(components);
      }
    }
    return components;
  };

  protected mounted() {
    const models: Model.Model[] = [];
    for (const component of this.props.components) {
      models.push(new Model.Model(component));
    }
    this.updateState({
      components: new Model.Collection(models),
      originalComponents: new Model.Collection(models),
    });
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
    this.updateState({ components: this.executeFilters() });
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
    this.updateState({ components: this.executeFilters() });
  }

  @listener({ capture: true, passive: true })
  private handleSortCriteriaChanged(event: CustomEvent) {
    if (event.detail.value) {
      this.currentSort(event.detail.value.toLowerCase());
      this.updateState({ components: this.executeSort(this.state.components) });
    }
  }

  protected render() {
    this.dataProvider(
      new PagingDataProviderView(
        new CollectionDataProvider(
          this.state.components
            ? this.state.components
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
      if (this.props.components) {
        this.props.components.forEach((component) => {
          if (component.cluster) {
            clusterOptions.set(component.cluster.name, {
              label: component.cluster.name,
              value: component.cluster.name,
            });
          }

          if (component.project) {
            projectOptions.set(component.project.name, {
              label: component.project.name,
              value: component.project.name,
            });
          }
        });
      }
      this.props.filterCallback(
        <div key="compfilter">
          <h4 class="reslabel">{Messages.Labels.refineBy()}</h4>
          <ConsoleFilter
            label={Messages.Labels.clusters()}
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
      <div id="components" class="oj-flex component-margin">
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
                ariaLabel="oam components"
                data={this.dataProvider()}
                selectionMode="single"
                class="oj-complete"
                item={{ selectable: true }}
              >
                <template slot="itemTemplate" data-oj-as="item">
                  <oj-list-item-layout class="oj-complete">
                    <div class="oj-flex cardmargin">
                      <div class="oj-sm-10 oj-flex-item">
                        <div class="carditem">
                          <strong>
                            <span>{Messages.Labels.name()}:&nbsp;</span>
                          </strong>
                          <a
                            data-bind={`attr: {href: '/oamcomps/' + item.data.data.metadata.uid + (item.data.cluster && item.data.cluster.name !== 'local' ? ('?cluster=' + item.data.cluster.name) : '')}`}
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
                          <strong>
                            <span>{Messages.Labels.created()}:&nbsp;</span>
                          </strong>
                          <span>
                            <oj-bind-text value="[[item.data.createdOn]]"></oj-bind-text>
                          </span>
                        </div>
                        <div class="carditem">
                          <strong>
                            <span>{Messages.Labels.workloadType()}:&nbsp;</span>
                          </strong>
                          <span>
                            <oj-bind-text value="[[item.data.workloadType]]"></oj-bind-text>
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
                            >
                              <oj-bind-text value="[[item.data.project.name]]"></oj-bind-text>
                            </a>
                          </div>
                        </oj-bind-if>
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
