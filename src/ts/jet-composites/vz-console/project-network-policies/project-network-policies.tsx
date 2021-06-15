// Copyright (c) 2021, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

// eslint-disable-next-line no-unused-vars
import { ElementVComponent, customElement, h } from "ojs/ojvcomponent-element";
import * as Model from "ojs/ojmodel";
import "ojs/ojtable";
import "ojs/ojlistview";
import "ojs/ojselectsingle";
import "ojs/ojpagingcontrol";
import "ojs/ojlistitemlayout";
import * as yaml from "js-yaml";
import * as ko from "knockout";
import { ConsoleMetadataItem } from "vz-console/metadata-item/metadata-item";
import * as Messages from "vz-console/utils/Messages";
import {
  LabelSelectorRequirement,
  NetworkPolicy,
} from "vz-console/service/types";
import PagingDataProviderView = require("ojs/ojpagingdataproviderview");
import CollectionDataProvider = require("ojs/ojcollectiondataprovider");
import ArrayDataProvider = require("ojs/ojarraydataprovider");

class Props {
  networkPolicies?: NetworkPolicy[];
}

class State {
  networkPolicies?: Model.Collection;
}

class NetworkPolicyModel {
  name: string;
  policyTypes: ArrayDataProvider<string, string>;
  matchLabels: ArrayDataProvider<string, string>;
  matchExpressions: ArrayDataProvider<string, LabelSelectorRequirement>;
  ingressRules: ArrayDataProvider<string, string>;
  egressRules: ArrayDataProvider<string, string>;
  constructor(netPol: NetworkPolicy) {
    this.name = netPol.name;
    this.policyTypes = new ArrayDataProvider<string, string>(
      netPol.policyTypes || []
    );
    const matchLabels = netPol?.labelPodSelectors;
    const matchLabelsArray = ko.observableArray([]);
    if (matchLabels) {
      for (const matchLabelsKey in matchLabels) {
        matchLabelsArray.push(
          `${matchLabelsKey}: ${matchLabels[matchLabelsKey]}`
        );
      }
    }
    this.matchLabels = new ArrayDataProvider<string, string>(matchLabelsArray);

    const matchExpressions = netPol.expressionPodSelectors;
    const matchExpressionsArray = ko.observableArray(matchExpressions || []);
    this.matchExpressions = new ArrayDataProvider<
      string,
      LabelSelectorRequirement
    >(matchExpressionsArray);

    const ingressRules = netPol.ingressRules;
    const ingressRulesStrArray = [];
    for (const idx in ingressRules) {
      const irule = ingressRules[idx];
      const portsStr = irule.ports?.join(", ") || "";
      let fromInfo = "";
      if (irule.hasFrom) {
        fromInfo = Messages.Project.netPolFromInfo();
      }
      ingressRulesStrArray.push(
        `${Messages.Project.netPolPorts()} [${portsStr}] ${fromInfo}`
      );
    }
    const ingressArray = ko.observableArray(ingressRulesStrArray);
    this.ingressRules = new ArrayDataProvider<string, string>(ingressArray);

    const egressRules = netPol.egressRules;
    const egressRulesStrArray = [];
    for (const idx in egressRules) {
      const erule = egressRules[idx];
      const portsStr = erule.ports?.join(", ") || "";
      let toInfo = "";
      if (erule.hasTo) {
        toInfo = Messages.Project.netPolToInfo();
      }
      egressRulesStrArray.push(
        `${Messages.Project.netPolPorts()} [${portsStr}] ${toInfo}`
      );
    }
    const egressArray = ko.observableArray(egressRulesStrArray);
    this.egressRules = new ArrayDataProvider<string, string>(egressArray);
  }
}
/**
 * @ojmetadata pack "vz-console"
 */
@customElement("vz-console-project-network-policies")
export class ConsoleProjectNetworkPolicies extends ElementVComponent<
  Props,
  State
