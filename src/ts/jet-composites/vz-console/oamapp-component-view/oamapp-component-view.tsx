// Copyright (c) 2021, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

// eslint-disable-next-line no-unused-vars
import { ElementVComponent, customElement, h } from "ojs/ojvcomponent-element";

import * as Messages from "vz-console/utils/Messages";
import { KeySetImpl } from "ojs/ojkeyset";
import * as ko from "knockout";
import "ojs/ojlistview";
import "ojs/ojlistitemlayout";

class Props {
  dataProvider?: ko.Observable;
  selectedComponent?: string;
  isRenderedOnPanel?: boolean;
}

/**
 * @ojmetadata pack "vz-console"
 */
@customElement("vz-console-oamapp-component-view")
export class ConsoleOAMAppComponentView extends ElementVComponent<Props> {
  protected render() {
    return (
      <oj-list-view
        id={this.props.isRenderedOnPanel ? "panelview" : "listview"}
        ariaLabel="oam application components"
        data={this.props.dataProvider}
        selectionMode="single"
        class="oj-complete"
        selected={
          this.props.selectedComponent
            ? new KeySetImpl([this.props.selectedComponent])
            : new KeySetImpl()
        }
        item={{ selectable: true }}
      >
        <template
          slot="itemTemplate"
          data-oj-as="item"
          render={this.renderOneAppComponent}
        ></template>
      </oj-list-view>
    );
  }

  private renderOneAppComponent(item: any) {
    let statusIconColor = "";
    if (item.data.status === "Running") {
      statusIconColor = "oj-icon-circle-green";
    } else if (item.data.status === "Pending") {
      statusIconColor = "oj-icon-circle-orange";
    } else {
      statusIconColor = "oj-icon-circle-red";
    }
    const statusIconOuterStyle = `oj-icon-circle oj-icon-circle-sm ${statusIconColor}`;
    return (
      <oj-list-item-layout id={"app-comp-" + item.data.name}>
        <div class="oj-flex">
          <div class="oj-sm-10 oj-flex-item">
            <div class="carditem">
              <strong>
                <span>{Messages.Labels.name()}:&nbsp;</span>
              </strong>
              <span id="{item.data.id+'_name'}">{item.data.name}</span>
            </div>
          </div>
          <div class="oj-sm-2 oj-flex-item">
            <div class="carditem">
              <a
                onClick={(evt) =>
                  item.data.eventHandler("traits", item.data.id)
                }
                onKeyPress={(evt) =>
                  item.data.eventHandler("traits", item.data.id)
                }
                tabindex="0"
              >
                {Messages.ComponentConfigLabels.traits}
              </a>
            </div>
          </div>
        </div>
        <div class="oj-flex">
          <div class="oj-sm-10 oj-flex-item compstatus">
            <div class="carditem">
              <strong>{Messages.Labels.status()}:&nbsp;</strong>
              <span id="{item.data.id+'_status'}">
                <span class={statusIconOuterStyle}>
                  <span class="oj-icon-circle-inner status-icon"></span>
                </span>
                &nbsp;
                {item.data.status}
              </span>
            </div>
          </div>
          <div class="oj-sm-2 oj-flex-item">
            <div class="carditem">
              <a
                onClick={(evt) =>
                  item.data.eventHandler("scopes", item.data.id)
                }
                onKeyPress={(evt) =>
                  item.data.eventHandler("scopes", item.data.id)
                }
                tabindex="0"
              >
                {Messages.ComponentConfigLabels.scopes}
              </a>
            </div>
          </div>
        </div>
        <div class="oj-flex">
          <div class="oj-sm-10 oj-flex-item">
            <div class="carditem">
              <strong>
                <span>{Messages.Labels.created()}:&nbsp;</span>
              </strong>
              <span id={item.data.id + "_created"}>
                {item.data.creationDate}
              </span>
            </div>
          </div>
          <div class="oj-sm-2 oj-flex-item">
            <div class="carditem">
              <a
                onClick={(evt) =>
                  item.data.eventHandler("params", item.data.id)
                }
                onKeyPress={(evt) =>
                  item.data.eventHandler("params", item.data.id)
                }
                tabindex="0"
              >
                {Messages.ComponentConfigLabels.params}
              </a>
            </div>
          </div>
        </div>
        <div class="oj-flex">
          <div class="oj-sm-12 oj-flex-item">
            <div class="carditem">
              <strong>
                <span>{Messages.Labels.oamCompRef()}:&nbsp;</span>
              </strong>
              <a
                href={
                  "/oamcomps/" +
                  item.data.oamComponent.data.metadata.uid +
                  (item.data.oamComponent.cluster &&
                  item.data.oamComponent.cluster.name !== "local"
                    ? "?cluster=" + item.data.oamComponent.cluster.name
                    : "")
                }
                tabindex="0"
              >
                {item.data.oamComponent.data.metadata.name}
              </a>
            </div>
          </div>
        </div>
        <div class="oj-flex">
          <div class="oj-sm-12 oj-flex-item">
            <div class="carditem">
              <strong>
                <span>{Messages.Labels.workload()}:&nbsp;</span>
              </strong>
              <a
                onClick={item.data.workloadOpenEventHandler}
                id={"workload_" + item.data.id}
                tabindex="0"
              >
                {item.data.oamComponent.workloadType}
              </a>
              <oj-popup
                id={"popup_" + item.data.id}
                modality="modal"
                {...{ "position.my.horizontal": "center" }}
                {...{ "position.my.vertical": "bottom" }}
                {...{ "position.at.horizontal": "center" }}
                {...{ "position.at.vertical": "bottom" }}
                {...{ "position.offset.y": "-10" }}
                tail="none"
                className="popup"
              >
                <div class="popupbody">
                  <div>
                    <a
                      onClick={item.data.workloadCloseEventHandler}
                      class="closelink"
                      tabindex="0"
                    >
                      Close
                    </a>
                  </div>
                  <pre class="popupcontent">{item.data.descriptor}</pre>
                </div>
              </oj-popup>
            </div>
          </div>
        </div>
      </oj-list-item-layout>
    );
  }
}
