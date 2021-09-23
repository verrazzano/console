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
import { UserInfoCookie } from "vz-console/service/types";
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

function getCookieAsString(name: string): string {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return "";
}

function getCookieAsObject(name: string): UserInfoCookie {
  const result = <UserInfoCookie>{
    username: ""
  };
  const cookie = getCookieAsString(name);
  const decoded = atob(cookie).split(",");
  decoded.forEach((pair) => {
    const arr = pair.split("=");
    result[arr[0]] = arr[1];
  });
  return result;
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
  footerLinks: Array<object>;
  selection: KnockoutRouterAdapter<CoreRouterDetail>;

  constructor() {
    // set username and email from cookie
    const cookie = getCookieAsObject("vz_userinfo");
    this.userDisplayName = ko.observable(cookie.username);

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
