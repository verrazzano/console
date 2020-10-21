// Copyright (C) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { Binding, Instance, VerrazzanoApi, Secret, getVmiInstancesForBinding, VMIType } from 'vz-console/service/loader'
import 'vz-console/binding/loader';
import * as Context from 'ojs/ojcontext';
import * as ko from 'knockout';
import 'ojs/ojknockout';
import * as sinon from 'sinon';

const expect = chai.expect;
let bindingElement: HTMLElement;

const instanceIp = "0.0.0.0"
const instance = <Instance>{
  id: "0",
  elasticUrl: `https://elasticsearch.vmi.system.default.${instanceIp}.xip.io`,
  kibanaUrl: `https://kibana.vmi.system.default.${instanceIp}.xip.io`,
  grafanaUrl: `https://grafana.vmi.system.default.${instanceIp}.xip.io`,
  prometheusUrl: `https://prometheus.vmi.system.default.${instanceIp}.xip.io`,
}
const bindings = {
  test: <Binding>{
    id: "test",
    name: "test-binding",
    description: "test",
    model: { id: "test", modelComponents: [] },
    components: [],
    vmiInstances: getVmiInstancesForBinding("test-binding", instance)
  }
}
const secrets: [Secret] = [{
  id: "test secret",
  name: "test secret",
  namespace: "test ns",
  status: "",
  type: ""
}]

async function setup(bindingId: string) {
  fixture.set(`<div id ="binding-holder"><vz-console-binding id="binding" binding-id="[[bindingId]]"/></div>`);
  bindingElement = document.querySelector('#binding') as HTMLElement;
  expect(bindingElement).not.to.be.null;
  ko.applyBindings({
    bindingId
  }, bindingElement);
  await Context.getContext(bindingElement).getBusyContext().whenReady(30000).catch((err) => { console.log(err) });
}
describe('binding vmi links test', () => {
  const stubGetInstance = sinon.stub(VerrazzanoApi.prototype, <any>"getInstance");
  const stubGetBinding = sinon.stub(VerrazzanoApi.prototype, <any>"getBinding");
  const stubListSecrets = sinon.stub(VerrazzanoApi.prototype, <any>"listSecrets");
  stubGetInstance.returns(Promise.resolve(instance));
  stubGetBinding.returns(bindings.test);
  stubListSecrets.returns(secrets)
  before(async () => await setup("test"));

  it('renders the binding vmi links correctly.', async () => {
    const elasticSearchLink = bindingElement.querySelector(`#binding-vmi-link-${VMIType.ElasticSearch.toLocaleLowerCase()} > * > a`);
    expect(elasticSearchLink).not.to.be.null;

    const kibanaLink = bindingElement.querySelector(`#binding-vmi-link-${VMIType.Kibana.toLocaleLowerCase()} > * > a`);
    expect(kibanaLink).not.to.be.null;

    const grafanaLink = bindingElement.querySelector(`#binding-vmi-link-${VMIType.Grafana.toLocaleLowerCase()} > * > a`);
    expect(grafanaLink).not.to.be.null;

    const prometheusLink = bindingElement.querySelector(`#binding-vmi-link-${VMIType.Prometheus.toLocaleLowerCase()} > * > a`);
    expect(prometheusLink).not.to.be.null;

    const elasticSearchUrl = instance.elasticUrl.replace(
      ".vmi.system.",
      `.vmi.${bindings.test.name.toLowerCase()}.`
    )
    const kibanaUrl = instance.kibanaUrl.replace(
      ".vmi.system.",
      `.vmi.${bindings.test.name.toLowerCase()}.`
    )
    const grafanaUrl = instance.grafanaUrl.replace(
      ".vmi.system.",
      `.vmi.${bindings.test.name.toLowerCase()}.`
    )
    const prometheusUrl = instance.prometheusUrl.replace(
      ".vmi.system.",
      `.vmi.${bindings.test.name.toLowerCase()}.`
    )

    expect(elasticSearchLink.textContent).to.equal(elasticSearchUrl);
    expect(elasticSearchLink.getAttribute("href")).to.equal(elasticSearchUrl);
    expect(kibanaLink.textContent).to.equal(kibanaUrl);
    expect(kibanaLink.getAttribute("href")).to.equal(kibanaUrl);
    expect(grafanaLink.textContent).to.equal(grafanaUrl);
    expect(grafanaLink.getAttribute("href")).to.equal(grafanaUrl);
    expect(prometheusLink.textContent).to.equal(prometheusUrl);
    expect(prometheusLink.getAttribute("href")).to.equal(prometheusUrl);
  });
  afterEach(() => fixture.cleanup());

});
