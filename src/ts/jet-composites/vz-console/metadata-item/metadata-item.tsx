// Copyright (c) 2020, 2021, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import {
  ElementVComponent,
  customElement,
  listener,
  // eslint-disable-next-line no-unused-vars
  h,
} from "ojs/ojvcomponent-element";

class Props {
  label?: string;
  value?: string;
  link?: boolean;
  replace?: boolean;
  target?: string;
  onclick?: () => void;
}

/**
 * @ojmetadata pack "vz-console"
 */
@customElement("vz-console-metadata-item")
export class ConsoleMetadataItem extends ElementVComponent<Props> {
  props: Props;

  @listener({ capture: true, passive: true })
  protected openLink(event: Event) {
    event.preventDefault();
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
        <strong>{this.props.label ? `${this.props.label}: ` : ""}</strong>
        {this.props.link ? (
          <a
            onClick={
              this.props.onclick
                ? (evt) => {
                    evt.preventDefault();
                    return this.props.onclick();
                  }
                : (evt) => {
                    return this.openLink(evt);
                  }
            }
            href={this.props.target ? this.props.target : this.props.value}
            tabindex="0"
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
