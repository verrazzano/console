// Copyright (c) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { VComponent, customElement, h } from "ojs/ojvcomponent";
import { VerrazzanoApi, Binding,  extractBindingsFromApplications} from "vz-console/service/loader";
import * as ArrayDataProvider from "ojs/ojarraydataprovider";
import "ojs/ojtable";
import * as ko from "knockout";
import { ConsoleError } from "vz-console/error/loader";
import * as Messages from "vz-console/utils/Messages"

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
export class ConsoleBindingList extends VComponent<Props> {
  verrazzanoApi: VerrazzanoApi;
  state: State = {
    loading: true,
  };

  columnArray = [
    { headerText: Messages.Labels.name(), sortable: "enabled", sortProperty: 'name' },
    { headerText: Messages.Labels.state(), sortable: "enabled", sortProperty: 'state' },
    { headerText: Messages.Labels.model(), sortable: "enabled", sortProperty: 'model.name' },
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
          bindings: extractBindingsFromApplications(response, "", this.props.modelId),
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
      return <ConsoleError context={Messages.Error.errRenderBindingList()} error={this.state.error}/>
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
              <p><a data-bind="attr: {href: '?ojr=binding&bindingId=' + row.data.id}"><oj-bind-text value="[[row.data.name]]"></oj-bind-text></a></p>
            </td>
            <td>
              <p>
              <oj-bind-if test="[[row.data.state === 'Running']]">
                  <span>
                    <span class="oj-icon-circle oj-icon-circle-xxs oj-icon-circle-green">
                      <span class="oj-icon-circle-inner status-icon"></span>
                    </span>
                    &nbsp;
                  </span>
                </oj-bind-if>
                <oj-bind-if test="[[row.data.state === 'Terminated']]">
                  <span>
                    <span id="status" class="oj-icon-circle oj-icon-circle-xxs oj-icon-circle-red">
                      <span class="oj-icon-circle-inner status-icon"></span>
                    </span>
                    &nbsp;
                  </span>
                </oj-bind-if>
                <oj-bind-if test="[[row.data.state === 'Creating']]">
                  <span>
                    <span id="status" class="oj-icon-circle oj-icon-circle-xxs oj-icon-circle-orange">
                      <span class="oj-icon-circle-inner status-icon"></span>
                    </span>
                    &nbsp;
                  </span>
                </oj-bind-if>
                <oj-bind-text value="[[row.data.state]]"></oj-bind-text>
              </p>
            </td>
            <td>
              <p><a data-bind="attr: {href: '?ojr=model&modelId=' + row.data.model.id}"><oj-bind-text value="[[row.data.model.name]]"></oj-bind-text></a></p>
            </td>
          </tr>
        </template>
      </oj-table>
    );
    
  }
}
