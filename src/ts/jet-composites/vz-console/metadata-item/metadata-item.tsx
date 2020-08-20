// Copyright (c) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { VComponent, customElement, h, listener } from "ojs/ojvcomponent";

class Props {
  label?: string;
  value?: string;
  link?: boolean;
}

/**
 * @ojmetadata pack "vz-console"
 */
@customElement("vz-console-metadata-item")
export class ConsoleMetadataItem extends VComponent<Props> {
  props: Props;

  @listener({ capture: true, passive: true })
  protected openLinkInNewTab(event: Event) {
   window.open(this.props.value,"_blank")
  }

  protected render() {
    return (
      <div class="oj-flex-item oj-sm-12">
          <strong>{this.props.label}:&nbsp;</strong>
        {this.props.link ? 
           <span onClick={this.openLinkInNewTab} class="link">{this.props.value}</span> : this.props.value}
      </div>
    );
  }
}
