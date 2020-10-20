// Copyright (C) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { By, until, WebElement } from "selenium-webdriver";
import { Utils } from './Utils';

export const PAGE_LOAD_TIMEOUT = 10000;

export class Wait {
    private static TIMEOUT = 30000;

    public static async waitForPresent(by: By, timeOut: number = Wait.TIMEOUT): Promise<WebElement> {
        try {
            console.log(`Waiting for the element to locate "${by}"`); //getLogger().info
            const driver = await Utils.getDriver();
            const e = driver.wait(until.elementLocated(by), timeOut, `Unable to locate element: ${by}`);
            return e;
        } catch (error) {
            console.log(`Error waiting for element ${by} to be present!`);
            throw error;
        }
    }

    /**
     * Wait until the web element is present in the DOM and immediately visible in the UI.
     * If your element is present in the DOM but hidden and you need to wait for it to be displayed,
     * please see this documented workaround:
     * http://surl.us.oracle.com/waitForElementToBeDisplayed_Workaround
     * @param by - locator {@see By}
     * @param timeOut - timeout in miliseconds, default is @constant TIMEOUT
     */
    public static async waitForVisible(by: By, timeOut: number = Wait.TIMEOUT): Promise<WebElement> {
        try {
            console.log(`Waiting for element to be visible: "${by}"`);
            return Wait.waitIgnoreStaleElement(by,
                async (element: WebElement) => { return await element.isDisplayed(); },
                `Unable to wait for element \"${by}\" to become visible`, timeOut);
        } catch (error) {
            console.log(`Error waiting for element ${by} to be visible!`);
            throw error;
        }
    }

    /**
     * Wait until the web element is enabled.
     * It assumes the element will be found and disabled so it will wait, for the provided timeout, until it is enabled.
     * If you know your element will first appear and be enabled after X time, please check this documented workaround:
     * http://surl.us.oracle.com/waitForPresentAndEnabled_Workaround
     * @param by - locator {@see By}
     * @param timeOut - timeout in miliseconds, default is @constant TIMEOUT
     */
    public static async waitForEnable(by: By, timeOut: number = Wait.TIMEOUT): Promise<WebElement> {
        try {
            await Wait.waitForVisible(by);
            console.log(`Waiting for element to be enable: "${by}"`);
            return Wait.waitIgnoreStaleElement(by,
                async (element: WebElement) => { return await element.isEnabled(); },
                `Unable to wait for element \"${by}\" to become Enable`, timeOut);
        } catch (error) {
            console.log(`Error waiting for element ${by} to be enabled!`);
            throw error;
        }
    }

    private static async waitIgnoreStaleElement(by: By, f: Function,
        timeOutMessage: string,
        timeOut: number = Wait.TIMEOUT): Promise<WebElement> {
        let element = await Wait.waitForPresent(by, timeOut);
        console.log(`Entering WaitIgnoreStaleElement; Locator: "${by}" `);
        const driver = await Utils.getDriver();
        await driver.wait<boolean>(
            async () => {
                try {
                    return await f(element);
                } catch (e) {
                    if (e.name === "StaleElementReferenceError") {
                        console.log("Element becomes stale. Re-locate the element.");
                        element = await Wait.waitForPresent(by, timeOut);
                        return false;
                    } else {
                        throw e;
                    }
                }
            }, timeOut, timeOutMessage
        );
        return element;
    }
}