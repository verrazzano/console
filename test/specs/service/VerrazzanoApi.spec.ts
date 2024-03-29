// Copyright (C) 2020, 2021, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import * as sinon from "sinon";
import { VerrazzanoApi } from "vz-console/service/VerrazzanoApi";
import { ResourceType, Status } from "vz-console/service/types";

const expect = chai.expect;
const makeMockResponse = (body = {}, status?: number) =>
  new window.Response(JSON.stringify(body), {
    status: status || 200,
    headers: { "Content-type": "application/json" },
  });

const makeMockRoleBindings = (ns) => {
  return {
    items: [
      {
        metadata: { name: "rb1", namespace: ns },
        roleRef: { kind: "ClusterRole", name: "cr1" },
        subjects: [
          { name: "user1", kind: "User" },
          { name: "group1", kind: "Group" },
        ],
      },
      {
        metadata: { name: "rb2", namespace: ns },
        roleRef: { kind: "ClusterRole", name: "cr2" },
        subjects: [
          { name: "user2_1", kind: "User" },
          { name: "user2_2", kind: "user" },
          { name: "group2", kind: "Group" },
        ],
      },
      {
        metadata: { name: "rb3", namespace: ns },
        roleRef: { kind: "Role", name: "role3" },
        subjects: [{ name: "user3", kind: "User" }],
      },
    ],
  };
};

const makeMockImageBuildRequests = () => {
  return {
    items: [
      {
        apiVersion: "images.verrazzano.io/v1alpha1",
        kind: "ImageBuildRequest",
        metadata: {
          creationTimestamp: "2021-07-02T19:41:06Z",
          generation: 1,
          name: "image1",
          namespace: "default",
        },
        spec: {
          baseImage: "base image",
          image: {
            name: "image",
            registry: "registry",
            repository: "repo",
            tag: "tag",
          },
          jdkInstaller: "installer",
          webLogicInstaller: "installer",
        },
      },
      {
        apiVersion: "images.verrazzano.io/v1alpha1",
        kind: "ImageBuildRequest",
        metadata: {
          creationTimestamp: "2021-07-07T18:13:54Z",
          generation: 1,
          name: "image4",
          namespace: "default",
        },
        spec: {
          baseImage: "base image",
          image: {
            name: "image",
            registry: "registry",
            repository: "repo",
            tag: "tag",
          },
          jdkInstaller: "installer",
          webLogicInstaller: "installer",
        },
      },
      {
        apiVersion: "images.verrazzano.io/v1alpha1",
        kind: "ImageBuildRequest",
        metadata: {
          creationTimestamp: "2021-07-07T19:15:36Z",
          generation: 1,
          name: "image2",
          namespace: "verrazzano-system",
        },
        spec: {
          baseImage: "base image",
          image: {
            name: "image",
            registry: "registry",
            repository: "repo",
            tag: "tag",
          },
          jdkInstaller: "installer",
          webLogicInstaller: "installer",
        },
      },
      {
        apiVersion: "images.verrazzano.io/v1alpha1",
        kind: "ImageBuildRequest",
        metadata: {
          creationTimestamp: "2021-07-07T18:20:35Z",
          generation: 1,
          name: "image5",
          namespace: "verrazzano-system",
        },
        spec: {
          baseImage: "base image",
          image: {
            name: "image",
            registry: "registry",
            repository: "repo",
            tag: "tag",
          },
          jdkInstaller: "installer",
          webLogicInstaller: "installer",
        },
      },
    ],
  };
};

