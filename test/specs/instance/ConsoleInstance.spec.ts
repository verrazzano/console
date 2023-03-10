// Copyright (C) 2020, 2022, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import {
  Instance,
  VerrazzanoApi,
  VMIType,
  ResourceType,
} from "vz-console/service/loader";
import "vz-console/instance/loader";
import * as Context from "ojs/ojcontext";
import * as ko from "knockout";
import "ojs/ojknockout";
import * as sinon from "sinon";
import * as Messages from "vz-console/utils/Messages";
import { checkMetaItemLabelValue, fakeRouter } from "../../testutils";

const expect = chai.expect;
let instanceElement: HTMLElement;

const instanceUrlSuffix = "default.0.0.0.0.xip.io";
const instance = <Instance>{
  id: "0",
  elasticUrl: `https://elasticsearch.vmi.system..${instanceUrlSuffix}`,
  kibanaUrl: `https://kibana.vmi.system.default.${instanceUrlSuffix}`,
  grafanaUrl: `https://grafana.vmi.system.default.${instanceUrlSuffix}`,
  prometheusUrl: `https://prometheus.vmi.system.default.${instanceUrlSuffix}`,
  keyCloakUrl: `https://keycloak.${instanceUrlSuffix}`,
  rancherUrl: `https://rancher.${instanceUrlSuffix}`,
  argoCDUrl: `https://argocd.${instanceUrlSuffix}`,
  thanosUrl: `https://thanos-query-frontend.${instanceUrlSuffix}`,
  mgmtCluster: "test",
  version: "1.0",
  status: "OK",
  profile: "Production",
};

const instanceWithAllDisabledComponents = <Instance>{
  id: "0",
  keyCloakUrl: null,
  rancherUrl: ``,
  argoCDUrl: ``,
  thanosUrl: ``,
  mgmtCluster: "test",
  version: "1.0",
  status: "OK",
  profile: "Production",
};

const sandbox = sinon.createSandbox();

async function setup(selectedItem?: string) {
  fixture.set(
    `<div id ="globalBody"><vz-console-instance id="instance" selected-item="[[selectedItem]]"/></div>`
  );
  instanceElement = document.querySelector("#instance") as HTMLElement;

  expect(instanceElement).not.to.be.null;
  ko.applyBindings(
    {
      selectedItem,
      router: fakeRouter(sandbox),
    },
    instanceElement.parentElement
  );

  await Context.getPageContext()
    .getBusyContext()
    .whenReady(30000)
    .catch((err) => {
      chai.assert.fail(err);
    });
  await Context.getContext(instanceElement)
    .getBusyContext()
    .whenReady(30000)
    .catch((err) => {
      chai.assert.fail(err);
    });
}

