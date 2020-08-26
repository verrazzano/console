// Copyright (c) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { VComponent, customElement, h } from "ojs/ojvcomponent";
import {
  VerrazzanoApi,
  extractIngressesFromApplications,
  Ingress,
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
  ingresses?: [Ingress];
  loading?: boolean;
  error?: string;
}

/**
 * @ojmetadata pack "vz-console"
 */
@customElement("vz-console-ingress-list")
export class ConsoleIngressList extends VComponent<Props> {
  verrazzanoApi: VerrazzanoApi;
  state: State = {
    loading: true,
  };

  columnArray = [
    { headerText: "Name", sortable: "enabled", sortProperty: "name" },
    { headerText: "Prefix", sortable: "enabled", sortProperty: "prefix" },
    { headerText: "Port", sortable: "enabled", sortProperty: "port" },
  ];

  data: ko.Observable = ko.observable();

  constructor() {
    super(new Props());
    this.verrazzanoApi = new VerrazzanoApi();
  }

  protected mounted() {
    if (this.props.bindingId) {
      this.columnArray.push({
        headerText: "Dns Name",
        sortable: "enabled",
        sortProperty: "dnsName",
      });
    } else {
      this.columnArray.push({
        headerText: "Component",
        sortable: "enabled",
        sortProperty: "component",
      });
    }

    this.getData();
  }

  async getData() {
    this.updateState({ loading: true });
    this.verrazzanoApi
      .listApplications()
      .then((response) =>
        this.updateState({
          loading: false,
          ingresses: extractIngressesFromApplications(
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
          context={"Error displaying ingress list."}
          error={this.state.error}
        />
      );
    }

    this.data(
      new ArrayDataProvider(this.state.ingresses ? this.state.ingresses : [], {
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
