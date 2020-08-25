// Copyright (c) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { VComponent, customElement, h } from "ojs/ojvcomponent";
import {
  VerrazzanoApi,
  extractModelSecretsFromApplications,
  ModelSecret,
} from "vz-console/service/loader";
import * as ArrayDataProvider from "ojs/ojarraydataprovider";
import "ojs/ojtable";
import * as ko from "knockout";
import { ConsoleError } from "vz-console/error/loader";

class Props {
  modelId: string;
  bindingId?: string;
}

class State {
  secrets?: [ModelSecret];
  loading?: boolean;
  error?: string;
}

/**
 * @ojmetadata pack "vz-console"
 */
@customElement("vz-console-secret-list")
export class ConsoleSecretList extends VComponent<Props> {
  verrazzanoApi: VerrazzanoApi;
  state: State = {
    loading: true,
  };

  columnArray = [
    { headerText: "Name", sortable: "enabled", sortProperty: "name" },
    { headerText: "Type", sortable: "enabled", sortProperty: "type" },
    { headerText: "Component", sortable: "enabled", sortProperty: "componentName" },
    { headerText: "Component Type", sortable: "enabled", sortProperty: "componentType" },
    { headerText: "Usage", sortable: "enabled", sortProperty: "usage" },
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
    Promise.all([this.verrazzanoApi.listApplications(),this.verrazzanoApi.listSecrets()])
    .then(([applications, rawSecrets]) =>
        this.updateState({
          loading: false,
          secrets: extractModelSecretsFromApplications(
            applications,
            rawSecrets,
            this.props.modelId,
            this.props.bindingId
          ),
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
      return (
        <ConsoleError
          context={"Error displaying secret list."}
          error={this.state.error}
        />
      );
    }

    this.data(
      new ArrayDataProvider(this.state.secrets ? this.state.secrets : [], {
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
