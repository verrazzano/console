// Copyright (c) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { VComponent, customElement, h } from "ojs/ojvcomponent";
import { Connection } from "vz-console/service/loader";
import * as ArrayDataProvider from "ojs/ojarraydataprovider";
import "ojs/ojtable";
import * as Messages from "vz-console/utils/Messages"
import PagingDataProviderView = require("ojs/ojpagingdataproviderview");
import * as ko from "knockout";
import "ojs/ojpagingcontrol";

class Props {
  connections?: [Connection];
}

/**
 * @ojmetadata pack "vz-console"
 */
@customElement("vz-console-connection-list")
export class ConsoleConnectionList extends VComponent<Props> {
  columnArray = [
    { headerText: Messages.Labels.name(), sortable: "enabled", sortProperty: "name" },
    { headerText: Messages.Labels.type(), sortable: "enabled", sortProperty: "type" },
    { headerText: Messages.Labels.comp(), sortable: "enabled", sortProperty: "component" },
    { headerText: Messages.Labels.target(), sortable: "enabled", sortProperty: "target" },
  ];

  dataProvider: ko.Observable = ko.observable();

  protected render() {
    this.dataProvider(new PagingDataProviderView(
      new ArrayDataProvider<string,Connection>(
        this.props.connections,
        {
          keyAttributes: "name",
          implicitSort: [{ attribute: "name", direction: "ascending" }],
        }
      )
    ))
    return (
      <div>
      <oj-table
        data={this.dataProvider()}
        columns={this.columnArray}
        aria-labelledby="resources"
        class="oj-table oj-table-container oj-component oj-table-horizontal-grid oj-complete"
        style={{ width: "100%" }}
        display='grid'
        verticalGridVisible='disabled'
      >
        <template slot="rowTemplate" data-oj-as="row">
          <tr>
            <td>
              <p>
                <oj-bind-text value="[[row.data.name]]"></oj-bind-text>
              </p>
            </td>
            <td>
              <p>
                <oj-bind-text value="[[row.data.type]]"></oj-bind-text>
              </p>
            </td>
            <td>
              <p>
                <oj-bind-text value="[[row.data.component]]"></oj-bind-text>
              </p>
            </td>
            <td>
              <p>
                <oj-bind-text value="[[row.data.target]]"></oj-bind-text>
              </p>
            </td>
          </tr>
        </template>
      </oj-table>
      <div class="oj-flex pagination">
          <div class="oj-sm-7 oj-flex-item"></div>
          <div class="oj-sm-5 oj-flex-item">
            <div class="oj-flex">
              <div class="oj-sm-1 oj-flex-item"></div>
              <div class="oj-sm-11 oj-flex-item">
                <oj-paging-control
                  data={this.dataProvider()}
                  pageSize={4}
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
