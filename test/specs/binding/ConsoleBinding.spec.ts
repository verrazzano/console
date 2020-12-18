// Copyright (C) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import {
  Binding,
  Instance,
  VerrazzanoApi,
  Secret,
  getVmiInstancesForBinding,
  VMIType,
} from "vz-console/service/loader";
import "vz-console/binding/loader";
import * as Context from "ojs/ojcontext";
import * as ko from "knockout";
import "ojs/ojknockout";
import * as sinon from "sinon";
import { checkMetaItemLabelValue, fakeRouter } from "../../testutils";
import * as Messages from "vz-console/utils/Messages";

const expect = chai.expect;
let bindingElement: HTMLElement;

const instanceIp = "0.0.0.0";
const instance = <Instance>{
  id: "0",
  elasticUrl: `https://elasticsearch.vmi.system.default.${instanceIp}.xip.io`,
  kibanaUrl: `https://kibana.vmi.system.default.${instanceIp}.xip.io`,
  grafanaUrl: `https://grafana.vmi.system.default.${instanceIp}.xip.io`,
  prometheusUrl: `https://prometheus.vmi.system.default.${instanceIp}.xip.io`,
};
const instanceUsingSharedVMI = <Instance>{
  ...instance,
  isUsingSharedVMI: true,
};
const bindings = {
  test: (isUsingSharedVMI: boolean) => {
    console.log(isUsingSharedVMI);
    return <Binding>{
      id: "test",
      name: "test-binding",
      description: "test",
      model: { id: "test", modelComponents: [] },
      components: [],
      vmiInstances: getVmiInstancesForBinding(
        "test-binding",
        isUsingSharedVMI ? instanceUsingSharedVMI : instance
      ),
    };
  },
};
const secrets: [Secret] = [
  {
    id: "test secret",
    name: "test secret",
    namespace: "test ns",
    status: "",
    type: "",
  },
];
const sandbox = sinon.createSandbox();

async function setup(bindingId: string) {
  fixture.set(
    `<div id ="globalBody"><vz-console-binding id="binding" binding-id="[[bindingId]]"/></div>`
  );
  bindingElement = document.querySelector("#binding") as HTMLElement;
  expect(bindingElement).not.to.be.null;
  ko.applyBindings(
    {
      bindingId,
      router: fakeRouter(sandbox),
    },
    bindingElement.parentElement
  );
  await Context.getContext(bindingElement)
    .getBusyContext()
    .whenReady(30000)
    .catch((err) => {
      chai.assert.fail(err);
    });
}
describe("binding vmi links test", () => {
  before(async () => {
    sandbox
      .stub(VerrazzanoApi.prototype, <any>"getInstance")
      .returns(Promise.resolve(instance));
    sandbox
      .stub(VerrazzanoApi.prototype, <any>"getBinding")
      .returns(bindings.test(false));
    sandbox.stub(VerrazzanoApi.prototype, <any>"listSecrets").returns(secrets);
    await setup("test")
      .then(() => console.log("Binding view rendered"))
      .catch((err) => {
        chai.assert.fail(err);
      });
  });

  after(() => {
    fixture.cleanup();
    sandbox.restore();
  });

  it("renders the binding vmi links correctly.", async () => {
    const elasticSearchMetaItem = bindingElement.querySelector(
      `#binding-vmi-link-${VMIType.ElasticSearch.toLocaleLowerCase()}`
    );
    expect(elasticSearchMetaItem).not.to.be.null;

    const kibanaMetaItem = bindingElement.querySelector(
      `#binding-vmi-link-${VMIType.Kibana.toLocaleLowerCase()}`
    );
    expect(kibanaMetaItem).not.to.be.null;

    const grafanaMetaItem = bindingElement.querySelector(
      `#binding-vmi-link-${VMIType.Grafana.toLocaleLowerCase()}`
    );
    expect(grafanaMetaItem).not.to.be.null;

    const prometheusMetaitem = bindingElement.querySelector(
      `#binding-vmi-link-${VMIType.Prometheus.toLocaleLowerCase()}`
    );
    expect(prometheusMetaitem).not.to.be.null;

    const bindingName = bindings.test(false).name;
    const elasticSearchUrl = instance.elasticUrl.replace(
      ".vmi.system.",
      `.vmi.${bindingName.toLowerCase()}.`
    );
    const kibanaUrl = instance.kibanaUrl.replace(
      ".vmi.system.",
      `.vmi.${bindingName.toLowerCase()}.`
    );
    const grafanaUrl = instance.grafanaUrl.replace(
      ".vmi.system.",
      `.vmi.${bindingName.toLowerCase()}.`
    );
    const prometheusUrl = instance.prometheusUrl.replace(
      ".vmi.system.",
      `.vmi.${bindingName.toLowerCase()}.`
    );

    checkMetaItemLabelValue(
      elasticSearchMetaItem.textContent,
      Messages.Labels.es(),
      elasticSearchUrl
    );
    expect(
      elasticSearchMetaItem.querySelector("* > a").getAttribute("href")
    ).to.equal(elasticSearchUrl);
    checkMetaItemLabelValue(
      kibanaMetaItem.textContent,
      Messages.Labels.kibana(),
      kibanaUrl
    );
    expect(kibanaMetaItem.querySelector("* > a").getAttribute("href")).to.equal(
      kibanaUrl
    );
    checkMetaItemLabelValue(
      grafanaMetaItem.textContent,
      Messages.Labels.grafana(),
      grafanaUrl
    );
    expect(
      grafanaMetaItem.querySelector("* > a").getAttribute("href")
    ).to.equal(grafanaUrl);
    checkMetaItemLabelValue(
      prometheusMetaitem.textContent,
      Messages.Labels.prom(),
      prometheusUrl
    );
    expect(
      prometheusMetaitem.querySelector("* > a").getAttribute("href")
    ).to.equal(prometheusUrl);
  });
});

