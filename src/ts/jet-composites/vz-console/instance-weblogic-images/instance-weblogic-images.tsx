// Copyright (c) 2021, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import {
  ElementVComponent,
  customElement,
  // eslint-disable-next-line no-unused-vars
  h,
  listener,
} from "ojs/ojvcomponent-element";
import { WeblogicImage } from "vz-console/service/loader";
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

class Props {}

class State {
  images?: Model.Collection;
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
  state: State = {};

  options = [
    {
      value: Messages.Labels.name().toLowerCase(),
      label: Messages.Labels.name(),
    },
  ];

  optionsDataProvider = new ArrayDataProvider(this.options, {
    keyAttributes: "value",
  });

  dataProvider: ko.Observable = ko.observable();

  defaultSort = "default";

  currentSort = ko.observable(this.defaultSort);

  constructor() {
    super(new Props());
  }

  compare = (left: Model.Model, right: Model.Model): number => {
    let result = 0;
    const leftComponent = left.attributes as WeblogicImage;
    const rightComponent = right.attributes as WeblogicImage;
    switch (this.currentSort()) {
      case "default":
      case Messages.Labels.name().toLowerCase(): {
        result = leftComponent.name?.localeCompare(rightComponent.name);
        break;
      }

      default: {
        break;
      }
    }
    return result;
  };

  private handleImageAdded = (image: WeblogicImage) => {
    this.state.images.push(new Model.Model(image));
    this.updateState({
      images: new Model.Collection(this.state.images.models),
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
  }

  @listener({ capture: true, passive: true })
  private handleSortCriteriaChanged(event: CustomEvent) {
    if (event.detail.value) {
      this.currentSort(event.detail.value.toLowerCase());
      this.updateState({ images: this.executeSort(this.state.images) });
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
