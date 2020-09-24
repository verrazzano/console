// Copyright (c) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import * as k8s from '@kubernetes/client-node';
import { exec } from 'child_process';
import { exit } from 'process';

const vzNamespace = 'verrazzano-system';
const dockerRegUser = process.env.DOCKER_REGISTRY_USER;
const dockerRegPwd = process.env.DOCKER_REGISTRY_PWD;
const dockerRegUri = process.env.DOCKER_REGISTRY_URI;
const modelCrdFile = process.env.MODEL_CRD_FILE;
const bindingCrdFile = process.env.BINDING_CRD_FILE;
const monitoringInstCrdFile = process.env.MONITORING_INSTANCE_CRD_FILE;
const verrazzanoOperatorManifest = './integtest/kind/verrazzano-operator-integtest.yaml';
const clusterName = 'console-selenium';

const kc = new k8s.KubeConfig();
console.log(`Loading Kube Config from ${process.env.KUBECONFIG}`);
kc.loadFromFile(process.env.KUBECONFIG);

const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

const createNamespace = async (ns: string) => {
    var namespace = {
        metadata: {
            name: ns,
        },
    };

    try {
        const readResponse = await k8sApi.readNamespace(ns);
        console.log(`Namespace ${ns} already exists. Not creating.`);
        return;
    } catch (error) {
        console.log(`Namespace ${ns} does not already exist`);
    }
    try {
        console.log(`Creating namespace ${ns}`);
        const response = await k8sApi.createNamespace(namespace);
        console.log('Created namespace');
    } catch (error) {
        console.log(`failed to create namespace ${ns}: ${error}`);
        throw error;
    }
}

const createDockerRegistrySecret = async (secretName: string, registryUri: string, username: string, pwd: string) => {
    const auth = Buffer.from(`${username}:${pwd}`).toString('base64');
    const auths = { auths: { [registryUri]: { 'username': username, 'password': pwd, 'auth': auth } } };
    const base64Data = Buffer.from(JSON.stringify(auths)).toString('base64');
    const theSecret: k8s.V1Secret = {
        type: 'kubernetes.io/dockerconfigjson',
        metadata: { name: secretName },
        data: { '.dockerconfigjson': base64Data }
    };
    try {
        await k8sApi.readNamespacedSecret(secretName, vzNamespace);
        console.log(`Secret ${secretName} already exists. Not creating`);
        return;
    } catch (error) {
        console.log(`Secret ${secretName} does not already exist`);
    }
    console.log(`Creating Docker registry secret ${secretName}`);
    try {
        const result = await k8sApi.createNamespacedSecret(vzNamespace, theSecret);
        console.log(`Created secret ${secretName}, response status is ${result.response.statusCode}`);
    } catch (err) {
        console.log(`Failed to create Docker Registry secret ${secretName}: ${err}`);
    }
};

const kubectlFromFile = async (file: string, kubeVerb: string = 'create'): Promise<string> => {
    const cmd = `kubectl ${kubeVerb} -f ${file}`;
    return new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
            stdout && console.log(stdout);
            stderr && console.error(stderr);
            if (error) {
                reject(`failed to ${kubeVerb} from file ${file}. ${error.message}`);
            } else {
                resolve(stdout ? stdout : stderr);
            }
        });
    });
}

const setupIntegTestEnv = async () => {
    try {
        if (!vzNamespace) {
            throw new Error("Verrazzano Namespace must be provided!");
        }

        if (!dockerRegUri || !dockerRegUser || !dockerRegPwd) {
            throw new Error("Environment variables DOCKER_REGISTRY_USER, DOCKER_REGISTRY_PWD and DOCKER_REGISTRY_URI must be set!");
        }

        await createNamespace(vzNamespace);
        console.log(`Creating Docker Registry secret for ${dockerRegUri}`);
        //    const username = 'desagar';
        // const pwd = 'bcd0debf747fca9547232ead6fe6117c5f6257e8';
        await createDockerRegistrySecret('ghcr', dockerRegUri, dockerRegUser, dockerRegPwd);
        console.log(`Creating Verrazzano Model CRD from file ${modelCrdFile}`);
        console.log(await kubectlFromFile(modelCrdFile, 'create'));
        console.log(`Creating Verrazzano Binding CRD from file ${modelCrdFile}`);
        await kubectlFromFile(bindingCrdFile, 'create');
        console.log(`Creating Verrazzano Monitoring Instances CRD from file ${modelCrdFile}`);
        await kubectlFromFile(monitoringInstCrdFile, 'create');
        console.log('Deploying Verrazzano Operator HARD-CODED VERSION TODO FIX');
        await kubectlFromFile(verrazzanoOperatorManifest, 'apply');
    } catch (error) {
        console.log(`Failed to create Kubernetes objects! ${error}`);
        exit(1);
    }
}

const getVerrazzanoOperatorURL = async (): Promise<string> => {
    try {
        const nodePortSvc = await k8sApi.readNamespacedService('verrazzano-operator', vzNamespace);
        const port = nodePortSvc.body.spec.ports[0];
        const nodeResp = await k8sApi.readNode(`${clusterName}-worker`);
        const nodeAddr = nodeResp.body.status.addresses.find((addr) => addr.type === 'InternalIP');
        return nodeAddr ? `http://${nodeAddr.address}:${port.nodePort}` : null;
    } catch (error) {
        console.log('Failed to get verrazzano-operator URL!');
        return null;
    }
}
// setupIntegTestEnv();
getVerrazzanoOperatorURL().then((addr) => console.log(`Operator URL is ${addr}`));