describe("instance panel screen tests", () => {
  before(async () => {
    sandbox
      .stub(VerrazzanoApi.prototype, <any>"getInstance")
      .returns(Promise.resolve(instance));
    sandbox
      .stub(VerrazzanoApi.prototype, <any>"listOAMAppsAndComponents")
      .returns(Promise.resolve({}));
    sandbox
      .stub(VerrazzanoApi.prototype, <any>"listClusters")
      .returns(Promise.resolve({}));
    sandbox
      .stub(VerrazzanoApi.prototype, <any>"listProjects")
      .returns(Promise.resolve({}));
    await setup()
      .then(() => console.log("Instance view rendered"))
      .catch((err) => {
        chai.assert.fail(err);
      });
  });

  after(() => {
    fixture.cleanup();
    sandbox.restore();
  });

  it("renders the vmi links correctly.", async () => {
    const elasticSearchLink = instanceElement.querySelector(
      `#instance-vmi-link-${VMIType.Opensearch.toLocaleLowerCase()}`
    );
    expect(elasticSearchLink).not.to.be.null;

    const kibanaLink = instanceElement.querySelector(
      `#instance-vmi-link-${VMIType.OpensearchDashboards.toLocaleLowerCase()}`
    );
    expect(kibanaLink).not.to.be.null;

    const grafanaLink = instanceElement.querySelector(
      `#instance-vmi-link-${VMIType.Grafana.toLocaleLowerCase()}`
    );
    expect(grafanaLink).not.to.be.null;

    const prometheusLink = instanceElement.querySelector(
      `#instance-vmi-link-${VMIType.Prometheus.toLocaleLowerCase()}`
    );
    expect(prometheusLink).not.to.be.null;

    checkMetaItemLabelValue(
      elasticSearchLink.textContent,
      Messages.Labels.es(),
      instance.elasticUrl
    );
    expect(
      elasticSearchLink.querySelector("* > a").getAttribute("href")
    ).to.equal(instance.elasticUrl);
    expect(
      elasticSearchLink.querySelector("* > a").getAttribute("tabindex")
    ).to.equal("0");

    checkMetaItemLabelValue(
      kibanaLink.textContent,
      Messages.Labels.kibana(),
      instance.kibanaUrl
    );
    expect(kibanaLink.querySelector("* > a").getAttribute("href")).to.equal(
      instance.kibanaUrl
    );
    expect(kibanaLink.querySelector("* > a").getAttribute("tabindex")).to.equal(
      "0"
    );

    checkMetaItemLabelValue(
      grafanaLink.textContent,
      Messages.Labels.grafana(),
      instance.grafanaUrl
    );
    expect(grafanaLink.querySelector("* > a").getAttribute("href")).to.equal(
      instance.grafanaUrl
    );
    expect(
      grafanaLink.querySelector("* > a").getAttribute("tabindex")
    ).to.equal("0");

    checkMetaItemLabelValue(
      prometheusLink.textContent,
      Messages.Labels.prom(),
      instance.prometheusUrl
    );
    expect(prometheusLink.querySelector("* > a").getAttribute("href")).to.equal(
      instance.prometheusUrl
    );
    expect(
      prometheusLink.querySelector("* > a").getAttribute("tabindex")
    ).to.equal("0");
  });

  it("renders the general details and links correctly.", async () => {
    const statusMetaItem = instanceElement.querySelector(
      `#instance-status-metaitem`
    );
    expect(statusMetaItem).not.to.be.null;

    const versionMetaItem = instanceElement.querySelector(
      `#instance-version-metaitem`
    );
    expect(versionMetaItem).not.to.be.null;

    const mgmtClusterMetaItem = instanceElement.querySelector(
      `#instance-mgmtcluster-metaitem`
    );
    expect(mgmtClusterMetaItem).not.to.be.null;

    const keycloakMetaItem = instanceElement.querySelector(
      `#instance-keycloak-link`
    );
    expect(keycloakMetaItem).not.to.be.null;

    const rancherMetaItem = instanceElement.querySelector(
      `#instance-rancher-link`
    );
    expect(rancherMetaItem).not.to.be.null;

    const argoCDMetaItem = instanceElement.querySelector(
      `#instance-argoCD-link`
    );
    console.log(argoCDMetaItem);
    expect(argoCDMetaItem).not.to.be.null;

    const thanosMetaItem = instanceElement.querySelector(
      `#instance-thanos-link`
    );
    console.log(thanosMetaItem);
    expect(thanosMetaItem).not.to.be.null;

    const profileMetaItem = instanceElement.querySelector(
      `#instance-profile-metaitem`
    );
    expect(profileMetaItem).not.to.be.null;

    checkMetaItemLabelValue(
      statusMetaItem.textContent,
      Messages.Labels.status(),
      instance.status
    );
    checkMetaItemLabelValue(
      versionMetaItem.textContent,
      Messages.Labels.version(),
      instance.version
    );
    checkMetaItemLabelValue(
      mgmtClusterMetaItem.textContent,
      Messages.Labels.mgmtCluster(),
      instance.mgmtCluster
    );
    checkMetaItemLabelValue(
      keycloakMetaItem.textContent,
      Messages.Labels.keycloak(),
      instance.keyCloakUrl
    );
    checkMetaItemLabelValue(
      rancherMetaItem.textContent,
      Messages.Labels.rancher(),
      instance.rancherUrl
    );
    checkMetaItemLabelValue(
      argoCDMetaItem.textContent,
      Messages.Labels.argoCD(),
      instance.argoCDUrl
    );
    checkMetaItemLabelValue(
      thanosMetaItem.textContent,
      Messages.Labels.thanos(),
      instance.thanosUrl
    );
    checkMetaItemLabelValue(
      profileMetaItem.textContent,
      Messages.Labels.profile(),
      instance.profile
    );
    expect(
      keycloakMetaItem.querySelector("* > a").getAttribute("href")
    ).to.equal(instance.keyCloakUrl);
    expect(
      rancherMetaItem.querySelector("* > a").getAttribute("href")
    ).to.equal(instance.rancherUrl);
    expect(argoCDMetaItem.querySelector("* > a").getAttribute("href")).to.equal(
      instance.argoCDUrl
    );
    expect(thanosMetaItem.querySelector("* > a").getAttribute("href")).to.equal(
      instance.thanosUrl
    );
  });

  it("renders the status badge correctly.", async () => {
    const badge = instanceElement.querySelector(`.badge-hexagon`);
    expect(badge).not.to.be.null;

    const badgeLabel = instanceElement.querySelector(
      `.status-badge-status-label`
    );
    expect(badgeLabel).not.to.be.null;
    expect(badgeLabel.textContent).to.equal(Messages.Nav.instance());
  });
});