describe("binding vmi links test for instance using shared vmi", () => {
  before(async () => {
    sandbox
      .stub(VerrazzanoApi.prototype, <any>"getInstance")
      .returns(Promise.resolve(instanceUsingSharedVMI));
    sandbox
      .stub(VerrazzanoApi.prototype, <any>"getBinding")
      .returns(bindings.test(true));
    sandbox.stub(VerrazzanoApi.prototype, <any>"listSecrets").returns(secrets);
    await setup("test")
      .then(() => console.log("Binding view rendered"))
      .catch((err) => {
        chai.assert.fail(err);
      });
  });

  after(() => {
    fixture.cleanup();
    sandbox.restore();
  });

  it("renders the binding vmi links correctly for shared vmi correctly.", async () => {
    const elasticSearchMetaItem = bindingElement.querySelector(
      `#binding-vmi-link-${VMIType.ElasticSearch.toLocaleLowerCase()}`
    );
    expect(elasticSearchMetaItem).not.to.be.null;

    const kibanaMetaItem = bindingElement.querySelector(
      `#binding-vmi-link-${VMIType.Kibana.toLocaleLowerCase()}`
    );
    expect(kibanaMetaItem).not.to.be.null;

    const grafanaMetaItem = bindingElement.querySelector(
      `#binding-vmi-link-${VMIType.Grafana.toLocaleLowerCase()}`
    );
    expect(grafanaMetaItem).not.to.be.null;

    const prometheusMetaitem = bindingElement.querySelector(
      `#binding-vmi-link-${VMIType.Prometheus.toLocaleLowerCase()}`
    );
    expect(prometheusMetaitem).not.to.be.null;

    checkMetaItemLabelValue(
      elasticSearchMetaItem.textContent,
      Messages.Labels.es(),
      instanceUsingSharedVMI.elasticUrl
    );
    expect(
      elasticSearchMetaItem.querySelector("* > a").getAttribute("href")
    ).to.equal(instanceUsingSharedVMI.elasticUrl);
    checkMetaItemLabelValue(
      kibanaMetaItem.textContent,
      Messages.Labels.kibana(),
      instanceUsingSharedVMI.kibanaUrl
    );
    expect(kibanaMetaItem.querySelector("* > a").getAttribute("href")).to.equal(
      instanceUsingSharedVMI.kibanaUrl
    );
    checkMetaItemLabelValue(
      grafanaMetaItem.textContent,
      Messages.Labels.grafana(),
      instanceUsingSharedVMI.grafanaUrl
    );
    expect(
      grafanaMetaItem.querySelector("* > a").getAttribute("href")
    ).to.equal(instanceUsingSharedVMI.grafanaUrl);
    checkMetaItemLabelValue(
      prometheusMetaitem.textContent,
      Messages.Labels.prom(),
      instanceUsingSharedVMI.prometheusUrl
    );
    expect(
      prometheusMetaitem.querySelector("* > a").getAttribute("href")
    ).to.equal(instanceUsingSharedVMI.prometheusUrl);
  });
});
