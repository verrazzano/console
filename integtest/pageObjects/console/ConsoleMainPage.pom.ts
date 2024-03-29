// Copyright (C) 2020, 2023, Oracle and/or its affiliates.
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

  // Link to OSD console
  private static readonly OSD_URL_LINK = By.xpath(
    `//*[@id="instance-vmi-link-opensearch-dashboards"]/div/a`
  );

  // Link to Prometheus console
  private static readonly PROMETHEUS_URL_LINK = By.xpath(
    `//*[@id="instance-vmi-link-prometheus"]/div/a`
  );

  // Link to Thanos Query console
  private static readonly THANOS_QUERY_URL_LINK = By.xpath(
    `//*[@id="instance-thanos-link"]/div/a`
  );

  // Link to Thanos Ruler console
  private static readonly THANOS_RULER_URL_LINK = By.xpath(
    `//*[@id="instance-thanos-ruler-link"]/div/a`
  );

  // Link to Kiali console
  private static readonly KIALI_URL_LINK = By.xpath(
    `//*[@id="instance-vmi-link-kiali"]/div/a`
  );

  // Link to Jaeger console
  private static readonly JAEGER_URL_LINK = By.xpath(
    `//*[@id="instance-jaeger-link"]/div/a`
  );

  // Link to Alertmanager console
  private static readonly ALERTMANAGER_URL_LINK = By.xpath(
    `//*[@id="instance-alertmanager-link"]/div/a`
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
    } else if (vmiName === "osd") {
      await Actions.doClick(ConsoleMainPage.OSD_URL_LINK);
    } else if (vmiName === "prometheus") {
      await Actions.doClick(ConsoleMainPage.PROMETHEUS_URL_LINK);
    } else if (vmiName === "kiali") {
      await Actions.doClick(ConsoleMainPage.KIALI_URL_LINK);
    } else if (vmiName === "jaeger") {
      await Actions.doClick(ConsoleMainPage.JAEGER_URL_LINK);
    } else if (vmiName === "thanosquery") {
      await Actions.doClick(ConsoleMainPage.THANOS_QUERY_URL_LINK);
    } else if (vmiName === "thanosruler") {
      await Actions.doClick(ConsoleMainPage.THANOS_RULER_URL_LINK);
    } else if (vmiName === "alertmanager") {
      await Actions.doClick(ConsoleMainPage.ALERTMANAGER_URL_LINK);
    } else {
      return false;
    }
    await Actions.switchToTab(tabIndex);
    return true;
  }
}
