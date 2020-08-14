// Copyright (c) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { VComponent, customElement, h } from "ojs/ojvcomponent";

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

  protected render() {
    return (
      <div class="oj-flex-item oj-sm-12">
          <strong>{this.props.label}:&nbsp;</strong>
        {this.props.link ? 
           <a href={this.props.value}> {this.props.value} </a> : this.props.value}
      </div>
    );
  }
}
