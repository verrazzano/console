// Copyright (C) 2020, 2021, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { By } from "selenium-webdriver";
import { Wait, PAGE_LOAD_TIMEOUT } from "../../utils/Wait";
import { Actions } from "../../utils/Actions";

/**
 * Page Object Model for Verrazzano Console main page
 */
export class ConsoleMainPage {
  private static readonly FOOTER_CONTAINER: By = By.className(
    "oj-web-applayout-footer-item"
  );

  private static readonly INSTANCE_STATUS_ITEM: By = By.id(
    "instance-status-metaitem"
  );

  private static readonly INSTANCE_VERSION_ITEM: By = By.id(
    "instance-version-metaitem"
  );

  private static readonly INSTANCE_PROFILE_ITEM: By = By.id(
    "instance-profile-metaitem"
  );

  // vz-console-instance is the outer envelope of the "body" of the main page
  // if this exists, it means the content (i.e. not just header and footer) are rendered
  private static readonly INSTANCE_BODY_OUTER_ELEM = By.css(
    "vz-console-instance"
  );

  // Link to Grafana console
  private static readonly GRAFANA_URL_LINK = By.xpath(
    `//*[@id="instance-vmi-link-grafana"]/div/a`
  );

  // Link to Kibana console
  private static readonly KIBANA_URL_LINK = By.xpath(
    `//*[@id="instance-vmi-link-kibana"]/div/a`
  );

  // Link to Prometheus console
  private static readonly PROMETHEUS_URL_LINK = By.xpath(
    `//*[@id="instance-vmi-link-prometheus"]/div/a`
  );

  // Link to Kiali console
  private static readonly KIALI_URL_LINK = By.xpath(
      `//*[@id="instance-vmi-link-kiali"]/div/a`
  );

  protected pageUrl: string = "/";
  protected pageLoadedElement: By = Wait.HEADER_CONTAINER;

  public async isPageLoaded(
    timeOut: number = PAGE_LOAD_TIMEOUT
  ): Promise<boolean> {
    return this.waitForHeader();
  }

  /* Wait for header */
  public async waitForHeader(): Promise<boolean> {
    return Wait.waitForHeader();
  }

  /* Wait for footer */
  public async waitForFooter(): Promise<boolean> {
    try {
      await Wait.waitForPresent(ConsoleMainPage.FOOTER_CONTAINER);
      return true;
    } catch (error) {
      return false;
    }
  }

  /* Wait for instance General Information */
  public async waitForInstanceInfo(): Promise<boolean> {
    try {
      await Wait.waitForPresent(ConsoleMainPage.INSTANCE_STATUS_ITEM);
      await Wait.waitForPresent(ConsoleMainPage.INSTANCE_VERSION_ITEM);
      await Wait.waitForPresent(ConsoleMainPage.INSTANCE_PROFILE_ITEM);
      return true;
    } catch (error) {
      return false;
    }
  }

  public async errorComponentExists(): Promise<boolean> {
    try {
      // wait for body to be rendered and make sure no error component exists
      await Wait.waitForPresent(ConsoleMainPage.INSTANCE_BODY_OUTER_ELEM);
      const errItem = await Wait.findNow(Wait.ERROR_ITEM);
      return !!errItem;
    } catch (error) {
      return false;
    }
  }

  /* Navigate to VMI console */
  public async navigateToVMI(
    vmiName: string,
    tabIndex: number
  ): Promise<boolean> {
    if (vmiName === "grafana") {
      await Actions.doClick(ConsoleMainPage.GRAFANA_URL_LINK);
    } else if (vmiName === "kibana") {
      await Actions.doClick(ConsoleMainPage.KIBANA_URL_LINK);
    } else if (vmiName === "prometheus") {
      await Actions.doClick(ConsoleMainPage.PROMETHEUS_URL_LINK);
    } else if (vmiName === "kiali") {
      await Actions.doClick(ConsoleMainPage.KIALI_URL_LINK);
    } else {
      return false;
    }
    await Actions.switchToTab(tabIndex);
    return true;
  }
}
