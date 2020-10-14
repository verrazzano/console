// Copyright (c) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import * as k8s from '@kubernetes/client-node';
import { loadYaml, V1Service } from '@kubernetes/client-node';
import { rejects } from 'assert';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { exit } from 'process';
import { safeLoadAll } from 'js-yaml';

const vzNamespace = 'verrazzano-system';
const dockerRegUser = process.env.DOCKER_REGISTRY_USER;
const dockerRegPwd = process.env.DOCKER_REGISTRY_PWD;
const dockerRegUri = process.env.DOCKER_REGISTRY_URI;
const verrazzanoRepoPath = process.env.VERRAZZANO_REPO_PATH;
const verrazzanoHelmChartDir = `${verrazzanoRepoPath}/install/chart`;
const verrazzanoOperatorHelmTemplate = `${verrazzanoHelmChartDir}/templates/01-verrazzano-operator.yaml`;
const clusterName = 'console-selenium';
const kindestNodeImage = 'kindest/node:v1.16.9@sha256:7175872357bc85847ec4b1aba46ed1d12fa054c83ac7a8a11f5c268957fd5765';
const kindConfigFile = `${__dirname}/kind/kind_config.yaml`;
const kubeConfigFile = process.env.KUBECONFIG;
const imagePullSecretName = 'ghcr';

let k8sApi: k8s.CoreV1Api;

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
};

const createCrd = async (crdFile: string) => {
    try {
        await kubectlFromFile(crdFile, 'create');
    } catch (error) {
        if (error && typeof(error) === 'string' && error.includes('AlreadyExists')) {
            console.log('CRD already exists - not creating');
        }
        else {
            console.log('A different error occurred');
            throw error;
        }
    }
};

const createNodePort = async (appName: string, port: number, targetPort: number): Promise<string> => {
    const nodePortManifestFile = `${__dirname}/kind/node-port.yaml`;
    return kubectlFromFile(nodePortManifestFile, 'apply');
};

const helmTemplateReplace = async (chartPath: string, outputLocation: string): Promise<void> => {
    //const imagePullSecretArg = `--set global.imagePullSecrets[0]=${imagePullSecretName}`;
    const imagePullPolicyArg = `--set image.pullPolicy=IfNotPresent`; // image is loaded into KinD cluster, don't pull it again
    const otherArgs = `--set config.envName=default --set config.dnsSuffix=dummy.verrazzano.io`

    const cmd = `helm template verrazzano ${chartPath} --namespace ${vzNamespace} ${imagePullPolicyArg} ${otherArgs}`;
    return new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
            if (stdout) {
                fs.writeFileSync(outputLocation, stdout);
            }
            stderr && console.error(stderr);
            if (error) {
                reject(`failed to locally replace templates on helm chart at ${chartPath}`);
            } else {
                resolve();
            }
        });
    });
}

const deployVerrazzanoOperator = async () => {
    // Copy operator template
    const tempDir = path.join(os.tmpdir());
    const helmChartDir = fs.mkdtempSync(tempDir);
    const helmChartTemplatesDir = path.join(helmChartDir, 'templates')
    fs.mkdirSync(helmChartTemplatesDir);

    console.log('temp dir is ' + helmChartDir);
    fs.copyFileSync(verrazzanoOperatorHelmTemplate, path.join(helmChartTemplatesDir, path.basename(verrazzanoOperatorHelmTemplate)));
    fs.copyFileSync(`${verrazzanoHelmChartDir}/values.yaml`, path.join(helmChartDir, 'values.yaml'));
    fs.copyFileSync(`${verrazzanoHelmChartDir}/Chart.yaml`, path.join(helmChartDir, 'Chart.yaml'));

    const actualOperatorManifest = path.join(tempDir, 'verrazzano-operator-manifest.yaml');
    await helmTemplateReplace(helmChartDir, actualOperatorManifest)

    let verrazzanoOperatorImage;
    const allYamls = safeLoadAll(fs.readFileSync(actualOperatorManifest).toString('utf-8'));
    allYamls.forEach(yaml => {
        console.log(yaml);
        if (yaml && yaml['kind'] == 'Deployment') {
            const containersYaml = yaml['spec']['template']['spec']['containers'];
            if (containersYaml) {
                verrazzanoOperatorImage = containersYaml[0]['image']
            }
        }
    });

    if (!verrazzanoOperatorImage) {
        throw new Error(`Verrazzano operator image not found in manifest file ${actualOperatorManifest}!`);
    }
    await kindLoadDockerImage(clusterName, verrazzanoOperatorImage);
    await kubectlFromFile(actualOperatorManifest, 'apply');
    await createNodePort('verrazzano-operator', 80, 3456);
}

