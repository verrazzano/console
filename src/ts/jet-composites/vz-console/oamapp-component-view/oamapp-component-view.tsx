// Copyright (c) 2021, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

// eslint-disable-next-line no-unused-vars
import { VComponent, customElement, h } from "ojs/ojvcomponent";

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
export class ConsoleOAMAppComponentView extends VComponent<Props> {
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
        item={{ focusable: false }}
      >
        <template slot="itemTemplate" data-oj-as="item">
          <oj-list-item-layout>
            <div class="oj-flex">
              <div class="oj-sm-10 oj-flex-item">
                <strong>
                  <span>{Messages.Labels.name()}:&nbsp;</span>
                </strong>
                <span data-bind="attr: { id: item.data.id+'_name' }">
                  <oj-bind-text value="[[item.data.name]]"></oj-bind-text>
                </span>
              </div>
              <div class="oj-sm-2 oj-flex-item">
                <a
                  data-bind="event: { click: () => {item.data.eventHandler('traits', item.data.id)} }"
                  tabindex="0"
                >
                  {Messages.ComponentConfigLabels.traits}
                </a>
              </div>
            </div>
            <div class="oj-flex">
              <div class="oj-sm-10 oj-flex-item compstatus">
                <strong>{Messages.Labels.status()}:&nbsp;</strong>
                <span data-bind="attr: { id: item.data.id+'_status' }">
                  <oj-bind-if test="[[item.data.status === 'Running']]">
                    <span class="oj-icon-circle oj-icon-circle-sm oj-icon-circle-green">
                      <span class="oj-icon-circle-inner status-icon"></span>
                    </span>
                  </oj-bind-if>
                  <oj-bind-if test="[[item.data.status === 'Terminated']]">
                    <span class="oj-icon-circle oj-icon-circle-sm oj-icon-circle-red">
                      <span class="oj-icon-circle-inner status-icon"></span>
                    </span>
                  </oj-bind-if>
                  <oj-bind-if test="[[item.data.status === 'Pending']]">
                    <span class="oj-icon-circle oj-icon-circle-sm oj-icon-circle-orange">
                      <span class="oj-icon-circle-inner status-icon"></span>
                    </span>
                  </oj-bind-if>
                  &nbsp;
                  <oj-bind-text value="[[item.data.status]]"></oj-bind-text>
                </span>
              </div>
              <div class="oj-sm-2 oj-flex-item">
                <a
                  data-bind="event: { click: () => {item.data.eventHandler('scopes', item.data.id)} }"
                  tabindex="0"
                >
                  {Messages.ComponentConfigLabels.scopes}
                </a>
              </div>
            </div>
            <div class="oj-flex">
              <div class="oj-sm-10 oj-flex-item">
                <strong>
                  <span>{Messages.Labels.created()}:&nbsp;</span>
                </strong>
                <span data-bind="attr: { id: item.data.id+'_created' }">
                  <oj-bind-text value="[[item.data.creationDate]]"></oj-bind-text>
                </span>
              </div>
              <div class="oj-sm-2 oj-flex-item">
                <a
                  data-bind="event: { click: () => {item.data.eventHandler('params', item.data.id)} }"
                  tabindex="0"
                >
                  {Messages.ComponentConfigLabels.params}
                </a>
              </div>
            </div>
            <div class="oj-flex">
              <div class="oj-sm-12 oj-flex-item">
                <strong>
                  <span>{Messages.Labels.oamCompRef()}:&nbsp;</span>
                </strong>
                <a
                  data-bind={`attr: {href: '/oamcomps/' + item.data.oamComponent.data.metadata.uid + '?cluster=' + (item.data.cluster && item.data.cluster.name !== 'local' ? ('?cluster=' + item.data.cluster.name) : '')}`}
                  tabindex="0"
                >
                  <oj-bind-text value="[[item.data.oamComponent.data.metadata.name]]"></oj-bind-text>
                </a>
              </div>
            </div>
            <div class="oj-flex">
              <div class="oj-sm-12 oj-flex-item">
                <strong>
                  <span>{Messages.Labels.workload()}:&nbsp;</span>
                </strong>
                <a
                  data-bind="event: { click: () => {item.data.workloadOpenEventHandler()} }, attr: {id: 'workload_' + item.data.id}"
                  tabindex="0"
                >
                  <oj-bind-text value="[[item.data.oamComponent.workloadType]]"></oj-bind-text>
                </a>
                <oj-popup
                  data-bind={`attr: {id: 'popup_' + item.data.id}`}
                  modality="modal"
                  {...{ "position.my.horizontal": "center" }}
                  {...{ "position.my.vertical": "bottom" }}
                  {...{ "position.at.horizontal": "center" }}
                  {...{ "position.at.vertical": "bottom" }}
                  {...{ "position.offset.y": "-10" }}
                  tail="none"
                  class="popup"
                >
                  <div class="popupbody">
                    <div>
                      <a
                        data-bind="event: { click: () => {item.data.workloadCloseEventHandler()} }"
                        class="closelink"
                        tabindex="0"
                      >
                        Close
                      </a>
                    </div>
                    <pre class="popupcontent">
                      <oj-bind-text value="[[item.data.descriptor]]"></oj-bind-text>
                    </pre>
                  </div>
                </oj-popup>
              </div>
            </div>
          </oj-list-item-layout>
        </template>
      </oj-list-view>
    );
  }
}
