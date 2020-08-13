// Copyright (c) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.


/**
 * Method for sending notifications to the aria-live region for Accessibility.
 * Sending a notice when the page is loaded, as well as changing the page title
 * is considered best practice for making Single Page Applications Accessbible.
 */

let validAriaLiveValues: string[] = ["off", "polite", "assertive"];

export function announce(message: string, manner?: string): void {
  if (manner === undefined || validAriaLiveValues.indexOf(manner) === -1) {
    manner = "polite";
  }

  let params: {
    bubbles: boolean;
    detail: { message: string, manner: string };
  } = {
    "bubbles": true,
    "detail": { "message": message, "manner": manner }
  };

  let globalBodyElement: HTMLElement = document.getElementById("globalBody") as HTMLElement;
  globalBodyElement.dispatchEvent(new CustomEvent("announce", params));
}