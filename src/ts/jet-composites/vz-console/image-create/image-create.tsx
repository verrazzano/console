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
import { ConsoleMetadataItem } from "vz-console/metadata-item/metadata-item";
import * as Messages from "vz-console/utils/Messages";
import { ImageBuildRequest } from "vz-console/service/types";
import { ojInputTextEventMap } from "ojs/ojinputtext";

class Props {
  createImageHandler: (image: ImageBuildRequest) => void;
  closeHandler: () => void;
}

class State {
  imageName?: string;
  imageNamespace?: string;
}
/**
 * @ojmetadata pack "vz-console"
 */
@customElement("vz-console-image-create")
export class ConsoleImageCreate extends ElementVComponent<Props, State> {
  state = {
    imageName: "",
    imageNamespace: "",
  };

  private handleNameChanged = (event: ojInputTextEventMap["valueChanged"]) => {
    this.updateState({
      imageName: event.detail.value,
    });
  };

  private handleNamespaceChanged = (
    event: ojInputTextEventMap["valueChanged"]
  ) => {
    this.updateState({
      imageNamespace: event.detail.value,
    });
  };

  render() {
    return (
      <div class="popupbody">
        <div>
          <a
            onClick={() => {
              this.props.closeHandler();
              this.updateState({
                imageName: "",
                imageNamespace: "",
              });
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
                <oj-input-text
                  id="imageName"
                  onValueChanged={this.handleNameChanged}
                ></oj-input-text>
              </div>
              <div class="oj-flex-item oj-sm-padding-2x-horizontal">
                <ConsoleMetadataItem label={Messages.Labels.ns()} />
              </div>
              <div class="oj-flex-item oj-sm-padding-2x-horizontal">
                <oj-input-text
                  id="imageNamespace"
                  onValueChanged={this.handleNamespaceChanged}
                ></oj-input-text>
              </div>
            </div>
          </div>
        </div>
        <div class="oj-sm-padding-2x-horizontal">
          <oj-button
            onClick={() => {
              this.props.createImageHandler({
                name: this.state.imageName,
                namespace: this.state.imageNamespace,
              });
              this.props.closeHandler();
              this.updateState({
                imageName: "",
                imageNamespace: "",
              });
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
