// Copyright (c) 2020, 2021, Oracle and/or its affiliates.
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
  cluster: () => Translations.getTranslatedString("nav.cluster"),
  instance: () => Translations.getTranslatedString("nav.instance"),
  home: () => Translations.getTranslatedString("nav.home"),
  oamApp: () => Translations.getTranslatedString("nav.oamApp"),
  oamComp: () => Translations.getTranslatedString("nav.oamComp"),
  oamAppDetails: () => Translations.getTranslatedString("nav.oamAppDetails"),
  oamCompDetails: () => Translations.getTranslatedString("nav.oamCompDetails"),
  compInstances: () => Translations.getTranslatedString("nav.compInstances"),
  oamCompInstance: () =>
    Translations.getTranslatedString("nav.oamCompInstance"),
  project: () => Translations.getTranslatedString("nav.project"),
};

export const Instance = {
  instanceDetails: () => Translations.getTranslatedString("instance.details"),
  instancePageLoaded: () =>
    Translations.getTranslatedString("instance.instancePageLoaded"),
  instanceHeading: () =>
    Translations.getTranslatedString("instance.instanceHeading"),
  clusters: () => Translations.getTranslatedString("instance.clusters"),
  oamApps: () => Translations.getTranslatedString("instance.oamApps"),
  oamCompoennts: () =>
    Translations.getTranslatedString("instance.oamComponents"),
  projects: () => Translations.getTranslatedString("instance.projects"),
  weblogicImages: () =>
    Translations.getTranslatedString("instance.webLogicImages"),
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

  errRenderInstance: (...args) =>
    Translations.getTranslatedString("error.errRenderInstance", args),

  errInvalidOamAppId: (...args) =>
    Translations.getTranslatedString("error.errInvalidOamAppId", args),

  errOAMApplicationDoesNotExist: (...args) =>
    Translations.getTranslatedString(
      "error.errOAMApplicationDoesNotExist",
      args
    ),

  errRenderOAMApplication: (...args) =>
    Translations.getTranslatedString("error.errRenderOAMApplication", args),

  errInvalidOamCompId: (...args) =>
    Translations.getTranslatedString("error.errInvalidOamCompId", args),

  errOAMComponentDoesNotExist: (...args) =>
    Translations.getTranslatedString("error.errOAMComponentDoesNotExist", args),

  errRenderOAMComponent: (...args) =>
    Translations.getTranslatedString("error.errRenderOAMComponent", args),

  errFetchingKubernetesResource: (...args) =>
    Translations.getTranslatedString(
      "error.errFetchingKubernetesResource",
      args
    ),

  errCreatingKubernetesResource: (...args) =>
    Translations.getTranslatedString(
      "error.errCreatingKubernetesResource",
      args
    ),

  errOAMApplicationsFetchError: (...args) =>
    Translations.getTranslatedString(
      "error.errOAMApplicationsFetchError",
      args
    ),

  errOAMComponentsFetchError: (...args) =>
    Translations.getTranslatedString("error.errOAMComponentsFetchError", args),

  errRenderOAMScopes: (...args) =>
    Translations.getTranslatedString("error.errRenderOAMScopes", args),

  errRenderOAMTraits: (...args) =>
    Translations.getTranslatedString("error.errRenderOAMTraits", args),

  errRenderOAMCompInstances: (...args) =>
    Translations.getTranslatedString("error.errRenderOAMCompInstances", args),

  errIngressesFetchError: (...args) =>
    Translations.getTranslatedString("error.errIngressesFetchError", args),

  errVzFetchError: (...args) =>
    Translations.getTranslatedString("error.errVzFetchError", args),

  errVmcsFetchError: (...args) =>
    Translations.getTranslatedString("error.errVmcFetchError", args),

  errVmiFetchError: (...args) =>
    Translations.getTranslatedString("error.errVmiFetchError", args),

  errVmcFetchError: (...args) =>
    Translations.getTranslatedString("error.errVmcFetchError", args),

  errIngressFetchError: (...args) =>
    Translations.getTranslatedString("error.errIngressFetchError", args),

  errInvalidWorkload: (...args) =>
    Translations.getTranslatedString("error.errInvalidWorkload", args),

  errMCApplicationsFetchError: (...args) =>
    Translations.getTranslatedString("error.errMCApplicationsFetchError", args),

  errMCComponentsFetchError: (...args) =>
    Translations.getTranslatedString("error.errMCComponentsFetchError", args),

  errFetchApiURLFromVMCError: (...args) =>
    Translations.getTranslatedString("error.errFetchApiURLFromVMCError", args),

  errProjectsFetchError: (...args) =>
    Translations.getTranslatedString("error.errProjectsFetchError", args),

  errImageBuildRequestsFetchError: (...args) =>
    Translations.getTranslatedString(
      "error.errImageBuildRequestFetchError",
      args
    ),

  errImageBuildRequestsCreateError: (...args) =>
    Translations.getTranslatedString(
      "error.errImageBuildRequestCreateError",
      args
    ),

  errInvalidProjectId: (...args) =>
    Translations.getTranslatedString("error.errInvalidProjectId", args),

  errRenderProject: (...args) =>
    Translations.getTranslatedString("error.errRenderProject", args),

  errVmcNotExists: (...args) =>
    Translations.getTranslatedString("error.errVmcNotExists", args),

  errRoleBindingsFetchError: (...args) =>
    Translations.getTranslatedString("error.errRoleBindingsFetchError", args),
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
  notAvailable: () => Translations.getTranslatedString("labels.notAvailable"),
  latestPSU: () => Translations.getTranslatedString("labels.latestPSU"),
  recommendedPatches: () =>
    Translations.getTranslatedString("labels.recommendedPatches"),
  baseImage: () => Translations.getTranslatedString("labels.baseImage"),
  image: () => Translations.getTranslatedString("labels.image"),
  registry: () => Translations.getTranslatedString("labels.registry"),
  repository: () => Translations.getTranslatedString("labels.repository"),
  tag: () => Translations.getTranslatedString("labels.tag"),
  jdkInstaller: () => Translations.getTranslatedString("labels.jdkInstaller"),
  weblogicInstaller: () =>
    Translations.getTranslatedString("labels.weblogicInstaller"),
  generalInfo: () => Translations.getTranslatedString("labels.generalInfo"),
  add: () => Translations.getTranslatedString("labels.add"),
  close: () => Translations.getTranslatedString("labels.close"),
  name: () => Translations.getTranslatedString("labels.name"),
  requestName: () => Translations.getTranslatedString("labels.requestName"),
  desc: () => Translations.getTranslatedString("labels.desc"),
  loading: () => Translations.getTranslatedString("labels.loading"),
  refineBy: () => Translations.getTranslatedString("labels.refineBy"),
  state: () => Translations.getTranslatedString("labels.state"),
  sortBy: () => Translations.getTranslatedString("labels.sortBy"),
  status: () => Translations.getTranslatedString("labels.status"),
  ns: () => Translations.getTranslatedString("labels.ns"),
  resources: () => Translations.getTranslatedString("labels.resources"),
  components: () => Translations.getTranslatedString("labels.components"),
  kibana: () => Translations.getTranslatedString("labels.kibana"),
  grafana: () => Translations.getTranslatedString("labels.grafana"),
  prom: () => Translations.getTranslatedString("labels.prom"),
  es: () => Translations.getTranslatedString("labels.es"),
  newWeblogicImage: () =>
    Translations.getTranslatedString("New Weblogic Image"),
  version: () => Translations.getTranslatedString("labels.version"),
  profile: () => Translations.getTranslatedString("labels.profile"),
  mgmtCluster: () => Translations.getTranslatedString("labels.mgmtCluster"),
  rancher: () => Translations.getTranslatedString("labels.rancher"),
  keycloak: () => Translations.getTranslatedString("labels.keycloak"),
  created: () => Translations.getTranslatedString("labels.created"),
  selectOption: () => Translations.getTranslatedString("labels.selectOption"),
  workloadType: () => Translations.getTranslatedString("labels.workloadType"),
  workloadSpec: () => Translations.getTranslatedString("labels.workloadSpec"),
  workload: () => Translations.getTranslatedString("labels.workload"),
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
  required: () => Translations.getTranslatedString("labels.required"),
  oamCompInfo: () => Translations.getTranslatedString("labels.oamCompInfo"),
  applications: () => Translations.getTranslatedString("labels.applications"),
  oamCompRef: () => Translations.getTranslatedString("labels.oamCompRef"),
  byType: () => Translations.getTranslatedString("labels.byType"),
  byState: () => Translations.getTranslatedString("labels.byState"),
  componentInfo: () => Translations.getTranslatedString("labels.componentInfo"),
  clusters: () => Translations.getTranslatedString("labels.clusters"),
  cluster: () => Translations.getTranslatedString("labels.cluster"),
  mgdClusterProfile: () =>
    Translations.getTranslatedString("labels.mgdClusterProfile"),
  prodProfile: () => Translations.getTranslatedString("labels.prodProfile"),
  devProfile: () => Translations.getTranslatedString("labels.devProfile"),
  projectInfo: () => Translations.getTranslatedString("labels.projectInfo"),
  namespaces: () => Translations.getTranslatedString("labels.namespaces"),
  networkPolicies: () =>
    Translations.getTranslatedString("labels.networkPolicies"),
  projects: () => Translations.getTranslatedString("labels.projects"),
  project: () => Translations.getTranslatedString("labels.project"),
  projectSpec: () => Translations.getTranslatedString("labels.projectSpec"),
  security: () => Translations.getTranslatedString("labels.security"),
  apiUrl: () => Translations.getTranslatedString("labels.apiUrl"),
};

