// Copyright (C) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import {
  BindingComponent,
  ComponentType,
  Status,
} from "vz-console/service/loader";
import "vz-console/binding-components/loader";
import * as Context from "ojs/ojcontext";
import * as ko from "knockout";
import "ojs/ojknockout";

const expect = chai.expect;
let componentsElement: HTMLElement;

async function setup(components: BindingComponent[]) {
  fixture.set(
    `<div id ="component-holder"><vz-console-binding-components id="binding-components" components="[[components]]"/></div>`
  );
  componentsElement = document.querySelector(
    "#binding-components"
  ) as HTMLElement;
  expect(componentsElement).not.to.be.null;
  ko.applyBindings(
    {
      components,
    },
    componentsElement
  );
  await Context.getContext(componentsElement)
    .getBusyContext()
    .whenReady(30000)
    .catch((err) => {
      console.log(err);
    });
}
describe("generic binding component tests", () => {
  const component = <BindingComponent>{
    id: "GenericComponent1",
    images: ["image1", "image2"],
    name: "GenericComponent1",
    placement: { cluster: "local", namespace: "test" },
    status: Status.Running,
    type: ComponentType.GEN,
  };
  before(async () => await setup([component]));
  it("renders the generic binding component correctly.", async () => {
    expect(
      componentsElement.querySelector(`#${component.id}_name`).textContent
    ).to.equal(component.name);
    expect(
      componentsElement.querySelector(`#${component.id}_type`).textContent
    ).to.equal(component.type);
    expect(
      componentsElement.querySelector(`#${component.id}_ns`).textContent
    ).to.equal(component.placement.namespace);
    expect(
      componentsElement.querySelector(`#${component.id}_cluster`).textContent
    ).to.equal(component.placement.cluster);
    expect(
      componentsElement
        .querySelector(`#${component.id}_status`)
        .textContent.trim()
    ).to.equal(component.status);
    expect(
      componentsElement
        .querySelector(`#${component.id}_images`)
        .querySelectorAll("li").length
    ).to.be.equal(component.images.length);
    componentsElement
      .querySelector(`#${component.id}_images`)
      .querySelectorAll("li")
      .forEach((element) => {
        expect(component.images).contains(element.textContent);
      });
  });
  afterEach(() => fixture.cleanup());
});
