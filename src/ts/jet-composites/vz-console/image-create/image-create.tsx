// Copyright (c) 2021, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import {
  ElementVComponent,
  customElement,
  // eslint-disable-next-line no-unused-vars
  h,
  listener,
} from "ojs/ojvcomponent-element";
import "ojs/ojtable";
import "ojs/ojselectsingle";
import "ojs/ojpagingcontrol";
import { ConsoleMetadataItem } from "vz-console/metadata-item/metadata-item";
import * as Messages from "vz-console/utils/Messages";
import { ImageBuildRequest } from "vz-console/service/types";
import { ojInputTextEventMap } from "ojs/ojinputtext";
import { ConsoleError } from "vz-console/error/error";
import ko = require("knockout");
import * as ArrayDataProvider from "ojs/ojarraydataprovider";

class Props {
  createImageHandler: (image: ImageBuildRequest) => Promise<void>;
  closeHandler: () => void;
}

class State {
  imageName?: string;
  error?: string;
  errorContext?: string;
  baseImage?: string;
  jdkInstaller?: string;
  webLogicInstaller?: string;
  dockerImageName?: string;
  imageRegistry?: string;
  imageRepository?: string;
  imageTag?: string;
}
/**
 * @ojmetadata pack "vz-console"
 */
@customElement("vz-console-image-create")
export class ConsoleImageCreate extends ElementVComponent<Props, State> {
  state = {
    imageName: "",
    error: "",
    errorContext: "",
    baseImage: "",
    jdkInstaller: "",
    webLogicInstaller: "",
    dockerImageName: "",
    imageRegistry: "",
    imageRepository: "",
    imageTag: "",
  };

  baseImages = [
    { value: "default", label: "ghcr.io/oracle/oraclelinux:8-slim" },
  ];

  baseImageDataProvider = new ArrayDataProvider(this.baseImages, {
    keyAttributes: "value",
  });

  jdkInstallers = [{ value: "default", label: "jdk-8u281-linux-x64.tar.gz" }];

  jdkInstallerDataProvider = new ArrayDataProvider(this.jdkInstallers, {
    keyAttributes: "value",
  });

  weblogicInstallers = [{ value: "default", label: "fmw_12.2.1.4.0_wls.jar" }];

  weblogicInstallerDataProvider = new ArrayDataProvider(
    this.weblogicInstallers,
    {
      keyAttributes: "value",
    }
  );

  defaultSelect = "default";
  baseImageSelection = ko.observable(this.defaultSelect);
  jdkInstallerSelection = ko.observable(this.defaultSelect);
  webLogicInstallerSelection = ko.observable(this.defaultSelect);

  private createImage = async (
    imageName: string,
    baseImage: string,
    jdkInstaller: string,
    webLogicInstaller: string,
    imageRegistry: string,
    imageRepository: string,
    imageTag: string
  ): Promise<boolean> => {
    try {
      await this.props.createImageHandler({
        metadata: {
          name: imageName,
          namespace: "verrazzano-system",
        },
        spec: {
          baseImage: baseImage,
          image: {
            name: imageName,
            registry: imageRegistry,
            repository: imageRepository,
            tag: imageTag,
          },
          jdkInstaller: jdkInstaller,
          webLogicInstaller: webLogicInstaller,
        },
      });
      return true;
    } catch (error) {
      let errorMessage = error;
      if (error && error.message) {
        errorMessage = error.message;
      }
      this.updateState({
        error: errorMessage,
        errorContext: Messages.Error.errImageBuildRequestsCreateError(),
      });
      return false;
    }
  };

  private handleNameChanged = (event: ojInputTextEventMap["valueChanged"]) => {
    this.updateState({
      imageName: event.detail.value,
    });
  };

  private handleImageRegistryChanged = (
    event: ojInputTextEventMap["valueChanged"]
  ) => {
    this.updateState({
      imageRegistry: event.detail.value,
    });
  };

  private handleImageRepositoryChanged = (
    event: ojInputTextEventMap["valueChanged"]
  ) => {
    this.updateState({
      imageRepository: event.detail.value,
    });
  };

  private handleImageTagChanged = (
    event: ojInputTextEventMap["valueChanged"]
  ) => {
    this.updateState({
      imageTag: event.detail.value,
    });
  };

  @listener({ capture: true, passive: true })
  private handleBaseImageChanged(event: CustomEvent) {
    if (event.detail.value) {
      this.baseImageSelection(event.detail.value);
      this.updateState({ baseImage: event.detail.value });
    }
  }

  @listener({ capture: true, passive: true })
  private handleJDKInstallerChanged(event: CustomEvent) {
    if (event.detail.value) {
      this.jdkInstallerSelection(event.detail.value);
      this.updateState({ jdkInstaller: event.detail.value });
    }
  }

  @listener({ capture: true, passive: true })
  private handleWeblogicInstallerChanged(event: CustomEvent) {
    if (event.detail.value) {
      this.webLogicInstallerSelection(event.detail.value);
      this.updateState({ webLogicInstaller: event.detail.value });
    }
  }

