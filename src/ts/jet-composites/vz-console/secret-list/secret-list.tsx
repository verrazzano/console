// Copyright (c) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { VComponent, customElement, h } from "ojs/ojvcomponent";
import { ComponentSecret } from "vz-console/service/loader";
import * as ArrayDataProvider from "ojs/ojarraydataprovider";
import "ojs/ojtable";
import * as Messages from "vz-console/utils/Messages"

class Props {
  secrets?: ComponentSecret[];
}

/**
 * @ojmetadata pack "vz-console"
 */
@customElement("vz-console-secret-list")
export class ConsoleSecretList extends VComponent<Props> {

  columnArray = [
    { headerText: Messages.Labels.name(), sortable: "enabled", sortProperty: "name" },
    { headerText: Messages.Labels.type(), sortable: "enabled", sortProperty: "type" },
    { headerText: Messages.Labels.comp(), sortable: "enabled", sortProperty: "componentName" },
    { headerText: Messages.Labels.compType(), sortable: "enabled", sortProperty: "componentType" },
    { headerText: Messages.Labels.usage(), sortable: "enabled", sortProperty: "usage" },
  ];

  protected render() {

    return (
      <oj-table
        data={new ArrayDataProvider(this.props.secrets, {
          keyAttributes: "name",
          implicitSort: [{ attribute: "name", direction: "ascending" }],
        })}
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
                <oj-bind-text value="[[row.data.componentName]]"></oj-bind-text>
              </p>
            </td>
            <td>
              <p>
                <oj-bind-text value="[[row.data.componentType]]"></oj-bind-text>
              </p>
            </td>
            <td>
              <p>
                <oj-bind-text value="[[row.data.usage]]"></oj-bind-text>
              </p>
            </td>
          </tr>
        </template>
      </oj-table>
    );
  }
}
