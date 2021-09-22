// Copyright (c) 2020, 2021, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import * as ko from "knockout";
import * as ResponsiveUtils from "ojs/ojresponsiveutils";
import * as ResponsiveKnockoutUtils from "ojs/ojresponsiveknockoututils";
import * as OffcanvasUtils from "ojs/ojoffcanvas";
import "ojs/ojknockout";
import "ojs/ojmodule-element";
import { ojNavigationList } from "ojs/ojnavigationlist";
import * as Messages from "vz-console/utils/Messages";
import * as Config from "ojs/ojconfig";
import CoreRouter = require("ojs/ojcorerouter");
import ModuleRouterAdapter = require("ojs/ojmodulerouter-adapter");
import KnockoutRouterAdapter = require("ojs/ojknockoutrouteradapter");
import UrlParamAdapter = require("ojs/ojurlparamadapter");
import ArrayDataProvider = require("ojs/ojarraydataprovider");

interface CoreRouterDetail {
  label: string;
  iconClass: string;
}

function getCookie(name: string): string {
  var cookies = document.cookie.split("=");
  for (let i = 0; i < cookies.length - 1; i += 2) {
    if (cookies[i] === name) {
      return cookies[i + 1];
    }
  }
  return "";
}

function getValueFromCookie(cookieVal: string, key: string): string {
  // base64 decode the cookie value before searching for the key
  var decoded = atob(cookieVal).split("=");
  for (let i = 0; i < decoded.length - 1; i += 2) {
    if (decoded[i] === key) {
      return decoded[i + 1];
    }
  }
  return "";
}

class RootViewModel {
  manner: ko.Observable<string>;
  message: ko.Observable<string | undefined>;
  signOut: ko.Observable<string | undefined>;
  appNav: ko.Observable<string | undefined>;
  smScreen: ko.Observable<boolean>;
  mdScreen: ko.Observable<boolean>;
  router: CoreRouter<CoreRouterDetail>;
  moduleAdapter: ModuleRouterAdapter<CoreRouterDetail>;
  navDataProvider: ojNavigationList<
    string,
    CoreRouter.CoreRouterState<CoreRouterDetail>
  >["data"];

  drawerParams: {
    selector: string;
    content: string;
    edge?: "start" | "end" | "top" | "bottom";
    displayMode?: "push" | "overlay";
    autoDismiss?: "focusLoss" | "none";
    size?: string;
    modality?: "modal" | "modeless";
  };

  appName: ko.Observable<string>;
  userDisplayName: ko.Observable<string>;
  userEmail: ko.Observable<string>;
  footerLinks: Array<object>;
  selection: KnockoutRouterAdapter<CoreRouterDetail>;

  constructor() {
    // get username from cookie
    var cookieValue = getCookie("vz_userinfo");
    const username = getValueFromCookie(cookieValue, "username");
    const email = getValueFromCookie(cookieValue, "email");
    this.userDisplayName = ko.observable(username);
    this.userEmail = ko.observable(email);

    // handle announcements sent when pages change, for Accessibility.
    this.manner = ko.observable("polite");
    this.message = ko.observable();
    this.signOut = ko.observable(Messages.Header.signOutLabel());
    this.appNav = ko.observable(Messages.Header.appNavLabel());

    // media queries for repsonsive layouts
    const smQuery: string | null = ResponsiveUtils.getFrameworkQuery("sm-only");
    if (smQuery) {
      this.smScreen = ResponsiveKnockoutUtils.createMediaQueryObservable(
        smQuery
      );
    }

    const mdQuery: string | null = ResponsiveUtils.getFrameworkQuery("md-up");
    if (mdQuery) {
      this.mdScreen = ResponsiveKnockoutUtils.createMediaQueryObservable(
        mdQuery
      );
    }

    const navData = [
      { path: "", redirect: "instance" },
      {
        path: "oamapp",
        detail: { label: Messages.Nav.oamApp(), iconClass: "" },
      },
      {
        path: "oamcomp",
        detail: { label: Messages.Nav.oamComp(), iconClass: "" },
      },
      {
        path: "instance",
        detail: { label: Messages.Nav.instance(), iconClass: "" },
      },
      {
        path: "project",
        detail: { label: Messages.Nav.project(), iconClass: "" },
      },
    ];
    // router setup
    this.router = new CoreRouter(navData, {
      urlAdapter: new UrlParamAdapter(),
    });
    this.router.sync();

    this.moduleAdapter = new ModuleRouterAdapter(this.router);

    this.selection = new KnockoutRouterAdapter(this.router);

    // Setup the navDataProvider with the routes, excluding the first redirected
    // route.
    this.navDataProvider = new ArrayDataProvider(navData.slice(1), {
      keyAttributes: "path",
    });

    const locale = Config.getLocale().split("-")[1].toLowerCase();
    // footer
    this.footerLinks = [
      {
        name: Messages.Footer.copyright(),
        linkId: "copyRight",
        linkTarget: `https://www.oracle.com/${
          locale === "us" ? "" : locale
        }/legal/copyright.html`,
      },
      {
        name: Messages.Footer.aboutOracle(),
        linkId: "aboutOracle",
        linkTarget: `https://www.oracle.com/${locale}/corporate/index.html#menu-about`,
      },
      {
        name: Messages.Footer.contactUs(),
        id: "contactUs",
        linkTarget: `https://www.oracle.com/${locale}/corporate/contact/index.html`,
      },
      {
        name: Messages.Footer.legalNotices(),
        id: "legalNotices",
        linkTarget: `https://www.oracle.com/${locale}/legal/index.html`,
      },
      {
        name: Messages.Footer.termsOfUse(),
        id: "termsOfUse",
        linkTarget: `https://www.oracle.com/${locale}/legal/terms/index.html`,
      },
      {
        name: Messages.Footer.yourPrivacyRights(),
        id: "yourPrivacyRights",
        linkTarget: `https://www.oracle.com/${locale}/legal/privacy/index.html`,
      },
    ];
  }

  announcementHandler = (event: any): void => {
    this.message(event.detail.message);
    this.manner(event.detail.manner);
  };

  // called by navigation drawer toggle button and after selection of nav drawer item
  toggleDrawer = (): Promise<boolean> => {
    return OffcanvasUtils.toggle(this.drawerParams);
  };

  // logout user from the console
  logout = (): void => {
    window.location.reload();
  };
}

export default new RootViewModel();