const setupIntegTestEnv = async () => {
    try {
        if (!vzNamespace) {
            throw new Error("Verrazzano Namespace must be provided!");
        }

        if (!dockerRegUri || !dockerRegUser || !dockerRegPwd) {
            throw new Error("Environment variables DOCKER_REGISTRY_USER, DOCKER_REGISTRY_PWD and DOCKER_REGISTRY_URI must be set!");
        }

        if (!verrazzanoRepoPath) {
            throw new Error("Environment variable VERRAZZANO_REPO_PATH must be set to the directory path of the cloned 'verrazzano' repository");
        }

        const modelCrdFile = `${verrazzanoHelmChartDir}/crds/verrazzano.io_verrazzanomodels_crd.yaml`;
        const bindingCrdFile = `${verrazzanoHelmChartDir}/crds/verrazzano.io_verrazzanobindings_crd.yaml`;
        const monitoringInstCrdFile = `${verrazzanoHelmChartDir}/crds/verrazzano.io_verrazzanomonitoringinstances_crd.yaml`;
        const vmcCrdFile = `${verrazzanoHelmChartDir}/crds/verrazzano.io_verrazzanomanagedclusters_crd.yaml`;

        /*console.log(`Deleting existing KinD cluster ${clusterName}`)
        await deleteExistingKindCluster();
        console.log(`Creating KinD cluster ${clusterName}`);
        await createKindCluster();
        console.log('Initializing Kubernetes API Client');*/

        initKubeClient();

        await createNamespace(vzNamespace);
        console.log(`Creating Docker Registry secret for ${dockerRegUri}`);
        //await createDockerRegistrySecret(imagePullSecretName, dockerRegUri, dockerRegUser, dockerRegPwd);
        console.log(`Creating Verrazzano Model CRD from file ${modelCrdFile}`);
        await createCrd(modelCrdFile);
        console.log(`Creating Verrazzano Binding CRD from file ${bindingCrdFile}`);
        await createCrd(bindingCrdFile);
        console.log(`Creating Verrazzano Monitoring Instances CRD from file ${monitoringInstCrdFile}`);
        await createCrd(monitoringInstCrdFile);
        console.log(`Creating Verrazzano Managed Clusters CRD from file ${vmcCrdFile}`);
        await createCrd(vmcCrdFile);
        console.log('Deploying Verrazzano Operator HARD-CODED VERSION TODO FIX');
        await deployVerrazzanoOperator();
        const addr = await getVerrazzanoOperatorURL();
        console.log(`Operator URL is ${addr}`);
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
};

const deleteExistingKindCluster = async () => {
    const cmd = `kind delete cluster --name ${clusterName}`;
    return new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
            stdout && console.log(stdout);
            stderr && console.error(stderr);
            // No need to fail on error since cluster might not exist
            resolve(stdout ? stdout : stderr);
        });
    });
};

const kindLoadDockerImage = async (clusterName: string, dockerImage: string) => {
    const cmd = `kind load docker-image --name ${clusterName} ${dockerImage}`;
    console.log(`Loading docker image ${dockerImage} into cluster ${clusterName}`);
    return new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
            stdout && console.log(stdout);
            stderr && console.error(stderr);
            // No need to fail on error since cluster might not exist
            resolve(stdout ? stdout : stderr);
        });
    });
};

const createKindCluster = async () => {
    const cmd = `kind create cluster --wait 30s --image ${kindestNodeImage} --name ${clusterName} --config ${kindConfigFile} --kubeconfig ${kubeConfigFile}`;
    return new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
            stdout && console.log(stdout);
            stderr && console.error(stderr);
            if (error) {
                reject(`failed to create KinD cluster using config ${kindConfigFile}. ${error.message}`);
            } else {
                resolve(stdout ? stdout : stderr);
            }
        });
    });
};

const initKubeClient = () => {
    if (!kubeConfigFile) {
        throw new Error("Environment variable KUBECONFIG must be specified!");
    }
    const kc = new k8s.KubeConfig();
    console.log(`Loading Kube Config from ${kubeConfigFile}`);
    kc.loadFromFile(kubeConfigFile);
    
    k8sApi = kc.makeApiClient(k8s.CoreV1Api);
};

setupIntegTestEnv();
