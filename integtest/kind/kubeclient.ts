import * as k8s from "@kubernetes/client-node";
import {KindUtil} from "./kindUtil";

export class KubeClient {
    kubeConfigFile: string;
    k8sApi: k8s.CoreV1Api;

    constructor(kubeConfigFile: string) {
        if (!kubeConfigFile) {
            throw new Error("Could not initialize Kubernetes client - no kube config file specified!");
        }
        this.kubeConfigFile = kubeConfigFile;
        const kc = new k8s.KubeConfig();
        console.log(`Loading Kube Config from ${this.kubeConfigFile}`);
        kc.loadFromFile(this.kubeConfigFile);

        this.k8sApi = kc.makeApiClient(k8s.CoreV1Api);
    }

    async createNamespace(ns: string) {
        var namespace = {
            metadata: {
                name: ns,
            },
        };

        try {
            const readResponse = await this.k8sApi.readNamespace(ns);
            console.log(`Namespace ${ns} already exists. Not creating.`);
            return;
        } catch (error) {
            console.log(`Namespace ${ns} does not already exist`);
        }
        try {
            console.log(`Creating namespace ${ns}`);
            const response = await this.k8sApi.createNamespace(namespace);
            console.log('Created namespace');
        } catch (error) {
            console.log(`failed to create namespace ${ns}: ${error}`);
            throw error;
        }
    }

    async createDockerRegistrySecret(secretName: string, secretNamespace: string,
                                     registryUri: string, username: string, pwd: string) {
        const auth = Buffer.from(`${username}:${pwd}`).toString('base64');
        const auths = {
            auths: {
                [registryUri]: {
                    'username': username,
                    'password': pwd,
                    'auth': auth
                }
            }
        };
        const base64Data = Buffer.from(JSON.stringify(auths)).toString('base64');
        const theSecret: k8s.V1Secret = {
            type: 'kubernetes.io/dockerconfigjson',
            metadata: {name: secretName},
            data: {'.dockerconfigjson': base64Data}
        };
        try {
            await this.k8sApi.readNamespacedSecret(secretName, secretNamespace);
            console.log(`Secret ${secretName} already exists. Not creating`);
            return;
        } catch (error) {
            console.log(`Secret ${secretName} does not already exist`);
        }
        console.log(`Creating Docker registry secret ${secretName}`);
        try {
            const result = await this.k8sApi.createNamespacedSecret(secretNamespace, theSecret);
            console.log(`Created secret ${secretName}, response status is ${result.response.statusCode}`);
        } catch (err) {
            console.log(`Failed to create Docker Registry secret ${secretName}: ${err}`);
        }
    };

    async getServiceNodePort(svcName: string, svcNamespace: string): Promise<number> {
        const svc = await this.k8sApi.readNamespacedService(svcName, svcNamespace);
        return svc.body.spec.ports[0].nodePort;
    }

    async getNodeInternalIPAddr(nodeName: string): Promise<string> {
        const nodeResp = await this.k8sApi.readNode(nodeName);
        const nodeAddr = nodeResp.body.status.addresses.find((addr) => addr.type === 'InternalIP');
        return (nodeAddr ? nodeAddr.address : null);
    }

    async kubectlFromFile (file: string, kubeVerb: string = 'create'): Promise<string> {
        const cmd = `kubectl ${kubeVerb} --kubeconfig ${this.kubeConfigFile} -f ${file}`;
        return KindUtil.runCommandLine(cmd, `${kubeVerb} from file ${file}`, false);
        /*    return new Promise((resolve, reject) => {
                exec(cmd, (error, stdout, stderr) => {
                    stdout && console.log(stdout);
                    stderr && console.error(stderr);
                    if (error) {
                        reject(`failed to ${kubeVerb} from file ${file}. ${error.message}`);
                    } else {
                        resolve(stdout ? stdout : stderr);
                    }
                });
            });*/
    };

    async createCrd(crdFile: string) {
        try {
            await this.kubectlFromFile(crdFile, 'create');
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
}