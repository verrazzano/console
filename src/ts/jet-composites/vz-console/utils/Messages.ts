// Copyright (c) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

/* eslint-disable import/no-webpack-loader-syntax */

import * as AppResource from "ojL10n!./resources/nls/strings";
import * as DefaultBundle from "ojL10n!ojtranslations/nls/ojtranslations";
import Translations = require("ojs/ojtranslation");

Translations.setBundle({ ...DefaultBundle, ...AppResource });

export const Header = {
  signOutLabel: () => Translations.getTranslatedString("header.signOut"),
  appNavLabel: () => Translations.getTranslatedString("header.appNav"),
};

export const Footer = {
  copyright: () => Translations.getTranslatedString("footer.copyRight"),
  aboutOracle: () => Translations.getTranslatedString("footer.aboutOracle"),
  contactUs: () => Translations.getTranslatedString("footer.contactUs"),
  legalNotices: () => Translations.getTranslatedString("footer.legalNotices"),
  termsOfUse: () => Translations.getTranslatedString("footer.termsOfUse"),
  yourPrivacyRights: () =>
    Translations.getTranslatedString("footer.yourPrivacyRights"),
};

export const Nav = {
  model: () => Translations.getTranslatedString("nav.model"),
  binding: () => Translations.getTranslatedString("nav.binding"),
  instance: () => Translations.getTranslatedString("nav.instance"),
  home: () => Translations.getTranslatedString("nav.home"),
  modelDetails: () => Translations.getTranslatedString("nav.modelDetails"),
  bindingDetails: () => Translations.getTranslatedString("nav.bindingDetails"),
  oamApp: () => Translations.getTranslatedString("nav.oamApp"),
  oamComp: () => Translations.getTranslatedString("nav.oamComp"),
  oamAppDetails: () => Translations.getTranslatedString("nav.oamAppDetails"),
  compInstances: () => Translations.getTranslatedString("nav.compInstances"),
};

export const Instance = {
  instanceDetails: () => Translations.getTranslatedString("instance.details"),
  instancePageLoaded: () =>
    Translations.getTranslatedString("instance.instancePageLoaded"),
  instanceHeading: () =>
    Translations.getTranslatedString("instance.instanceHeading"),
  appModels: () => Translations.getTranslatedString("instance.appModels"),
  appBindings: () => Translations.getTranslatedString("instance.appBindings"),
  oamApps: () => Translations.getTranslatedString("instance.oamApps"),
  oamCompoennts: () =>
    Translations.getTranslatedString("instance.oamComponents"),
};

export const Binding = {
  bindingsPageLoaded: () =>
    Translations.getTranslatedString("binding.bindingsPageLoaded"),
  heading: () => Translations.getTranslatedString("binding.heading"),
  telemetry: () => Translations.getTranslatedString("binding.telemetry"),
};

export const Model = {
  modelsPageLoaded: () =>
    Translations.getTranslatedString("model.modelsPageLoaded"),
  heading: () => Translations.getTranslatedString("model.heading"),
};

export const Error = {
  errSendAuthReq: (...args) =>
    Translations.getTranslatedString("error.errSendAuthReq", args),
  errAccessToken: (...args) =>
    Translations.getTranslatedString("error.errAccessToken", args),
  errRefreshToken: (...args) =>
    Translations.getTranslatedString("error.errRefreshToken", args),
  errLoggingOut: (...args) =>
    Translations.getTranslatedString("error.errLoggingOut", args),
  errCallKeyCloak: (...args) =>
    Translations.getTranslatedString("error.errCallKeyCloak", args),
  errFetchFailed: (...args) =>
    Translations.getTranslatedString("error.errFetchFailed", args),

  errInvalidBindingId: (...args) =>
    Translations.getTranslatedString("error.errInvalidBindingId", args),
  errRenderBinding: (...args) =>
    Translations.getTranslatedString("error.errRenderBinding", args),

  errRenderBindingComponents: (...args) =>
    Translations.getTranslatedString("error.errRenderBindingComponents", args),

  errRenderBindingList: (...args) =>
    Translations.getTranslatedString("error.errRenderBindingList", args),
  errRenderBindingTelemetry: (...args) =>
    Translations.getTranslatedString("error.errRenderBindingTelemetry", args),

  errRenderConnectionList: (...args) =>
    Translations.getTranslatedString("error.errRenderConnectionList", args),
  errRenderIngList: (...args) =>
    Translations.getTranslatedString("error.errRenderIngList", args),

  errRenderInstance: (...args) =>
    Translations.getTranslatedString("error.errRenderInstance", args),

  errInvalidModelId: (...args) =>
    Translations.getTranslatedString("error.errInvalidModelId", args),
  errRenderModel: (...args) =>
    Translations.getTranslatedString("error.errRenderModel", args),

  errRenderModelComponents: (...args) =>
    Translations.getTranslatedString("error.errRenderModelComponents", args),

  errRenderModelList: (...args) =>
    Translations.getTranslatedString("error.errRenderModelList", args),

  errRenderSecretList: (...args) =>
    Translations.getTranslatedString("error.errRenderSecretList", args),

  errBindingDoesNotExist: (...args) =>
    Translations.getTranslatedString("error.errBindingDoesNotExist", args),

  errInvalidOamAppId: (...args) =>
    Translations.getTranslatedString("error.errInvalidOamAppId", args),

  errOAMApplicationDoesNotExist: (...args) =>
    Translations.getTranslatedString(
      "error.errOAMApplicationDoesNotExist",
      args
    ),

  errRenderOAMApplication: (...args) =>
    Translations.getTranslatedString("error.errRenderOAMApplication", args),
};

