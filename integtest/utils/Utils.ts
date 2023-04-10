// Copyright (C) 2020, 2022, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import * as fs from "fs";
import {
  Builder,
  Capabilities,
  Condition,
  WebDriver,
} from "selenium-webdriver";
import { KeycloakLoginPage } from "../pageObjects/keycloak/KeycloakLoginPage.pom";

export interface LoginInfo {
  username: string;
  password: string;
}

export class Utils {
  private static driver: WebDriver;
  private static config: any;

  static isLoginEnabled(): boolean {
    const rawLoginEnabled = Utils.getConfig("loginEnabled");
    // Anything other than the string or boolean false value is assumed to be a true
    if (rawLoginEnabled !== "false" && rawLoginEnabled !== false) {
      return true;
    } else {
      return false;
    }
  }

  static getInvalidLoginInfo(): LoginInfo {
    // Returns LoginInfo with random username and password
    return {
      username: Math.random().toString(36).substr(2, 8),
      password: Math.random().toString(36).substr(2, 8),
    };
  }

  static async navigateAndLogin(
    useInvalidLoginInfo?: boolean,
    timeout?: number
  ) {
    const url = Utils.getConfig("driverInfo").url as string;
    const loginInfo = useInvalidLoginInfo
      ? Utils.getInvalidLoginInfo()
      : Utils.getConfig("loginInfo");
    const loginEnabled = Utils.isLoginEnabled();
    try {
      console.log(`Navigating to: ${url}`);
      if (useInvalidLoginInfo) {
        console.log("Using invalid login credentials");
      }
      await Utils.getJETPage(url, timeout);

      if (loginEnabled) {
        Utils.validateConfigLoginInfo();
        const keycloakLoginPage = new KeycloakLoginPage();
        if (await keycloakLoginPage.isPageLoaded()) {
          console.log("Login page is current page");
          console.log(`Performing an initial log in.`);
          await keycloakLoginPage.login(loginInfo, timeout);
        } else {
          const driver = await Utils.getDriver();
          console.log(
            `Login page is not current page. Current page url is ${await driver.getCurrentUrl()}`
          );
        }
      }
    } catch (error) {
      console.error(`Unable to navigate and log in to ${url}. ${error}`);
      throw error;
    }
  }

  // pageReadyScript is the Javascript code for Oracle JET page ready check
  static pageReadyScript = `
    const done = arguments[0];
    const contextModule = 'ojs/ojcontext';
    try {
      require(
        [contextModule],
        function(Context) {
          if (Context.getPageContext().getBusyContext().isReady()) {
            done('');
          } else {
            done('not yet ready');
          }
        },
        function (ex) {
          require.undef(contextModule);
          done(ex.message);
        }
      )
    } catch (ex) {
      if (ex.message === 'require is not defined') {
         done(''); // Not a JET page
      } else {
         done(ex.message);
      } 
    }
    `;

  // ojetPageReady() returns a Condition that executes the page ready Javascript check remotely on the browser
  static ojetPageReady(): Condition<Promise<boolean>> {
    return new Condition("Page Ready", async (driver: WebDriver) => {
      try {
        console.debug("Running page ready script:");
        const scriptOutput = await driver.executeAsyncScript<string>(
          Utils.pageReadyScript
        );
        console.debug(
          `Ran page ready script - return value: "${scriptOutput}"`
        );
        return scriptOutput === "";
      } catch (err) {
        return false;
      }
    });
  }

  static getConfig(key: string) {
    if (!Utils.config) {
      Utils.readConfigFile();
    }
    return key ? Utils.config[key] : Utils.config;
  }

  static async gotoConsoleMainPage() {
    const url = Utils.getConfig("driverInfo").url;
    console.log(`Navigating to Verrazzano Console main page at ${url}`);
    await Utils.getJETPage(url);
  }

  static async gotoGrafanaMainPage() {
    const url = Utils.getConfig("grafana").url;
    console.log(`Navigating to Grafana main page at ${url}`);
    await Utils.getJETPage(url);
  }

  static async gotoOSDMainPage() {
    const url = Utils.getConfig("osd").url;
    console.log(`Navigating to OSD main page at ${url}`);
    await Utils.getJETPage(url);
  }

