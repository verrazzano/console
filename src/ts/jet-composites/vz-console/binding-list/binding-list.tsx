// Copyright (c) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { VComponent, customElement, h } from "ojs/ojvcomponent";
import { VerrazzanoApi } from "service/VerrazzanoApi";
import { Binding } from "service/types";
import { extractBindingsFromApplications } from "service/common";
import * as ArrayDataProvider from "ojs/ojarraydataprovider";
import "ojs/ojtable";
import * as ko from "knockout";
import { ConsoleError } from "vz-console/error/loader"

class Props {
  modelId?: string;
}

class State {
  bindings?: [Binding];
  loading?: boolean;
  error?: string;
}

/**
 * @ojmetadata pack "vz-console"
 */
@customElement("vz-console-binding-list")
export class ConsoleBindingList extends VComponent {
  verrazzanoApi: VerrazzanoApi;
  state: State = {
    loading: true,
  };

  columnArray = [
    { headerText: "Name", sortable: "enabled", sortProperty: 'name' },
    { headerText: "State", sortable: "enabled", sortProperty: 'state' },
    { headerText: "Model", sortable: "enabled", sortProperty: 'model.name' },
  ];

  data: ko.Observable = ko.observable();

  constructor() {
    super(new Props());
    this.verrazzanoApi = new VerrazzanoApi();
  }

  protected mounted() {
    this.getData();
  }

  async getData() {
    this.updateState({ loading: true });
    this.verrazzanoApi
      .listApplications()
      .then((response) =>
        this.updateState({
          loading: false,
          bindings: extractBindingsFromApplications(response),
        })
      )
      .catch((error) => {
        let errorMessage = error;
        if (error && error.message) {
            errorMessage = error.message;
        }
        this.updateState({ error: errorMessage });
      });
  }

  protected render() {
    if (this.state.error) {
      return <ConsoleError context={"Error displaying binding list"} error={this.state.error}/>
    }

    this.data(
      new ArrayDataProvider(this.state.bindings ? this.state.bindings : [], {
        keyAttributes: "name",
        implicitSort: [{ attribute: "name", direction: "ascending" }],
      })
    );

    if (this.state.loading) {
      return <p>Loading..</p>;
    }

    return (
      <oj-table
        data={this.data()}
        columns={this.columnArray}
        aria-labelledby="resources"
        class="oj-table oj-table-container oj-component oj-table-horizontal-grid oj-complete"
        style={{ width: "100%" }}
      >
        <template slot="rowTemplate" data-oj-as="row">
          <tr>
            <td>
              <a href="?ojr=binding"><oj-bind-text value="[[row.data.name]]"></oj-bind-text></a>
            </td>
            <td>
              <oj-bind-text value="[[row.data.state]]"></oj-bind-text>
            </td>
            <td>
            <a href="?ojr=model"><oj-bind-text value="[[row.data.model.name]]"></oj-bind-text></a>
            </td>
          </tr>
        </template>
      </oj-table>
    );
    
  }
}
