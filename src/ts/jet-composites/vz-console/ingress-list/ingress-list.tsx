// Copyright (c) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { VComponent, customElement, h } from "ojs/ojvcomponent";
import { Ingress } from "vz-console/service/loader";
import * as ArrayDataProvider from "ojs/ojarraydataprovider";
import "ojs/ojtable";
import * as Messages from "vz-console/utils/Messages"

class Props {
  isBindingIngress: boolean;
  ingresses?: [Ingress];
}

/**
 * @ojmetadata pack "vz-console"
 */
@customElement("vz-console-ingress-list")
export class ConsoleIngressList extends VComponent<Props> {

  columnArray = [
    { headerText: Messages.Labels.name(), sortable: "enabled", sortProperty: "name" },
    { headerText: Messages.Labels.prefix(), sortable: "enabled", sortProperty: "prefix" },
    { headerText: Messages.Labels.port(), sortable: "enabled", sortProperty: "port" },
  ];

  protected render() {
    if (this.props.isBindingIngress) {
      this.columnArray.push({
        headerText: Messages.Labels.dnsName(),
        sortable: "enabled",
        sortProperty: "dnsName",
      });
    } else {
      this.columnArray.push({
        headerText: Messages.Labels.comp(),
        sortable: "enabled",
        sortProperty: "component",
      });
    }

    return (
      <oj-table
        data={new ArrayDataProvider(this.props.ingresses, {
          keyAttributes: "name",
          implicitSort: [{ attribute: "name", direction: "ascending" }],
        })}
        columns={this.columnArray}
        aria-labelledby="resources"
        class="oj-table oj-table-container oj-component oj-table-horizontal-grid oj-complete"
        style={{ width: "100%" }}
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
    );
  }
}