describe("VerrazzanoApi tests", () => {
  it("reload window on 401 response code", async () => {
    const testNs = "listRoleBindingsNs";
    const status = 401;
    const mockRoleBindings = makeMockRoleBindings(testNs);
    const fakeFetch = sinon.fake.returns(
      makeMockResponse(mockRoleBindings, status)
    );
    const vzApi = new VerrazzanoApi("local", fakeFetch);
    const fakeReload = sinon.stub(vzApi, "showRefreshPageDialog");
    await vzApi.listRoleBindings(testNs);
    expect(fakeReload.calledOnce).to.be.true;
  });

  it("listRoleBindings returns expected data", async () => {
    const testNs = "listRoleBindingsNs";
    const mockRoleBindings = makeMockRoleBindings(testNs);
    const fakeFetch = sinon.fake.returns(makeMockResponse(mockRoleBindings));
    const vzApi = new VerrazzanoApi("local", fakeFetch);
    let roleBindings = await vzApi.listRoleBindings(testNs);
    expect(fakeFetch.callCount).to.eq(1);
    expect(
      fakeFetch.calledWith(
        sinon.match(
          `namespaces/${testNs}/${ResourceType.RoleBinding.Kind.toLowerCase()}s`
        )
      )
    ).to.be.true;
    expect(roleBindings.length).to.eq(mockRoleBindings.items.length);
    roleBindings.forEach((rb) => {
      const matchingMockRb = mockRoleBindings.items.find(
        (mrb) => mrb.metadata.name == rb.name
      );
      expect(matchingMockRb).to.be.ok;
      if (matchingMockRb.roleRef.kind === "ClusterRole") {
        expect(rb.clusterRole).to.eq(matchingMockRb.roleRef.name);
      } else {
        expect(rb.clusterRole).to.be.not.ok;
      }
      expect(rb.subjects).to.deep.equal(matchingMockRb.subjects);
    });
  });

  it("listImageBuildRequests returns expected data", async () => {
    const mockImageBuildRequests = makeMockImageBuildRequests();
    const fakeFetch = sinon.fake.returns(
      makeMockResponse(mockImageBuildRequests)
    );
    const vzApi = new VerrazzanoApi("local", fakeFetch);
    let imageBuildRequests = await vzApi.listImageBuildRequests();
    expect(fakeFetch.callCount).to.eq(1);
    expect(
      fakeFetch.calledWith(
        sinon.match(
          `/${ResourceType.VerrazzanoImageBuildRequest.Kind.toLowerCase()}s`
        )
      )
    ).to.be.true;
    expect(imageBuildRequests.length).to.eq(
      mockImageBuildRequests.items.length
    );
    imageBuildRequests.forEach((ibr) => {
      const matchingMockIBR = mockImageBuildRequests.items.find(
        (mibr) => mibr.metadata.name == ibr.metadata.name,
        (mibr) => mibr.metadata.namespace == ibr.metadata.namespace
      );
      expect(matchingMockIBR).to.be.ok;
    });
  });

  it("listClusters returns expected data", async () => {
    const testNs = "listClustersNs";
    const mockClusters = {
      items: [
        {
          metadata: { name: "cluster1" },
          status: {
            apiUrl: "apiUrl1",
            conditions: [{ name: "Ready", status: "True" }],
            state: Status.Active,
          },
        },
        {
          metadata: { name: "cluster2" },
          status: { apiUrl: "apiUrl2", conditions: [], state: "" },
        },
        {
          // this test case is missing apiUrl to make sure that case is handled
          metadata: { name: "cluster3" },
          status: {
            conditions: [{ name: "Ready", status: "False" }],
            state: Status.Inactive,
          },
        },
      ],
    };
    const fakeFetch = sinon.fake.returns(makeMockResponse(mockClusters));
    const vzApi = new VerrazzanoApi("local", fakeFetch);
    let clusters = await vzApi.listClusters();
    expect(fakeFetch.callCount).to.eq(1);
    expect(
      fakeFetch.calledWith(
        sinon.match(
          `/${ResourceType.VerrazzanoManagedCluster.Kind.toLowerCase()}s`
        )
      )
    ).to.be.true;
    expect(clusters.length).to.eq(mockClusters.items.length);
    clusters.forEach((cluster) => {
      const matchingMockCluster = mockClusters.items.find(
        (c) => c.metadata.name == cluster.name
      );
      expect(matchingMockCluster).to.be.ok;
      expect(cluster.name).to.eq(matchingMockCluster.metadata.name);
      expect(cluster.apiUrl).to.eq(matchingMockCluster.status.apiUrl);
      if (
        matchingMockCluster.status.conditions &&
        matchingMockCluster.status.conditions.length > 0 &&
        matchingMockCluster.status.state === Status.Active
      ) {
        console.log(
          `cluster name ${cluster.name} has status ${cluster.status} and condition in mock is: ${matchingMockCluster.status.conditions[0].name} = ${matchingMockCluster.status.conditions[0].status} and state is: ${matchingMockCluster.status.state}`
        );
        expect(cluster.status).to.eq(Status.Active);
      } else if (
        matchingMockCluster.status.conditions &&
        matchingMockCluster.status.conditions.length > 0 &&
        matchingMockCluster.status.state === Status.Inactive
      ) {
        console.log(
          `cluster name ${cluster.name} has status ${cluster.status} and condition in mock is: ${matchingMockCluster.status.conditions[0].name} = ${matchingMockCluster.status.conditions[0].status} and state is: ${matchingMockCluster.status.state} `
        );
        expect(cluster.status).to.eq(Status.Inactive);
      } else {
        console.log(
          `cluster name ${cluster.name} has status ${cluster.status} and condition in mock is: ${matchingMockCluster.status.conditions} and state is : ${matchingMockCluster.status.state}`
        );
        expect(cluster.status).to.eq(Status.Pending);
      }
    });
  });
});
