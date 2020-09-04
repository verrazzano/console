// Copyright (c) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { VComponent, customElement, h } from "ojs/ojvcomponent";
import { Model} from "vz-console/service/loader";
import * as ArrayDataProvider from "ojs/ojarraydataprovider";
import "ojs/ojtable";
import * as Messages from "vz-console/utils/Messages"

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
    { headerText: Messages.Labels.bindings(), sortable: "disabled" }
  ];

  protected render() {
    return (
      <oj-table
        data={new ArrayDataProvider(this.props.models, {
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
              <p><a data-bind="attr: {href: '?ojr=model&modelId=' + row.data.id}"><oj-bind-text value="[[row.data.name]]"></oj-bind-text></a></p>
            </td>
            <td>
            <oj-bind-for-each data='[[row.data.bindings || []]]'>
              <template>
                <p><a data-bind="attr: {href: '?ojr=binding&bindingId=' + $current.data.id}"><oj-bind-text value='[[$current.data.name]]'></oj-bind-text></a></p>
              </template>
            </oj-bind-for-each>
            </td>
          </tr>
        </template>
      </oj-table>
    );
  }
}