> {
  state: State = {};
  dataProvider: ko.Observable = ko.observable();

  protected mounted() {
    const models: Model.Model[] = [];
    this.props.networkPolicies.forEach((netPol) => {
      models.push(new Model.Model(new NetworkPolicyModel(netPol)));
    });
    this.updateState({
      networkPolicies: new Model.Collection(models),
    });
  }

  protected render() {
    this.dataProvider(
      new PagingDataProviderView(
        new CollectionDataProvider(
          this.state.networkPolicies
            ? this.state.networkPolicies
            : new Model.Collection([])
        )
      )
    );

    return (
      <div id="components" class="oj-flex component-margin">
        <div class="oj-flex">
          <div class="oj-sm-12 oj-flex-item">{this.renderLinkToYaml()}</div>
        </div>
        {this.renderPopup("netPolYaml", this.props.networkPolicies)}
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
                ariaLabel="project security"
                data={this.dataProvider()}
                selectionMode="single"
                class="oj-complete"
                item={{ selectable: true }}
              >
                <template slot="itemTemplate" data-oj-as="item">
                  <oj-list-item-layout>
                    <div class="oj-flex oj-sm-12">
                      <div class="oj-sm-6 oj-flex-item">
                        <div class="oj-flex-item">
                          <strong>
                            <span>{Messages.Labels.name()}:&nbsp;</span>
                          </strong>
                          <span>
                            <oj-bind-text value="[[item.data.name]]"></oj-bind-text>
                          </span>
                        </div>
                        <div class="oj-sm-12">
                          <strong>
                            <span>
                              {Messages.Project.netPolLabelSelector()}:&nbsp;
                            </span>
                          </strong>
                          <ul>
                            <oj-bind-for-each data="[[item.data.matchLabels]]">
                              <template>
                                <li>
                                  <oj-bind-text value="[[$current.data]]"></oj-bind-text>
                                </li>
                              </template>
                            </oj-bind-for-each>
                          </ul>
                        </div>
                        <div class="oj-sm-12">
                          <strong>
                            <span>
                              {Messages.Project.netPolExpressionSelector()}
                              :&nbsp;
                            </span>
                          </strong>
                          <ul>
                            <oj-bind-for-each data="[[item.data.matchExpressions]]">
                              <template>
                                <li>
                                  <oj-bind-text value="[[$current.data.key]]"></oj-bind-text>
                                  <oj-bind-text value="[[$current.data.operator]]"></oj-bind-text>
                                  <oj-bind-text value="[[$current.data.values]]"></oj-bind-text>
                                </li>
                              </template>
                            </oj-bind-for-each>
                          </ul>
                        </div>
                        <div class="oj-sm-12">
                          <strong>
                            <span>
                              {Messages.Project.netPolPolicyTypes()}:&nbsp;
                            </span>
                          </strong>
                          <ul>
                            <oj-bind-for-each data="[[item.data.policyTypes]]">
                              <template>
                                <li>
                                  <oj-bind-text value="[[$current.data]]"></oj-bind-text>
                                </li>
                              </template>
                            </oj-bind-for-each>
                          </ul>
                        </div>
                      </div>
                      <div class="oj-sm-6 oj-flex-item">
                        <div class="oj-sm-12">
                          <strong>
                            <span>
                              {Messages.Project.netPolIngressRules()}:&nbsp;
                            </span>
                          </strong>
                          <ul>
                            <oj-bind-for-each data="[[item.data.ingressRules]]">
                              <template>
                                <li>
                                  <oj-bind-text value="[[$current.data]]"></oj-bind-text>
                                </li>
                              </template>
                            </oj-bind-for-each>
                          </ul>
                        </div>
                        <div class="oj-sm-12">
                          <strong>
                            <span>
                              {Messages.Project.netPolEgressRules()}:&nbsp;
                            </span>
                          </strong>
                          <ul>
                            <oj-bind-for-each data="[[item.data.egressRules]]">
                              <template>
                                <li>
                                  <oj-bind-text value="[[$current.data]]"></oj-bind-text>
                                </li>
                              </template>
                            </oj-bind-for-each>
                          </ul>
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
    );
  }

  private renderPopup(popupId: string, popupContent: any) {
    return (
      <oj-popup
        id={popupId}
        tail="none"
        modality="modal"
        {...{ "position.my.horizontal": "center" }}
        {...{ "position.my.vertical": "bottom" }}
        {...{ "position.at.horizontal": "center" }}
        {...{ "position.at.vertical": "bottom" }}
        {...{ "position.offset.y": "-10px" }}
        className="popup"
      >
        <div class="popupbody">
          <div>
            <a
              onClick={() => {
                (document.getElementById(popupId) as any).close();
              }}
              class="closelink"
            >
              Close
            </a>
          </div>
          <pre class="popupcontent">
            {yaml.dump(yaml.load(JSON.stringify(popupContent)))}
          </pre>
        </div>
      </oj-popup>
    );
  }

  private renderLinkToYaml() {
    if (this.props.networkPolicies && this.props.networkPolicies.length > 0) {
      return (
        <ConsoleMetadataItem
          label=""
          value={Messages.Project.netPolViewYaml()}
          link={true}
          onclick={() => {
            (document.getElementById("netPolYaml") as any).open("#viewNetPol");
          }}
          id="viewNetPol"
        />
      );
    }
    return "";
  }
}