  render() {
    return (
      <div class="popupbody">
        <div>
          <a
            onClick={() => {
              this.props.closeHandler();
              this.updateState({
                imageName: "",
                error: "",
                errorContext: "",
                baseImage: "",
                jdkInstaller: "",
                webLogicInstaller: "",
                dockerImageName: "",
                imageRegistry: "",
                imageRepository: "",
                imageTag: "",
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
                  value={this.state.imageName}
                  onValueChanged={this.handleNameChanged}
                ></oj-input-text>
              </div>
              <div class="oj-flex-item oj-sm-padding-2x-horizontal oj-sm-padding-2x-vertical">
                <ConsoleMetadataItem label={Messages.Labels.image()} />
              </div>

              <div class="oj-flex-item oj-sm-padding-2x-horizontal">
                <ConsoleMetadataItem label="" />
              </div>

              <div class="oj-flex-item oj-sm-padding-10x-horizontal oj-sm-padding-2x-vertical">
                <ConsoleMetadataItem label={Messages.Labels.registry()} />
              </div>
              <div class="oj-flex-item oj-sm-padding-2x-horizontal">
                <oj-input-text
                  id="imageRegistry"
                  value={this.state.imageRegistry}
                  onValueChanged={this.handleImageRegistryChanged}
                ></oj-input-text>
              </div>
              <div class="oj-flex-item oj-sm-padding-10x-horizontal oj-sm-padding-2x-vertical">
                <ConsoleMetadataItem label={Messages.Labels.repository()} />
              </div>
              <div class="oj-flex-item oj-sm-padding-2x-horizontal">
                <oj-input-text
                  id="imageRepository"
                  value={this.state.imageRepository}
                  onValueChanged={this.handleImageRepositoryChanged}
                ></oj-input-text>
              </div>

              <div class="oj-flex-item oj-sm-padding-10x-horizontal oj-sm-padding-2x-vertical">
                <ConsoleMetadataItem label={Messages.Labels.tag()} />
              </div>
              <div class="oj-flex-item oj-sm-padding-2x-horizontal">
                <oj-input-text
                  id="imageTag"
                  value={this.state.imageTag}
                  onValueChanged={this.handleImageTagChanged}
                ></oj-input-text>
              </div>

              <div class="oj-flex-item oj-sm-padding-2x-horizontal oj-sm-padding-2x-vertical">
                <ConsoleMetadataItem label={Messages.Labels.baseImage()} />
              </div>
              <div class="oj-flex-item oj-sm-padding-2x-horizontal">
                <oj-select-single
                  id="baseImageSelection"
                  data={this.baseImageDataProvider}
                  value={this.baseImageSelection}
                  onValueChanged={this.handleBaseImageChanged}
                  class="oj-complete sortselect"
                  placeholder={Messages.Labels.selectOption()}
                ></oj-select-single>
              </div>
              <div class="oj-flex-item oj-sm-padding-2x-horizontal oj-sm-padding-2x-vertical">
                <ConsoleMetadataItem label={Messages.Labels.jdkInstaller()} />
              </div>
              <div class="oj-flex-item oj-sm-padding-2x-horizontal">
                <oj-select-single
                  id="jdkInstallerSelection"
                  data={this.jdkInstallerDataProvider}
                  value={this.jdkInstallerSelection}
                  onValueChanged={this.handleJDKInstallerChanged}
                  class="oj-complete sortselect"
                  placeholder={Messages.Labels.selectOption()}
                ></oj-select-single>
              </div>
              <div class="oj-flex-item oj-sm-padding-2x-horizontal oj-sm-padding-2x-vertical">
                <ConsoleMetadataItem
                  label={Messages.Labels.weblogicInstaller()}
                />
              </div>
              <div class="oj-flex-item oj-sm-padding-2x-horizontal">
                <oj-select-single
                  id="weblogicInstallerSelection"
                  data={this.weblogicInstallerDataProvider}
                  value={this.jdkInstallerSelection}
                  onValueChanged={this.handleWeblogicInstallerChanged}
                  class="oj-complete sortselect"
                  placeholder={Messages.Labels.selectOption()}
                ></oj-select-single>
              </div>
            </div>
          </div>
        </div>
        <div class="demo-flex-display">
          <div class="oj-sm-odd-cols-12 oj-md-odd-cols-2">
            <div class="oj-flex">
              <div class="oj-flex-item oj-sm-padding-4x-horizontal oj-sm-padding-8x-vertical">
                <oj-button
                  onClick={async () => {
                    const success = await this.createImage(
                      this.state.imageName,
                      this.state.baseImage,
                      this.state.jdkInstaller,
                      this.state.webLogicInstaller,
                      this.state.imageRegistry,
                      this.state.imageRepository,
                      this.state.imageTag
                    );
                    if (success) {
                      this.props.closeHandler();
                      this.updateState({
                        imageName: "",
                        error: "",
                        errorContext: "",
                        baseImage: "",
                        jdkInstaller: "",
                        webLogicInstaller: "",
                        dockerImageName: "",
                        imageRegistry: "",
                        imageRepository: "",
                        imageTag: "",
                      });
                    }
                  }}
                >
                  {Messages.Labels.add()}
                </oj-button>
              </div>
              <div class="oj-flex-item oj-sm-padding-20x-horizontal oj-sm-padding-8x-vertical">
                {this.state.error ? (
                  <ConsoleError
                    context={this.state.errorContext}
                    error={this.state.error}
                  />
                ) : (
                  ""
                )}
              </div>
            </div>
          </div>
        </div>
        <div class="oj-sm-margin-4x-right"></div>
      </div>
    );
  }
}
