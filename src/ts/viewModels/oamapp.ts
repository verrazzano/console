// Copyright (c) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
import "vz-console/oamapp/loader";
import { getQueryParam } from "vz-console/utils/loader";
import * as AccUtils from "../accUtils";
class ModelViewModel {
  oamAppId: string | null;
  selectedItem: string | null;
  selectedComponent: string | null;
  constructor() {
    this.oamAppId = getQueryParam("oamAppId");
    this.selectedItem = getQueryParam("selectedItem");
    this.selectedComponent = getQueryParam("selectedComponent");
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
    AccUtils.announce("OAM Application page loaded.");
    document.title = "OAM Applications";
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
