// Copyright (c) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

export = {
    header : {
        "signOut": "Sign Out",
        "appNav": "Application Navigation",
    },
    footer : {
        "copyRight": "© 2020 Oracle",
        "aboutOracle": "About Oracle",
        "contactUs": "Contact Us",
        "legalNotices": "Legal Notices",
        "termsOfUse": "Terms Of Use",
        "yourPrivacyRights": "Your Privacy Rights"

    },
    nav : {
        "model": "Application Model",
        "binding": "Application Binding",
        "instance": "Verrazzano",
        "home": "Home",
        "modelDetails": "Model Details",
        "bindingDetails": "Binding Details" 
    },
    model : {
        "modelsPageLoaded": "Models page loaded.",
        "heading": "Application Model Details",
    },
    binding : {
        "bindingsPageLoaded": "Bindings page loaded.",
        "heading": "Application Binding Details",
        "telemetry": "Application Telemetry",
    },
    instance : {
        "details" : "Instance Details",
        "instancePageLoaded": "Instance page loaded.",
        "instanceHeading": "Verrazzano",
        "appModels": "Application Models",
        "appBindings": "Application Bindings",
    },
    error : {
        "errSendAuthReq" : "Error sending auth request: {0}",
        "errAccessToken" : "Error getting access token: {0}",
        "errRefreshToken" : "Error refreshing token: {0}",
        "errLoggingOut": "Error logging out: {0}",
        "errCallKeyCloak": "Error calling keycloak {0}",
        "errFetchFailed": "Failed to perform fetch {0}",

        "errInvalidBindingId": "Invalid Binding Id.",
        "errRenderBinding": "Error displaying verrazzano binding {0}.",

        "errRenderBindingList": "Error displaying binding list.",
        "errRenderBindingTelemetry": "Error displaying Binding telemetry links.",

        "errRenderBindingComponents": "Error displaying binding components.",

        "errRenderConnectionList": "Error displaying connections list",
        "errRenderIngList": "Error displaying ingress list.",

        "errRenderInstance": "Error displaying verrazzano instance",

        "errInvalidModelId": "Invalid Model Id.",
        "errRenderModel": "Error displaying verrazzano model {0}.",

        "errRenderModelComponents": "Error displaying model components.",

        "errRenderModelList": "Error displaying model list",

        "errRenderSecretList": "Error displaying secret list."
    },
    auth : {
        "msgAuthInit": "KeycloakJet auth initialized",
        "msgTokenNotInStorage": "Access token does not exist in storage",
        "msgLogInKeyCloak": "KeycloakJet: logging in via keycloak",
        "msgGetAccessToken": "KeycloakJet returning from keycloak, getting acess token",
        "msgAuthEnabled": "Auth enabled = {0}",
        "msgUiUrl": "UI URL = {0}",
    },
    labels : {
        "generalInfo": "General Information",
        "name": "Name",
        "desc": "Description",
        "model": "Model",
        "loading": "Loading...",
        "refineBy": "Filters",
        "state": "State",
        "type": "Type",
        "sortBy": "Sort by:",
        "status": "Status",
        "cluster": "Cluster",
        "image": "Image",
        "ns": "Namespace",
        "resources" : "Resources",
        "components": "Components",
        "connections":"Connections",
        "ingresses": "Ingresses",
        "secrets": "Secrets",
        "kibana": "Kibana",
        "grafana":"Grafana",
        "prom":"Prometheus",
        "es": "Elasticsearch",
        "target": "Target",
        "comp": "Component",
        "prefix":"Prefix",
        "port":"Port",
        "dnsName":"Dns Name",
        "version":"Version",
        "mgmtCluster":"Management Cluster",
        "rancher":"Rancher",
        "keycloak":"Keycloak",
        "bindings": "Binding(s)",
        "modelBindings": "Bindings",
        "compType":"Component Type",
        "usage":"Usage"
    },

    api : {
        "msgFetchModel": "Fetching model details for model {0}",
        "msgFetchInstance": "Fetching instance details for instance {0}.",
        "msgFetchBinding": "Fetching binding details for binding {0}",
        "msgFetchComponent": "Fetching Component status for {0} {1}",
        "msgFetchVmi": "Fetching VMI details for binding {0}",
    },

    pagination : {
        "msgItemRange": "Showing ${pageFrom$}-${pageTo$} of ${pageMax$} items",
        "msgItem": "Showing ${pageTo$} of ${pageMax$} items"
    }

};