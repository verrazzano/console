// Copyright (c) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { VComponent, customElement, h } from "ojs/ojvcomponent";
import {
  VerrazzanoApi,
  extractConnectionsFromApplications,
  Connection,
} from "vz-console/service/loader";
import * as ArrayDataProvider from "ojs/ojarraydataprovider";
import "ojs/ojtable";
import * as ko from "knockout";
import { ConsoleError } from "vz-console/error/loader";
import * as Messages from "vz-console/utils/Messages"

class Props {
  modelId: string;
  bindingId?: string;
}

class State {
  connections?: [Connection];
  loading?: boolean;
  error?: string;
}

/**
 * @ojmetadata pack "vz-console"
 */
@customElement("vz-console-connection-list")
export class ConsoleConnectionList extends VComponent<Props> {
  verrazzanoApi: VerrazzanoApi;
  state: State = {
    loading: true,
  };

  columnArray = [
    { headerText: Messages.Labels.name(), sortable: "enabled", sortProperty: "name" },
    { headerText: Messages.Labels.type(), sortable: "enabled", sortProperty: "type" },
    { headerText: Messages.Labels.comp(), sortable: "enabled", sortProperty: "component" },
    { headerText: Messages.Labels.target(), sortable: "enabled", sortProperty: "target" },
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
          connections: extractConnectionsFromApplications(
            response,
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
          context={Messages.Error.errRenderConnectionList()}
          error={this.state.error}
        />
      );
    }

    this.data(
      new ArrayDataProvider(
        this.state.connections ? this.state.connections : [],
        {
          keyAttributes: "name",
          implicitSort: [{ attribute: "name", direction: "ascending" }],
        }
      )
    );

    if (this.state.loading) {
      return <p>{Messages.Labels.loading()}</p>;
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
