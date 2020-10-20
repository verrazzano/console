// Copyright (C) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import * as fs from 'fs';
import ojwd, { DriverManager as dm } from '@oracle/oraclejet-webdriver';
import {  WebDriver } from "selenium-webdriver";
import { MainPage } from "../pageObjects/MainPage.pom";
import { LoginPage } from "../pageObjects/LoginPage.pom";
export interface LoginInfo {
    username: string;
    password: string;
}

const BROWSER = "chrome"; //TODO desagar add to config?

export class Utils {
    private static driver: WebDriver;
    private static uiUrl = process.env.VZ_UI_URL;
    private static config: any

    static async navigateAndLogin(acceptCookies?: boolean, timeout?: number) {
        const url = Utils.getConfig("driverInfo").url;
        const loginInfo = Utils.getConfig("loginInfo");
        try {
            console.log(`Navigating to: ${url}`);
            const driver = await Utils.getDriver();
            await ojwd.get(driver, url);
            const loginPage = new LoginPage();
            if (loginPage.isPageLoaded()) {
                console.log('Login page is current page');
                console.log(`Performing an initial log in.`);
                await loginPage.login(loginInfo, acceptCookies, timeout);    
            } else {
                console.log(`Login page is not current page. Current page url is ${driver.getCurrentUrl()}`);
            }
        } catch (error) {
            console.error(`Unable to navigate and log in to ${url}. ${error}`);
            throw error;
        }
    }

    static getConfig(key: string) {
        if (!Utils.config) {
            Utils.readConfigFile();
        }
        return (key) ? Utils.config[key] : Utils.config;
    }

    static async gotoMainPage(): Promise<MainPage> {
        const mainPage = new MainPage();
        const driver = await Utils.getDriver();
        console.log(`Navigating to UI main page at ${this.uiUrl}`)
        await ojwd.get(driver, this.uiUrl);

        /* Verify MainPage is reachable and loaded */
        await mainPage.isPageLoaded();
        return mainPage;
    }

    public static releaseDriver() {
        if (Utils.driver) {
            dm.releaseDriver(Utils.driver);
            Utils.driver = null;
        }
    }

    public static async getDriver(): Promise<WebDriver> {
        if (!Utils.driver) {
            const driverInfo = Utils.getConfig("driverInfo");

            // Use JET DriverManager
            dm.registerConfig({capabilities: driverInfo}, 'verrazzano');
            Utils.driver = await dm.getDriver('verrazzano');
        }
        return Utils.driver;
    }

    static readConfigFile(): void {
        const configPath = process.env.VZ_UITEST_CONFIG || "config.uitest.json";
        console.log(`Reading UI test config file at ${configPath}`)
        if (fs.existsSync(configPath)) {
            if (configPath.endsWith(".json")) {
                Utils.config = JSON.parse(fs.readFileSync(configPath).toString());
            } else {
                throw new Error(`The uitest config file ${configPath}, must have a name ending in ".json"`);
            }
        } else {
            throw new Error(`No uitest config file found for file name ${configPath}.`);
        }

        Utils.validateConfigLoginInfo();

        if (!Utils.config['driverInfo']) {
            Utils.config['driverInfo'] = { url: 'http://localhost:8000'};
        } else if (!Utils.config['driverInfo'].url) {
            Utils.config['driverInfo'].url = 'http://localhost:8000';
        }
    }

    private static validateConfigLoginInfo() {
        const errMsg = `The uitest config file must have a loginInfo section with username and password`
        if (!Utils.config['loginInfo']) {
            throw new Error(errMsg);
        }
        const loginInfo = Utils.config['loginInfo'] as LoginInfo;
        if (!loginInfo.username || !loginInfo.password) {
            throw new Error(errMsg);
        }
    }

}
