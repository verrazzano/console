// Copyright (c) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

// eslint-disable-next-line no-unused-vars
import { VComponent, customElement, h } from "ojs/ojvcomponent";
import { Ingress } from "vz-console/service/loader";
import * as ArrayDataProvider from "ojs/ojarraydataprovider";
import "ojs/ojtable";
import * as Messages from "vz-console/utils/Messages";
import * as ko from "knockout";
import "ojs/ojpagingcontrol";
import PagingDataProviderView = require("ojs/ojpagingdataproviderview");

class Props {
  isBindingIngress: boolean;
  ingresses?: [Ingress];
}

/**
 * @ojmetadata pack "vz-console"
 */
@customElement("vz-console-ingress-list")
export class ConsoleIngressList extends VComponent<Props> {
  dataProvider: ko.Observable = ko.observable();

  protected render() {
    this.dataProvider(
      new PagingDataProviderView(
        new ArrayDataProvider(this.props.ingresses, {
          keyAttributes: "name",
          implicitSort: [{ attribute: "name", direction: "ascending" }],
        })
      )
    );

    return (
      <div>
        <oj-table
          data={this.dataProvider()}
          columns={[
            {
              headerText: Messages.Labels.name(),
              sortable: "enabled",
              sortProperty: "name",
            },
            {
              headerText: Messages.Labels.prefix(),
              sortable: "enabled",
              sortProperty: "prefix",
            },
            {
              headerText: Messages.Labels.port(),
              sortable: "enabled",
              sortProperty: "port",
            },
            ...[
              this.props.isBindingIngress
                ? [
                    {
                      headerText: Messages.Labels.dnsName(),
                      sortable: "enabled",
                      sortProperty: "dnsName",
                    },
                  ]
                : [
                    {
                      headerText: Messages.Labels.comp(),
                      sortable: "enabled",
                      sortProperty: "component",
                    },
                  ],
            ],
          ]}
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
                  <oj-bind-text value="[[row.data.prefix]]"></oj-bind-text>
                </p>
              </td>
              <td>
                <p>
                  <oj-bind-text value="[[row.data.port]]"></oj-bind-text>
                </p>
              </td>
              <td>
                <p>
                  <oj-bind-if test="[[row.data.dnsName !== '']]">
                    <oj-bind-text value="[[row.data.dnsName]]"></oj-bind-text>
                  </oj-bind-if>
                  <oj-bind-if test="[[row.data.component !== '']]">
                    <oj-bind-text value="[[row.data.component]]"></oj-bind-text>
                  </oj-bind-if>
                </p>
              </td>
            </tr>
          </template>
        </oj-table>
        <div class="oj-flex pagination">
          <div class="oj-sm-7 oj-flex-item"></div>
          <div class="oj-sm-5 oj-flex-item">
            <div class="oj-flex">
              <div class="oj-sm-2 oj-flex-item"></div>
              <div class="oj-sm-10 oj-flex-item">
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
