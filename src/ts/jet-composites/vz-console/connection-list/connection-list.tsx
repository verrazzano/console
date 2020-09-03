// Copyright (c) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { VComponent, customElement, h } from "ojs/ojvcomponent";
import { Connection } from "vz-console/service/loader";
import * as ArrayDataProvider from "ojs/ojarraydataprovider";
import "ojs/ojtable";
import * as Messages from "vz-console/utils/Messages"

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

  protected render() {

    return (
      <oj-table
        data={new ArrayDataProvider<string,Connection>(
          this.props.connections,
          {
            keyAttributes: "name",
            implicitSort: [{ attribute: "name", direction: "ascending" }],
          }
        )}
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
    );
  }
}
