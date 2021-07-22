// Copyright (c) 2021, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import {
  ElementVComponent,
  customElement,
  // eslint-disable-next-line no-unused-vars
  h,
  listener,
} from "ojs/ojvcomponent-element";
import {
  VerrazzanoApi,
  ImageBuildRequest,
  ResourceType,
} from "vz-console/service/loader";
import * as ArrayDataProvider from "ojs/ojarraydataprovider";
import * as Model from "ojs/ojmodel";
import "ojs/ojtable";
import "ojs/ojselectsingle";
import "ojs/ojpagingcontrol";
import * as ko from "knockout";
import * as Messages from "vz-console/utils/Messages";
import PagingDataProviderView = require("ojs/ojpagingdataproviderview");
import CollectionDataProvider = require("ojs/ojcollectiondataprovider");
import "ojs/ojinputtext";
import { ConsoleImageCreate } from "vz-console/image-create/image-create";
import { ConsoleError } from "vz-console/error/error";

class Props { }

class State {
  images?: Model.Collection;
  loading?: boolean;
  error?: string;
  errorContext?: string;
  namespaces?: Array<{ value: string, label: string }>;
}

/**
 * @ojmetadata pack "vz-console"
 */
@customElement("vz-console-instance-weblogic-images")
export class ConsoleInstanceWeblogicImages extends ElementVComponent<
Props,
State
> {
  popupId = "createImagePopup";
  verrazzanoApi: VerrazzanoApi;
  state: State = {
    loading: true,
  };

  options = [
    {
      value: Messages.Labels.name().toLowerCase(),
      label: Messages.Labels.name(),
    },
    { value: Messages.Labels.ns().toLowerCase(), label: Messages.Labels.ns() },
  ];

  optionsDataProvider = new ArrayDataProvider(this.options, {
    keyAttributes: "value",
  });

  dataProvider: ko.Observable = ko.observable();

  defaultSort = "default";

  currentSort = ko.observable(this.defaultSort);

  constructor() {
    super(new Props());
    this.verrazzanoApi = new VerrazzanoApi();
  }

  compare = (left: Model.Model, right: Model.Model): number => {
    let result = 0;
    const leftComponent = left.attributes as ImageBuildRequest;
    const rightComponent = right.attributes as ImageBuildRequest;
    switch (this.currentSort()) {
      case "default":
      case Messages.Labels.name().toLowerCase(): {
        result = leftComponent.metadata.name?.localeCompare(
          rightComponent.metadata.name
        );
        break;
      }
      case Messages.Labels.ns().toLowerCase(): {
        result = leftComponent.metadata.namespace?.localeCompare(
          rightComponent.metadata.namespace
        );
        break;
      }
      default: {
        break;
      }
    }
    return result;
  };

  private handleImageAdded = async (image: ImageBuildRequest) => {
    let apiVersionValue = ResourceType.VerrazzanoImageBuildRequest.ApiVersion;
    const slashIndex = ResourceType.VerrazzanoImageBuildRequest.ApiVersion.indexOf(
      "/"
    );
    if (slashIndex > -1) {
      apiVersionValue = ResourceType.VerrazzanoImageBuildRequest.ApiVersion.substring(
        slashIndex + 1
      );
    }
    let dashList = [];
    let dashIdx = image.spec.jdkInstaller.indexOf("-");
    while (dashIdx != -1) {
      dashList.push(dashIdx);
      dashIdx = image.spec.jdkInstaller.indexOf("-", dashIdx + 1);
    }
    const jdkVersion = image.spec.jdkInstaller.substring(dashList[0] + 1, dashList[1]);
    let underscoreList = [];
    let underscoreIdx = image.spec.webLogicInstaller.indexOf("_");
    while (underscoreIdx != -1) {
      underscoreList.push(underscoreIdx);
      underscoreIdx = image.spec.webLogicInstaller.indexOf("_", underscoreIdx + 1);
    }
    const weblogicVersion = image.spec.webLogicInstaller.substring(underscoreList[0] + 1, underscoreList[1]);
    const imageBuildRequest = {
      apiVersion: apiVersionValue,
      kind: ResourceType.VerrazzanoImageBuildRequest.Kind,
      metadata: {
        name: image.metadata.name,
        namespace: image.metadata.namespace,
      },
      spec: {
        baseImage: image.spec.baseImage,
        image: {
          name: image.spec.image.name,
          registry: image.spec.image.registry,
          repository: image.spec.image.repository,
          tag: image.spec.image.tag,
        },
        jdkInstaller: image.spec.jdkInstaller,
        jdkInstallerVersion: jdkVersion,
        webLogicInstaller: image.spec.webLogicInstaller,
        webLogicInstallerVersion: weblogicVersion,
      }
    };
    await this.verrazzanoApi.postKubernetesResource(
      ResourceType.VerrazzanoImageBuildRequest,
      imageBuildRequest,
      imageBuildRequest.metadata.namespace
    );
    this.state.images.push(new Model.Model(image));
    this.updateState({
      images: new Model.Collection(this.state.images.models),
      loading: false,
      error: "",
    });
  };

  private handleClosePopup = () => {
    (document.getElementById(this.popupId) as any).close();
  };

  executeSort = (images: Model.Collection): Model.Collection => {
    if (images) {
      images.comparator = this.compare;
      images.sort();
    }
    return images;
  };

  protected mounted() {
    const models: Model.Model[] = [];
    this.updateState({
      images: new Model.Collection(models),
    });
    this.getData();
  }

  @listener({ capture: true, passive: true })
  private handleSortCriteriaChanged(event: CustomEvent) {
    if (event.detail.value) {
      this.currentSort(event.detail.value.toLowerCase());
      this.updateState({ images: this.executeSort(this.state.images) });
    }
  }

  async getData() {
    this.updateState({ loading: true });
    try {
      let currNamespaces = new Array<string>();
      const namespaces = await this.verrazzanoApi.listNamespaces();
      namespaces.forEach((namespace) => {
        currNamespaces.push(namespace.metadata.name);
      });
      let namespaceKeys = [];
      for (var i = 0; i < currNamespaces.length; i++) {
        namespaceKeys.push(i);
      }
      let namespacesDataProvider = [];
      for (var i = 0; i < currNamespaces.length; i++) {
        namespacesDataProvider.push({ value: namespaceKeys[i], label: currNamespaces[i] });
      }
      const imageBuildRequests = await this.verrazzanoApi.listImageBuildRequests();
      imageBuildRequests.forEach((request) => {
        this.state.images.push(new Model.Model(request));
      });
      this.updateState({
        images: new Model.Collection(this.state.images.models),
        loading: false,
        error: "",
        namespaces: namespacesDataProvider,
      });
    } catch (error) {
      let errorMessage = error;
      if (error && error.message) {
        errorMessage = error.message;
      }
      this.updateState({
        error: errorMessage,
        errorContext: Messages.Error.errFetchingKubernetesResource(),
      });
    }
  }

  protected render() {
    this.dataProvider(
      new PagingDataProviderView(
        new CollectionDataProvider(
          this.state.images ? this.state.images : new Model.Collection([])
        )
      )
    );

    if (this.state.error) {
      return (
        <ConsoleError
          context={this.state.errorContext}
          error={this.state.error}
        />
      );
    }

    if (this.state.loading) {
      return <p>{Messages.Labels.loading()}</p>;
    }

    return (
      <div>
        <div>
          <oj-button
            id="weblogicCreateButton"
            onClick={() => {
              (document.getElementById(this.popupId) as any).open(
                "#weblogicCreateButton"
              );
            }}
            class="openlink"
          >
            Create Image
          </oj-button>
        </div>
        <div>
          <oj-popup
            id="createImagePopup"
            tail="none"
            modality="modal"
            {...{ "position.my.horizontal": "center" }}
            {...{ "position.my.vertical": "bottom" }}
            {...{ "position.at.horizontal": "center" }}
            {...{ "position.at.vertical": "bottom" }}
            {...{ "position.offset.y": "-10px" }}
            className="popup"
          >
            <ConsoleImageCreate
              createImageHandler={this.handleImageAdded}
              closeHandler={this.handleClosePopup}
              value=""
              namespaces={this.state.namespaces}
            />
          </oj-popup>
        </div>

        <div id="webLogicImages" class="oj-flex component-margin">
          <div class="oj-lg-12 oj-md-12 oj-sm-12 oj-flex-item">
            <div class="oj-flex">
              <div class="oj-sm-12 oj-flex-item res">
                <div class="oj-flex card-border">
                  <div class="oj-sm-1 oj-flex-item">
                    <oj-label for="sortBy" class="oj-label-inline sortby">
                      {Messages.Labels.sortBy()}
                    </oj-label>
                  </div>
                  <div class="oj-sm-3 oj-flex-item">
                    <oj-select-single
                      id="sortBy"
                      data={this.optionsDataProvider}
                      value={this.currentSort}
                      onValueChanged={this.handleSortCriteriaChanged}
                      class="oj-complete sortselect"
                      placeholder={Messages.Labels.selectOption()}
                    ></oj-select-single>
                  </div>
                  <div class="oj-sm-3 oj-flex-item"></div>
                  <div class="oj-sm-5 oj-flex-item">
                    <div class="oj-flex">
                      <div class="oj-sm-1 oj-flex-item"></div>
                      <div class="oj-sm-11 oj-flex-item">
                        <oj-paging-control
                          data={this.dataProvider()}
                          pageSize={10}
                          class="oj-complete pagination"
                          pageOptions={{
                            layout: ["nav", "pages", "rangeText"],
                            type: "numbers",
                          }}
                          translations={{
                            fullMsgItemRange: Messages.Pagination.msgItemRange(),
                            fullMsgItem: Messages.Pagination.msgItem(),
                          }}
                        ></oj-paging-control>
                      </div>
                    </div>
                  </div>
                </div>
                <oj-list-view
                  id="listview"
                  ariaLabel="weblogic images"
                  data={this.dataProvider()}
                  selectionMode="single"
                  class="oj-complete"
                  item={{ selectable: true }}
                >
                  <template slot="itemTemplate" data-oj-as="item">
                    <oj-list-item-layout class="oj-complete">
                      <div class="oj-flex cardmargin">
                        <div class="oj-sm-10 oj-flex-item">
                          <div class="carditem">
                            <strong>
                              <span>{Messages.Labels.name()}:&nbsp;</span>
                            </strong>
                            <oj-bind-text value="[[item.data.metadata.name]]"></oj-bind-text>
                          </div>

                          <div class="carditem">
                            <strong>
                              <span>{Messages.Labels.ns()}:&nbsp;</span>
                            </strong>

                            <oj-bind-text value="[[item.data.metadata.namespace]]"></oj-bind-text>
                          </div>

                          <div class="carditem">
                            <strong>
                              <span>{Messages.Labels.status()}:&nbsp;</span>
                            </strong>
                            <oj-bind-text value="[[item.data.status?.state]]"></oj-bind-text>
                          </div>
                        </div>
                      </div>
                    </oj-list-item-layout>
                  </template>
                </oj-list-view>

                <div class="oj-flex card-border">
                  <div class="oj-sm-7 oj-flex-item"></div>
                  <div class="oj-sm-5 oj-flex-item">
                    <div class="oj-flex">
                      <div class="oj-sm-1 oj-flex-item"></div>
                      <div class="oj-sm-11 oj-flex-item">
                        <oj-paging-control
                          data={this.dataProvider()}
                          pageSize={10}
                          class="oj-complete pagination"
                          pageOptions={{
                            layout: ["nav", "pages", "rangeText"],
                            type: "numbers",
                          }}
                          translations={{
                            fullMsgItemRange: Messages.Pagination.msgItemRange(),
                            fullMsgItem: Messages.Pagination.msgItem(),
                          }}
                        ></oj-paging-control>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
