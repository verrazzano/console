// Copyright (c) 2020, 2021, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

export = {
  header: {
    signOut: "Sign Out",
    appNav: "Application Navigation",
  },
  footer: {
    copyRight: "© 2021 Oracle",
    aboutOracle: "About Oracle",
    contactUs: "Contact Us",
    legalNotices: "Legal Notices",
    termsOfUse: "Terms Of Use",
    yourPrivacyRights: "Your Privacy Rights",
  },
  nav: {
    cluster: "Clusters",
    instance: "Verrazzano",
    home: "Home",
    oamApp: "OAM Application",
    oamComp: "OAM Component",
    oamAppDetails: "OAM Application Details",
    oamCompDetails: "OAM Component Details",
    compInstances: "Component Instances",
    oamCompInstance: "OAM Component Instance",
    project: "Project",
  },
  instance: {
    clusters: "Clusters",
    details: "Instance Details",
    instancePageLoaded: "Instance page loaded.",
    instanceHeading: "Verrazzano",
    oamApps: "OAM Applications",
    oamComponents: "OAM Components",
    projects: "Projects",
    webLogicImages: "WebLogic Images",
  },
  error: {
    errSendAuthReq: "Error sending auth request: {0}",
    errAccessToken: "Error getting access token: {0}",
    errRefreshToken: "Error refreshing token: {0}",
    errLoggingOut: "Error logging out: {0}",
    errCallKeyCloak: "Error calling keycloak {0}",
    errFetchFailed: "Failed to perform fetch {0}",

    errRenderInstance: "Error displaying verrazzano instance",

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

    errVzFetchError:
      "Error fetching Verrazzano instance; either no instance found, or more than one instance is present.",

    errVmcsFetchError: "Error fetching Managed Clusters.",

    errVmiFetchError: "Error fetching System VMI.",

    errVmcFetchError: "Error fetching Managed Cluster {0}",

    errIngressFetchError: "Error fetching Ingress {0}/{1}",

    errInvalidWorkload: "Invalid workload metadata for component {0}/{1}",

    errMCApplicationsFetchError:
      "Error fetching Multi-cluster OAM ApplicationConfigurations.",

    errMCComponentsFetchError: "Error fetching Multi-cluster OAM Components.",

    errFetchApiURLFromVMCError: "Unable to read apiUrl from status of VMC {0}.",

    errProjectsFetchError: "Error fetching Projects.",
    errRoleBindingsFetchError: "Error fetching RoleBindings in namespace {0}.",
    errInvalidProjectId: "Invalid Project Id.",
    errRenderProject: "Error displaying Project {0}.",
    errVmcNotExists:
      "VerrazzanoManagedCluster {0} does not exist/is not registered yet.",
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
    add: "Add",
    close: "Close",
    name: "Name",
    desc: "Description",
    loading: "Loading...",
    refineBy: "Filters",
    state: "State",
    sortBy: "Sort by:",
    status: "Status",
    ns: "Namespace",
    resources: "Resources",
    components: "Components",
    kibana: "Kibana",
    grafana: "Grafana",
    prom: "Prometheus",
    es: "Elasticsearch",
    version: "Version",
    profile: "Install Profile",
    mgmtCluster: "Admin Cluster",
    rancher: "Rancher",
    keycloak: "Keycloak",
    created: "Created",
    newWeblogicImage: "New Weblogic Image",
    selectOption: "Please select an option ...",
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
    clusters: "Clusters",
    cluster: "Cluster",
    mgdClusterProfile: "Managed Cluster",
    prodProfile: "Production",
    devProfile: "Development",
    projectInfo: "Project Details",
    namespaces: "Namespaces",
    netPolIngressRules: "Ingress Rules",
    netPolEgressRules: "Egress Rules",
    netPolFromInfo: "from specific sources",
    netPolPolicyTypes: "Policy Types",
    netPolPorts: "Ports",
    netPolToInfo: "to specific destinations",
    netPolViewYaml: "View YAML",
    networkPolicies: "Network Policies",
    matchLabelsSelector: "Match Labels Selectors",
    matchExpressionsSelector: "Match Expressions Selectors",
    projects: "Projects",
    project: "Project",
    projectSpec: "Project Spec",
    projectAdmin: "Project Admin",
    projectMonitor: "Project Monitor",
    subjectKind: "Kind",
    subjectAccess: "Access",
    security: "Security",
    apiUrl: "API URL",
  },

  pagination: {
    // eslint-disable-next-line no-template-curly-in-string
    msgItemRange: "Showing ${pageFrom$}-${pageTo$} of ${pageMax$} items",
    // eslint-disable-next-line no-template-curly-in-string
    msgItem: "Showing ${pageTo$} of ${pageMax$} items",
  },
};
