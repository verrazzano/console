// Copyright (c) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

// eslint-disable-next-line no-unused-vars
import { VComponent, customElement, listener, h } from "ojs/ojvcomponent";
import { Component, ComponentType } from "vz-console/service/loader";
import * as ArrayDataProvider from "ojs/ojarraydataprovider";
import * as Model from "ojs/ojmodel";
import "ojs/ojtable";
import "ojs/ojlistview";
import "ojs/ojcheckboxset";
import "ojs/ojselectsingle";
import "ojs/ojpagingcontrol";
import "ojs/ojlistitemlayout";
import * as ko from "knockout";
import { ConsoleFilter } from "vz-console/filter/loader";
import * as Messages from "vz-console/utils/Messages";
import PagingDataProviderView = require("ojs/ojpagingdataproviderview");
import CollectionDataProvider = require("ojs/ojcollectiondataprovider");

class Props {
  components: [Component];
  filterCallback?: (filter: Element) => {};
}

class State {
  originalComponents?: Model.Collection;
  components?: Model.Collection;
}

/**
 * @ojmetadata pack "vz-console"
 */
@customElement("vz-console-model-components")
export class ConsoleModelComponents extends VComponent<Props, State> {
  state: State = {};

  options = [
    { value: "name", label: "Name" },
    { value: "type", label: "Type" },
  ];

  optionsDataProvider = new ArrayDataProvider(this.options, {
    keyAttributes: "value",
  });

  dataProvider: ko.Observable = ko.observable();

  defaultSort = "default";

  currentSort = ko.observable(this.defaultSort);

  currentTypeFilter = ko.observable([ComponentType.ANY]);

  compare = (left: Model.Model, right: Model.Model): number => {
    let result = 0;
    const leftComponent = left.attributes as Component;
    const rightComponent = right.attributes as Component;
    switch (this.currentSort()) {
      case "default":
      case "name": {
        result = leftComponent.name?.localeCompare(rightComponent.name);
        break;
      }

      case "type": {
        result = leftComponent.type?.localeCompare(rightComponent.type);
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
        const component = model.attributes as Component;
        const typeFilter = this.currentTypeFilter();
        if (
          typeFilter.includes(ComponentType.ANY) ||
          typeFilter.includes(component.type)
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
    this.props.components
      .filter((component) => {
        return [
          ComponentType.WLS,
          ComponentType.COH,
          ComponentType.MS,
          ComponentType.GEN,
        ].includes(component.type);
      })
      .forEach((component) => {
        models.push(new Model.Model(component));
      });

    this.updateState({
      components: new Model.Collection(models),
      originalComponents: new Model.Collection(models),
    });
  }

  @listener({ capture: true, passive: true })
  private handleTypeFilterChanged(event: CustomEvent) {
    if (
      event.detail.previousValue.length > 0 &&
      event.detail.value.length === 0
    ) {
      this.currentTypeFilter([ComponentType.ANY]);
    } else {
      this.currentTypeFilter(event.detail.value);
    }
    this.updateState({ components: this.executeFilters() });
  }

  @listener({ capture: true, passive: true })
  private handleSortCriteriaChanged(event: CustomEvent) {
    this.currentSort(event.detail.value.toLowerCase());
    this.updateState({ components: this.executeSort(this.state.components) });
  }

  protected render() {
    this.dataProvider(
      new PagingDataProviderView(
        new CollectionDataProvider(
          this.state && this.state.components
            ? this.state.components
            : new Model.Collection([])
        )
      )
    );

    if (this.props.filterCallback) {
      this.props.filterCallback(
        <div>
          <h4 class="reslabel">{Messages.Labels.refineBy()}</h4>
          <ConsoleFilter
            label={Messages.Labels.byType()}
            options={[
              { label: ComponentType.WLS, value: ComponentType.WLS },
              { label: ComponentType.COH, value: ComponentType.COH },
              { label: ComponentType.MS, value: ComponentType.MS },
              { label: ComponentType.GEN, value: ComponentType.GEN },
            ]}
            onValueChanged={this.handleTypeFilterChanged}
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
                ariaLabel="model components"
                data={this.dataProvider()}
                selectionMode="single"
                class="oj-complete"
              >
                <template slot="itemTemplate" data-oj-as="item">
                  <oj-list-item-layout>
                    <div class="oj-flex">
                      <div
                        class="oj-sm-12
                     oj-flex-item"
                      >
                        <strong>
                          <span>{Messages.Labels.name()}:&nbsp;</span>
                        </strong>
                        <span data-bind="attr: { id: item.data.id+'_name' }">
                          <oj-bind-text value="[[item.data.name]]"></oj-bind-text>
                        </span>
                      </div>
                    </div>

                    <div class="oj-flex">
                      <div class="oj-sm-12 oj-flex-item">
                        <strong>
                          <span>{Messages.Labels.type()}:&nbsp;</span>
                        </strong>
                        <span data-bind="attr: { id: item.data.id+'_type' }">
                          <oj-bind-text value="[[item.data.type]]"></oj-bind-text>
                        </span>
                      </div>
                    </div>

                    <div class="oj-flex">
                      <div class="oj-sm-12 oj-flex-item">
                        <oj-bind-if test="[[item.data.images &&  item.data.images.length === 1]]">
                          <strong>
                            <span>{Messages.Labels.image()}:&nbsp;</span>
                          </strong>
                          <span data-bind="attr: { id: item.data.id+'_images' }">
                            <oj-bind-text value="[[item.data.images[0]]]"></oj-bind-text>
                          </span>
                        </oj-bind-if>
                        <oj-bind-if test="[[item.data.images &&  item.data.images.length > 1]]">
                          <strong>
                            <span>{Messages.Labels.images()}:&nbsp;</span>
                          </strong>
                          <ul data-bind="attr: { id: item.data.id+'_images' }">
                            <oj-bind-for-each data="[[item.data.images]]">
                              <template>
                                <li>
                                  <span>
                                    <oj-bind-text value="[[$current.data]]"></oj-bind-text>
                                  </span>
                                </li>
                              </template>
                            </oj-bind-for-each>
                          </ul>
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
