// Copyright (c) 2021, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

// eslint-disable-next-line no-unused-vars
import { VComponent, customElement, h } from "ojs/ojvcomponent";
import { OAMComponentParam } from "vz-console/service/loader";
import * as ArrayDataProvider from "ojs/ojarraydataprovider";
import "ojs/ojtable";
import * as Messages from "vz-console/utils/Messages";
import * as ko from "knockout";
import "ojs/ojpagingcontrol";
import PagingDataProviderView = require("ojs/ojpagingdataproviderview");

class Props {
  params?: [OAMComponentParam];
}

/**
 * @ojmetadata pack "vz-console"
 */
@customElement("vz-console-oamcomp-params-list")
export class ConsoleOAMCompParamsList extends VComponent<Props> {
  columnArray = [
    {
      headerText: Messages.Labels.name(),
      sortable: "enabled",
      sortProperty: "name",
    },
    {
      headerText: Messages.Labels.desc(),
      sortable: "enabled",
      sortProperty: "description",
    },
    {
      headerText: Messages.Labels.required(),
      sortable: "enabled",
      sortProperty: "required",
    },
  ];

  dataProvider: ko.Observable = ko.observable();

  protected render() {
    this.dataProvider(
      new PagingDataProviderView(
        new ArrayDataProvider(this.props.params ? this.props.params : [], {
          keyAttributes: "name",
          implicitSort: [{ attribute: "name", direction: "ascending" }],
        })
      )
    );
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
                  <oj-bind-text value="[[row.data.name]]"></oj-bind-text>
                </p>
              </td>
              <td>
                <p>
                  <oj-bind-text value="[[row.data.description]]"></oj-bind-text>
                </p>
              </td>
              <td>
                <p>
                  <oj-bind-text value="[[row.data.required]]"></oj-bind-text>
                </p>
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