export const Auth = {
  msgAuthInit: () => Translations.getTranslatedString("auth.msgAuthInit"),
  msgTokenNotInStorage: () =>
    Translations.getTranslatedString("auth.msgTokenNotInStorage"),
  msgLogInKeyCloak: () =>
    Translations.getTranslatedString("auth.msgLogInKeyCloak"),
  msgGetAccessToken: () =>
    Translations.getTranslatedString("auth.msgGetAccessToken"),
  msgAuthEnabled: (...args) =>
    Translations.getTranslatedString("auth.msgAuthEnabled", args),
  msgUiUrl: (...args) =>
    Translations.getTranslatedString("auth.msgUiUrl", args),
};

export const Labels = {
  generalInfo: () => Translations.getTranslatedString("labels.generalInfo"),
  name: () => Translations.getTranslatedString("labels.name"),
  desc: () => Translations.getTranslatedString("labels.desc"),
  model: () => Translations.getTranslatedString("labels.model"),
  loading: () => Translations.getTranslatedString("labels.loading"),
  refineBy: () => Translations.getTranslatedString("labels.refineBy"),
  state: () => Translations.getTranslatedString("labels.state"),
  type: () => Translations.getTranslatedString("labels.type"),
  sortBy: () => Translations.getTranslatedString("labels.sortBy"),
  status: () => Translations.getTranslatedString("labels.status"),
  cluster: () => Translations.getTranslatedString("labels.cluster"),
  image: () => Translations.getTranslatedString("labels.image"),
  ns: () => Translations.getTranslatedString("labels.ns"),
  resources: () => Translations.getTranslatedString("labels.resources"),
  components: () => Translations.getTranslatedString("labels.components"),
  connections: () => Translations.getTranslatedString("labels.connections"),
  ingresses: () => Translations.getTranslatedString("labels.ingresses"),
  secrets: () => Translations.getTranslatedString("labels.secrets"),
  kibana: () => Translations.getTranslatedString("labels.kibana"),
  grafana: () => Translations.getTranslatedString("labels.grafana"),
  prom: () => Translations.getTranslatedString("labels.prom"),
  es: () => Translations.getTranslatedString("labels.es"),
  target: () => Translations.getTranslatedString("labels.target"),
  comp: () => Translations.getTranslatedString("labels.comp"),
  prefix: () => Translations.getTranslatedString("labels.prefix"),
  port: () => Translations.getTranslatedString("labels.port"),
  dnsName: () => Translations.getTranslatedString("labels.dnsName"),
  version: () => Translations.getTranslatedString("labels.version"),
  mgmtCluster: () => Translations.getTranslatedString("labels.mgmtCluster"),
  rancher: () => Translations.getTranslatedString("labels.rancher"),
  keycloak: () => Translations.getTranslatedString("labels.keycloak"),
  bindings: () => Translations.getTranslatedString("labels.bindings"),
  modelBindings: () => Translations.getTranslatedString("labels.modelBindings"),
  compType: () => Translations.getTranslatedString("labels.compType"),
  usage: () => Translations.getTranslatedString("labels.usage"),
  created: () => Translations.getTranslatedString("labels.created"),
  selectOption: () => Translations.getTranslatedString("labels.selectOption"),
  images: () => Translations.getTranslatedString("labels.images"),
  workloadType: () => Translations.getTranslatedString("labels.workloadType"),
  latestRevision: () =>
    Translations.getTranslatedString("labels.latestRevision"),
  labels: () => Translations.getTranslatedString("labels.labels"),
  annotations: () => Translations.getTranslatedString("labels.annotations"),
  oamAppInfo: () => Translations.getTranslatedString("labels.oamAppInfo"),
  traits: () => Translations.getTranslatedString("labels.traits"),
  scopes: () => Translations.getTranslatedString("labels.scopes"),
  params: () => Translations.getTranslatedString("labels.params"),
  kind: () => Translations.getTranslatedString("labels.kind"),
  value: () => Translations.getTranslatedString("labels.value"),
};

export const Api = {
  msgFetchBinding: (...args) =>
    Translations.getTranslatedString("api.msgFetchBinding", args),
  msgFetchModel: (...args) =>
    Translations.getTranslatedString("api.msgFetchModel", args),
  msgFetchInstance: (...args) =>
    Translations.getTranslatedString("api.msgFetchInstance", args),
  msgFetchComponent: (...args) =>
    Translations.getTranslatedString("api.msgFetchComponent", args),
  msgFetchVmi: (...args) =>
    Translations.getTranslatedString("api.msgFetchVmi", args),
};

export const Pagination = {
  msgItemRange: () =>
    Translations.getTranslatedString("pagination.msgItemRange"),
  msgItem: () => Translations.getTranslatedString("pagination.msgItem"),
};
