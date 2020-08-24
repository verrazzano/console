// Copyright (c) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { VComponent, customElement, h, listener } from "ojs/ojvcomponent";
import { VerrazzanoApi } from "service/VerrazzanoApi";
import { Model } from "service/types";
import { extractModelsFromApplications } from "service/common";
import * as ArrayDataProvider from "ojs/ojarraydataprovider";
import "ojs/ojtable";
import * as ko from "knockout";
import { ConsoleError } from "vz-console/error/loader"

class Props {
  modelId?: string;
}

class State {
  models?: [Model];
  loading?: boolean;
  error?: string;
}

/**
 * @ojmetadata pack "vz-console"
 */
@customElement("vz-console-model-list")
export class ConsoleModelList extends VComponent {
  verrazzanoApi: VerrazzanoApi;
  state: State = {
    loading: true,
  };

  columnArray = [
    { headerText: "Name", sortable: "enabled", sortProperty: 'name' },
    { headerText: "Binding(s)", sortable: "disabled" }
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
          models: extractModelsFromApplications(response),
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
      return <ConsoleError context={"Error displaying model list"} error={this.state.error}/>
    }
    
    this.data(
      new ArrayDataProvider(this.state.models ? this.state.models : [], {
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
            <a href="?ojr=model/row.data.name"><oj-bind-text value="[[row.data.name]]"></oj-bind-text></a>
            </td>
            <td>
            <oj-bind-for-each data='[[row.data.bindings || []]]'>
              <template>
                <p><a href="?ojr=binding"><oj-bind-text value='[[$current.data.name]]'></oj-bind-text></a></p>
              </template>
            </oj-bind-for-each>
            </td>
          </tr>
        </template>
      </oj-table>
    );
  }
}
