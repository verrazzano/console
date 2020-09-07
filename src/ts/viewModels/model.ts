// Copyright (c) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
import "vz-console/model/loader";
import { getQueryParam } from "vz-console/utils/loader"
import * as AccUtils from "../accUtils";
class ModelViewModel {

  modelId: string | null;
  nav?: string | null;
  constructor() {
    this.modelId = getQueryParam('modelId');
    this.nav = getQueryParam('nav');
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
    AccUtils.announce("Models page loaded.");
    document.title = "Verrazzano Models";
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

export = ModelViewModel;
