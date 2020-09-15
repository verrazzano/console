// Copyright (C) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { By } from "selenium-webdriver";
import { Wait, PAGE_LOAD_TIMEOUT } from '../utils/Wait';

/**
 * Page Object Model for the main page
 */
export class MainPage {
    // private static readonly HEADER_CONTAINER: By = By.xpath(`//header[@class="oj-web-applayout-header"]`);
    private static readonly FOOTER_CONTAINER: By = By.className("oj-web-applayout-footer-item");
    private static readonly HEADER_CONTAINER: By = By.className("oj-web-applayout-header");
    protected pageUrl: string = '/';
    protected pageLoadedElement: By = MainPage.HEADER_CONTAINER;

    public async isPageLoaded(timeOut: number = PAGE_LOAD_TIMEOUT): Promise<boolean> {
        try {
            // this.switchToDefaultContent();
            await Wait.waitForPresent(this.pageLoadedElement, timeOut);
            return true;
        } catch (error) {
            return false;
        }
    }

    /* Wait for header */
    public async waitForHeader(): Promise<void> {
        // this.switchToDefaultContent();
        await Wait.waitForPresent(MainPage.HEADER_CONTAINER);
    }

    /* Wait for footer */
    public async waitForFooter(): Promise<void> {
        // this.switchToDefaultContent();
        await Wait.waitForPresent(MainPage.FOOTER_CONTAINER);
    }

}