describe("instance panel screen tests with components disabled", () => {
  before(async () => {
    sandbox
      .stub(VerrazzanoApi.prototype, <any>"getInstance")
      .returns(Promise.resolve(instanceWithAllDisabledComponents));
    sandbox
      .stub(VerrazzanoApi.prototype, <any>"listOAMAppsAndComponents")
      .returns(Promise.resolve({}));
    sandbox
      .stub(VerrazzanoApi.prototype, <any>"listClusters")
      .returns(Promise.resolve({}));
    sandbox
      .stub(VerrazzanoApi.prototype, <any>"listProjects")
      .returns(Promise.resolve({}));
    await setup()
      .then(() => console.log("Instance view rendered"))
      .catch((err) => {
        chai.assert.fail(err);
      });
  });

  after(() => {
    fixture.cleanup();
    sandbox.restore();
  });

  it("renders the vmi links correctly.", async () => {
    const elasticSearchLink = instanceElement.querySelector(
      `#instance-vmi-link-${VMIType.Opensearch.toLocaleLowerCase()}`
    );
    expect(elasticSearchLink).to.be.null;

    const kibanaLink = instanceElement.querySelector(
      `#instance-vmi-link-${VMIType.OpensearchDashboards.toLocaleLowerCase()}`
    );
    expect(kibanaLink).to.be.null;

    const grafanaLink = instanceElement.querySelector(
      `#instance-vmi-link-${VMIType.Grafana.toLocaleLowerCase()}`
    );
    expect(grafanaLink).to.be.null;

    const prometheusLink = instanceElement.querySelector(
      `#instance-vmi-link-${VMIType.Prometheus.toLocaleLowerCase()}`
    );
    expect(prometheusLink).to.be.null;
  });

  it("renders the general details and links correctly.", async () => {
    const statusMetaItem = instanceElement.querySelector(
      `#instance-status-metaitem`
    );
    expect(statusMetaItem).not.to.be.null;

    const versionMetaItem = instanceElement.querySelector(
      `#instance-version-metaitem`
    );
    expect(versionMetaItem).not.to.be.null;

    const mgmtClusterMetaItem = instanceElement.querySelector(
      `#instance-mgmtcluster-metaitem`
    );
    expect(mgmtClusterMetaItem).not.to.be.null;

    const keycloakMetaItem = instanceElement.querySelector(
      `#instance-keycloak-link`
    );
    expect(keycloakMetaItem).to.be.null;

    const rancherMetaItem = instanceElement.querySelector(
      `#instance-rancher-link`
    );
    expect(rancherMetaItem).to.be.null;

    const argoCDMetaItem = instanceElement.querySelector(
      `#instance-argoCD-link`
    );
    expect(argoCDMetaItem).to.be.null;

    const thanosMetaItem = instanceElement.querySelector(
      `#instance-thanos-link`
    );
    expect(thanosMetaItem).to.be.null;

    const profileMetaItem = instanceElement.querySelector(
      `#instance-profile-metaitem`
    );
    expect(profileMetaItem).not.to.be.null;
  });

  it("renders the status badge correctly.", async () => {
    const badge = instanceElement.querySelector(`.badge-hexagon`);
    expect(badge).not.to.be.null;

    const badgeLabel = instanceElement.querySelector(
      `.status-badge-status-label`
    );
    expect(badgeLabel).not.to.be.null;
    expect(badgeLabel.textContent).to.equal(Messages.Nav.instance());
  });
});

