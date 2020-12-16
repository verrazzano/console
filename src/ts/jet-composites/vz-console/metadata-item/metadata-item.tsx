// Copyright (c) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

// eslint-disable-next-line no-unused-vars
import { VComponent, customElement, listener, h } from "ojs/ojvcomponent";

class Props {
  label?: string;
  value?: string;
  link?: boolean;
  replace?: boolean;
  target?: string;
  onclick?: () => {};
}

/**
 * @ojmetadata pack "vz-console"
 */
@customElement("vz-console-metadata-item")
export class ConsoleMetadataItem extends VComponent<Props> {
  props: Props;

  @listener({ capture: true, passive: true })
  protected openLink(event: Event) {
    const url = this.props.target ? this.props.target : this.props.value;
    if (this.props.replace) {
      window.open(url, "_self");
    } else {
      window.open(url, "_blank");
    }
  }

  protected render() {
    return (
      <div class="oj-flex-item oj-sm-12 metadata-item">
        <strong>{this.props.label}:&nbsp;</strong>
        {this.props.link ? (
          <a
            onClick={this.props.onclick ? this.props.onclick : this.openLink}
            href={this.props.target ? this.props.target : this.props.value}
          >
            {this.props.value}
          </a>
        ) : (
          this.props.value
        )}
      </div>
    );
  }
}
