// Copyright (c) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { VComponent, customElement, h } from "ojs/ojvcomponent";
import { Model} from "vz-console/service/loader";
import * as ArrayDataProvider from "ojs/ojarraydataprovider";
import "ojs/ojtable";
import * as Messages from "vz-console/utils/Messages"
import PagingDataProviderView = require("ojs/ojpagingdataproviderview");
import * as ko from "knockout";
import "ojs/ojpagingcontrol";

class Props {
  models?: [Model];
}

/**
 * @ojmetadata pack "vz-console"
 */
@customElement("vz-console-model-list")
export class ConsoleModelList extends VComponent<Props> {
  columnArray = [
    { headerText: Messages.Labels.name(), sortable: "enabled", sortProperty: 'name' },
    { headerText: Messages.Labels.bindings(), sortable: 'disabled' }
  ];

  dataProvider: ko.Observable = ko.observable();

  protected render() {
    this.dataProvider(new PagingDataProviderView(
      new ArrayDataProvider(this.props.models, {
        keyAttributes: "name",
        implicitSort: [{ attribute: "name", direction: "ascending" }],
      })
    ))
    return (
      <div>
        <oj-table
          data={this.dataProvider()}
          columns={this.columnArray}
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
                  <a data-bind={`attr: {href: '/models/' + row.data.id}`}>
                    <oj-bind-text value="[[row.data.name]]"></oj-bind-text>
                  </a>
                </p>
              </td>
              <td>
                <oj-bind-for-each data="[[row.data.bindings || []]]">
                  <template>
                    <p>
                      <a data-bind="attr: {href: '/bindings/' + $current.data.id}">
                        <oj-bind-text value="[[$current.data.name]]"></oj-bind-text>
                      </a>
                    </p>
                  </template>
                </oj-bind-for-each>
              </td>
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
                    fullMsgItem: Messages.Pagination.msgItem()
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