describe("Multi cluster apps and component list test", () => {
  const localClusterAppName = "springboot-appconf";
  before(async () => {
    const components = `
    {
      "apiVersion": "v1",
      "items": [
        {
          "apiVersion": "core.oam.dev/v1alpha2",
          "kind": "Component",
          "metadata": {
            "name": "springboot-component",
            "namespace": "springboot"
          },
          "spec": {
            "workload": {
              "apiVersion": "core.oam.dev/v1alpha2",
              "kind": "ContainerizedWorkload",
              "metadata": {
                "labels": {
                  "app": "springboot"
                },
                "name": "springboot-workload",
                "namespace": "springboot"
              },
              "spec": {
                "containers": [
                  {
                    "image": "ghcr.io/verrazzano/example-springboot:0.9.0",
                    "name": "springboot-container",
                    "ports": [
                      {
                        "containerPort": 8080,
                        "name": "springboot"
                      }
                    ]
                  }
                ]
              }
            }
          },
          "status": {
            "latestRevision": {
              "name": "springboot-component-v1",
              "revision": 1
            },
            "observedGeneration": 1
          }
        }
      ],
      "kind": "List",
      "metadata": {
        "resourceVersion": "",
        "selfLink": ""
      }
    }`;

    const mcComponents = `{
      "apiVersion": "v1",
      "items": [
        {
          "apiVersion": "clusters.verrazzano.io/v1alpha1",
          "kind": "MultiClusterComponent",
          "metadata": {
            "name": "hello-helidon-component",
            "namespace": "hello-helidon"
          },
          "spec": {
            "placement": {
              "clusters": [
                {
                  "name": "managed1"
                }
              ]
            },
            "template": {
              "spec": {
                "workload": {
                  "apiVersion": "oam.verrazzano.io/v1alpha1",
                  "kind": "VerrazzanoHelidonWorkload",
                  "metadata": {
                    "labels": {
                      "app": "hello-helidon"
                    },
                    "name": "hello-helidon-workload",
                    "namespace": "hello-helidon"
                  },
                  "spec": {
                    "deploymentTemplate": {
                      "metadata": {
                        "name": "hello-helidon-deployment"
                      },
                      "podSpec": {
                        "containers": [
                          {
                            "image": "ghcr.io/verrazzano/example-helidon-greet-app-v1:0.1.10-3-20201016220428-56fb4d4",
                            "name": "hello-helidon-container",
                            "ports": [
                              {
                                "containerPort": 8080,
                                "name": "http"
                              }
                            ]
                          }
                        ]
                      }
                    }
                  }
                }
              }
            }
          }
        }
      ],
      "kind": "List",
      "metadata": {
        "resourceVersion": "",
        "selfLink": ""
      }
    }
`;

    const mcApps = `
{
  "apiVersion": "v1",
  "items": [
    {
      "apiVersion": "clusters.verrazzano.io/v1alpha1",
      "kind": "MultiClusterApplicationConfiguration",
      "metadata": {
        "name": "hello-helidon",
        "namespace": "hello-helidon",
        "uid": "b8c77a58-a09d-4c43-986a-315a8040ab97"
      },
      "spec": {
        "placement": {
          "clusters": [
            {
              "name": "managed1"
            }
          ]
        },
        "template": {
          "metadata": {
            
          },
          "spec": {
            "components": [
              {
                "componentName": "hello-helidon-component"
                
              }
            ]
          }
        }
      },
      "status": {
        
      }
    }
  ],
  "kind": "List",
  "metadata": {
    "resourceVersion": "",
    "selfLink": ""
  }
}
 `;
    const apps = `
{
  "apiVersion": "v1",
  "items": [
    {
      "apiVersion": "core.oam.dev/v1alpha2",
      "kind": "ApplicationConfiguration",
      "metadata": {
        "name": "${localClusterAppName}",
        "namespace": "springboot",
        "uid": "d69b84be-8673-46d0-a7dc-bc15915c594f"
      },
      "spec": {
        "components": [
          {
            "componentName": "springboot-component"
            
          }
        ]
      }
    }
  ],
  "kind": "List",
  "metadata": {
    "resourceVersion": "",
    "selfLink": ""
  }
}
 `;
    const vmcs = `{
  "apiVersion": "v1",
  "items": [
  ],
  "kind": "List",
  "metadata": {
    "resourceVersion": "",
    "selfLink": ""
  }
}`;

    const projects = `{
  "apiVersion": "v1",
  "items": [
  ],
  "kind": "List",
  "metadata": {
    "resourceVersion": "",
    "selfLink": ""
  }
}`;

    sandbox
      .stub(VerrazzanoApi.prototype, <any>"getInstance")
      .returns(Promise.resolve(instance));
    sandbox
      .stub(VerrazzanoApi.prototype, <any>"getKubernetesResource")
      .withArgs(ResourceType.ApplicationConfiguration)
      .returns(Promise.resolve(new Response(apps)))
      .withArgs(ResourceType.Component)
      .returns(Promise.resolve(new Response(components)))
      .withArgs(ResourceType.MultiClusterApplicationConfiguration)
      .returns(Promise.resolve(new Response(mcApps)))
      .withArgs(ResourceType.MultiClusterComponent)
      .returns(Promise.resolve(new Response(mcComponents)))
      .withArgs(ResourceType.VerrazzanoManagedCluster)
      .returns(Promise.resolve(new Response(vmcs)))
      .withArgs(ResourceType.VerrazzanoProject)
      .returns(Promise.resolve(new Response(projects)));
    sandbox
      .stub(VerrazzanoApi.prototype, <any>"getVMC")
      .returns(Promise.resolve(""));
    await setup()
      .then(() => console.log("Instance view rendered"))
      .catch((err) => {
        chai.assert.fail(err);
      });
  });

  after(() => {
    fixture.cleanup();
    sandbox.restore();
  });

  it("renders the app deployed in local cluster correctly even when vmc corresponding to multicluster resources does not exists.", async () => {
    expect(
      instanceElement
        .querySelector("#applications")
        .querySelector("#listview")
        .querySelector(".carditem").textContent
    ).contains(localClusterAppName);
  });
});
