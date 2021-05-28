// Copyright (c) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

// eslint-disable-next-line no-unused-vars
import { ElementVComponent, customElement, h } from "ojs/ojvcomponent-element";
import { ojMessage } from "ojs/ojmessage";
// eslint-disable-next-line import/no-duplicates
import { ojMessages } from "ojs/ojmessages";
// eslint-disable-next-line import/no-duplicates
import "ojs/ojmessages";
import * as ko from "knockout";
import * as ArrayDataProvider from "ojs/ojarraydataprovider";

class Props {
  context?: string;
  error?: string;
}

/**
 * @ojmetadata pack "vz-console"
 */
@customElement("vz-console-error")
export class ConsoleError extends ElementVComponent<Props> {
  props: Props = {};

  categoryOption = ko.computed<ojMessages["displayOptions"]>(() => {
    return {
      category: "auto" as ojMessage.DisplayOptions["category"],
    };
  });

  protected mounted() {
    console.error(this.props.context + " : " + this.props.error);
  }

  createMessage(): ojMessage.Message {
    return {
      severity: "error",
      summary: this.props.context,
      detail: this.props.error,
    };
  }

  protected render() {
    return (
      <div class="oj-sm-web-padding-horizontal">
        <oj-messages
          id="error"
          messages={new ArrayDataProvider([this.createMessage()])}
          display-options={this.categoryOption}
        ></oj-messages>
      </div>
    );
  }
}
