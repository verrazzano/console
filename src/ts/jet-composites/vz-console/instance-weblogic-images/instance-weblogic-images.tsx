// Copyright (c) 2021, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import {
  ElementVComponent,
  customElement,
  // eslint-disable-next-line no-unused-vars
  h,
  listener,
} from "ojs/ojvcomponent-element";
import { VerrazzanoApi, ImageBuildRequest, ResourceType } from "vz-console/service/loader";
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
        result = leftComponent.name?.localeCompare(rightComponent.name);
        break;
      }

      case Messages.Labels.ns().toLowerCase(): {
        result = leftComponent.namespace?.localeCompare(
          rightComponent.namespace
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
    this.updateState({ loading: true });
    try {
      const imageBuildPostRequest = {
        apiVersion: "images.verrazzano.io/v1alpha1",
        // apiVersion: String(ResourceType.VerrazzanoImageBuildRequest.ApiVersion), 
        //need way to remove api from front
        kind: ResourceType.VerrazzanoImageBuildRequest.Kind,
        metadata: {
          name: image.name,
          namespace: image.namespace,
        },
      };
      const postRequestResponse = await this.verrazzanoApi.postKubernetesResource(ResourceType.VerrazzanoImageBuildRequest, imageBuildPostRequest, imageBuildPostRequest.metadata.namespace);
      this.state.images.push(new Model.Model(image));
      this.updateState({
        images: new Model.Collection(this.state.images.models),
        loading: false,
        error: "",
      });
    } catch (error) {
      let errorMessage = error;
      if (error && error.message) {
        errorMessage = error.message;
      }
      this.updateState({ error: errorMessage });
    }
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
      const imageBuildRequests = await this.verrazzanoApi.listImageBuildRequests();
      imageBuildRequests.forEach((request) => {
        this.state.images.push(new Model.Model(request));
      });
      this.updateState({
        images: new Model.Collection(this.state.images.models),
        loading: false,
        error: "",
      });
    } catch (error) {
      let errorMessage = error;
      if (error && error.message) {
        errorMessage = error.message;
      }
      this.updateState({ error: errorMessage });
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
          context={Messages.Error.errImageBuildRequestsFetchError()}
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
                            <oj-bind-text value="[[item.data.name]]"></oj-bind-text>
                          </div>

                          <div class="carditem">
                            <strong>
                              <span>{Messages.Labels.ns()}:&nbsp;</span>
                            </strong>

                            <oj-bind-text value="[[item.data.namespace]]"></oj-bind-text>
                          </div>

                          <div class="carditem">
                            <strong>
                              <span>{Messages.Labels.status()}:&nbsp;</span>
                            </strong>
                            <oj-bind-text value="[[item.data.status]]"></oj-bind-text>
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
