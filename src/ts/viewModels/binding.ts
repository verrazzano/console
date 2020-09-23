// Copyright (c) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
import "vz-console/binding/loader";
import { getQueryParam } from "vz-console/utils/loader";
import * as AccUtils from "../accUtils";
import * as Messages from "vz-console/utils/Messages";
class BindingViewModel {
  bindingId: string | null;
  selectedItem: string | null;
  constructor() {
    this.bindingId = getQueryParam("bindingId");
    this.selectedItem = getQueryParam("selectedItem");
  }

  /**
   * Optional ViewModel method invoked after the View is inserted into the
   * document DOM.  The application can put logic that requires the DOM being
   * attached here.
   * This method might be called multiple times - after the View is created
   * and inserted into the DOM and after the View is reconnected
   * after being disconnected.
   */
  connected(): void {
    AccUtils.announce(Messages.Binding.bindingsPageLoaded());
    document.title = "Verrazzano Binding";
  }

  /**
   * Optional ViewModel method invoked after the View is disconnected from the DOM.
   */
  disconnected(): void {
    // implement if needed
  }

  /**
   * Optional ViewModel method invoked after transition to the new View is complete.
   * That includes any possible animation between the old and the new View.
   */
  transitionCompleted(): void {
    // implement if needed
  }
}

export = BindingViewModel;
