// Copyright (C) 2021, 2022, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { By } from "selenium-webdriver";
import { Wait, PAGE_LOAD_TIMEOUT } from "../../utils/Wait";
import {Actions} from "../../utils/Actions";

/**
 * Page Object Model for Prometheus main page
 */
export class PrometheusMainPage {
  private static readonly HEADER_CONTAINER: By = By.className("navbar");

  private static readonly PROMETHEUS_PANEL: By = By.id("graph_container");

  private static readonly ADD_GRAPH_BUTTON: By = By.id("add_graph");

  // Link to Classic UI
  private static readonly CLASSIC_UI_LINK = By.linkText("Classic UI");

  protected pageUrl: string = "/";
  protected pageLoadedElement: By = PrometheusMainPage.HEADER_CONTAINER;

  public async isPageLoaded(
    timeOut: number = PAGE_LOAD_TIMEOUT
  ): Promise<boolean> {
    return this.waitForHeader();
  }

  /* Wait for header */
  public async waitForHeader(): Promise<boolean> {
    try {
      await Wait.waitForPresent(PrometheusMainPage.HEADER_CONTAINER);
      // If navbar has "Classic UI" link, means it is 2.3.1, click on it, and wait for header again
      // else, it is older version
      try {
        await Actions.doClick(PrometheusMainPage.CLASSIC_UI_LINK)
        await Wait.waitForPresent(PrometheusMainPage.HEADER_CONTAINER);
      } catch (error) {
        console.log("No Classic UI link in older version of Prometheus")
      }
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  /* Wait for Prometheus panel */
  public async waitForPrometheusPanel(): Promise<boolean> {
    try {
      await Wait.waitForPresent(PrometheusMainPage.PROMETHEUS_PANEL);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  /* Wait for add graph button */
  public async waitForAddGraphButton(): Promise<boolean> {
    try {
      await Wait.waitForPresent(PrometheusMainPage.ADD_GRAPH_BUTTON);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}
