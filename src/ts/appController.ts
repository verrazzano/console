// Copyright (c) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import * as ko from "knockout";
import * as ModuleUtils from "ojs/ojmodule-element-utils";
import * as ResponsiveUtils from "ojs/ojresponsiveutils";
import * as ResponsiveKnockoutUtils from "ojs/ojresponsiveknockoututils";
import * as OffcanvasUtils from "ojs/ojoffcanvas";
import CoreRouter = require ("ojs/ojcorerouter");
import ModuleRouterAdapter = require("ojs/ojmodulerouter-adapter");
import KnockoutRouterAdapter = require("ojs/ojknockoutrouteradapter");
import UrlParamAdapter = require("ojs/ojurlparamadapter");
import ArrayDataProvider = require("ojs/ojarraydataprovider");
import "ojs/ojknockout";
import "ojs/ojmodule-element";
import { ojNavigationList } from "ojs/ojnavigationlist";
import { ojModule } from "ojs/ojmodule-element";
import { KeycloakJet } from "./auth/KeycloakJet";

interface CoreRouterDetail {
  label: string;
  iconClass: string;
};

class RootViewModel {
  manner: ko.Observable<string>;
  message: ko.Observable<string|undefined>;
  smScreen: ko.Observable<boolean>;
  mdScreen: ko.Observable<boolean>;
  router: CoreRouter<CoreRouterDetail>;
  moduleAdapter: ModuleRouterAdapter<CoreRouterDetail>;
  navDataProvider: ojNavigationList<string, CoreRouter.CoreRouterState<CoreRouterDetail>>["data"];
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

  oauth: KeycloakJet

  constructor() {
    //OAuth initialization
    this.oauth = KeycloakJet.getInstance();

    this.userEmail = ko.observable(this.oauth.getUserEmail());
    this.userDisplayName = ko.observable(this.oauth.getUsername());
    
    // handle announcements sent when pages change, for Accessibility.
    this.manner = ko.observable("polite");
    this.message = ko.observable();

    let globalBodyElement: HTMLElement = document.getElementById("globalBody") as HTMLElement;
    globalBodyElement.addEventListener("announce", this.announcementHandler, false);

    // media queries for repsonsive layouts
    let smQuery: string | null = ResponsiveUtils.getFrameworkQuery("sm-only");
    if (smQuery){
      this.smScreen = ResponsiveKnockoutUtils.createMediaQueryObservable(smQuery);
    }

    let mdQuery: string | null = ResponsiveUtils.getFrameworkQuery("md-up");
    if (mdQuery){
      this.mdScreen = ResponsiveKnockoutUtils.createMediaQueryObservable(mdQuery);
    }

    const navData = [
      { path: "", redirect: "instance" },
      { path: "model", detail: { label: "Application Model", iconClass: "" } },
      { path: "binding", detail: { label: "Application Binding", iconClass: "" } },
      { path: "instance", detail: { label: "Verrazzano", iconClass: "" } }
//      { path: "about", detail: { label: "About", iconClass: "oj-ux-ico-information-s" } }
    ];
    // router setup
    const router = new CoreRouter(navData, {
      urlAdapter: new UrlParamAdapter()
    });
    router.sync();

    this.moduleAdapter = new ModuleRouterAdapter(router);

    this.selection = new KnockoutRouterAdapter(router);

    // Setup the navDataProvider with the routes, excluding the first redirected
    // route.
    this.navDataProvider = new ArrayDataProvider(navData.slice(1), {keyAttributes: "path"});

    // drawer

    this.drawerParams = {
      displayMode: "push",
      selector: "#navDrawer",
      content: "#pageContent"
    };

    // close offcanvas on medium and larger screens
    this.mdScreen.subscribe(() => {
      OffcanvasUtils.close(this.drawerParams);
    });

    // add a close listener so we can move focus back to the toggle button when the drawer closes
    let navDrawerElement: HTMLElement = document.querySelector("#navDrawer") as HTMLElement;
    navDrawerElement.addEventListener("ojclose", () => {
      let drawerToggleButtonElment: HTMLElement = document.querySelector("#drawerToggleButton") as HTMLElement;
      drawerToggleButtonElment.focus();
    });

    // header

    // application Name used in Branding Area
    this.appName = ko.observable("App Name");

    // footer
    this.footerLinks = [
      {name: 'About Oracle', linkId: 'aboutOracle', linkTarget:'http://www.oracle.com/us/corporate/index.html#menu-about'},
      { name: "Contact Us", id: "contactUs", linkTarget: "http://www.oracle.com/us/corporate/contact/index.html" },
      { name: "Legal Notices", id: "legalNotices", linkTarget: "http://www.oracle.com/us/legal/index.html" },
      { name: "Terms Of Use", id: "termsOfUse", linkTarget: "http://www.oracle.com/us/legal/terms/index.html" },
      { name: "Your Privacy Rights", id: "yourPrivacyRights", linkTarget: "http://www.oracle.com/us/legal/privacy/index.html" },
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

  logout = () => {
    this.oauth.logout();
  };
}

export default new RootViewModel();
