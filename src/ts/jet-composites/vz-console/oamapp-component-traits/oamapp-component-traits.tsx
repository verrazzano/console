// Copyright (c) 2021, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

// eslint-disable-next-line no-unused-vars
import { ElementVComponent, customElement, h } from "ojs/ojvcomponent-element";
import { OAMTrait } from "vz-console/service/loader";
import * as Model from "ojs/ojmodel";
import "ojs/ojtable";
import "ojs/ojlistview";
import "ojs/ojselectsingle";
import "ojs/ojpagingcontrol";
import "ojs/ojlistitemlayout";
import * as ko from "knockout";
import * as Messages from "vz-console/utils/Messages";
import PagingDataProviderView = require("ojs/ojpagingdataproviderview");
import CollectionDataProvider = require("ojs/ojcollectiondataprovider");

class Props {
  traits: Array<OAMTrait>;
}

class State {
  traits?: Model.Collection;
}

/**
 * @ojmetadata pack "vz-console"
 */
@customElement("vz-console-oamapp-component-traits")
export class ConsoleOamApplicationComponentTraits extends ElementVComponent<
  Props,
  State
> {
  state: State = {};
  dataProvider: ko.Observable = ko.observable();

  constructor() {
    super(new Props());
  }

  protected mounted() {
    const models: Model.Model[] = [];
    for (const trait of this.props.traits) {
      models.push(new Model.Model(trait));
    }
    this.updateState({
      traits: new Model.Collection(models),
    });
  }

  protected render() {
    this.dataProvider(
      new PagingDataProviderView(
        new CollectionDataProvider(
          this.state.traits ? this.state.traits : new Model.Collection([])
        )
      )
    );

    return (
      <div id="components" class="oj-flex component-margin">
        <div class="oj-lg-12 oj-md-12 oj-sm-12 oj-flex-item">
          <div class="oj-flex">
            <div class="oj-sm-12 oj-flex-item res">
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

              <oj-list-view
                id="listview"
                ariaLabel="oam component traits"
                data={this.dataProvider()}
                selectionMode="single"
                class="oj-complete"
              >
                <template
                  slot="itemTemplate"
                  data-oj-as="item"
                  render={this.renderOneTrait}
                />
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
    );
  }

  renderOneTrait = (item: any) => {
    const trait = item.data as OAMTrait;
    const traitErrorDisplay = !trait.error ? '' :
        <div>
          <strong>
            <span>{Messages.Labels.error()}:&nbsp;</span>
          </strong>
          <span id={`${trait.id}_error`}>{trait.error}</span>
        </div>;

    // If no error, show a link on trait.kind for the popup
    const traitKindDisplay = trait.error ? trait.kind :
        <a onClick={trait.traitOpenEventHandler} id={`trait_${trait.id}`}>
          {trait.kind}
        </a>;

    return (
      <oj-list-item-layout>
        <div className="oj-flex">
          <div className="oj-sm-12 oj-flex-item">
            <strong>
              <span>{Messages.Labels.name()}:&nbsp;</span>
            </strong>
            <span id={`${trait.id}_name`}>{trait.name}</span>
          </div>
        </div>
        <div className="oj-sm-12 oj-flex-item">
          <strong>
            <span>{Messages.Labels.kind()}:&nbsp;</span>
          </strong>
          {traitKindDisplay}
          <oj-popup
            id={`popup_${trait.id}`}
            modality="modal"
            {...{ "position.my.horizontal": "center" }}
            {...{ "position.my.vertical": "bottom" }}
            {...{ "position.at.horizontal": "center" }}
            {...{ "position.at.vertical": "bottom" }}
            {...{ "position.offset.y": "-10" }}
            tail="none"
            className="popup"
          >
            <div className="popupbody">
              <div>
                <a onClick={trait.traitCloseEventHandler} className="closelink">
                  Close
                </a>
              </div>
              <pre className="popupcontent">
                {trait.descriptor}
              </pre>
            </div>
          </oj-popup>
        </div>
        {traitErrorDisplay}
      </oj-list-item-layout>
    );
  };
}
