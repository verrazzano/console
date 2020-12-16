// Copyright (c) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

// eslint-disable-next-line no-unused-vars
import { VComponent, customElement, h, listener } from "ojs/ojvcomponent";
import { OAMComponentInstance, Status } from "vz-console/service/loader";
import * as ArrayDataProvider from "ojs/ojarraydataprovider";
import * as Model from "ojs/ojmodel";
import "ojs/ojtable";
import "ojs/ojlistview";
import "ojs/ojselectsingle";
import "ojs/ojpagingcontrol";
import "ojs/ojlistitemlayout";
import * as ko from "knockout";
import { ConsoleFilter } from "vz-console/filter/loader";
import * as Messages from "vz-console/utils/Messages";
import { KeySetImpl } from "ojs/ojkeyset";
import PagingDataProviderView = require("ojs/ojpagingdataproviderview");
import CollectionDataProvider = require("ojs/ojcollectiondataprovider");

class Props {
  components: [OAMComponentInstance];
  filterCallback?: (filter: Element) => {};
  selectedComponent?: string;
  linkSelectionCallback?: (
    selectedItem: string,
    selectedComponent: string
  ) => {};
}

class State {
  originalComponents?: Model.Collection;
  components?: Model.Collection;
}

/**
 * @ojmetadata pack "vz-console"
 */
@customElement("vz-console-oamapp-components")
export class ConsoleOamApplicationComponents extends VComponent<Props, State> {
  state: State = {};
  options = [
    { value: "name", label: "Name" },
    { value: "status", label: "Status" },
  ];

  optionsDataProvider = new ArrayDataProvider(this.options, {
    keyAttributes: "value",
  });

  dataProvider: ko.Observable = ko.observable();

  defaultSort = "default";

  currentSort = ko.observable(this.defaultSort);

  currentStatusFilter = ko.observable([Status.Any]);

  links = {
    traits: Messages.Labels.traits(),
    scopes: Messages.Labels.scopes(),
    params: Messages.Labels.params(),
  };

  compare = (left: Model.Model, right: Model.Model): number => {
    let result = 0;
    const leftComponent = left.attributes as OAMComponentInstance;
    const rightComponent = right.attributes as OAMComponentInstance;
    switch (this.currentSort()) {
      case "default":
      case "name": {
        result = leftComponent.name?.localeCompare(rightComponent.name);
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
        const component = model.attributes as OAMComponentInstance;
        const statusFilter = this.currentStatusFilter();
        if (
          statusFilter.includes(Status.Any) ||
          statusFilter.includes(component.status)
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
    this.props.components.forEach((component) => {
      component.eventHandler = this.props.linkSelectionCallback;
      models.push(new Model.Model(component));
    });

    this.updateState({
      components: new Model.Collection(models),
      originalComponents: new Model.Collection(models),
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
          this.state.components
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
                ariaLabel="oam application components"
                data={this.dataProvider()}
                selectionMode="single"
                class="oj-complete"
                selected={
                  this.props.selectedComponent
                    ? new KeySetImpl([this.props.selectedComponent])
                    : new KeySetImpl()
                }
              >
                <template slot="itemTemplate" data-oj-as="item">
                  <oj-list-item-layout>
                    <div class="oj-flex">
                      <div class="oj-sm-10 oj-flex-item">
                        <strong>
                          <span>{Messages.Labels.name()}:&nbsp;</span>
                        </strong>
                        <span data-bind="attr: { id: item.data.id+'_name' }">
                          <oj-bind-text value="[[item.data.name]]"></oj-bind-text>
                        </span>
                      </div>
                      <div class="oj-sm-2 oj-flex-item">
                        <a data-bind="event: { click: () => {item.data.eventHandler('traits', item.data.id)} }">
                          {this.links.traits}
                        </a>
                      </div>
                    </div>
                    <div class="oj-flex">
                      <div class="oj-sm-10 oj-flex-item compstatus">
                        <strong>{Messages.Labels.status()}:&nbsp;</strong>
                        <span data-bind="attr: { id: item.data.id+'_status' }">
                          <oj-bind-if test="[[item.data.status === 'Running']]">
                            <span class="oj-icon-circle oj-icon-circle-xxs oj-icon-circle-green">
                              <span class="oj-icon-circle-inner status-icon"></span>
                            </span>
                          </oj-bind-if>
                          <oj-bind-if test="[[item.data.status === 'Terminated']]">
                            <span class="oj-icon-circle oj-icon-circle-xxs oj-icon-circle-red">
                              <span class="oj-icon-circle-inner status-icon"></span>
                            </span>
                          </oj-bind-if>
                          <oj-bind-if test="[[item.data.status === 'Creating']]">
                            <span class="oj-icon-circle oj-icon-circle-xxs oj-icon-circle-orange">
                              <span class="oj-icon-circle-inner status-icon"></span>
                            </span>
                          </oj-bind-if>
                          &nbsp;
                          <oj-bind-text value="[[item.data.status]]"></oj-bind-text>
                        </span>
                      </div>
                      <div class="oj-sm-2 oj-flex-item">
                        <a data-bind="event: { click: () => {item.data.eventHandler('scopes', item.data.id)} }">
                          {this.links.scopes}
                        </a>
                      </div>
                    </div>
                    <div class="oj-flex">
                      <div class="oj-sm-10 oj-flex-item">
                        <strong>
                          <span>{Messages.Labels.created()}:&nbsp;</span>
                        </strong>
                        <span data-bind="attr: { id: item.data.id+'_created' }">
                          <oj-bind-text value="[[item.data.creationDate]]"></oj-bind-text>
                        </span>
                      </div>
                      <div class="oj-sm-2 oj-flex-item">
                        <a data-bind="event: { click: () => {item.data.eventHandler('params', item.data.id)} }">
                          {this.links.params}
                        </a>
                      </div>
                    </div>
                    <div class="oj-flex">
                      <div class="oj-sm-12 oj-flex-item">
                        <strong>
                          <span>{Messages.Labels.oamCompRef()}:&nbsp;</span>
                        </strong>
                        <a
                          data-bind={`attr: {href: '/oamcomps/' + item.data.oamComponent.data.metadata.uid}`}
                        >
                          <oj-bind-text value="[[item.data.oamComponent.data.metadata.name]]"></oj-bind-text>
                        </a>
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
