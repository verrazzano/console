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
import { KeycloakJet } from "vz-console/auth/loader";
import * as Messages from "vz-console/utils/Messages";
import * as Config from "ojs/ojconfig"

interface CoreRouterDetail {
  label: string;
  iconClass: string;
};

class RootViewModel {
  manner: ko.Observable<string>;
  message: ko.Observable<string|undefined>;
  signOut: ko.Observable<string|undefined>;
  appNav: ko.Observable<string|undefined>;
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
    this.signOut = ko.observable(Messages.Header.signOutLabel())
    this.appNav = ko.observable(Messages.Header.appNavLabel())
    
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
      { path: "model", detail: { label: Messages.Nav.model(), iconClass: "" } },
      { path: "binding", detail: { label: Messages.Nav.binding(), iconClass: "" } },
      { path: "instance", detail: { label: Messages.Nav.instance(), iconClass: "" } }
    ];
    // router setup
    this.router = new CoreRouter(navData, {
      urlAdapter: new UrlParamAdapter()
    });
    this.router.sync();

    this.moduleAdapter = new ModuleRouterAdapter(this.router);

    this.selection = new KnockoutRouterAdapter(this.router);

    // Setup the navDataProvider with the routes, excluding the first redirected
    // route.
    this.navDataProvider = new ArrayDataProvider(navData.slice(1), {keyAttributes: "path"});

    let locale = Config.getLocale().split("-")[1].toLowerCase();
    // footer
    this.footerLinks = [
      {name: Messages.Footer.copyright(), linkId: 'copyRight', linkTarget: `https://www.oracle.com/${(locale === 'us' ? "" : locale)}/legal/copyright.html` },
      {name: Messages.Footer.aboutOracle(), linkId: 'aboutOracle', linkTarget:`https://www.oracle.com/${locale}/corporate/index.html#menu-about` },
      { name: Messages.Footer.contactUs(), id: "contactUs", linkTarget: `https://www.oracle.com/${locale}/corporate/contact/index.html` },
      { name: Messages.Footer.legalNotices(), id: "legalNotices", linkTarget: `https://www.oracle.com/${locale}/legal/index.html` },
      { name: Messages.Footer.termsOfUse(), id: "termsOfUse", linkTarget: `https://www.oracle.com/${locale}/legal/terms/index.html` },
      { name: Messages.Footer.yourPrivacyRights(), id: "yourPrivacyRights", linkTarget: `https://www.oracle.com/${locale}/legal/privacy/index.html` },
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
