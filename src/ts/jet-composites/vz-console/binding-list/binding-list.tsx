// Copyright (c) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

// eslint-disable-next-line no-unused-vars
import { VComponent, customElement, h } from "ojs/ojvcomponent";
import { Binding } from "vz-console/service/loader";
import * as ArrayDataProvider from "ojs/ojarraydataprovider";
import "ojs/ojtable";
import * as Messages from "vz-console/utils/Messages";
import * as ko from "knockout";
import "ojs/ojpagingcontrol";
import PagingDataProviderView = require("ojs/ojpagingdataproviderview");

class Props {
  bindings?: [Binding];
  isModelDetailsPage?: string;
}

/**
 * @ojmetadata pack "vz-console"
 */
@customElement("vz-console-binding-list")
export class ConsoleBindingList extends VComponent<Props> {
  dataProvider: ko.Observable = ko.observable();

  protected render() {
    const columnArray = [
      {
        headerText: Messages.Labels.name(),
        sortable: "enabled",
        sortProperty: "name",
      },
      {
        headerText: Messages.Labels.state(),
        sortable: "enabled",
        sortProperty: "state",
      },
    ];
    if (!this.props.isModelDetailsPage) {
      columnArray.push({
        headerText: Messages.Labels.model(),
        sortable: "enabled",
        sortProperty: "model.name",
      });
    }
    this.dataProvider(
      new PagingDataProviderView(
        new ArrayDataProvider(
          this.props.bindings
            ? this.props.bindings.map((binding) => {
                const bindingData = {
                  id: binding.id,
                  name: binding.name,
                  state: binding.state,
                  model: {},
                };
                if (!this.props.isModelDetailsPage) {
                  bindingData.model = binding.model;
                }
                return bindingData;
              })
            : [],
          {
            keyAttributes: "name",
            implicitSort: [{ attribute: "name", direction: "ascending" }],
          }
        )
      )
    );
    return (
      <div>
        <oj-table
          data={this.dataProvider()}
          columns={columnArray}
          aria-labelledby="resources"
          class="oj-table oj-table-container oj-component oj-table-horizontal-grid oj-complete"
          style={{ width: "100%" }}
          display="grid"
          verticalGridVisible="disabled"
        >
          <template slot="rowTemplate" data-oj-as="row">
            <tr>
              <td>
                <p>
                  <a data-bind={`attr: {href: '/bindings/' + row.data.id}`}>
                    <oj-bind-text value="[[row.data.name]]"></oj-bind-text>
                  </a>
                </p>
              </td>
              <td>
                <p>
                  <oj-bind-if test="[[row.data.state === 'Running']]">
                    <span>
                      <span class="oj-icon-circle oj-icon-circle-xxs oj-icon-circle-green">
                        <span class="oj-icon-circle-inner status-icon"></span>
                      </span>
                      &nbsp;
                    </span>
                  </oj-bind-if>
                  <oj-bind-if test="[[row.data.state === 'Terminated']]">
                    <span>
                      <span
                        id="status"
                        class="oj-icon-circle oj-icon-circle-xxs oj-icon-circle-red"
                      >
                        <span class="oj-icon-circle-inner status-icon"></span>
                      </span>
                      &nbsp;
                    </span>
                  </oj-bind-if>
                  <oj-bind-if test="[[row.data.state === 'Creating']]">
                    <span>
                      <span
                        id="status"
                        class="oj-icon-circle oj-icon-circle-xxs oj-icon-circle-orange"
                      >
                        <span class="oj-icon-circle-inner status-icon"></span>
                      </span>
                      &nbsp;
                    </span>
                  </oj-bind-if>
                  <oj-bind-text value="[[row.data.state]]"></oj-bind-text>
                </p>
              </td>
              <oj-bind-if test="[[row.data.model.id]]">
                <td>
                  <p>
                    <a data-bind="attr: {href: '/models/' + row.data.model.id}">
                      <oj-bind-text value="[[row.data.model.name]]"></oj-bind-text>
                    </a>
                  </p>
                </td>
              </oj-bind-if>
            </tr>
          </template>
        </oj-table>
        <div class="oj-flex pagination">
          <div class="oj-sm-8 oj-flex-item"></div>
          <div class="oj-sm-4 oj-flex-item">
            <div class="oj-flex">
              <div class="oj-sm-12 oj-flex-item">
                <oj-paging-control
                  data={this.dataProvider()}
                  pageSize={10}
                  class="oj-complete"
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
    );
  }
}
