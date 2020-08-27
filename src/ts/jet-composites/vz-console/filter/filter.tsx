// Copyright (c) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { VComponent, customElement, h, listener } from "ojs/ojvcomponent";
import "ojs/ojcheckboxset";
import * as ko from "knockout";
import * as ArrayDataProvider from "ojs/ojarraydataprovider";

class Props {
  label: string;
  options: [{ label: string; value: string }];
  onValueChanged: (event: CustomEvent) => void;
}

/**
 * @ojmetadata pack "vz-console"
 */
@customElement("vz-console-filter")
export class ConsoleFilter extends VComponent<Props> {
  data = ko.observable(new ArrayDataProvider([{}]));

  @listener({ capture: true, passive: true })
  private handleValueChanged(event: CustomEvent) {
    this.props.onValueChanged(event);
  }

  protected render() {
    this.data(
      this.props.options
        ? new ArrayDataProvider(this.props.options, { keyAttributes: "value" })
        : new ArrayDataProvider([])
    );
    return (
      <div class="oj-flex">
        <div class="oj-lg-12 oj-md-12 oj-sm-only-hide oj-flex-item">
          <oj-label>{this.props.label}</oj-label>
          <oj-checkboxset
            labelledBy={this.props.label}
            class="oj-sm-padding-4x-bottom oj-complete"
            onValueChanged={this.handleValueChanged}
            options={this.data()}
          ></oj-checkboxset>
        </div>
      </div>
    );
  }
}