export const Pagination = {
  msgItemRange: () =>
    Translations.getTranslatedString("pagination.msgItemRange"),
  msgItem: () => Translations.getTranslatedString("pagination.msgItem"),
};

export const ComponentConfigLabels = {
  traits: Labels.traits(),
  scopes: Labels.scopes(),
  params: Labels.params(),
};

export const Project = {
  projectAdmin: () => Translations.getTranslatedString("labels.projectAdmin"),
  projectMonitor: () =>
    Translations.getTranslatedString("labels.projectMonitor"),
  subjectKind: () => Translations.getTranslatedString("labels.subjectKind"),
  subjectAccess: () => Translations.getTranslatedString("labels.subjectAccess"),
  netPolLabelSelector: () =>
    Translations.getTranslatedString("labels.matchLabelsSelector"),
  netPolExpressionSelector: () =>
    Translations.getTranslatedString("labels.matchExpressionsSelector"),
  netPolIngressRules: () =>
    Translations.getTranslatedString("labels.netPolIngressRules"),
  netPolEgressRules: () =>
    Translations.getTranslatedString("labels.netPolEgressRules"),
  netPolPolicyTypes: () =>
    Translations.getTranslatedString("labels.netPolPolicyTypes"),
  netPolPorts: () => Translations.getTranslatedString("labels.netPolPorts"),
  netPolViewYaml: () =>
    Translations.getTranslatedString("labels.netPolViewYaml"),
  netPolToInfo: () => Translations.getTranslatedString("labels.netPolToInfo"),
  netPolFromInfo: () =>
    Translations.getTranslatedString("labels.netPolFromInfo"),
};
