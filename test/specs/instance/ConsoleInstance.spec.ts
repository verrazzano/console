// Copyright (C) 2020, 2021, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import {
  Instance,
  VerrazzanoApi,
  VMIType,
  OAMApplication,
} from "vz-console/service/loader";
import "vz-console/instance/loader";
import * as Context from "ojs/ojcontext";
import * as ko from "knockout";
import "ojs/ojknockout";
import * as sinon from "sinon";
import * as Messages from "vz-console/utils/Messages";
import { checkMetaItemLabelValue, fakeRouter } from "../../testutils";

const expect = chai.expect;
let instanceElement: HTMLElement;

const instanceUrlSuffix = "default.0.0.0.0.xip.io";
const instance = <Instance>{
  id: "0",
  elasticUrl: `https://elasticsearch.vmi.system..${instanceUrlSuffix}`,
  kibanaUrl: `https://kibana.vmi.system.default.${instanceUrlSuffix}`,
  grafanaUrl: `https://grafana.vmi.system.default.${instanceUrlSuffix}`,
  prometheusUrl: `https://prometheus.vmi.system.default.${instanceUrlSuffix}`,
  keyCloakUrl: `https://keycloak.${instanceUrlSuffix}`,
  rancherUrl: `https://rancher.${instanceUrlSuffix}`,
  mgmtCluster: "test",
  version: "1.0",
  status: "OK",
};
const sandbox = sinon.createSandbox();

async function setup(selectedItem?: string) {
  fixture.set(
    `<div id ="globalBody"><vz-console-instance id="instance" selected-item="[[selectedItem]]"/></div>`
  );
  instanceElement = document.querySelector("#instance") as HTMLElement;
  expect(instanceElement).not.to.be.null;
  ko.applyBindings(
    {
      selectedItem,
      router: fakeRouter(sandbox),
    },
    instanceElement.parentElement
  );
  await Context.getContext(instanceElement)
    .getBusyContext()
    .whenReady(30000)
    .catch((err) => {
      chai.assert.fail(err);
    });
}
describe("instance panel screen tests", () => {
  before(async () => {
    sandbox
      .stub(VerrazzanoApi.prototype, <any>"getInstance")
      .returns(Promise.resolve(instance));
    sandbox
      .stub(VerrazzanoApi.prototype, <any>"listOAMAppsAndComponents")
      .returns(Promise.resolve({}));
    await setup()
      .then(() => console.log("Instance view rendered"))
      .catch((err) => {
        chai.assert.fail(err);
      });
  });

  after(() => {
    fixture.cleanup();
    sandbox.restore();
  });

  it("renders the vmi links correctly.", async () => {
    const elasticSearchLink = instanceElement.querySelector(
      `#instance-vmi-link-${VMIType.ElasticSearch.toLocaleLowerCase()}`
    );
    expect(elasticSearchLink).not.to.be.null;

    const kibanaLink = instanceElement.querySelector(
      `#instance-vmi-link-${VMIType.Kibana.toLocaleLowerCase()}`
    );
    expect(kibanaLink).not.to.be.null;

    const grafanaLink = instanceElement.querySelector(
      `#instance-vmi-link-${VMIType.Grafana.toLocaleLowerCase()}`
    );
    expect(grafanaLink).not.to.be.null;

    const prometheusLink = instanceElement.querySelector(
      `#instance-vmi-link-${VMIType.Prometheus.toLocaleLowerCase()}`
    );
    expect(prometheusLink).not.to.be.null;

    checkMetaItemLabelValue(
      elasticSearchLink.textContent,
      Messages.Labels.es(),
      instance.elasticUrl
    );
    expect(
      elasticSearchLink.querySelector("* > a").getAttribute("href")
    ).to.equal(instance.elasticUrl);
    checkMetaItemLabelValue(
      kibanaLink.textContent,
      Messages.Labels.kibana(),
      instance.kibanaUrl
    );
    expect(kibanaLink.querySelector("* > a").getAttribute("href")).to.equal(
      instance.kibanaUrl
    );
    checkMetaItemLabelValue(
      grafanaLink.textContent,
      Messages.Labels.grafana(),
      instance.grafanaUrl
    );
    expect(grafanaLink.querySelector("* > a").getAttribute("href")).to.equal(
      instance.grafanaUrl
    );
    checkMetaItemLabelValue(
      prometheusLink.textContent,
      Messages.Labels.prom(),
      instance.prometheusUrl
    );
    expect(prometheusLink.querySelector("* > a").getAttribute("href")).to.equal(
      instance.prometheusUrl
    );
  });

  it("renders the general details and links correctly.", async () => {
    const statusMetaItem = instanceElement.querySelector(
      `#instance-status-metaitem`
    );
    expect(statusMetaItem).not.to.be.null;

    const versionMetaItem = instanceElement.querySelector(
      `#instance-version-metaitem`
    );
    expect(versionMetaItem).not.to.be.null;

    const mgmtClusterMetaItem = instanceElement.querySelector(
      `#instance-mgmtcluster-metaitem`
    );
    expect(mgmtClusterMetaItem).not.to.be.null;

    const keycloakMetaItem = instanceElement.querySelector(
      `#instance-keycloak-link`
    );
    expect(keycloakMetaItem).not.to.be.null;

    const rancherMetaItem = instanceElement.querySelector(
      `#instance-rancher-link`
    );
    expect(rancherMetaItem).not.to.be.null;

    checkMetaItemLabelValue(
      statusMetaItem.textContent,
      Messages.Labels.status(),
      instance.status
    );
    checkMetaItemLabelValue(
      versionMetaItem.textContent,
      Messages.Labels.version(),
      instance.version
    );
    checkMetaItemLabelValue(
      mgmtClusterMetaItem.textContent,
      Messages.Labels.mgmtCluster(),
      instance.mgmtCluster
    );
    checkMetaItemLabelValue(
      keycloakMetaItem.textContent,
      Messages.Labels.keycloak(),
      instance.keyCloakUrl
    );
    checkMetaItemLabelValue(
      rancherMetaItem.textContent,
      Messages.Labels.rancher(),
      instance.rancherUrl
    );
    expect(
      keycloakMetaItem.querySelector("* > a").getAttribute("href")
    ).to.equal(instance.keyCloakUrl);
    expect(
      rancherMetaItem.querySelector("* > a").getAttribute("href")
    ).to.equal(instance.rancherUrl);
  });

  it("renders the status badge correctly.", async () => {
    const badge = instanceElement.querySelector(`.badge-hexagon`);
    expect(badge).not.to.be.null;

    const badgeLabel = instanceElement.querySelector(
      `.status-badge-status-label`
    );
    expect(badgeLabel).not.to.be.null;
    expect(badgeLabel.textContent).to.equal(Messages.Nav.instance());
  });
});
