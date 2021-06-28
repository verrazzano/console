// Copyright (c) 2021, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import {
  ElementVComponent,
  customElement,
  // eslint-disable-next-line no-unused-vars
  h,
} from "ojs/ojvcomponent-element";
import "ojs/ojtable";
import "ojs/ojselectsingle";
import "ojs/ojpagingcontrol";
import "ojs/ojinputtext";
import { ConsoleMetadataItem } from "vz-console/metadata-item/metadata-item";
import * as Messages from "vz-console/utils/Messages";
import * as ko from "knockout";
import { WeblogicImage } from "vz-console/service/types";

class Props {
  createImageHandler: (image: WeblogicImage) => void;
  closeHandler: () => void;
}

/**
 * @ojmetadata pack "vz-console"
 */
@customElement("vz-console-image-create")
export class ConsoleImageCreate extends ElementVComponent<Props> {
  render() {
    return (
      <div class="popupbody">
        <div>
          <a
            onClick={() => {
              this.props.closeHandler();
              const textElement = document.getElementById(
                "imageName"
              ) as HTMLInputElement;
              textElement.value = "";
            }}
            class="closelink"
          >
            {Messages.Labels.close()}
          </a>
        </div>
        <h1>
          <ConsoleMetadataItem label={Messages.Labels.newWeblogicImage()} />
        </h1>
        <div class="demo-flex-display">
          <div class="oj-sm-odd-cols-12 oj-md-odd-cols-4">
            <div class="oj-flex">
              <div class="oj-flex-item oj-sm-padding-2x-horizontal">
                <ConsoleMetadataItem label={Messages.Labels.name()} />
              </div>
              <div class="oj-flex-item oj-sm-padding-2x-horizontal">
                <oj-input-text id="imageName" value=""></oj-input-text>
              </div>
            </div>
          </div>
        </div>
        <div class="oj-sm-margin-4x-right">
          <oj-button
            onClick={() => {
              const textElement = document.getElementById(
                "imageName"
              ) as HTMLInputElement;
              this.props.createImageHandler({ name: `${textElement.value}` });
              this.props.closeHandler();
              textElement.value = "";
            }}
          >
            {Messages.Labels.add()}
          </oj-button>
        </div>
        <div class="oj-sm-margin-4x-right"></div>
      </div>
    );
  }
}
