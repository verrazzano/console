// Copyright (c) 2020, 2021, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

export = {
  header: {
    signOut: "Sign Out",
    appNav: "Application Navigation",
  },
  footer: {
    copyRight: "© 2020 Oracle",
    aboutOracle: "About Oracle",
    contactUs: "Contact Us",
    legalNotices: "Legal Notices",
    termsOfUse: "Terms Of Use",
    yourPrivacyRights: "Your Privacy Rights",
  },
  nav: {
    instance: "Verrazzano",
    home: "Home",
    oamApp: "OAM Application",
    oamComp: "OAM Component",
    oamAppDetails: "OAM Application Details",
    oamCompDetails: "OAM Component Details",
    compInstances: "Component Instances",
    oamCompInstance: "OAM Component Instance",
  },
  instance: {
    details: "Instance Details",
    instancePageLoaded: "Instance page loaded.",
    instanceHeading: "Verrazzano",
    oamApps: "OAM Applications",
    oamComponents: "OAM Components",
  },
  error: {
    errSendAuthReq: "Error sending auth request: {0}",
    errAccessToken: "Error getting access token: {0}",
    errRefreshToken: "Error refreshing token: {0}",
    errLoggingOut: "Error logging out: {0}",
    errCallKeyCloak: "Error calling keycloak {0}",
    errFetchFailed: "Failed to perform fetch {0}",

    errRenderConnectionList: "Error displaying connections list",
    errRenderIngList: "Error displaying ingress list.",

    errRenderInstance: "Error displaying verrazzano instance",

    errRenderSecretList: "Error displaying secret list.",

    errBindingDoesNotExist: "No Binding with id {0}.",

    errInvalidOamAppId: "Invalid OAM Application Id.",

    errOAMApplicationDoesNotExist: "No OAM Application with id {0}.",

    errRenderOAMApplication: "Error displaying OAM Application {0}.",

    errInvalidOamCompId: "Invalid OAM Component Id.",

    errOAMComponentDoesNotExist: "No OAM Component with id {0}.",

    errRenderOAMComponent: "Error displaying OAM Component {0}.",

    errFetchingKubernetesResource:
      "Error fetching {0} {1}/{2} from the cluster.",

    errOAMApplicationsFetchError:
      "Error fetching OAM ApplicationConfigurations.",

    errOAMComponentsFetchError: "Error fetching OAM Components.",

    errRenderOAMScopes: "Error displaying scopes.",

    errRenderOAMTraits: "Error displaying traits.",

    errRenderOAMCompInstances: "Error displaying Component Instances.",

    errIngressesFetchError: "Error fetching Ingresses.",

    errVmcsFetchError: "Error fetching Managed Clusters.",

    errVmiFetchError: "Error fetching System VMI.",

    errVmcFetchError: "Error fetching Managed Cluster {0}",

    errIngressFetchError: "Error fetching Ingress {0}/{1}",
  },
  auth: {
    msgAuthInit: "KeycloakJet auth initialized",
    msgTokenNotInStorage: "Access token does not exist in storage",
    msgLogInKeyCloak: "KeycloakJet: logging in via keycloak",
    msgGetAccessToken:
      "KeycloakJet returning from keycloak, getting acess token",
    msgAuthEnabled: "Auth enabled = {0}",
    msgUiUrl: "UI URL = {0}",
  },
  labels: {
    generalInfo: "General Information",
    name: "Name",
    desc: "Description",
    loading: "Loading...",
    refineBy: "Filters",
    state: "State",
    type: "Type",
    sortBy: "Sort by:",
    status: "Status",
    cluster: "Cluster",
    image: "Image",
    ns: "Namespace",
    resources: "Resources",
    components: "Components",
    connections: "Connections",
    ingresses: "Ingresses",
    secrets: "Secrets",
    kibana: "Kibana",
    grafana: "Grafana",
    prom: "Prometheus",
    es: "Elasticsearch",
    target: "Target",
    comp: "Component",
    prefix: "Prefix",
    port: "Port",
    dnsName: "Dns Name",
    version: "Version",
    mgmtCluster: "Management Cluster",
    rancher: "Rancher",
    keycloak: "Keycloak",
    compType: "Component Type",
    usage: "Usage",
    created: "Created",
    selectOption: "Please select an option ...",
    images: "Images",
    workloadType: "Workload Type",
    workloadSpec: "Workload Spec",
    workload: "Workload",
    latestRevision: "Latest Revision",
    labels: "Labels",
    annotations: "Annotations",
    oamAppInfo: "OAM Application Information",
    scopes: "Scopes",
    traits: "Traits",
    params: "Parameters",
    kind: "Kind",
    value: "Value",
    required: "Required",
    oamCompInfo: "Component Instance Details",
    applications: "Applications",
    oamCompRef: "OAM Component Ref",
    byType: "By Type",
    byState: "By State",
    componentInfo: "Component Details",
  },

  api: {
    msgFetchInstance: "Fetching instance details for instance {0}.",
    msgFetchComponent: "Fetching Component status for {0} {1}",
    msgFetchVmi: "Fetching VMI details for binding {0}",
  },

  pagination: {
    // eslint-disable-next-line no-template-curly-in-string
    msgItemRange: "Showing ${pageFrom$}-${pageTo$} of ${pageMax$} items",
    // eslint-disable-next-line no-template-curly-in-string
    msgItem: "Showing ${pageTo$} of ${pageMax$} items",
  },
};
