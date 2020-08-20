// Copyright (c) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { VComponent, customElement, h, listener } from "ojs/ojvcomponent";
import { ojMessage } from 'ojs/ojmessage';
import { ojMessages } from 'ojs/ojmessages';
import 'ojs/ojmessages';
import * as ko from "knockout";
import * as ArrayDataProvider from 'ojs/ojarraydataprovider';

class Props {
  context?: string;
  error?: string;
}

/**
 * @ojmetadata pack "vz-console"
 */
@customElement("vz-console-error")
export class ConsoleError extends VComponent {
  props: Props = {
  };

  categoryOption = ko.computed<ojMessages['displayOptions']>(() => {
      return { 
        category: 'auto' as ojMessage.DisplayOptions['category'] 
      }
  });

  protected mounted() {
    console.error(this.props.context + " : " + this.props.error);
  }

  createMessage(): ojMessage.Message {
    return {
      severity: "error",
      summary: this.props.context,
      detail: this.props.error
    };
   }


  protected render() {
    return (
      <div class="oj-sm-web-padding-horizontal">   
        <oj-messages id="error" messages={new ArrayDataProvider([this.createMessage()])} 
                      display-options={this.categoryOption}>
        </oj-messages>
      </div>
    );
  }
}
