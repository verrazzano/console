import * as sinon from "sinon";
import {VerrazzanoApi} from "vz-console/service/VerrazzanoApi";
import {ResourceType, Status} from "vz-console/service/types";

const expect = chai.expect;
const makeMockResponse = (body = {}) => new window.Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-type': 'application/json' }
});

const makeMockRoleBindings = (ns) => {
    return {
        items: [
            {
                metadata: { name: "rb1", namespace: ns},
                roleRef: { kind: "ClusterRole", name: "cr1"},
                subjects: [ {name: "user1", kind: "User"}, {name: "group1", kind: "Group"}]
            },
            {
                metadata: { name: "rb2", namespace: ns},
                roleRef: { kind: "ClusterRole", name: "cr2"},
                subjects: [ {name: "user2_1", kind: "User"}, {name: "user2_2", kind: "user"}, {name: "group2", kind: "Group"}]
            },
            {
                metadata: { name: "rb3", namespace: ns},
                roleRef: { kind: "Role", name: "role3"},
                subjects: [ {name: "user3", kind: "User"} ]
            }
        ]
    };
}
describe("VerrazzanoApi tests", () => {
    it("listRoleBindings returns expected data", async () => {
        const testNs = "listRoleBindingsNs";
        const mockRoleBindings = makeMockRoleBindings(testNs);
        const fakeFetch = sinon.fake.returns(makeMockResponse(mockRoleBindings));
        const vzApi = new VerrazzanoApi("fakeUrl", "local", fakeFetch);
        let roleBindings = await vzApi.listRoleBindings(testNs);
        expect(fakeFetch.callCount).to.eq(1);
        expect(fakeFetch.calledWith(sinon.match(`namespaces/${testNs}/${ResourceType.RoleBinding.Kind.toLowerCase()}s`))).to.be.true;
        expect(roleBindings.length).to.eq(mockRoleBindings.items.length);
        roleBindings.forEach((rb) => {
            const matchingMockRb = mockRoleBindings.items.find((mrb) => mrb.metadata.name == rb.name);
            expect(matchingMockRb).to.be.ok;
            if (matchingMockRb.roleRef.kind === "ClusterRole") {
                expect(rb.clusterRole).to.eq(matchingMockRb.roleRef.name);
            } else {
                expect(rb.clusterRole).to.be.not.ok;
            }
            expect(rb.subjects).to.deep.equal(matchingMockRb.subjects);
        });
    });

    it("listClusters returns expected data", async () => {
        const testNs = "listClustersNs";
        const mockClusters = {
            items: [
                {
                    metadata: {name: "cluster1" },
                    status: {apiUrl: "apiUrl1", conditions: [{name: "Ready", status: "True" }] }
                },
                {
                    metadata: {name: "cluster2" },
                    status: {apiUrl: "apiUrl2", conditions: [] }
                },
                {
                    // this test case is missing apiUrl to make sure that case is handled
                    metadata: {name: "cluster3" },
                    status: { conditions: [{name: "Ready", status: "False" }] }
                }
            ]
        }
        const fakeFetch = sinon.fake.returns(makeMockResponse(mockClusters));
        const vzApi = new VerrazzanoApi("fakeUrl", "local", fakeFetch);
        let clusters = await vzApi.listClusters();
        expect(fakeFetch.callCount).to.eq(1);
        expect(fakeFetch.calledWith(sinon.match(`/${ResourceType.VerrazzanoManagedCluster.Kind.toLowerCase()}s`))).to.be.true;
        expect(clusters.length).to.eq(mockClusters.items.length);
        clusters.forEach((cluster) => {
            const matchingMockCluster = mockClusters.items.find((c) => c.metadata.name == cluster.name);
            expect(matchingMockCluster).to.be.ok;
            expect(cluster.name).to.eq(matchingMockCluster.metadata.name);
            expect(cluster.apiUrl).to.eq(matchingMockCluster.status.apiUrl);
            if (matchingMockCluster.status.conditions && matchingMockCluster.status.conditions.length > 0) {
                console.log(`cluster name ${cluster.name} has status ${cluster.status} and condition in mock is: ${matchingMockCluster.status.conditions[0].name} = ${matchingMockCluster.status.conditions[0].status}`);
                expect(cluster.status).to.eq(matchingMockCluster.status.conditions[0].status === "True" ? Status.Running : Status.Terminated);
            } else {
                console.log(`cluster name ${cluster.name} has status ${cluster.status} and condition in mock is: ${matchingMockCluster.status.conditions}`);
                expect(cluster.status).to.eq(Status.Pending);
            }
        });
    })
})

