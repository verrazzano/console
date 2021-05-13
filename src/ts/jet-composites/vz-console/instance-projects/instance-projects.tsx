// Copyright (c) 2021, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

// eslint-disable-next-line no-unused-vars
import {
  ElementVComponent,
  customElement,
  h,
  listener,
} from "ojs/ojvcomponent-element";
import { Project } from "vz-console/service/loader";
import * as ArrayDataProvider from "ojs/ojarraydataprovider";
import * as Model from "ojs/ojmodel";
import "ojs/ojtable";
import "ojs/ojselectsingle";
import "ojs/ojpagingcontrol";
import * as ko from "knockout";
import * as Messages from "vz-console/utils/Messages";
import PagingDataProviderView = require("ojs/ojpagingdataproviderview");
import CollectionDataProvider = require("ojs/ojcollectiondataprovider");

class Props {
  projects: Array<Project>;
  filterCallback?: (filter: Element) => void;
  selectedItem?: string;
}

class State {
  originalProjects?: Model.Collection;
  projects?: Model.Collection;
}

/**
 * @ojmetadata pack "vz-console"
 */
@customElement("vz-console-instance-projects")
export class ConsoleInstanceProjects extends ElementVComponent<Props, State> {
  state: State = {};
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

  dataProvider: ko.Observable = ko.observable();

  defaultSort = "default";

  currentSort = ko.observable(this.defaultSort);

  constructor() {
    super(new Props());
  }

  compare = (left: Model.Model, right: Model.Model): number => {
    let result = 0;
    const leftProject = left.attributes as Project;
    const rightProject = right.attributes as Project;
    switch (this.currentSort()) {
      case "default":
      case Messages.Labels.name().toLowerCase(): {
        result = leftProject.name?.localeCompare(rightProject.name);
        break;
      }

      case Messages.Labels.ns().toLowerCase(): {
        result = leftProject.namespace?.localeCompare(rightProject.namespace);
        break;
      }

      default: {
        break;
      }
    }
    return result;
  };

  executeSort = (projects: Model.Collection): Model.Collection => {
    if (projects) {
      projects.comparator = this.compare;
      projects.sort();
    }
    return projects;
  };

  protected mounted() {
    const models: Model.Model[] = [];
    for (const project of this.props.projects) {
      models.push(new Model.Model(project));
    }
    this.updateState({
      projects: new Model.Collection(models),
      originalProjects: new Model.Collection(models),
    });
  }

  @listener({ capture: true, passive: true })
  private handleSortCriteriaChanged(event: CustomEvent) {
    this.currentSort(event.detail.value.toLowerCase());
    this.updateState({
      projects: this.executeSort(this.state.projects),
    });
  }

  protected render() {
    this.props.filterCallback(null);
    this.dataProvider(
      new PagingDataProviderView(
        new CollectionDataProvider(
          this.state.projects ? this.state.projects : new Model.Collection([])
        )
      )
    );

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
                ariaLabel="projects"
                data={this.dataProvider()}
                selectionMode="single"
                class="oj-complete"
                item={{ selectable: true }}
              >
                <template slot="itemTemplate" data-oj-as="item">
                  <oj-list-item-layout class="oj-complete">
                    <div class="oj-flex cardmargin">
                      <div class="oj-sm-12 oj-flex-item">
                        <div class="carditem">
                          <strong>
                            <span>{Messages.Labels.name()}:&nbsp;</span>
                          </strong>

                          <a
                            data-bind={`attr: {href: '/projects/' + item.data.data.metadata.uid}`}
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
