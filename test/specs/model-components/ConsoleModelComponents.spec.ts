// Copyright (C) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { Component, ComponentType } from 'vz-console/service/loader'
import 'vz-console/model-components/loader';
import * as Context from 'ojs/ojcontext';
import * as ko from 'knockout';
import 'ojs/ojknockout';

const expect = chai.expect;
let componentsElement: HTMLElement;

async function setup(components: Component[]) {
  fixture.set(`<div id ="component-holder"><vz-console-model-components id="model-components" components="[[components]]"/></div>`);
  componentsElement = document.querySelector('#model-components') as HTMLElement;
  expect(componentsElement).not.to.be.null;
  ko.applyBindings({
    components
  }, componentsElement);
  await Context.getContext(componentsElement).getBusyContext().whenReady(50000).catch((err) => { console.log(err) }).finally();
}
describe('generic model component tests', () => {
  const component = <Component>{
    id: "GenericComponent1",
    images: ["image1", "image2"],
    name: "GenericComponent1",
    type: ComponentType.GEN,
  }
  before(async () => await setup([component]));
  it('renders the generic component correctly.', async () => {
    expect(componentsElement.querySelector(`#${component.id}_name`).textContent).to.equal(component.name)
    expect(componentsElement.querySelector(`#${component.id}_type`).textContent).to.equal(component.type)
    expect(componentsElement.querySelector(`#${component.id}_images`).querySelectorAll("li").length).to.be.equal(component.images.length)
    componentsElement.querySelector(`#${component.id}_images`).querySelectorAll("li").forEach((element) => {
      expect(component.images).contains(element.textContent)
    })
  });
  afterEach(() => fixture.cleanup());

});