  static async gotoPrometheusMainPage() {
    const url = Utils.getConfig("prometheus").url;
    console.log(`Navigating to Prometheus main page at ${url}`);
    await Utils.getJETPage(url);
  }

  static async gotoThanosQueryMainPage() {
    const url = Utils.getConfig("thanosquery").url;
    console.log(`Navigating to Thanos Query main page at ${url}`);
    await Utils.getJETPage(url);
  }

  static async gotoKialiMainPage() {
    const url = Utils.getConfig("kiali").url;
    console.log(`Navigating to Kiali main page at ${url}`);
    await Utils.getJETPage(url);
  }

  static async gotoJaegerMainPage() {
    const url = Utils.getConfig("jaeger").url;
    console.log(`Navigating to Jaeger main page at ${url}`);
    await Utils.getJETPage(url);
  }

  public static async gotoInvalidUrl(): Promise<boolean> {
    const url = Utils.getConfig("driverInfo").url;
    const invalidUrl = url.replace(
      "verrazzano",
      Math.random().toString(36).substr(2, 10)
    );
    return await Utils.getJETPage(invalidUrl)
      .then(() => true)
      .catch(() => false);
  }

  public static async releaseDriver() {
    if (Utils.driver) {
      try {
        await Utils.driver.quit();
      } catch (err) {
        console.warn(`Failed when releasing driver session: ${err}`);
      } finally {
        Utils.driver = null;
      }
    }
  }

  public static async saveBrowserLogs(filename: string) {
    const logEntries = await Utils.driver.manage().logs().get("browser");
    const writeStream = fs.createWriteStream(filename);
    logEntries.forEach((entry) => {
      writeStream.write(JSON.stringify(entry.toJSON()) + "\n");
    });
  }

  public static async takeScreenshot(filename: string) {
    if (Utils.driver) {
      try {
        const imgBase64 = await Utils.driver.takeScreenshot();
        await fs.promises.writeFile(filename, imgBase64, {
          encoding: "base64",
        });
      } catch (err) {
        console.error(
          `Failed to take screenshot to file ${filename}: ${err.toString()}`
        );
      }
    } else {
      console.warn("Cannot take screenshot - Utils.driver is undefined");
    }
  }

  public static async saveFailedTestInfo(specName: string, title: string) {
    const titleNoSpaces = title.split(" ").join("_");
    await Utils.takeScreenshot(`Screenshot_${specName}_${titleNoSpaces}.png`);
    await Utils.saveBrowserLogs(`ConsoleLog_${specName}_${titleNoSpaces}.log`);
  }

  public static async getDriver(): Promise<WebDriver> {
    if (!Utils.driver) {
      const driverInfo = Utils.getConfig("driverInfo");
      const caps = new Capabilities(driverInfo);
      const driver: WebDriver = new Builder().withCapabilities(caps).build();
      Utils.driver = driver;
    }
    return Utils.driver;
  }

  static readConfigFile(): void {
    const configPath = process.env.VZ_UITEST_CONFIG || "config.uitest.json";
    console.log(`Reading UI test config file at ${configPath}`);
    if (fs.existsSync(configPath)) {
      if (configPath.endsWith(".json")) {
        Utils.config = JSON.parse(fs.readFileSync(configPath).toString());
      } else {
        throw new Error(
          `The uitest config file ${configPath}, must have a name ending in ".json"`
        );
      }
    } else {
      throw new Error(
        `No uitest config file found for file name ${configPath}.`
      );
    }

    if (!Utils.config.driverInfo) {
      Utils.config.driverInfo = { url: "http://localhost:8000" };
    } else if (!Utils.config.driverInfo.url) {
      Utils.config.driverInfo.url = "http://localhost:8000";
    }
  }

  private static validateConfigLoginInfo() {
    const errMsg = `The uitest config file must have a loginInfo section with username and password`;
    if (!Utils.config.loginInfo) {
      throw new Error(errMsg);
    }
    const loginInfo = Utils.config.loginInfo as LoginInfo;
    if (!loginInfo.username || !loginInfo.password) {
      throw new Error(errMsg);
    }
  }

  private static async getJETPage(url: string, timeout?: number) {
    const driver = await Utils.getDriver();
    await driver.get(url);
    await driver.wait(Utils.ojetPageReady(), timeout);
  }

}
